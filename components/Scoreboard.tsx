
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, PlayerKey, ScoreType } from '../types';
import PlayerCard from './PlayerCard';
import GameControls from './GameControls';
import GameSummary from './GameSummary';
import { Peer, DataConnection } from 'peerjs';

const initialPlayerState = {
  name: 'Player',
  commandPoints: 0,
  scores: {
    1: { primary: 0, secondary: 0 },
    2: { primary: 0, secondary: 0 },
    3: { primary: 0, secondary: 0 },
    4: { primary: 0, secondary: 0 },
    5: { primary: 0, secondary: 0 },
  },
  secondaryMissions: {
    1: [null, null],
    2: [null, null],
    3: [null, null],
    4: [null, null],
    5: [null, null],
  },
};

const initialGameState: GameState = {
  turn: 1,
  primaryMission: null,
  player1: { ...initialPlayerState, name: 'Player 1' },
  player2: { ...initialPlayerState, name: 'Player 2' },
};

const Scoreboard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [peerId, setPeerId] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // PeerJS refs
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);
  
  // Initialize PeerJS
  useEffect(() => {
    // Check for watch param
    const params = new URLSearchParams(window.location.search);
    const watchId = params.get('watch');
    
    // Cleanup function
    const cleanup = () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      connectionsRef.current = [];
    };

    if (watchId) {
      // CLIENT MODE (OBS/Viewer)
      setIsReadOnly(true);
      
      const peer = new Peer();
      peerRef.current = peer;
      
      peer.on('open', () => {
        console.log('Connected to peer server as client');
        const conn = peer.connect(watchId);
        
        conn.on('open', () => {
          console.log('Connected to host');
        });
        
        conn.on('data', (data: any) => {
          console.log('Received game state');
          setGameState(data);
        });
        
        conn.on('close', () => {
          console.log('Connection closed');
        });
      });
      
      peer.on('error', (err) => {
        console.error('Peer error:', err);
      });

    } else {
      // HOST MODE (Tablet/Controller)
      const peer = new Peer();
      peerRef.current = peer;
      
      peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        setPeerId(id);
      });
      
      peer.on('connection', (conn) => {
        console.log('Client connected');
        connectionsRef.current.push(conn);
        
        // Send current state immediately upon connection
        conn.on('open', () => {
            // We use a functional update ref or just read current state?
            // Since this runs in a closure, we need to be careful.
            // But we can trigger a sync effect instead.
            // For now, let's just push it.
             conn.send(gameState);
        });
        
        conn.on('close', () => {
          connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
        });
      });
    }
    
    return cleanup;
  }, []); // Run once on mount

  // Sync state to clients when it changes (Host only)
  useEffect(() => {
    if (!isReadOnly && connectionsRef.current.length > 0) {
      connectionsRef.current.forEach(conn => {
        if (conn.open) {
          conn.send(gameState);
        }
      });
    }
  }, [gameState, isReadOnly]);


  const handleNameChange = useCallback((playerKey: PlayerKey, newName: string) => {
    setGameState(prev => ({
      ...prev,
      [playerKey]: { ...prev[playerKey], name: newName },
    }));
  }, []);

  const handleScoreChange = useCallback((playerKey: PlayerKey, scoreType: ScoreType, delta: number, turn?: number) => {
    setGameState(prev => {
      const newState = JSON.parse(JSON.stringify(prev)) as GameState;
      const playerState = newState[playerKey];

      if (scoreType === 'commandPoints') {
        playerState.commandPoints = Math.max(0, playerState.commandPoints + delta);
      } else if (turn) {
        const scoreCategory = scoreType === 'primaryScore' ? 'primary' : 'secondary';
        const maxScore = scoreType === 'primaryScore' ? 50 : 40;

        const currentTotal = Object.values(playerState.scores).reduce((sum, turnScore) => sum + turnScore[scoreCategory], 0);
        const currentTurnScore = playerState.scores[turn][scoreCategory];

        let newTurnScore = currentTurnScore + delta;
        
        if (delta > 0 && currentTotal + delta > maxScore) {
          newTurnScore = currentTurnScore + (maxScore - currentTotal);
        }
        
        newTurnScore = Math.max(0, newTurnScore);
        
        playerState.scores[turn][scoreCategory] = newTurnScore;
      }

      return newState;
    });
  }, []);
  
  const handleTurnChange = useCallback((delta: number) => {
    setGameState(prev => ({
      ...prev,
      turn: Math.max(1, Math.min(6, prev.turn + delta)),
    }));
  }, []);
  
  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the game? All scores will be lost.')) {
      setGameState(initialGameState);
    }
  }, []);
  
  const handlePrimaryMissionChange = useCallback((missionId: string) => {
    setGameState(prev => ({
      ...prev,
      primaryMission: missionId === 'none' ? null : missionId,
    }));
  }, []);

  const handleSecondaryMissionChange = useCallback((playerKey: PlayerKey, slotIndex: number, missionId: string) => {
    setGameState(prev => {
      const { turn } = prev;
      const newMissions = { ...prev[playerKey].secondaryMissions };
      const turnMissions = [...(newMissions[turn] || [null, null])];
      turnMissions[slotIndex] = missionId === 'none' ? null : missionId;
      newMissions[turn] = turnMissions;

      return {
        ...prev,
        [playerKey]: {
          ...prev[playerKey],
          secondaryMissions: newMissions,
        },
      };
    });
  }, []);

  const handleBroadcastClick = () => {
    setShowBroadcastModal(true);
    setCopySuccess(false);
  };

  const getBroadcastUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('watch', peerId);
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
        className="w-full max-w-5xl bg-slate-900/80 p-4 rounded-xl shadow-2xl border-4 border-slate-700/50 relative"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.9) 100%)',
        }}
      >
        <GameControls 
          turn={gameState.turn} 
          onTurnChange={handleTurnChange} 
          onReset={handleReset}
          primaryMission={gameState.primaryMission}
          onPrimaryMissionChange={handlePrimaryMissionChange}
          readOnly={isReadOnly}
          onBroadcastClick={handleBroadcastClick}
        />
        {gameState.turn <= 5 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlayerCard 
              player={gameState.player1} 
              playerKey="player1"
              turn={gameState.turn}
              onNameChange={handleNameChange}
              onScoreChange={handleScoreChange}
              onSecondaryMissionChange={handleSecondaryMissionChange}
              readOnly={isReadOnly}
            />
            <PlayerCard 
              player={gameState.player2} 
              playerKey="player2"
              turn={gameState.turn}
              onNameChange={handleNameChange}
              onScoreChange={handleScoreChange}
              onSecondaryMissionChange={handleSecondaryMissionChange}
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
              The view will update in real-time as you change scores here.
            </p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                readOnly 
                value={peerId ? getBroadcastUrl() : 'Generating ID...'} 
                className="bg-slate-900 border border-slate-700 text-gray-300 text-sm rounded-lg block w-full p-2.5 font-mono"
              />
              <button 
                onClick={copyToClipboard}
                disabled={!peerId}
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
