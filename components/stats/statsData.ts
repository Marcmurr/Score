
import type { GameState, PlayerKey, PlayerState, ScoreEntry, TacticalSecondary } from '../../types';
import { getSecondaryName } from '../../data/missions';
import { BATTLE_READY_VP, ROUNDS, primaryInRound, secondaryInRound, sumScores } from '../../scoring';

// Identity colors for each player on the stats page (validated as a pair on the
// dark chart surface). Text never uses them; they mark swatches, lines and dots.
export const PLAYER_COLORS: Record<PlayerKey, string> = {
  player1: '#3987e5',
  player2: '#d95926',
};

export const LAST_ROUND = ROUNDS[ROUNDS.length - 1];

// The player who goes first is listed first.
export const turnOrder = (state: GameState): PlayerKey[] =>
  state.firstPlayer === 'player2' ? ['player2', 'player1'] : ['player1', 'player2'];

export const otherPlayer = (key: PlayerKey): PlayerKey => (key === 'player1' ? 'player2' : 'player1');

// Battle rounds that have started (all five once the game is over).
export const playedRounds = (state: GameState): number[] => ROUNDS.filter(round => round <= state.round);

export interface ScoreLine {
  id: string;
  kind: 'primary' | 'secondary';
  mission: string;
  reason: string;
  vp: number;
  round: number;
  at: number;
}

const toLines = (scores: ScoreEntry[], kind: ScoreLine['kind'], mission: string): ScoreLine[] =>
  scores.map(entry => ({ id: entry.id, kind, mission, reason: entry.reason, vp: entry.vp, round: entry.round, at: entry.at }));

// Every score that counts towards the player's total, with the mission it came from.
export const scoreLines = (player: PlayerState): ScoreLine[] => {
  const secondaries =
    player.secondaryMode === 'fixed'
      ? player.fixedSecondaries.flatMap(slot => (slot.missionId ? toLines(slot.scores, 'secondary', getSecondaryName(slot.missionId)) : []))
      : player.tacticalSecondaries.flatMap(card => toLines(card.scores, 'secondary', getSecondaryName(card.missionId)));
  return [...toLines(player.primaryScores, 'primary', player.primaryMission || 'Primary'), ...secondaries];
};

// Running total after each round: index 0 is the start of the game (Battle Ready VP).
export const cumulativeScores = (player: PlayerState): number[] => {
  const totals = [player.battleReady ? BATTLE_READY_VP : 0];
  ROUNDS.forEach(round => totals.push(totals[totals.length - 1] + primaryInRound(player, round) + secondaryInRound(player, round)));
  return totals;
};

// Tactical cards drawn and discarded during `round`.
export const cardMovesInRound = (player: PlayerState, round: number) => {
  if (player.secondaryMode !== 'tactical') return { drawn: [], discarded: [] };
  const names = (cards: TacticalSecondary[]) => cards.map(card => getSecondaryName(card.missionId));
  return {
    drawn: names(player.tacticalSecondaries.filter(card => card.drawnRound === round)),
    discarded: names(player.tacticalSecondaries.filter(card => card.status === 'discarded' && card.resolvedRound === round)),
  };
};

export interface ReasonTotal {
  reason: string;
  count: number;
  vp: number;
}

// VP grouped by how they were scored, biggest first.
export const reasonTotals = (scores: ScoreEntry[]): ReasonTotal[] => {
  const byReason = new Map<string, ReasonTotal>();
  scores.forEach(entry => {
    const reason = entry.reason || 'Other';
    const total = byReason.get(reason) ?? { reason, count: 0, vp: 0 };
    byReason.set(reason, { ...total, count: total.count + 1, vp: total.vp + entry.vp });
  });
  return [...byReason.values()].sort((a, b) => b.vp - a.vp);
};

export interface FeedItem extends ScoreLine {
  player: PlayerKey;
}

// The most recent scores across both players, newest first.
export const latestScores = (state: GameState, count: number): FeedItem[] =>
  (['player1', 'player2'] as PlayerKey[])
    .flatMap(key => scoreLines(state[key]).map(line => ({ ...line, player: key })))
    .sort((a, b) => b.at - a.at || b.round - a.round)
    .slice(0, count);

export interface CardSummary {
  drawn: number;
  scored: number;
  discarded: number;
  inHand: number;
  averageScored: number | null;
}

export const tacticalSummary = (player: PlayerState): CardSummary => {
  const cards = player.tacticalSecondaries;
  const scored = cards.filter(card => card.status === 'scored');
  return {
    drawn: cards.length,
    scored: scored.length,
    discarded: cards.filter(card => card.status === 'discarded').length,
    inHand: cards.filter(card => card.status === 'active').length,
    averageScored: scored.length ? scored.reduce((sum, card) => sum + sumScores(card.scores), 0) / scored.length : null,
  };
};

export interface CpRound {
  gained: number;
  spent: number;
  stratagems: { id: string; name: string; cost: number }[];
  leftAfter: number;
}

// Command Points gained and spent in `round`, what they were spent on, and CP left after it.
export const cpInRound = (player: PlayerState, round: number): CpRound => {
  const entries = player.cpLog.filter(entry => entry.round === round);
  return {
    gained: entries.reduce((sum, entry) => sum + Math.max(0, entry.delta), 0),
    spent: entries.reduce((sum, entry) => sum - Math.min(0, entry.delta), 0),
    stratagems: entries
      .filter(entry => entry.delta < 0)
      .map(entry => ({ id: entry.id, name: entry.reason || 'Unnamed', cost: -entry.delta })),
    leftAfter: player.cpLog.reduce((sum, entry) => (entry.round <= round ? sum + entry.delta : sum), 0),
  };
};
