import { Component } from '@angular/core';
import { Track } from 'ngx-audio-player';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  msaapDisplayTitle = true;
  msaapDisplayPlayList = true;
  msaapPageSizeOptions = [2, 4, 6];
  msaapDisplayVolumeControls = true;

  // Material Style Advance Audio Player Playlist
  msaapPlaylist: Track[] = [
    {
      title: 'Audio One Title',
      link:
        'https://cdn-ondemand.rtp.pt/nas2.share/wavrss/at3/1205/1899373_112355-1205021849.mp3'
    },
    {
      title: 'Audio Two Title',
      link:
        'https://cdn-ondemand.rtp.pt/nas2.share/wavrss/at3/1201/1739695_105533-1201181858.mp3'
    },
    {
      title: 'Audio Three Title',
      link: 'Link to Audio Three URL'
    }
  ];
}
