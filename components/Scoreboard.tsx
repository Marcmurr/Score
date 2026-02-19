
import React, { useState, useCallback } from 'react';
import type { GameState, PlayerKey, ScoreType } from '../types';
import PlayerCard from './PlayerCard';
import GameControls from './GameControls';
import GameSummary from './GameSummary';

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


  return (
    <div 
      className="w-full max-w-5xl bg-slate-900/80 p-4 rounded-xl shadow-2xl border-4 border-slate-700/50"
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
          />
          <PlayerCard 
            player={gameState.player2} 
            playerKey="player2"
            turn={gameState.turn}
            onNameChange={handleNameChange}
            onScoreChange={handleScoreChange}
            onSecondaryMissionChange={handleSecondaryMissionChange}
          />
        </div>
      ) : (
        <GameSummary gameState={gameState} />
      )}
    </div>
  );
};

export default Scoreboard;
