
import React, { useState } from 'react';
import type { ScoreEntry } from '../types';
import Stepper from './ui/Stepper';
import { removePreset, savePreset, usePresets } from '../scoringPresets';

interface ScoreControlProps {
  label: string; // The mission, for screen readers
  scores: ScoreEntry[]; // Every score for this mission
  round: number;
  headroom: number; // VP that can still be added this round
  presetKey: string;
  onAdd: (vp: number, reason: string) => void;
  onRemove: (entryId: string) => void;
}

const MAX_SINGLE_SCORE = 15;

const chipClass = 'text-xs font-bold px-2 py-1 rounded-md border transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed';

// Records how VP were scored: one-tap buttons for reasons used before, a form
// for new ones, and this round's scores (tap to remove a mistake).
const ScoreControl: React.FC<ScoreControlProps> = ({ label, scores, round, headroom, presetKey, onAdd, onRemove }) => {
  const presets = usePresets(presetKey);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');
  const [vp, setVp] = useState(1);

  const roundScores = scores.filter(entry => entry.round === round);
  const capped = headroom === 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (capped) return;
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
              {preset.label} +{preset.vp} ✕
            </button>
          ) : (
            <button
              key={preset.label}
              type="button"
              disabled={capped}
              onClick={() => onAdd(preset.vp, preset.label)}
              aria-label={`Score ${preset.label}, ${preset.vp} VP, for ${label}`}
              className={`${chipClass} bg-slate-700 hover:bg-amber-600 text-white border-slate-500 hover:border-amber-500`}
            >
              {preset.label} <span className="text-amber-300">+{preset.vp}</span>
            </button>
          ),
        )}
        {!editing && (
          <button
            type="button"
            disabled={capped && !formOpen}
            onClick={() => setFormOpen(open => !open)}
            aria-expanded={formOpen}
            className={`${chipClass} bg-amber-700 hover:bg-amber-600 text-white border-amber-600`}
          >
            {formOpen ? 'Cancel' : '+ Score…'}
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
            placeholder="How? e.g. Held 2 objectives"
            aria-label={`How was ${label} scored?`}
            autoFocus
            className="flex-1 min-w-[10rem] bg-slate-700 border border-slate-600 text-white text-sm rounded-md p-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <Stepper size="sm" value={vp} label="VP to add" onChange={(delta) => setVp(v => Math.max(1, Math.min(MAX_SINGLE_SCORE, v + delta)))} />
          <button type="submit" disabled={capped} className={`${chipClass} bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-800 py-2`}>
            Add
          </button>
          <p className="w-full text-xs text-gray-400">A reason you type becomes a one-tap button for this mission.</p>
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
                aria-label={`Remove ${entry.reason || 'score'} +${entry.vp} VP`}
                title="Tap to remove"
                className={`${chipClass} bg-emerald-900/60 hover:bg-red-900/70 text-emerald-100 border-emerald-700 hover:border-red-600`}
              >
                {entry.reason || 'Score'} +{entry.vp} <span aria-hidden="true">✕</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {capped && <p className="text-xs text-amber-400">VP limit reached.</p>}
    </div>
  );
};

export default ScoreControl;
