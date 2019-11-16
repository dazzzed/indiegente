import { Component, OnInit } from '@angular/core';
import { Track } from 'ngx-audio-player';

import { pods } from '../../indiegente-be/podcasts/pods.json';
import { links } from '../../indiegente-be/podcasts/mp3.json';

import { faSortAmountDownAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  msaapDisplayTitle = true;
  msaapDisplayPlayList = true;
  msaapPageSizeOptions = [2, 4, 6];
  msaapDisplayVolumeControls = true;

  // Material Style Advance Audio Player Playlist
  msaapPlaylist: Track[] = [];
  faSortAmountDownAlt = faSortAmountDownAlt;
  ngOnInit() {
    this.msaapPlaylist = pods
      .map(pod => {
        return {
          title: pod.title,
          link: links.find(l => l.id === pod.id).link
        };
      })
      .reverse();
    console.log(this.msaapPlaylist);
  }

  revertOrder() {
    this.msaapPlaylist = [];
    this.msaapPlaylist = this.msaapPlaylist.reverse();
  }
}
