import { createReducer, on } from '@ngrx/store';

import { retrievedTrackList, addPageTracks } from './playlist.actions';
import { Track } from './playlist.model';

export const initialState: ReadonlyArray<Track> = [];

export const playlistReducer = createReducer(
  initialState,
  on(retrievedTrackList, (state, { playlist }) => playlist),
  on(addPageTracks, (state, { playlist }) => [...state, ...playlist])
);
