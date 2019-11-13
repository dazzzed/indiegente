import { Component, OnInit } from '@angular/core';
import { Track } from 'ngx-audio-player';

import { pods } from './podcasts/pods.json';
import { links } from './podcasts/mp3.json';

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

  ngOnInit() {
    this.msaapPlaylist = pods.map(pod => {
      return {
        title: pod.title,
        link: links.find(l => l.id === pod.id).link
      };
    });
    console.log(this.msaapPlaylist);
  }
}
