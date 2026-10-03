
import type { GameState } from './types';
import { parseGameState } from './gameReducer';

// Browser storage can be unavailable (private windows, blocked site data), so
// every access is wrapped and the app keeps working without it.

const SAVED_GAME_KEY = 'score:game';
const HOST_ID_KEY = 'score:hostId';

export const loadSavedGame = (): GameState | null => {
  try {
    const raw = localStorage.getItem(SAVED_GAME_KEY);
    return raw ? parseGameState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

export const saveGame = (state: GameState): void => {
  try {
    localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(state));
  } catch {
    // Not saved; the game still works for this session.
  }
};

// The host's PeerJS ID is part of the share links, so it is kept across
// reloads to avoid having to update the link in OBS.
export const getHostId = (): string => {
  try {
    const saved = localStorage.getItem(HOST_ID_KEY);
    if (saved) return saved;
  } catch {
    // Fall through to a new ID.
  }
  return createHostId();
};

// Replaces the host ID, so links shared with the old one stop working.
export const createHostId = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const id = `score-${Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')}`;
  try {
    localStorage.setItem(HOST_ID_KEY, id);
  } catch {
    // The link will change on the next reload.
  }
  return id;
};
