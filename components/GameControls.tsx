
import React from 'react';

interface GameControlsProps {
  round: number;
  onRoundChange: (delta: number) => void;
  onReset: () => void;
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
  round, 
  onRoundChange, 
  onReset, 
  readOnly = false,
  onBroadcastClick
}) => {
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

        {/* Center: Round Controls - Pushed right in readOnly */}
        <div className="flex items-center gap-1 sm:gap-3">
          {!readOnly && (
            <button onClick={() => onRoundChange(-1)} aria-label="Previous round" className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors duration-200 border-2 border-slate-600 hover:border-amber-500">
                <ChevronLeftIcon className="h-6 w-6 text-amber-400"/>
            </button>
          )}
          
          <span className="font-orbitron text-base sm:text-2xl text-amber-400 w-24 sm:w-36 text-center whitespace-nowrap">
            {round <= 5 ? `Round ${round}` : 'Summary'}
          </span>
          
          {!readOnly && (
            <button onClick={() => onRoundChange(1)} aria-label="Next round" className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors duration-200 border-2 border-slate-600 hover:border-amber-500">
                <ChevronRightIcon className="h-6 w-6 text-amber-400"/>
            </button>
          )}
        </div>
        
        {/* Spacer for centering in interactive mode */}
        {!readOnly && <div className="hidden sm:block w-10"></div>}
      </div>
    </div>
  );
};

export default GameControls;
