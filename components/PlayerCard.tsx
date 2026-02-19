
import React from 'react';
import type { PlayerState, PlayerKey, ScoreType, TurnScore } from '../types';
import IconButton from './ui/IconButton';
import { SECONDARY_MISSIONS } from '../data/missions';

interface PlayerCardProps {
  player: PlayerState;
  playerKey: PlayerKey;
  turn: number;
  onNameChange: (playerKey: PlayerKey, newName: string) => void;
  onScoreChange: (playerKey: PlayerKey, scoreType: ScoreType, delta: number, turn?: number) => void;
  onSecondaryMissionChange: (playerKey: PlayerKey, slotIndex: number, missionId: string) => void;
  readOnly?: boolean;
}

const MinusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  playerKey, 
  turn, 
  onNameChange, 
  onScoreChange, 
  onSecondaryMissionChange,
  readOnly = false
}) => {
  const scores = Object.values(player.scores) as TurnScore[];
  const totalPrimary = scores.reduce((sum, turnScores) => sum + turnScores.primary, 0);
  const totalSecondary = scores.reduce((sum, turnScores) => sum + turnScores.secondary, 0);
  const totalScore = totalPrimary + totalSecondary;

  const missionsForTurn = player.secondaryMissions[turn] || [null, null];
  const turnScores = player.scores[turn] || { primary: 0, secondary: 0 };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-lg p-4 md:p-6 w-full flex flex-col gap-4 shadow-lg transition-all duration-300">
      {readOnly ? (
        <h2 className="font-orbitron text-2xl md:text-3xl text-center text-amber-400 border-b-2 border-transparent pb-1">
          {player.name}
        </h2>
      ) : (
        <input
          type="text"
          value={player.name}
          onChange={(e) => onNameChange(playerKey, e.target.value)}
          className="font-orbitron text-2xl md:text-3xl text-center bg-transparent border-b-2 border-slate-600 focus:border-amber-500 text-amber-400 outline-none transition-colors duration-300 pb-1"
          placeholder="Player Name"
        />
      )}
      
      <div className="grid grid-cols-2 gap-4 text-center">
        {/* Command Points */}
        <div className="flex flex-col items-center gap-2 p-2 bg-slate-900/50 rounded-md">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Command Points</span>
          <div className="flex items-center gap-3">
            {!readOnly && <IconButton onClick={() => onScoreChange(playerKey, 'commandPoints', -1)} ariaLabel="Decrease Command Points"><MinusIcon /></IconButton>}
            <span className="font-orbitron text-3xl text-white w-12">{player.commandPoints}</span>
            {!readOnly && <IconButton onClick={() => onScoreChange(playerKey, 'commandPoints', 1)} ariaLabel="Increase Command Points"><PlusIcon /></IconButton>}
          </div>
        </div>
        
        {/* Total Score */}
        <div className="flex flex-col items-center justify-center gap-2 p-2 bg-red-900/40 rounded-md border border-red-700/50">
           <span className="text-sm font-bold uppercase tracking-wider text-red-300">Total Score</span>
           <span className="font-orbitron text-5xl text-white font-bold">{totalScore}</span>
        </div>
      </div>
      
      {/* Primary Score */}
      <div className="flex flex-col items-center gap-2 p-3 bg-slate-900/50 rounded-md">
        <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Primary Score (Turn {turn})</span>
        <div className="flex items-center gap-3">
          {!readOnly && <IconButton onClick={() => onScoreChange(playerKey, 'primaryScore', -1, turn)} ariaLabel="Decrease Primary Score by 1"><MinusIcon /></IconButton>}
          <span className="font-orbitron text-3xl text-white w-12 text-center">{turnScores.primary}</span>
          {!readOnly && <IconButton onClick={() => onScoreChange(playerKey, 'primaryScore', 1, turn)} ariaLabel="Increase Primary Score by 1"><PlusIcon /></IconButton>}
        </div>
      </div>
      
      {/* Secondary Score */}
      <div className="flex flex-col items-center gap-2 p-3 bg-slate-900/50 rounded-md">
        <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Secondary Score (Turn {turn})</span>
        <div className="flex items-center gap-3">
          {!readOnly && <IconButton onClick={() => onScoreChange(playerKey, 'secondaryScore', -1, turn)} ariaLabel="Decrease Secondary Score by 1"><MinusIcon /></IconButton>}
          <span className="font-orbitron text-3xl text-white w-12 text-center">{turnScores.secondary}</span>
          {!readOnly && <IconButton onClick={() => onScoreChange(playerKey, 'secondaryScore', 1, turn)} ariaLabel="Increase Secondary Score by 1"><PlusIcon /></IconButton>}
        </div>
      </div>

      {/* Secondary Objectives */}
      <div className="flex flex-col gap-3 p-3 bg-slate-900/50 rounded-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 text-center">Secondary Objectives (Turn {turn})</h3>
        <div className="flex flex-col gap-3">
          {[0, 1].map(index => {
            const missionId = missionsForTurn[index];
            const mission = missionId ? SECONDARY_MISSIONS.find(m => m.id === missionId) : null;
            
            return (
              <div key={index} className="flex flex-col">
                {readOnly ? (
                  <div className="bg-slate-700/50 border border-slate-600 text-white text-xl md:text-2xl font-bold font-orbitron tracking-wide rounded-lg p-3 min-h-[50px] flex items-center justify-center text-center shadow-md">
                     {mission ? mission.name : <span className="text-gray-500 italic text-base font-sans">No Objective Selected</span>}
                  </div>
                ) : (
                  <select
                    aria-label={`Select secondary objective ${index + 1} for turn ${turn}`}
                    value={missionId || 'none'}
                    onChange={(e) => onSecondaryMissionChange(playerKey, index, e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                  >
                    <option value="none">-- Select Objective {index + 1} --</option>
                    {SECONDARY_MISSIONS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                )}
                {!readOnly && mission && (
                  <div className="mt-2 text-xs text-gray-400 bg-slate-800 p-2 rounded-md">
                    <p>{mission.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default PlayerCard;
