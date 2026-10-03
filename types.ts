
export type PlayerKey = 'player1' | 'player2';

export type SecondaryMode = 'tactical' | 'fixed';

// One scoring event: how many VP, in which battle round, and how they were scored.
export interface ScoreEntry {
  id: string;
  round: number;
  vp: number;
  reason: string; // e.g. "Held 2 objectives"; empty when not given
  at: number; // When it was recorded (ms since epoch), for ordering the score feed
}

export interface FixedSecondary {
  missionId: string | null;
  scores: ScoreEntry[];
}

export interface TacticalSecondary {
  missionId: string;
  drawnRound: number;
  status: 'active' | 'scored' | 'discarded';
  resolvedRound: number | null;
  scores: ScoreEntry[];
}

export interface PlayerState {
  name: string;
  faction: string;
  commandPoints: number;
  battleReady: boolean;
  forceDisposition: string | null; // Force Disposition ID
  primaryMission: string; // Name from the Force Disposition matrix
  primaryScores: ScoreEntry[];
  secondaryMode: SecondaryMode;
  fixedSecondaries: [FixedSecondary, FixedSecondary];
  tacticalSecondaries: TacticalSecondary[];
}

export interface GameState {
  version: number;
  round: number; // 1-5 are battle rounds, 6 is the summary
  firstPlayer: PlayerKey | null; // Who takes the first turn of each battle round
  player1: PlayerState;
  player2: PlayerState;
}

// Identifies which mission a score belongs to.
export type ScoreTarget =
  | { kind: 'primary' }
  | { kind: 'fixed'; slot: 0 | 1 }
  | { kind: 'tactical'; missionId: string };
