
import React from 'react';
import { PRIMARY_MISSIONS } from '../data/missions';

interface GameControlsProps {
  turn: number;
  onTurnChange: (delta: number) => void;
  onReset: () => void;
  primaryMission: string | null;
  onPrimaryMissionChange: (missionId: string) => void;
}

const ChevronLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const RefreshIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4a14.95 14.95 0 0114.347 9.431m-1.795 4.341A14.95 14.95 0 014 12" />
    </svg>
);

const GameControls: React.FC<GameControlsProps> = ({ turn, onTurnChange, onReset, primaryMission, onPrimaryMissionChange }) => {
  const selectedMission = PRIMARY_MISSIONS.find(m => m.id === primaryMission);
  
  return (
    <div className="w-full flex flex-col gap-4 mb-4">
      <div className="w-full flex justify-between items-center bg-slate-800/70 border-2 border-slate-700 rounded-lg p-3 shadow-lg">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md border-2 border-red-900 hover:border-red-600"
        >
          <RefreshIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <div className="flex items-center gap-3">
          <button onClick={() => onTurnChange(-1)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors duration-200 border-2 border-slate-600 hover:border-amber-500">
              <ChevronLeftIcon className="h-6 w-6 text-amber-400"/>
          </button>
          <span className="font-orbitron text-2xl text-amber-400 w-28 text-center">
            {turn <= 5 ? `Turn ${turn}` : 'Summary'}
          </span>
          <button onClick={() => onTurnChange(1)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors duration-200 border-2 border-slate-600 hover:border-amber-500">
              <ChevronRightIcon className="h-6 w-6 text-amber-400"/>
          </button>
        </div>
      </div>
      <div className="w-full bg-slate-800/70 border-2 border-slate-700 rounded-lg p-3 shadow-lg flex flex-col sm:flex-row items-center gap-4">
        <label htmlFor="primary-mission" className="font-orbitron text-lg text-amber-400 whitespace-nowrap">Primary Mission</label>
        <select
          id="primary-mission"
          value={primaryMission || 'none'}
          onChange={(e) => onPrimaryMissionChange(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
        >
          <option value="none" disabled>Select a mission</option>
          {PRIMARY_MISSIONS.map(mission => (
            <option key={mission.id} value={mission.id}>{mission.name}</option>
          ))}
        </select>
      </div>
      {selectedMission && (
        <div className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-lg p-3 shadow-inner -mt-2">
          <p className="text-gray-300">{selectedMission.description}</p>
        </div>
      )}
    </div>
  );
};

export default GameControls;