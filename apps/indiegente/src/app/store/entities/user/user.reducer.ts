import { createReducer, on } from '@ngrx/store';
import { setCurrentTrack, setUser } from './user.actions';
import { User } from './user.model';

export const initialState: Readonly<User> = <User>(
  JSON.parse(
    localStorage.getItem('indiegente-user') ||
      '{"currentTrack":{"index":1, "time": 0}}'
  )
);

export const userReducer = createReducer(
  initialState,
  on(setUser, (state, { user }) => user),
  on(setCurrentTrack, (state, { trackNr, time, title }) => {
    const userState: User = {
      ...state,
      currentTrack: { index: trackNr, time, title },
    };
    console.log(userState);

    localStorage.setItem('indiegente-user', JSON.stringify(userState));
    return userState;
  })
);
