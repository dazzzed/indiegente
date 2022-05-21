import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  tap,
  switchMap,
  take,
  forkJoin,
  of,
  Subject,
  fromEvent,
  first,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { PlaylistService } from './services/playlist.service';
import { selectPlaylist } from './store/entities/playlist/playlist.selector';
import {
  selectCurrentTrack,
  selectCurrentTrackIndex,
} from './store/entities/user/user.selector';
import { SwUpdate } from '@angular/service-worker';
import { setCurrentTrack } from './store/entities/user/user.actions';
import { Track } from './store/entities/playlist/playlist.model';

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
  currenTrack$: Observable<{ index: number; time: number; title: string }>;
  palyingTrack$: Subject<Track> = new Subject();
  playingTrackEl!: HTMLAudioElement;
  pageChange$: any;

  lastPlayedTrackIndnex!: number;
  playingTrackIndex = 0;
  lastPlayedTrackIndex$: Observable<number>;
  playingTrackTime = 0;

  constructor(
    private store: Store,
    private playlistService: PlaylistService,
    private http: HttpClient,
    private swUpdate: SwUpdate,
    private cdr: ChangeDetectorRef
  ) {
    this.updateClient();

    this.currenTrack$ = this.store.select(selectCurrentTrack);
    this.playlist$ = this.store.select(selectPlaylist);
    this.lastPlayedTrackIndex$ = this.store.select(selectCurrentTrackIndex);
  }

  ngOnInit(): void {
    this.setupPlayer();
    this.saveStateOnclose();
  }

  saveStateOnclose() {
    fromEvent(window, 'beforeunload')
      .pipe(tap(() => this.updateStoredLastTrackIndex()))
      .subscribe();
  }

  private setupPlayer() {
    this.playlistService
      .getPlaylist(1)
      .pipe(
        switchMap(() => this.lastPlayedTrackIndex$.pipe(take(1))),
        switchMap((lastPlayedTrackIndex) => {
          if (lastPlayedTrackIndex > 12) {
            const reqs = [];

            for (let i = 2; i <= Math.ceil(lastPlayedTrackIndex / 12); i++) {
              reqs.push(this.playlistService.getPlaylist(i));
            }
            return forkJoin(reqs);
          }
          return of(null);
        }),
        switchMap(() =>
          forkJoin({
            pl: this.playlist$.pipe(first()),
            track: this.currenTrack$.pipe(first()),
          })
        ),
        switchMap(({ pl, track }) => {
          this.playingTrackTime = track.time;
          this.playingTrackIndex = pl.findIndex((t) => t.title === track.title);
          return this.tracks.changes;
        }),
        tap((els: QueryList<ElementRef<HTMLAudioElement>>) => {
          const playTrack = <HTMLAudioElement>(
            els.get(this.playingTrackIndex)?.nativeElement
          );
          playTrack.currentTime = this.playingTrackTime;
          this.playingTrackEl = playTrack;
          this.cdr.detectChanges();
        })
      )
      .subscribe(console.log);
  }

  ended(index: number) {
    this.playlist$
      .pipe(
        take(1),
        tap((playlist) => {
          if (index + 1 === playlist.length) {
            this.playlistService
              .getPlaylist(Math.ceil(playlist.length / 12) + 1)
              .subscribe(() => {
                this.playNext(index);
                this.palyingTrack$.next(playlist[index]);
              });
          } else {
            this.playNext(index);
            this.palyingTrack$.next(playlist[index]);
          }
        })
      )
      .subscribe();
  }

  updatestate(trackEl: HTMLAudioElement, index: number) {
    if (this.playingTrackEl && this.playingTrackIndex !== index)
      this.playingTrackEl.pause();

    this.playingTrackEl = trackEl;
    this.playingTrackIndex = index;
    this.playingTrackEl.play();
    this.playlist$.pipe(take(1)).subscribe((playlist) => {
      this.palyingTrack$.next(playlist[index]);
    });
    this.updateStoredLastTrackIndex();
  }

  updateStoredLastTrackIndex() {
    this.playlist$.pipe(take(1)).subscribe((playlist) => {
      this.store.dispatch(
        setCurrentTrack({
          trackNr: this.playingTrackIndex,
          time: this.playingTrackEl.currentTime,
          title: playlist[this.playingTrackIndex].title,
        })
      );
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
      this.playingTrackTime = 0;
      this.playingTrackEl.play();
      this.updateStoredLastTrackIndex();
      this.playlist$.pipe(take(1)).subscribe((playlist) => {
        this.palyingTrack$.next(playlist[index]);
      });
    }, 100);
  }

  loadNextPage() {
    this.playlist$.pipe(take(1)).subscribe((playlist) => {
      this.playlistService
        .getPlaylist(Math.ceil(playlist.length / 12) + 1)
        .subscribe();
    });
  }

  playPrevious(index: number) {
    this.playingTrackEl.pause();
    this.playingTrackEl = <HTMLAudioElement>(
      this.tracks?.find((_track, i) => i === index - 1)?.nativeElement
    );
    this.playingTrackIndex = index - 1;
    this.playingTrackTime = 0;
    this.playingTrackEl.play();
    this.updateStoredLastTrackIndex();
    this.playlist$.pipe(take(1)).subscribe((playlist) => {
      this.palyingTrack$.next(playlist[index]);
    });
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
