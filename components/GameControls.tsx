
import React from 'react';
import { PRIMARY_MISSIONS } from '../data/missions';

interface GameControlsProps {
  turn: number;
  onTurnChange: (delta: number) => void;
  onReset: () => void;
  primaryMission: string | null;
  onPrimaryMissionChange: (missionId: string) => void;
  readOnly?: boolean;
  onBroadcastClick?: () => void;
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

const WifiIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const GameControls: React.FC<GameControlsProps> = ({ 
  turn, 
  onTurnChange, 
  onReset, 
  primaryMission, 
  onPrimaryMissionChange,
  readOnly = false,
  onBroadcastClick
}) => {
  const selectedMission = PRIMARY_MISSIONS.find(m => m.id === primaryMission);
  
  return (
    <div className="w-full flex flex-col gap-4 mb-4">
      {/* Top Bar */}
      <div className={`w-full flex items-center bg-slate-800/70 border-2 border-slate-700 rounded-lg p-3 shadow-lg ${readOnly ? 'justify-end' : 'justify-between'}`}>
        {/* Left Side: Buttons - Hidden in readOnly */}
        {!readOnly && (
          <div className="flex gap-2">
            <button 
              onClick={onReset}
              className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-3 md:px-4 rounded-md transition-colors duration-200 shadow-md border-2 border-red-900 hover:border-red-600"
              title="Reset Game"
            >
              <RefreshIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            {onBroadcastClick && (
              <button 
                onClick={onBroadcastClick}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 md:px-4 rounded-md transition-colors duration-200 shadow-md border-2 border-indigo-700 hover:border-indigo-400"
                title="Stream to OBS"
              >
                <WifiIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Stream</span>
              </button>
            )}
          </div>
        )}

        {/* Center: Turn Controls - Pushed right in readOnly */}
        <div className="flex items-center gap-3">
          {!readOnly && (
            <button onClick={() => onTurnChange(-1)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors duration-200 border-2 border-slate-600 hover:border-amber-500">
                <ChevronLeftIcon className="h-6 w-6 text-amber-400"/>
            </button>
          )}
          
          <span className="font-orbitron text-2xl text-amber-400 w-28 text-center">
            {turn <= 5 ? `Turn ${turn}` : 'Summary'}
          </span>
          
          {!readOnly && (
            <button onClick={() => onTurnChange(1)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors duration-200 border-2 border-slate-600 hover:border-amber-500">
                <ChevronRightIcon className="h-6 w-6 text-amber-400"/>
            </button>
          )}
        </div>
        
        {/* Spacer for centering in interactive mode */}
        {!readOnly && <div className="hidden sm:block w-10"></div>}
      </div>

      {/* Mission Selection - Pushed right with padding in readOnly */}
      <div className={`w-full bg-slate-800/70 border-2 border-slate-700 rounded-lg p-3 shadow-lg flex flex-col sm:flex-row items-center gap-4 ${readOnly ? 'justify-end pl-16 md:pl-64' : ''}`}>
        <label htmlFor="primary-mission" className="font-orbitron text-lg text-amber-400 whitespace-nowrap">Primary Mission</label>
        {readOnly ? (
          <div className="bg-slate-700/50 border border-slate-600 text-white text-sm rounded-lg p-2.5 min-w-[200px] text-right">
             {selectedMission ? selectedMission.name : <span className="text-gray-500 italic">No Mission Selected</span>}
          </div>
        ) : (
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
        )}
      </div>
      
      {/* Mission Description */}
      {selectedMission && (
        <div className={`w-full bg-slate-800/50 border-2 border-slate-700 rounded-lg p-3 shadow-inner -mt-2 ${readOnly ? 'pl-16 md:pl-64' : ''}`}>
          <p className={`text-gray-300 ${readOnly ? 'text-right' : ''}`}>{selectedMission.description}</p>
        </div>
      )}
    </div>
  );
};

export default GameControls;
