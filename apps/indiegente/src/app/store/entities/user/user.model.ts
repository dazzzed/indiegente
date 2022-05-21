export interface User {
  username: string;
  currentTrack: {
    index: number;
    time: number;
  };
}
