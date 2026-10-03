
import type { GameState, PlayerKey, PlayerState, ScoreEntry, ScoreTarget } from './types';
import { headroom, scoresFor } from './scoring';

// Bump when the shape of GameState changes, and teach parseGameState to
// upgrade the previous version.
export const STATE_VERSION = 3;
export const SUMMARY_ROUND = 6;

const createPlayer = (name: string): PlayerState => ({
  name,
  faction: '',
  commandPoints: 0,
  battleReady: false,
  forceDisposition: null,
  primaryMission: '',
  primaryScores: [],
  secondaryMode: 'tactical',
  fixedSecondaries: [{ missionId: null, scores: [] }, { missionId: null, scores: [] }],
  tacticalSecondaries: [],
});

export const createInitialGameState = (): GameState => ({
  version: STATE_VERSION,
  round: 1,
  firstPlayer: null,
  player1: createPlayer('Player 1'),
  player2: createPlayer('Player 2'),
});

export const isGameState = (data: unknown): data is GameState =>
  typeof data === 'object' && data !== null && (data as GameState).version === STATE_VERSION;

// Version 2 kept only a VP total per round; each becomes one entry without a reason.
type RoundVP = Record<string, number>;
type V2Player = Omit<PlayerState, 'faction' | 'primaryScores' | 'fixedSecondaries' | 'tacticalSecondaries'> & {
  primaryVP: RoundVP;
  fixedSecondaries: { missionId: string | null; vp: RoundVP }[];
  tacticalSecondaries: (Omit<PlayerState['tacticalSecondaries'][number], 'scores'> & { vp: RoundVP })[];
};

const entriesFromRoundVP = (vp: RoundVP, idPrefix: string): ScoreEntry[] =>
  Object.entries(vp)
    .filter(([, value]) => value > 0)
    .map(([round, value]) => ({ id: `${idPrefix}-r${round}`, round: Number(round), vp: value, reason: '', at: 0 }));

const upgradeV2Player = (player: V2Player, key: PlayerKey): PlayerState => {
  const { primaryVP, fixedSecondaries, tacticalSecondaries, ...rest } = player;
  return {
    ...rest,
    faction: '',
    primaryScores: entriesFromRoundVP(primaryVP, `${key}-primary`),
    fixedSecondaries: [0, 1].map(slot => ({
      missionId: fixedSecondaries[slot]?.missionId ?? null,
      scores: entriesFromRoundVP(fixedSecondaries[slot]?.vp ?? {}, `${key}-fixed${slot}`),
    })) as PlayerState['fixedSecondaries'],
    tacticalSecondaries: tacticalSecondaries.map(({ vp, ...card }) => ({
      ...card,
      scores: entriesFromRoundVP(vp, `${key}-${card.missionId}`),
    })),
  };
};

// Accepts a game state from storage or from the host, upgrading older versions.
export const parseGameState = (data: unknown): GameState | null => {
  if (isGameState(data)) return data;
  if (typeof data !== 'object' || data === null) return null;
  const old = data as { version?: number; round: number; player1: V2Player; player2: V2Player };
  if (old.version === 2) {
    return {
      version: STATE_VERSION,
      round: old.round,
      firstPlayer: null,
      player1: upgradeV2Player(old.player1, 'player1'),
      player2: upgradeV2Player(old.player2, 'player2'),
    };
  }
  return null;
};

export type PlayerChanges = Partial<
  Pick<PlayerState, 'name' | 'faction' | 'battleReady' | 'forceDisposition' | 'primaryMission' | 'secondaryMode'>
>;

