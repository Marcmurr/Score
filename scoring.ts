
import type { PlayerState, RoundVP } from './types';

// 11th edition scoring limits, per player.
export const ROUNDS = [1, 2, 3, 4, 5];
export const PRIMARY_ROUND_CAP = 15;
export const PRIMARY_GAME_CAP = 45;
export const SECONDARY_ROUND_CAP = 15;
export const SECONDARY_GAME_CAP = 45;
export const FIXED_SECONDARY_CAP = 20; // Per Fixed Secondary Mission, per game
export const BATTLE_READY_VP = 10;

export const vpIn = (vp: RoundVP, round: number): number => vp[round] ?? 0;

export const sumVP = (vp: RoundVP): number =>
  ROUNDS.reduce((sum, round) => sum + vpIn(vp, round), 0);

// VP records that count towards the player's secondary score in their current mode.
export const countedSecondaryVP = (player: PlayerState): RoundVP[] =>
  player.secondaryMode === 'fixed'
    ? player.fixedSecondaries.map(slot => slot.vp)
    : player.tacticalSecondaries.map(card => card.vp);

export const primaryInRound = (player: PlayerState, round: number): number =>
  vpIn(player.primaryVP, round);

export const primaryTotal = (player: PlayerState): number => sumVP(player.primaryVP);

export const secondaryInRound = (player: PlayerState, round: number): number =>
  countedSecondaryVP(player).reduce((sum, vp) => sum + vpIn(vp, round), 0);

export const secondaryTotal = (player: PlayerState): number =>
  countedSecondaryVP(player).reduce((sum, vp) => sum + sumVP(vp), 0);

export const totalScore = (player: PlayerState): number =>
  primaryTotal(player) + secondaryTotal(player) + (player.battleReady ? BATTLE_READY_VP : 0);

// Clamps a change to a VP value so it never goes below zero and, when adding,
// never pushes any running total past its cap. `headroom` lists the VP still
// available under each cap that applies.
export const clampVPChange = (delta: number, current: number, headroom: number[]): number => {
  if (delta <= 0) {
    return Math.max(delta, -current);
  }
  return Math.max(0, Math.min(delta, ...headroom));
};
