
import React, { useState } from 'react';
import type { ScoreEntry } from '../types';
import Stepper from './ui/Stepper';
import { removePreset, savePreset, usePresets } from '../scoringPresets';

interface ScoreControlProps {
  label: string; // The mission, for screen readers
  scores: ScoreEntry[]; // Every entry for this mission; `vp` is negative for CP spent
  round: number;
  headroom: number; // How much can still be added (VP) or spent (CP) this round
  presetKey: string;
  mode?: 'score' | 'spend';
  onAdd: (amount: number, reason: string) => void;
  onRemove: (entryId: string) => void;
}

// Wording for scoring VP versus spending Command Points on stratagems.
const COPY = {
  score: {
    open: '+ Score…',
    placeholder: 'How? e.g. Held 2 objectives',
    ask: (label: string) => `How was ${label} scored?`,
    amount: 'VP to add',
    submit: 'Add',
    hint: 'A reason you type becomes a one-tap button for this mission.',
    capped: 'VP limit reached.',
    unit: 'VP',
    sign: '+',
    max: 15,
    presetAria: (name: string, amount: number, label: string) => `Score ${name}, ${amount} VP, for ${label}`,
    unnamed: 'Score',
  },
  spend: {
    open: 'Stratagem…',
    placeholder: 'Stratagem, e.g. Command Re-roll',
    ask: () => 'What was CP spent on?',
    amount: 'CP to spend',
    submit: 'Spend',
    hint: 'A stratagem you type becomes a one-tap button.',
    capped: 'No CP left to spend.',
    unit: 'CP',
    sign: '−',
    max: 5,
    presetAria: (name: string, amount: number) => `Spend ${amount} CP on ${name}`,
    unnamed: 'CP',
  },
};

const signed = (amount: number) => (amount < 0 ? `−${-amount}` : `+${amount}`);

const chipClass = 'text-xs font-bold px-2 py-1 rounded-md border transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed';

// Records how VP were scored (or what CP were spent on): one-tap buttons for
// reasons used before, a form for new ones, and this round's entries (tap to
// remove a mistake).
const ScoreControl: React.FC<ScoreControlProps> = ({ label, scores, round, headroom, presetKey, mode = 'score', onAdd, onRemove }) => {
  const copy = COPY[mode];
  const presets = usePresets(presetKey);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');
  const [vp, setVp] = useState(1);

  const roundScores = scores.filter(entry => entry.round === round);
  const capped = headroom === 0;
  // A score over the limit is trimmed to fit; a stratagem the player can't afford is unavailable.
  const canUse = (amount: number) => (mode === 'spend' ? amount <= headroom : !capped);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUse(vp)) return;
    onAdd(vp, reason);
    savePreset(presetKey, { label: reason, vp });
    setReason('');
    setVp(1);
    setFormOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap gap-1.5">
        {presets.map(preset =>
          editing ? (
            <button
              key={preset.label}
              type="button"
              onClick={() => removePreset(presetKey, preset.label)}
              aria-label={`Forget "${preset.label}"`}
              className={`${chipClass} bg-red-900/60 hover:bg-red-800 text-white border-red-700`}
            >
              {preset.label} {copy.sign}{preset.vp} ✕
            </button>
          ) : (
            <button
              key={preset.label}
              type="button"
              disabled={!canUse(preset.vp)}
              onClick={() => onAdd(preset.vp, preset.label)}
              aria-label={copy.presetAria(preset.label, preset.vp, label)}
              className={`${chipClass} bg-slate-700 hover:bg-amber-600 text-white border-slate-500 hover:border-amber-500`}
            >
              {preset.label} <span className="text-amber-300">{copy.sign}{preset.vp}</span>
            </button>
          ),
        )}
        {!editing && (
          <button
            type="button"
            disabled={capped && !formOpen}
            onClick={() => {
              // Start each new entry fresh, even after a cancelled one.
              setReason('');
              setVp(1);
              setFormOpen(open => !open);
            }}
            aria-expanded={formOpen}
            className={`${chipClass} bg-amber-700 hover:bg-amber-600 text-white border-amber-600`}
          >
            {formOpen ? 'Cancel' : copy.open}
          </button>
        )}
        {presets.length > 0 && !formOpen && (
          <button
            type="button"
            onClick={() => setEditing(on => !on)}
            className={`${chipClass} bg-transparent hover:bg-slate-700 text-gray-400 border-slate-600`}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 bg-slate-800 border border-slate-600 rounded-md p-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.ask(label)}
            autoFocus
            className="flex-1 min-w-[10rem] bg-slate-700 border border-slate-600 text-white text-sm rounded-md p-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <Stepper size="sm" value={vp} label={copy.amount} onChange={(delta) => setVp(v => Math.max(1, Math.min(copy.max, v + delta)))} />
          <button type="submit" disabled={!canUse(vp)} className={`${chipClass} bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-800 py-2`}>
            {copy.submit}
          </button>
          <p className="w-full text-xs text-gray-400">{copy.hint}</p>
        </form>
      )}

      {roundScores.length > 0 && (
        <ul className="flex flex-wrap items-center gap-1.5" aria-label={`${label} scores this round`}>
          <li className="text-xs text-gray-400" aria-hidden="true">This round:</li>
          {roundScores.map(entry => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                aria-label={`Remove ${entry.reason || copy.unnamed.toLowerCase()} ${signed(entry.vp)} ${copy.unit}`}
                title="Tap to remove"
                className={`${chipClass} bg-emerald-900/60 hover:bg-red-900/70 text-emerald-100 border-emerald-700 hover:border-red-600`}
              >
                {entry.reason || copy.unnamed} {signed(entry.vp)} <span aria-hidden="true">✕</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {capped && <p className="text-xs text-amber-400">{copy.capped}</p>}
    </div>
  );
};

export default ScoreControl;
