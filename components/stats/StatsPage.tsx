
import React, { useCallback, useEffect, useState } from 'react';
import type { GameState } from '../../types';
import { SUMMARY_ROUND } from '../../gameReducer';
import { describeViewerStatus, useViewerSync } from '../../peerSync';
import ScoreChart from './ScoreChart';
import { LatestScores, Panel, PlayerMissions, RoundBreakdown, ScoreHeader, StillPossible } from './StatsSections';
import { LAST_ROUND, turnOrder } from './statsData';

const DELAY_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60];
const MAX_DELAY_MS = Math.max(...DELAY_OPTIONS) * 1000;
const DELAY_KEY = 'score:statsDelay';

const loadDelay = (): number => {
  try {
    const saved = Number(localStorage.getItem(DELAY_KEY));
    return DELAY_OPTIONS.includes(saved) ? saved : 0;
  } catch {
    return 0;
  }
};

const saveDelay = (seconds: number) => {
  try {
    localStorage.setItem(DELAY_KEY, String(seconds));
  } catch {
    // Remembered for this visit only.
  }
};

interface Snapshot {
  at: number;
  json: string;
  state: GameState;
}

// Holds updates back by `delaySeconds`, so the page doesn't get ahead of a
// video stream that runs behind real time.
const useDelayedState = (delaySeconds: number) => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [now, setNow] = useState(() => Date.now());

  const push = useCallback((state: GameState) => {
    const json = JSON.stringify(state);
    setSnapshots(list => {
      if (list.length > 0 && list[list.length - 1].json === json) return list; // Heartbeat, nothing new
      const at = Date.now();
      // Keep the last minute of updates plus the newest one before it.
      const firstRecent = list.findIndex(snapshot => snapshot.at >= at - MAX_DELAY_MS);
      const kept = firstRecent === -1 ? list.slice(-1) : list.slice(Math.max(0, firstRecent - 1));
      return [...kept, { at, json, state }];
    });
  }, []);

  useEffect(() => {
    if (!delaySeconds) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [delaySeconds]);

  const latest = snapshots[snapshots.length - 1];
  const shown = delaySeconds
    ? [...snapshots].reverse().find(snapshot => snapshot.at <= now - delaySeconds * 1000) ?? snapshots[0]
    : latest;
  return { state: shown?.state ?? null, push, behind: shown !== latest };
};

const TONE_DOT_CLASS = {
  good: 'bg-emerald-400',
  warn: 'bg-amber-400',
  bad: 'bg-red-500',
};

// Read-only page for viewers: live scores, how they were scored, and trends.
const StatsPage: React.FC<{ watchId: string }> = ({ watchId }) => {
  const [delay, setDelay] = useState(loadDelay);
  const { state, push, behind } = useDelayedState(delay);
  const connection = describeViewerStatus(useViewerSync(watchId, push));

  const changeDelay = (seconds: number) => {
    setDelay(seconds);
    saveDelay(seconds);
  };

  const title = !state ? 'Game stats' : state.round >= SUMMARY_ROUND ? 'Final score' : `Round ${state.round} of ${LAST_ROUND}`;

  const matchup = state ? `${state.player1.name} vs ${state.player2.name}` : null;
  useEffect(() => {
    document.title = matchup ? `${matchup} · Game stats` : 'Game stats';
  }, [matchup]);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200">
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-3">
            <span className="font-orbitron text-lg text-amber-400">{title}</span>
            <span role="status" className="flex items-center gap-1.5 text-xs text-gray-300">
              <span className={`h-2 w-2 rounded-full ${TONE_DOT_CLASS[connection.tone]} ${connection.tone === 'good' ? '' : 'animate-pulse'}`} aria-hidden="true" />
              {connection.tone === 'good' ? (delay ? `Live, ${delay}s delay` : 'Live') : connection.label}
            </span>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-400">
            Stream delay
            <select
              value={delay}
              onChange={(e) => changeDelay(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md p-1.5"
            >
              {DELAY_OPTIONS.map(seconds => (
                <option key={seconds} value={seconds}>{seconds ? `${seconds}s` : 'Off'}</option>
              ))}
            </select>
          </label>
        </div>
        {behind && (
          <p className="max-w-6xl mx-auto px-3 sm:px-4 pb-2 text-xs text-gray-400">
            Showing scores {delay}s behind live to match the stream.
          </p>
        )}
      </header>

      {!state ? (
        <main className="flex flex-col items-center justify-center gap-2 min-h-[60vh] px-4 text-center text-gray-400">
          <p className="font-orbitron text-amber-400">Waiting for the game…</p>
          <p className="text-sm">{connection.label}</p>
        </main>
      ) : (
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 flex flex-col gap-4">
          <ScoreHeader state={state} />

          {/* One column on phones (latest scores first); rounds beside a sidebar on wide screens */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-start">
            <div className="contents lg:flex lg:flex-col lg:gap-4 lg:col-span-2">
              <div className="order-2 lg:order-none"><RoundBreakdown state={state} /></div>
            </div>
            <div className="contents lg:flex lg:flex-col lg:gap-4">
              <div className="order-1 lg:order-none"><LatestScores state={state} /></div>
              <div className="order-3 lg:order-none">
                <Panel title="Score over time"><ScoreChart state={state} /></Panel>
              </div>
              <div className="order-4 lg:order-none"><StillPossible state={state} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {turnOrder(state).map(key => <PlayerMissions key={key} state={state} player={key} />)}
          </div>
        </main>
      )}
    </div>
  );
};

export default StatsPage;
