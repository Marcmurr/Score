
export interface TurnScore {
  primary: number;
  secondary: number;
}

export interface PlayerState {
  name: string;
  commandPoints: number;
  scores: Record<number, TurnScore>;
  secondaryMissions: Record<number, (string | null)[]>;
}

export interface GameState {
  turn: number;
  primaryMission: string | null; // Mission ID
  player1: PlayerState;
  player2: PlayerState;
}

export type PlayerKey = 'player1' | 'player2';
export type ScoreType = 'primaryScore' | 'secondaryScore' | 'commandPoints';
