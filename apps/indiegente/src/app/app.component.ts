import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Playlist } from '@indiegente/api-interfaces';
import { expand, map, mergeMap, Observable, share, tap, switchMap } from 'rxjs';
import { Track } from 'ngx-audio-player';
import { Store } from '@ngrx/store';
import { PlaylistService } from './services/playlist.service';
import { selectPlaylist } from './store/entities/playlist/playlist.selector';
import { retrievedTrackList } from './store/entities/playlist/playlist.actions';

@Component({
  selector: 'indiegente-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  msaapDisplayTitle = true;
  msaapDisplayPlayList = true;
  msaapPageSizeOptions = [2, 4, 6];
  msaapDisplayVolumeControls = true;

  currentPage = 1;

  playlist$!: Observable<Track[]>;
  playlist: Track[] = [];

  constructor(
    private store: Store,
    private playlistService: PlaylistService,
    private http: HttpClient
  ) {
    this.playlist$ = this.store.select(selectPlaylist).pipe(share());
  }

  ngOnInit(): void {
    this.playlistService
      .getPlaylist(1)
      .pipe(
        switchMap(() => this.playlist$),
        tap((pl) => (this.playlist = JSON.parse(JSON.stringify(pl))))
      )

      .subscribe();
  }
  loadMore() {}
}
