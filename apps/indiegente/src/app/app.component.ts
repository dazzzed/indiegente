import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
  BehaviorSubject,
  takeWhile,
  concat,
  fromEvent,
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
export class AppComponent implements OnInit {
  @ViewChildren('trackEl')
  tracks!: QueryList<ElementRef<HTMLAudioElement>>;
  msaapDisplayTitle = true;
  msaapDisplayPlayList = true;
  msaapPageSizeOptions = [2, 4, 6];
  msaapDisplayVolumeControls = true;

  currentPage = 1;

  playlist$!: Observable<Track[]>;
  playlist: Track[] = [];
  currenTrack$: Observable<number>;
  playingTrackEl!: HTMLAudioElement;
  pageChange$: any;

  lastPlayedTrackIndnex!: number;
  playingTrackIndex = 0;

  constructor(
    private store: Store,
    private playlistService: PlaylistService,
    private http: HttpClient,
    private swUpdate: SwUpdate
  ) {
    this.updateClient();

    this.currenTrack$ = this.store.select(selectCurrentTrack);
    this.playlist$ = this.store.select(selectPlaylist);
  }

  ngOnInit(): void {
    this.playlistService
      .getPlaylist(1)
      .subscribe(
        () =>
          (this.playingTrackEl = <HTMLAudioElement>(
            this.tracks?.find((_track, i) => i === 0)?.nativeElement
          ))
      );
  }

  ended(index: number) {
    this.playlist$.pipe(take(1)).subscribe((playlist) => {
      if (index + 1 === playlist.length) {
        this.playlistService
          .getPlaylist(Math.ceil(playlist.length / 12) + 1)
          .subscribe(() => this.playNext(index));
      } else {
        this.playNext(index);
      }
    });
  }

  playPause() {
    this.playingTrackEl.paused
      ? this.playingTrackEl.play()
      : this.playingTrackEl.pause();
  }

  playNext(index: number) {
    this.playingTrackEl.pause();

    setTimeout(() => {
      this.playingTrackEl = <HTMLAudioElement>(
        this.tracks?.find((_track, i) => i === index + 1)?.nativeElement
      );

      this.playingTrackIndex = index + 1;
      this.playingTrackEl.play();
    }, 100);
  }

  playPrevious(index: number) {
    this.playingTrackEl.pause();
    this.playingTrackEl = <HTMLAudioElement>(
      this.tracks?.find((_track, i) => i === index - 1)?.nativeElement
    );
    this.playingTrackIndex = index - 1;
    this.playingTrackEl.play();
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
