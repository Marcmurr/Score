
import type { GameState, PlayerKey, PlayerState, RoundVP, SecondaryTarget } from './types';
import {
  FIXED_SECONDARY_CAP,
  PRIMARY_GAME_CAP,
  PRIMARY_ROUND_CAP,
  SECONDARY_GAME_CAP,
  SECONDARY_ROUND_CAP,
  clampVPChange,
  primaryInRound,
  primaryTotal,
  secondaryInRound,
  secondaryTotal,
  sumVP,
  vpIn,
} from './scoring';

// Bump when the shape of GameState changes, so viewers ignore incompatible hosts.
export const STATE_VERSION = 2;
export const SUMMARY_ROUND = 6;

const createPlayer = (name: string): PlayerState => ({
  name,
  commandPoints: 0,
  battleReady: false,
  forceDisposition: null,
  primaryMission: '',
  primaryVP: {},
  secondaryMode: 'tactical',
  fixedSecondaries: [{ missionId: null, vp: {} }, { missionId: null, vp: {} }],
  tacticalSecondaries: [],
});

export const createInitialGameState = (): GameState => ({
  version: STATE_VERSION,
  round: 1,
  player1: createPlayer('Player 1'),
  player2: createPlayer('Player 2'),
});

export const isGameState = (data: unknown): data is GameState =>
  typeof data === 'object' && data !== null && (data as GameState).version === STATE_VERSION;

export type PlayerChanges = Partial<
  Pick<PlayerState, 'name' | 'battleReady' | 'forceDisposition' | 'primaryMission' | 'secondaryMode'>
>;

type PlayerAction =
  | { type: 'updatePlayer'; player: PlayerKey; changes: PlayerChanges }
  | { type: 'changeCommandPoints'; player: PlayerKey; delta: number }
  | { type: 'changePrimaryVP'; player: PlayerKey; round: number; delta: number }
  | { type: 'changeSecondaryVP'; player: PlayerKey; target: SecondaryTarget; round: number; delta: number }
  | { type: 'setFixedSecondary'; player: PlayerKey; slot: 0 | 1; missionId: string | null }
  | { type: 'drawTactical'; player: PlayerKey; missionId: string; round: number }
  | { type: 'resolveTactical'; player: PlayerKey; missionId: string; status: 'scored' | 'discarded'; round: number }
  | { type: 'reopenTactical'; player: PlayerKey; missionId: string }
  | { type: 'returnTactical'; player: PlayerKey; missionId: string };

export type GameAction =
  | { type: 'sync'; state: GameState }
  | { type: 'reset' }
  | { type: 'changeRound'; delta: number }
  | PlayerAction;

const addVP = (vp: RoundVP, round: number, delta: number): RoundVP => ({
  ...vp,
  [round]: vpIn(vp, round) + delta,
});

const changeSecondaryVP = (
  player: PlayerState,
  target: SecondaryTarget,
  round: number,
  delta: number,
): PlayerState => {
  const sharedHeadroom = [
    SECONDARY_ROUND_CAP - secondaryInRound(player, round),
    SECONDARY_GAME_CAP - secondaryTotal(player),
  ];

  if (target.kind === 'fixed') {
    const slot = player.fixedSecondaries[target.slot];
    if (player.secondaryMode !== 'fixed' || !slot.missionId) return player;

    const change = clampVPChange(delta, vpIn(slot.vp, round), [
      ...sharedHeadroom,
      FIXED_SECONDARY_CAP - sumVP(slot.vp),
    ]);
    if (change === 0) return player;

    const fixedSecondaries: PlayerState['fixedSecondaries'] = [...player.fixedSecondaries];
    fixedSecondaries[target.slot] = { ...slot, vp: addVP(slot.vp, round, change) };
    return { ...player, fixedSecondaries };
  }

  const card = player.tacticalSecondaries.find(c => c.missionId === target.missionId);
  if (player.secondaryMode !== 'tactical' || !card) return player;

  const change = clampVPChange(delta, vpIn(card.vp, round), sharedHeadroom);
  if (change === 0) return player;

  return {
    ...player,
    tacticalSecondaries: player.tacticalSecondaries.map(c =>
      c === card ? { ...c, vp: addVP(c.vp, round, change) } : c,
    ),
  };
};

const playerReducer = (player: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'updatePlayer':
      return { ...player, ...action.changes };

    case 'changeCommandPoints':
      return { ...player, commandPoints: Math.max(0, player.commandPoints + action.delta) };

    case 'changePrimaryVP': {
      const change = clampVPChange(action.delta, primaryInRound(player, action.round), [
        PRIMARY_ROUND_CAP - primaryInRound(player, action.round),
        PRIMARY_GAME_CAP - primaryTotal(player),
      ]);
      if (change === 0) return player;
      return { ...player, primaryVP: addVP(player.primaryVP, action.round, change) };
    }

    case 'changeSecondaryVP':
      return changeSecondaryVP(player, action.target, action.round, action.delta);

    case 'setFixedSecondary': {
      const otherSlot = player.fixedSecondaries[action.slot === 0 ? 1 : 0];
      if (action.missionId && otherSlot.missionId === action.missionId) return player;

      const fixedSecondaries: PlayerState['fixedSecondaries'] = [...player.fixedSecondaries];
      // Swapping the mission keeps its VP (correcting a mis-pick); clearing the slot drops it.
      fixedSecondaries[action.slot] = action.missionId
        ? { ...fixedSecondaries[action.slot], missionId: action.missionId }
        : { missionId: null, vp: {} };
      return { ...player, fixedSecondaries };
    }

    case 'drawTactical':
      if (player.tacticalSecondaries.some(c => c.missionId === action.missionId)) return player;
      return {
        ...player,
        tacticalSecondaries: [
          ...player.tacticalSecondaries,
          { missionId: action.missionId, drawnRound: action.round, status: 'active', resolvedRound: null, vp: {} },
        ],
      };

    case 'resolveTactical':
      return {
        ...player,
        tacticalSecondaries: player.tacticalSecondaries.map(c =>
          c.missionId === action.missionId && c.status === 'active'
            ? { ...c, status: action.status, resolvedRound: action.round }
            : c,
        ),
      };

    case 'reopenTactical':
      return {
        ...player,
        tacticalSecondaries: player.tacticalSecondaries.map(c =>
          c.missionId === action.missionId ? { ...c, status: 'active', resolvedRound: null } : c,
        ),
      };

    case 'returnTactical':
      // Undo a mis-draw: put an unscored card back in the deck.
      return {
        ...player,
        tacticalSecondaries: player.tacticalSecondaries.filter(
          c => c.missionId !== action.missionId || sumVP(c.vp) > 0,
        ),
      };
  }
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'sync':
      return action.state;
    case 'reset':
      return createInitialGameState();
    case 'changeRound':
      return { ...state, round: Math.max(1, Math.min(SUMMARY_ROUND, state.round + action.delta)) };
    default:
      return { ...state, [action.player]: playerReducer(state[action.player], action) };
  }
};
