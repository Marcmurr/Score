
export type PlayerKey = 'player1' | 'player2';

export type SecondaryMode = 'tactical' | 'fixed';

// VP scored, keyed by battle round (1-5).
export type RoundVP = Record<number, number>;

export interface FixedSecondary {
  missionId: string | null;
  vp: RoundVP;
}

export interface TacticalSecondary {
  missionId: string;
  drawnRound: number;
  status: 'active' | 'scored' | 'discarded';
  resolvedRound: number | null;
  vp: RoundVP;
}

export interface PlayerState {
  name: string;
  commandPoints: number;
  battleReady: boolean;
  forceDisposition: string | null; // Force Disposition ID
  primaryMission: string; // Name from the Force Disposition matrix
  primaryVP: RoundVP;
  secondaryMode: SecondaryMode;
  fixedSecondaries: [FixedSecondary, FixedSecondary];
  tacticalSecondaries: TacticalSecondary[];
}

export interface GameState {
  version: number;
  round: number; // 1-5 are battle rounds, 6 is the summary
  player1: PlayerState;
  player2: PlayerState;
}

// Identifies which secondary a VP change applies to.
export type SecondaryTarget =
  | { kind: 'fixed'; slot: 0 | 1 }
  | { kind: 'tactical'; missionId: string };
