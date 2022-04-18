import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Playlist } from '@indiegente/api-interfaces';
import {
  expand,
  map,
  mergeMap,
  Observable,
  share,
  tap,
  switchMap,
  take,
  forkJoin,
  of,
  delay,
} from 'rxjs';
import { AudioPlayerComponent, Track } from 'ngx-audio-player';
import { Store } from '@ngrx/store';
import { PlaylistService } from './services/playlist.service';
import { selectPlaylist } from './store/entities/playlist/playlist.selector';
import { retrievedTrackList } from './store/entities/playlist/playlist.actions';
import { selectCurrentTrack } from './store/entities/user/user.selector';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'indiegente-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('audioPlayer')
  audioPlayer!: AudioPlayerComponent;
  msaapDisplayTitle = true;
  msaapDisplayPlayList = true;
  msaapPageSizeOptions = [2, 4, 6];
  msaapDisplayVolumeControls = true;

  currentPage = 1;

  playlist$!: Observable<Track[]>;
  playlist: Track[] = [];
  currenTrack$: Observable<number>;

  constructor(
    private store: Store,
    private playlistService: PlaylistService,
    private http: HttpClient,
    private swUpdate: SwUpdate
  ) {
    this.updateClient();

    this.currenTrack$ = this.store.select(selectCurrentTrack);
  }

  ngOnInit(): void {
    this.playlistService
      .getPlaylist(1)
      .pipe(
        tap((pl) => (this.playlist = JSON.parse(JSON.stringify(pl)))),
        switchMap(() => this.currenTrack$),
        switchMap((trackIndex) => {
          if (trackIndex > 12) {
            const pages = [];
            for (let i = 2; i <= Math.ceil(trackIndex / 12); i++) {
              pages.push(this.playlistService.getPlaylist(i));
            }
            return forkJoin(pages).pipe(
              tap(
                (tracks) =>
                  (this.playlist = this.playlist.concat(
                    ...JSON.parse(JSON.stringify(tracks))
                  ))
              )
            );
          } else {
            return of(null);
          }
        }),
        switchMap(() => this.currenTrack$),
        delay(10),
        tap((index) => {
          this.audioPlayer.selectTrack(index);
          let i = 1;
          while (i < Math.ceil(index / 10)) {
            this.audioPlayer.paginator.nextPage();
            i++;
          }
        })
      )
      .subscribe();
  }

  loadMore() {
    this.savePlayingState();
    // Plus one for array indexing starting at 0 and another to load before last one plays
    const isLast = this.audioPlayer.currentIndex + 2 === this.playlist.length;

    if (isLast) {
      const nextPage = this.playlist.length / 12 + 1;
      this.loadNextPage(nextPage);
    }
  }
  savePlayingState() {
    this.playlistService.saveState(this.audioPlayer.currentIndex);
  }

  loadNextPage(page: number) {
    this.playlistService.getPlaylist(page).subscribe((pl) => {
      this.playlist = this.playlist.concat(JSON.parse(JSON.stringify(pl)));
    });
  }

  ngAfterViewInit(): void {
    if (window.innerWidth < 768) {
      document
        .querySelector('.ngx-col .ngx-d-none')
        ?.classList.remove('ngx-d-none');

      document.querySelector('mat-slider')?.classList.remove('ngx-d-none');

      const fragment: Element = <Element>document.querySelector('.ngx-col');

      document
        ?.querySelector('.ngx-col')
        ?.parentNode?.parentNode?.childNodes.item(1)
        .appendChild(fragment);

      document
        ?.querySelector('.mat-card .ngx-col')
        ?.classList.remove('ngx-col');
    }
  }

  // PWA Updates Management
  updateClient() {
    if (!this.swUpdate.isEnabled) {
      console.log('Not Enabled');
      return;
    }
    this.swUpdate.available.subscribe((event) => {
      console.log(`current`, event.current, `available`, event.available);
      if (confirm('An update is available for the application. Install?')) {
        this.swUpdate.activateUpdate().then(() => location.reload());
      }
    });

    this.swUpdate.activated.subscribe((event) => {
      console.log(`current`, event.previous, `available`, event.current);
    });
  }
}
