import { createAction, props } from '@ngrx/store';
import { User } from './user.model';

export const setUser = createAction('[User] Set User', props<{ user: User }>());

export const setCurrentTrack = createAction(
  '[User] Set User CurentTrack',
  props<{ trackNr: number }>()
);