type PlayerAction =
  | { type: 'updatePlayer'; player: PlayerKey; changes: PlayerChanges }
  | { type: 'changeCommandPoints'; player: PlayerKey; delta: number }
  | { type: 'addScore'; player: PlayerKey; target: ScoreTarget; entry: ScoreEntry }
  | { type: 'removeScore'; player: PlayerKey; target: ScoreTarget; entryId: string }
  | { type: 'setFixedSecondary'; player: PlayerKey; slot: 0 | 1; missionId: string | null }
  | { type: 'drawTactical'; player: PlayerKey; missionId: string; round: number }
  | { type: 'resolveTactical'; player: PlayerKey; missionId: string; status: 'scored' | 'discarded'; round: number }
  | { type: 'reopenTactical'; player: PlayerKey; missionId: string }
  | { type: 'returnTactical'; player: PlayerKey; missionId: string };

export type GameAction =
  | { type: 'sync'; state: GameState }
  | { type: 'reset' }
  | { type: 'changeRound'; delta: number }
  | { type: 'setFirstPlayer'; player: PlayerKey | null }
  | PlayerAction;

// Replaces the score list for `target` with the result of `update`.
const updateScores = (
  player: PlayerState,
  target: ScoreTarget,
  update: (scores: ScoreEntry[]) => ScoreEntry[],
): PlayerState => {
  switch (target.kind) {
    case 'primary':
      return { ...player, primaryScores: update(player.primaryScores) };
    case 'fixed': {
      const fixedSecondaries: PlayerState['fixedSecondaries'] = [...player.fixedSecondaries];
      const slot = fixedSecondaries[target.slot];
      fixedSecondaries[target.slot] = { ...slot, scores: update(slot.scores) };
      return { ...player, fixedSecondaries };
    }
    case 'tactical':
      return {
        ...player,
        tacticalSecondaries: player.tacticalSecondaries.map(card =>
          card.missionId === target.missionId ? { ...card, scores: update(card.scores) } : card,
        ),
      };
  }
};

const playerReducer = (player: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'updatePlayer':
      return { ...player, ...action.changes };

    case 'changeCommandPoints':
      return { ...player, commandPoints: Math.max(0, player.commandPoints + action.delta) };

    case 'addScore': {
      // Scores past a cap are trimmed to what still fits.
      const vp = Math.min(Math.floor(action.entry.vp), headroom(player, action.target, action.entry.round));
      if (vp <= 0) return player;
      return updateScores(player, action.target, scores => [...scores, { ...action.entry, vp }]);
    }

    case 'removeScore':
      if (!scoresFor(player, action.target)) return player;
      return updateScores(player, action.target, scores => scores.filter(entry => entry.id !== action.entryId));

    case 'setFixedSecondary': {
      const otherSlot = player.fixedSecondaries[action.slot === 0 ? 1 : 0];
      if (action.missionId && otherSlot.missionId === action.missionId) return player;

      const fixedSecondaries: PlayerState['fixedSecondaries'] = [...player.fixedSecondaries];
      // Swapping the mission keeps its scores (correcting a mis-pick); clearing the slot drops them.
      fixedSecondaries[action.slot] = action.missionId
        ? { ...fixedSecondaries[action.slot], missionId: action.missionId }
        : { missionId: null, scores: [] };
      return { ...player, fixedSecondaries };
    }

    case 'drawTactical':
      if (player.tacticalSecondaries.some(c => c.missionId === action.missionId)) return player;
      return {
        ...player,
        tacticalSecondaries: [
          ...player.tacticalSecondaries,
          { missionId: action.missionId, drawnRound: action.round, status: 'active', resolvedRound: null, scores: [] },
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
          c => c.missionId !== action.missionId || c.scores.length > 0,
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
    case 'setFirstPlayer':
      return { ...state, firstPlayer: action.player };
    default:
      return { ...state, [action.player]: playerReducer(state[action.player], action) };
  }
};

// Creates a score entry for an addScore action.
export const newScoreEntry = (round: number, vp: number, reason: string): ScoreEntry => {
  const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  return { id: `${Date.now().toString(36)}-${random}`, round, vp, reason: reason.trim(), at: Date.now() };
};
