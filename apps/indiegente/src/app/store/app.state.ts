import { Track } from './entities/playlist/playlist.model';

export interface AppState {
  palylist: ReadonlyArray<Track>;
}
