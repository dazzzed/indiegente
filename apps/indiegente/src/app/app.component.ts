import { Component, OnInit, ViewChild } from '@angular/core';
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
} from 'rxjs';
import { AudioPlayerComponent, Track } from 'ngx-audio-player';
import { Store } from '@ngrx/store';
import { PlaylistService } from './services/playlist.service';
import { selectPlaylist } from './store/entities/playlist/playlist.selector';
import { retrievedTrackList } from './store/entities/playlist/playlist.actions';
import { selectCurrentTrack } from './store/entities/user/user.selector';

@Component({
  selector: 'indiegente-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
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
    private http: HttpClient
  ) {
    this.currenTrack$ = this.store.select(selectCurrentTrack);
  }

  ngOnInit(): void {
    this.playlistService
      .getPlaylist(1)
      .pipe(
        tap((pl) => (this.playlist = JSON.parse(JSON.stringify(pl)))),
        switchMap(() => this.currenTrack$),
        tap((index) => this.audioPlayer.selectTrack(index))
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
}
