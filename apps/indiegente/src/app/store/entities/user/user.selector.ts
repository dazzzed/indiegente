import { createSelector, createFeatureSelector } from '@ngrx/store';
import { User } from './user.model';

export const selectUser = createFeatureSelector<User>('user');

export const selectCurrentTrack = createSelector(
  selectUser,
  (user) => user.currentTrack
);

export const selectCurrentTrackIndex = createSelector(
  selectUser,
  (user) => user.currentTrack?.index
);
