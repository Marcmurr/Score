
import React, { useReducer, useState, useCallback, useEffect, useMemo } from 'react';
import PlayerCard from './PlayerCard';
import GameControls from './GameControls';
import GameSummary from './GameSummary';
import type { GameState } from '../types';
import { SUMMARY_ROUND, createInitialGameState, gameReducer } from '../gameReducer';
import { createHostId, getHostId, loadSavedGame, saveGame } from '../storage';
import { describeHostStatus, describeViewerStatus, useHostBroadcast, useViewerSync } from '../peerSync';
import { FACTIONS } from '../data/factions';

type ShareLink = 'overlay' | 'stats';

const SHARE_LINKS: { id: ShareLink; title: string; description: string }[] = [
  { id: 'overlay', title: 'OBS overlay', description: 'Paste into a Browser Source in OBS.' },
  { id: 'stats', title: 'Stats page', description: 'Share with viewers: live round-by-round scores on phone, tablet or PC.' },
];

const TONE_TEXT_CLASS = {
  good: 'text-emerald-400',
  warn: 'text-amber-400',
  bad: 'text-red-400',
};

const Scoreboard: React.FC = () => {
  // A `watch` link opens the read-only overlay for that host; otherwise this is the host.
  const watchId = useMemo(() => new URLSearchParams(window.location.search).get('watch') || null, []);
  const isReadOnly = watchId !== null;
  const [hostId, setHostId] = useState(() => (isReadOnly ? null : getHostId()));

  const [gameState, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => (isReadOnly ? null : loadSavedGame()) ?? createInitialGameState(),
  );
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState<ShareLink | null>(null);

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
    setCopiedLink(null);
  };

  const getShareUrl = (link: ShareLink) => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('watch', hostId ?? '');
    if (link === 'stats') url.searchParams.set('view', 'stats');
    return url.toString();
  };

  const handleNewLinks = () => {
    if (window.confirm('Create new links? The current overlay and stats links will stop working, so you will need to update OBS and share the new stats link.')) {
      setHostId(createHostId());
      setCopiedLink(null);
    }
  };

  const copyToClipboard = (link: ShareLink) => {
    navigator.clipboard.writeText(getShareUrl(link)).then(() => {
      setCopiedLink(link);
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
              goesFirst={gameState.firstPlayer === 'player1'}
              dispatch={dispatch}
              readOnly={isReadOnly}
            />
            <PlayerCard 
              player={gameState.player2} 
              playerKey="player2"
              round={gameState.round}
              goesFirst={gameState.firstPlayer === 'player2'}
              dispatch={dispatch}
              readOnly={isReadOnly}
            />
          </div>
        ) : (
          <GameSummary gameState={gameState} />
        )}
      </div>

      {!isReadOnly && (
        <datalist id="faction-suggestions">
          {FACTIONS.map(faction => <option key={faction} value={faction} />)}
        </datalist>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-orbitron text-amber-400 mb-4 text-center">Share the game</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Both views update in real time as you change scores here. The links stay the same when you reload
              this page, so you only need to share them once.
            </p>
            <p className={`mb-4 text-sm font-bold ${TONE_TEXT_CLASS[connection.tone]}`}>● {connection.label}</p>

            {SHARE_LINKS.map(link => (
              <div key={link.id} className="mb-4">
                <p className="text-sm font-bold text-white">{link.title}</p>
                <p className="text-xs text-gray-400 mb-1">{link.description}</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    aria-label={`${link.title} link`}
                    value={getShareUrl(link.id)} 
                    className="bg-slate-900 border border-slate-700 text-gray-300 text-sm rounded-lg block w-full p-2.5 font-mono"
                  />
                  <button 
                    onClick={() => copyToClipboard(link.id)}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {copiedLink === link.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}

            <div className="mb-4 border-t border-slate-700 pt-3">
              <p className="text-xs text-gray-400 mb-2">
                Shared a link somewhere it shouldn't be? New links stop the current ones working.
              </p>
              <button
                onClick={handleNewLinks}
                className="bg-slate-700 hover:bg-red-800 text-white text-sm font-bold py-2 px-4 rounded-lg border border-slate-600 hover:border-red-600 transition-colors duration-200"
              >
                New links
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
