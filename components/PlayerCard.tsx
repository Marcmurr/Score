
import React from 'react';
import type { PlayerState, PlayerKey } from '../types';
import { newScoreEntry, type GameAction } from '../gameReducer';
import Stepper from './ui/Stepper';
import ScoreControl from './ScoreControl';
import SecondaryMissions from './SecondaryMissions';
import { FORCE_DISPOSITIONS, getDispositionName } from '../data/missions';
import {
  BATTLE_READY_VP,
  PRIMARY_GAME_CAP,
  PRIMARY_ROUND_CAP,
  headroom,
  primaryInRound,
  primaryTotal,
  secondaryInRound,
  totalScore,
} from '../scoring';
import { primaryPresetKey } from '../scoringPresets';

interface PlayerCardProps {
  player: PlayerState;
  playerKey: PlayerKey;
  round: number;
  goesFirst: boolean;
  dispatch: React.Dispatch<GameAction>;
  readOnly?: boolean;
}

const FirstBadge: React.FC = () => (
  <span className="text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-900 rounded px-1.5 py-0.5">1st</span>
);

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  playerKey,
  round,
  goesFirst,
  dispatch,
  readOnly = false
}) => {
  const primaryTarget = { kind: 'primary' } as const;
  const dispositionName = getDispositionName(player.forceDisposition);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-lg p-4 md:p-6 w-full flex flex-col gap-4 shadow-lg transition-all duration-300">
      {readOnly ? (
        <div className="flex flex-col items-center gap-1 pb-1">
          <h2 className="font-orbitron text-2xl md:text-3xl text-center text-amber-400 flex items-center gap-2">
            {player.name}
            {goesFirst && <FirstBadge />}
          </h2>
          {player.faction && <p className="text-sm uppercase tracking-wider text-gray-400">{player.faction}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={player.name}
            onChange={(e) => dispatch({ type: 'updatePlayer', player: playerKey, changes: { name: e.target.value } })}
            className="font-orbitron text-2xl md:text-3xl text-center bg-transparent border-b-2 border-slate-600 focus:border-amber-500 text-amber-400 outline-none transition-colors duration-300 pb-1"
            placeholder="Player Name"
          />
          <div className="flex gap-2">
            <input
              type="text"
              list="faction-suggestions"
              value={player.faction}
              onChange={(e) => dispatch({ type: 'updatePlayer', player: playerKey, changes: { faction: e.target.value } })}
              placeholder="Faction"
              aria-label="Faction"
              className="flex-1 min-w-0 bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2"
            />
            <button
              type="button"
              onClick={() => dispatch({ type: 'setFirstPlayer', player: goesFirst ? null : playerKey })}
              aria-pressed={goesFirst}
              className={`shrink-0 text-xs font-bold uppercase px-3 rounded-lg border transition-colors duration-200 ${goesFirst ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600'}`}
            >
              Goes first
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-center">
        {/* Command Points */}
        <div className="flex flex-col items-center gap-2 p-2 bg-slate-900/50 rounded-md">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Command Points</span>
          <Stepper
            value={player.commandPoints}
            label="Command Points"
            readOnly={readOnly}
            onChange={(delta) => dispatch({ type: 'changeCommandPoints', player: playerKey, delta })}
          />
        </div>

        {/* Total Score */}
        <div className="flex flex-col items-center justify-center gap-1 p-2 bg-red-900/40 rounded-md border border-red-700/50">
          <span className="text-sm font-bold uppercase tracking-wider text-red-300">Total Score</span>
          <span className="font-orbitron text-5xl text-white font-bold">{totalScore(player)}</span>
          {readOnly ? (
            player.battleReady && <span className="text-xs text-red-200">incl. {BATTLE_READY_VP} Battle Ready</span>
          ) : (
            <label className="flex items-center gap-2 text-xs text-red-200 cursor-pointer">
              <input
                type="checkbox"
                checked={player.battleReady}
                onChange={(e) => dispatch({ type: 'updatePlayer', player: playerKey, changes: { battleReady: e.target.checked } })}
                className="accent-amber-500"
              />
              Battle Ready (+{BATTLE_READY_VP})
            </label>
          )}
        </div>
      </div>

      {/* Primary Mission: each player has their own, set by the Force Disposition pairing */}
      <div className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-md">
        <span className="text-sm font-bold uppercase tracking-wider text-gray-400 text-center">Primary Mission</span>
        {readOnly ? (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 min-h-[50px] flex flex-col items-center justify-center text-center shadow-[0_0_10px_rgba(251,191,36,0.2)]">
            {player.primaryMission ? (
              <span className="text-amber-400 text-xl md:text-2xl font-orbitron font-bold">{player.primaryMission}</span>
            ) : (
              <span className="text-gray-500 italic">No Mission Selected</span>
            )}
            {dispositionName && <span className="text-xs uppercase tracking-wider text-gray-400 mt-1">{dispositionName}</span>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              aria-label="Force Disposition"
              value={player.forceDisposition ?? 'none'}
              onChange={(e) => dispatch({ type: 'updatePlayer', player: playerKey, changes: { forceDisposition: e.target.value === 'none' ? null : e.target.value } })}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
            >
              <option value="none">-- Force Disposition --</option>
              {FORCE_DISPOSITIONS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <input
              type="text"
              aria-label="Primary Mission"
              value={player.primaryMission}
              onChange={(e) => dispatch({ type: 'updatePlayer', player: playerKey, changes: { primaryMission: e.target.value } })}
              placeholder="Mission from the matrix"
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
            />
          </div>
        )}
      </div>

      {/* Round scores */}
      <div className={`grid gap-4 text-center ${readOnly ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="flex flex-col items-center gap-2 p-3 bg-slate-900/50 rounded-md">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Primary (Round {round})</span>
          <span className="font-orbitron text-3xl text-white">{primaryInRound(player, round)}</span>
          {!readOnly && (
            <>
              <p className="text-xs text-gray-400">
                {primaryInRound(player, round)}/{PRIMARY_ROUND_CAP} this round · {primaryTotal(player)}/{PRIMARY_GAME_CAP} game
              </p>
              <ScoreControl
                label="Primary"
                scores={player.primaryScores}
                round={round}
                headroom={headroom(player, primaryTarget, round)}
                presetKey={primaryPresetKey(player.primaryMission)}
                onAdd={(vp, reason) => dispatch({ type: 'addScore', player: playerKey, target: primaryTarget, entry: newScoreEntry(round, vp, reason) })}
                onRemove={(entryId) => dispatch({ type: 'removeScore', player: playerKey, target: primaryTarget, entryId })}
              />
            </>
          )}
        </div>
        {readOnly && (
          <div className="flex flex-col items-center gap-2 p-3 bg-slate-900/50 rounded-md">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Secondary (Round {round})</span>
            <span className="font-orbitron text-3xl text-white">{secondaryInRound(player, round)}</span>
          </div>
        )}
      </div>

      <SecondaryMissions player={player} playerKey={playerKey} round={round} dispatch={dispatch} readOnly={readOnly} />
    </div>
  );
};

export default PlayerCard;
