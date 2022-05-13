import { Track as ngxTrack } from 'ngx-audio-player';

export interface Track extends ngxTrack {
  pageNr: number;
  index: number;
}
