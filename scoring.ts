
import type { PlayerState, ScoreEntry, ScoreTarget } from './types';

// 11th edition scoring limits, per player.
export const ROUNDS = [1, 2, 3, 4, 5];
export const PRIMARY_ROUND_CAP = 15;
export const PRIMARY_GAME_CAP = 45;
export const SECONDARY_ROUND_CAP = 15;
export const SECONDARY_GAME_CAP = 45;
export const FIXED_SECONDARY_CAP = 20; // Per Fixed Secondary Mission, per game
export const BATTLE_READY_VP = 10;

// Total VP of `scores`, or only those from `round` when given.
export const sumScores = (scores: ScoreEntry[], round?: number): number =>
  scores.reduce((sum, entry) => (round === undefined || entry.round === round ? sum + entry.vp : sum), 0);

// Score lists that count towards the player's secondary total in their current mode.
export const countedSecondaryScores = (player: PlayerState): ScoreEntry[][] =>
  player.secondaryMode === 'fixed'
    ? player.fixedSecondaries.map(slot => slot.scores)
    : player.tacticalSecondaries.map(card => card.scores);

export const primaryInRound = (player: PlayerState, round: number): number => sumScores(player.primaryScores, round);

export const primaryTotal = (player: PlayerState): number => sumScores(player.primaryScores);

export const secondaryInRound = (player: PlayerState, round: number): number =>
  countedSecondaryScores(player).reduce((sum, scores) => sum + sumScores(scores, round), 0);

export const secondaryTotal = (player: PlayerState): number =>
  countedSecondaryScores(player).reduce((sum, scores) => sum + sumScores(scores), 0);

export const totalScore = (player: PlayerState): number =>
  primaryTotal(player) + secondaryTotal(player) + (player.battleReady ? BATTLE_READY_VP : 0);

// The score list for `target`, or null when nothing can be scored there
// (an empty Fixed slot, a card not in play, or a mission from the other mode).
export const scoresFor = (player: PlayerState, target: ScoreTarget): ScoreEntry[] | null => {
  switch (target.kind) {
    case 'primary':
      return player.primaryScores;
    case 'fixed': {
      const slot = player.fixedSecondaries[target.slot];
      return player.secondaryMode === 'fixed' && slot.missionId ? slot.scores : null;
    }
    case 'tactical': {
      const card = player.tacticalSecondaries.find(c => c.missionId === target.missionId);
      return player.secondaryMode === 'tactical' && card ? card.scores : null;
    }
  }
};

// The most VP that can still be added to `target` in `round` without breaking a cap.
export const headroom = (player: PlayerState, target: ScoreTarget, round: number): number => {
  const scores = scoresFor(player, target);
  if (!scores) return 0;
  if (target.kind === 'primary') {
    return Math.max(0, Math.min(PRIMARY_ROUND_CAP - primaryInRound(player, round), PRIMARY_GAME_CAP - primaryTotal(player)));
  }
  const limits = [SECONDARY_ROUND_CAP - secondaryInRound(player, round), SECONDARY_GAME_CAP - secondaryTotal(player)];
  if (target.kind === 'fixed') limits.push(FIXED_SECONDARY_CAP - sumScores(scores));
  return Math.max(0, Math.min(...limits));
};

// The most VP the player could still add from `fromRound` to the end of the game.
export const remainingPotential = (player: PlayerState, fromRound: number) => {
  const rounds = ROUNDS.filter(round => round >= fromRound);
  const primary = Math.min(
    PRIMARY_GAME_CAP - primaryTotal(player),
    rounds.reduce((sum, round) => sum + PRIMARY_ROUND_CAP - primaryInRound(player, round), 0),
  );
  const secondaryLimits = [
    SECONDARY_GAME_CAP - secondaryTotal(player),
    rounds.reduce((sum, round) => sum + SECONDARY_ROUND_CAP - secondaryInRound(player, round), 0),
  ];
  if (player.secondaryMode === 'fixed') {
    secondaryLimits.push(player.fixedSecondaries.reduce((sum, slot) => sum + FIXED_SECONDARY_CAP - sumScores(slot.scores), 0));
  }
  const secondary = Math.min(...secondaryLimits);
  return { primary: Math.max(0, primary), secondary: Math.max(0, secondary) };
};
