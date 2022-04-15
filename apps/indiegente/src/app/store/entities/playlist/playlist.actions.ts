import { createAction, props } from '@ngrx/store';
import { Track } from './playlist.model';

export const addTrack = createAction(
  '[Track List] Add Track',
  props<{ trackId: string }>()
);

export const removeTrack = createAction(
  '[Track Collection] Remove Track',
  props<{ trackId: string }>()
);

export const retrievedTrackList = createAction(
  '[Track List/API] Retrieve Playlist Success',
  props<{ playlist: ReadonlyArray<Track> }>()
);
