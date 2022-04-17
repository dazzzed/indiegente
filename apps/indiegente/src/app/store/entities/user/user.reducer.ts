import { createReducer, on } from '@ngrx/store';
import { setCurrentTrack, setUser } from './user.actions';
import { User } from './user.model';

export const initialState: Readonly<User> = <User>(
  JSON.parse(localStorage.getItem('indiegente-user') || '')
);

export const userReducer = createReducer(
  initialState,
  on(setUser, (state, { user }) => user),
  on(setCurrentTrack, (state, { trackNr }) => {
    const userState = {
      ...state,
      currentTrackIndex: trackNr,
    };
    console.log(userState);

    localStorage.setItem('indiegente-user', JSON.stringify(userState));
    return userState;
  })
);
