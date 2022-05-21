import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Playlist } from '@indiegente/api-interfaces';
import { Store } from '@ngrx/store';
import { map, tap } from 'rxjs';
import {
  addPageTracks,
  retrievedTrackList,
} from '../store/entities/playlist/playlist.actions';
import { Track } from '../store/entities/playlist/playlist.model';
import { setCurrentTrack } from '../store/entities/user/user.actions';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  constructor(private http: HttpClient, private store: Store) {}

  getPlaylist(pageNr: number) {
    return this.http.get<Playlist[]>(`/api/indiegente?page=${pageNr}`).pipe(
      map((p) => {
        return (
          p.map((ep, i) => {
            const track: Track = {
              link: ep.url,
              index: i,
              pageNr: pageNr,
              title: ep.label,
              duration: Number(ep.duration.trim().replace('min', '')),
            };

            return track;
          }) || []
        );
      }),
      tap((playlist) =>
        pageNr === 1
          ? this.store.dispatch(retrievedTrackList({ playlist }))
          : this.store.dispatch(addPageTracks({ playlist }))
      )
    );
  }
}
