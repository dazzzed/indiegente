import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Track } from './playlist.model';

export const selectPlaylist = createFeatureSelector<Track[]>('playlist');

export const selectTrackCollection = createSelector(
  selectPlaylist,
  (playlist) => playlist
);
