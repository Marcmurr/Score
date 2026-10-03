
import { useSyncExternalStore } from 'react';

// Reasons the scorekeeper has used before, remembered per mission on this
// device so they become one-tap buttons in later rounds and games.

export interface ScoringPreset {
  label: string;
  vp: number;
}

type PresetStore = Record<string, ScoringPreset[]>;

const STORAGE_KEY = 'score:presets';
const NO_PRESETS: ScoringPreset[] = [];

const load = (): PresetStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PresetStore) : {};
  } catch {
    return {};
  }
};

let presets = load();
const listeners = new Set<() => void>();

const update = (key: string, next: ScoringPreset[]) => {
  presets = { ...presets, [key]: next };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Remembered for this session only.
  }
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Presets are keyed by mission, so both players share them in a mirror match.
export const primaryPresetKey = (missionName: string) => `primary:${missionName.trim().toLowerCase()}`;
export const secondaryPresetKey = (missionId: string) => `secondary:${missionId}`;
// Stratagems differ by army, so they're remembered per faction.
export const stratagemPresetKey = (faction: string) => `cp:${faction.trim().toLowerCase()}`;

export const usePresets = (key: string): ScoringPreset[] =>
  useSyncExternalStore(subscribe, () => presets[key] ?? NO_PRESETS);

// Adds a preset, replacing any with the same label.
export const savePreset = (key: string, preset: ScoringPreset) => {
  const label = preset.label.trim();
  if (!label) return;
  const others = (presets[key] ?? []).filter(p => p.label.toLowerCase() !== label.toLowerCase());
  update(key, [...others, { label, vp: preset.vp }]);
};

export const removePreset = (key: string, label: string) => {
  update(key, (presets[key] ?? []).filter(p => p.label !== label));
};
