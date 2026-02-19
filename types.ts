
export interface PlayerState {
  name: string;
  commandPoints: number;
  scores: {
    [turn: number]: {
      primary: number;
      secondary: number;
    };
  };
  secondaryMissions: {
    [turn: number]: (string | null)[];
  };
}

export interface GameState {
  turn: number;
  primaryMission: string | null; // Mission ID
  player1: PlayerState;
  player2: PlayerState;
}

export type PlayerKey = 'player1' | 'player2';
export type ScoreType = 'primaryScore' | 'secondaryScore' | 'commandPoints';