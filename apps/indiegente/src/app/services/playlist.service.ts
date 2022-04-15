import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Playlist } from '@indiegente/api-interfaces';
import { Store } from '@ngrx/store';
import { Track } from 'ngx-audio-player';
import { map, tap } from 'rxjs';
import { retrievedTrackList } from '../store/entities/playlist/playlist.actions';

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
            const track = new Track();

            track.link = ep.url;
            track.index = i;
            track.title = ep.label;
            track.duration = Number(ep.duration.trim().replace('min', ''));

            return track;
          }) || []
        );
      }),
      tap((playlist) => this.store.dispatch(retrievedTrackList({ playlist })))
    );
  }
}