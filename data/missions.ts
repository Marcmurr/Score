
// 11th edition, Chapter Approved 2026-27 Mission Deck.

export interface ForceDisposition {
  id: string;
  name: string;
}

// Each player picks one. The pairing of both players' dispositions decides
// each player's own Primary Mission (see the Force Disposition matrix).
export const FORCE_DISPOSITIONS: ForceDisposition[] = [
  { id: 'take-and-hold', name: 'Take and Hold' },
  { id: 'purge-the-foe', name: 'Purge the Foe' },
  { id: 'disruption', name: 'Disruption' },
  { id: 'reconnaissance', name: 'Reconnaissance' },
  { id: 'priority-assets', name: 'Priority Assets' },
];

export interface SecondaryMission {
  id: string;
  name: string;
  fixed: boolean; // Can be chosen as a Fixed Secondary Mission
}

export const SECONDARY_MISSIONS: SecondaryMission[] = [
  { id: 'a-grievous-blow', name: 'A Grievous Blow', fixed: true },
  { id: 'a-tempting-target', name: 'A Tempting Target', fixed: false },
  { id: 'assassination', name: 'Assassination', fixed: true },
  { id: 'beacon', name: 'Beacon', fixed: false },
  { id: 'behind-enemy-lines', name: 'Behind Enemy Lines', fixed: false },
  { id: 'bring-it-down', name: 'Bring It Down', fixed: true },
  { id: 'burden-of-trust', name: 'Burden of Trust', fixed: false },
  { id: 'centre-ground', name: 'Centre Ground', fixed: false },
  { id: 'cleanse', name: 'Cleanse', fixed: false },
  { id: 'defend-stronghold', name: 'Defend Stronghold', fixed: false },
  { id: 'display-of-might', name: 'Display of Might', fixed: false },
  { id: 'engage-on-all-fronts', name: 'Engage on All Fronts', fixed: true },
  { id: 'forward-position', name: 'Forward Position', fixed: false },
  { id: 'no-prisoners', name: 'No Prisoners', fixed: false },
  { id: 'outflank', name: 'Outflank', fixed: false },
  { id: 'overwhelming-force', name: 'Overwhelming Force', fixed: false },
  { id: 'plunder', name: 'Plunder', fixed: false },
  { id: 'secure-no-mans-land', name: "Secure No Man's Land", fixed: false },
];

export const FIXED_SECONDARY_MISSIONS = SECONDARY_MISSIONS.filter(m => m.fixed);

export const getSecondaryName = (missionId: string | null | undefined): string =>
  SECONDARY_MISSIONS.find(m => m.id === missionId)?.name ?? '—';

export const getDispositionName = (dispositionId: string | null): string | null =>
  FORCE_DISPOSITIONS.find(d => d.id === dispositionId)?.name ?? null;
