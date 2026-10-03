
import React, { useReducer, useState, useCallback, useEffect, useMemo } from 'react';
import PlayerCard from './PlayerCard';
import GameControls from './GameControls';
import GameSummary from './GameSummary';
import type { GameState } from '../types';
import { SUMMARY_ROUND, createInitialGameState, gameReducer } from '../gameReducer';
import { getHostId, loadSavedGame, saveGame } from '../storage';
import { describeHostStatus, describeViewerStatus, useHostBroadcast, useViewerSync } from '../peerSync';

const TONE_TEXT_CLASS = {
  good: 'text-emerald-400',
  warn: 'text-amber-400',
  bad: 'text-red-400',
};

const Scoreboard: React.FC = () => {
  // A `watch` link opens the read-only overlay for that host; otherwise this is the host.
  const watchId = useMemo(() => new URLSearchParams(window.location.search).get('watch') || null, []);
  const isReadOnly = watchId !== null;
  const hostId = useMemo(() => (isReadOnly ? null : getHostId()), [isReadOnly]);

  const [gameState, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => (isReadOnly ? null : loadSavedGame()) ?? createInitialGameState(),
  );
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!isReadOnly) saveGame(gameState);
  }, [gameState, isReadOnly]);

  const handleSync = useCallback((state: GameState) => dispatch({ type: 'sync', state }), []);
  const host = useHostBroadcast(hostId, gameState);
  const viewerStatus = useViewerSync(watchId, handleSync);
  const connection = isReadOnly ? describeViewerStatus(viewerStatus) : describeHostStatus(host.status, host.viewers);

  const handleRoundChange = useCallback((delta: number) => {
    dispatch({ type: 'changeRound', delta });
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the game? All scores will be lost.')) {
      dispatch({ type: 'reset' });
    }
  }, []);
  
  const handleBroadcastClick = () => {
    setShowBroadcastModal(true);
    setCopySuccess(false);
  };

  const getBroadcastUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('watch', hostId ?? '');
    return url.toString();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getBroadcastUrl()).then(() => {
      setCopySuccess(true);
    });
  };

  return (
    <>
      <div 
        className="w-full max-w-5xl bg-slate-900/80 p-2 sm:p-4 rounded-xl shadow-2xl border-4 border-slate-700/50 relative"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.9) 100%)',
        }}
      >
        <GameControls 
          round={gameState.round} 
          onRoundChange={handleRoundChange} 
          onReset={handleReset}
          readOnly={isReadOnly}
          onBroadcastClick={handleBroadcastClick}
          connection={connection}
        />
        {gameState.round < SUMMARY_ROUND ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlayerCard 
              player={gameState.player1} 
              playerKey="player1"
              round={gameState.round}
              dispatch={dispatch}
              readOnly={isReadOnly}
            />
            <PlayerCard 
              player={gameState.player2} 
              playerKey="player2"
              round={gameState.round}
              dispatch={dispatch}
              readOnly={isReadOnly}
            />
          </div>
        ) : (
          <GameSummary gameState={gameState} />
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-orbitron text-amber-400 mb-4 text-center">Stream to OBS</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Copy the link below and paste it into a <strong className="text-white">Browser Source</strong> in OBS. 
              The view will update in real-time as you change scores here. The link stays the same when you reload
              this page, so you only need to add it to OBS once.
            </p>
            <p className={`mb-4 text-sm font-bold ${TONE_TEXT_CLASS[connection.tone]}`}>● {connection.label}</p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                readOnly 
                value={getBroadcastUrl()} 
                className="bg-slate-900 border border-slate-700 text-gray-300 text-sm rounded-lg block w-full p-2.5 font-mono"
              />
              <button 
                onClick={copyToClipboard}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => setShowBroadcastModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Scoreboard;
