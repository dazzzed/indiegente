import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Playlist } from '@indiegente/api-interfaces';
import { expand, map, mergeMap, Observable, share } from 'rxjs';
import { Track } from 'ngx-audio-player';

@Component({
  selector: 'indiegente-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  msaapDisplayTitle = true;
  msaapDisplayPlayList = true;
  msaapPageSizeOptions = [2, 4, 6];
  msaapDisplayVolumeControls = true;

  currentPage = 1;

  constructor(private http: HttpClient) {}
  playlist$: Observable<Track[]> = this.http
    .get<Playlist[]>(`/api/indiegente?page=${this.currentPage}`)
    .pipe(
      share(),
      map((p) => {
        return p.map((ep) => {
          const track = new Track();

          track.link = ep.url;
          track.title = ep.label;
          track.duration = Number(ep.duration);

          return track;
        });
      })
    );

  loadMore() {}
}
