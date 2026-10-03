
import React from 'react';
import type { GameState, PlayerState } from '../types';
import { getDispositionName, getSecondaryName } from '../data/missions';
import {
  BATTLE_READY_VP,
  FIXED_SECONDARY_CAP,
  ROUNDS,
  primaryInRound,
  primaryTotal,
  secondaryInRound,
  secondaryTotal,
  sumScores,
  totalScore,
} from '../scoring';

interface GameSummaryProps {
  gameState: GameState;
}

// Each secondary the player used, with VP scored and how it ended.
const secondaryRows = (player: PlayerState) =>
  player.secondaryMode === 'fixed'
    ? player.fixedSecondaries
        .filter(slot => slot.missionId)
        .map(slot => ({
          key: slot.missionId!,
          name: getSecondaryName(slot.missionId),
          vp: sumScores(slot.scores),
          note: `Fixed · max ${FIXED_SECONDARY_CAP}`,
        }))
    : player.tacticalSecondaries.map(card => ({
        key: card.missionId,
        name: getSecondaryName(card.missionId),
        vp: sumScores(card.scores),
        note:
          card.status === 'scored'
            ? `Scored R${card.resolvedRound}`
            : card.status === 'discarded'
              ? `Discarded R${card.resolvedRound}`
              : `In hand since R${card.drawnRound}`,
      }));

const PlayerMissions: React.FC<{ player: PlayerState }> = ({ player }) => {
  const rows = secondaryRows(player);
  const dispositionName = getDispositionName(player.forceDisposition);
  return (
    <div className="bg-slate-900/50 p-3 rounded-md">
      <p className="text-gray-300 font-bold text-center mb-2 truncate">{player.name}</p>
      <p className="text-sm text-center mb-3">
        <span className="text-amber-400 font-orbitron">{player.primaryMission || 'No Primary Mission'}</span>
        {dispositionName && <span className="block text-xs uppercase tracking-wider text-gray-400">{dispositionName}</span>}
      </p>
      <ul className="text-sm text-gray-300 space-y-1">
        {rows.length === 0 && <li className="bg-slate-800 p-2 rounded-md text-gray-500 italic">No secondary missions</li>}
        {rows.map(row => (
          <li key={row.key} className="bg-slate-800 p-2 rounded-md flex items-center justify-between gap-2">
            <span className="truncate">
              {row.name}
              <span className="block text-xs text-gray-500">{row.note}</span>
            </span>
            <span className="font-orbitron text-white">{row.vp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const GameSummary: React.FC<GameSummaryProps> = ({ gameState }) => {
    const { player1, player2 } = gameState;

    return (
        <div className="mt-4 w-full bg-slate-800/70 border-2 border-slate-700 rounded-lg p-4 shadow-lg">
            <h2 className="font-orbitron text-2xl text-center text-amber-400 mb-4 border-b-2 border-slate-700 pb-2">Game Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
                <div className="bg-slate-900/50 p-3 rounded-md">
                    <p className="font-orbitron text-xl text-amber-400 truncate">{player1.name}</p>
                    <p className="font-orbitron text-4xl font-bold text-white">{totalScore(player1)}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-md">
                    <p className="font-orbitron text-xl text-amber-400 truncate">{player2.name}</p>
                    <p className="font-orbitron text-4xl font-bold text-white">{totalScore(player2)}</p>
                </div>
            </div>

            <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-amber-400 uppercase bg-slate-900/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 rounded-tl-lg">Round</th>
                            <th scope="col" className="px-4 py-3 text-center" colSpan={2}>{player1.name}</th>
                            <th scope="col" className="px-4 py-3 text-center rounded-tr-lg" colSpan={2}>{player2.name}</th>
                        </tr>
                        <tr className="border-b border-t border-slate-700">
                            <th scope="col" className="px-4 py-2"></th>
                            <th scope="col" className="px-4 py-2 text-center font-normal">Primary</th>
                            <th scope="col" className="px-4 py-2 text-center font-normal">Secondary</th>
                            <th scope="col" className="px-4 py-2 text-center font-normal">Primary</th>
                            <th scope="col" className="px-4 py-2 text-center font-normal">Secondary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ROUNDS.map(round => (
                            <tr key={round} className="border-b border-slate-700 bg-slate-800/50">
                                <th scope="row" className="px-4 py-3 font-orbitron font-medium text-white whitespace-nowrap">
                                    {round}
                                </th>
                                <td className="px-4 py-3 text-center">{primaryInRound(player1, round)}</td>
                                <td className="px-4 py-3 text-center">{secondaryInRound(player1, round)}</td>
                                <td className="px-4 py-3 text-center">{primaryInRound(player2, round)}</td>
                                <td className="px-4 py-3 text-center">{secondaryInRound(player2, round)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="text-white bg-slate-900/30 border-b border-slate-700">
                            <th scope="row" className="px-4 py-3 font-orbitron">Battle Ready</th>
                            <td className="px-4 py-3 text-center" colSpan={2}>{player1.battleReady ? BATTLE_READY_VP : 0}</td>
                            <td className="px-4 py-3 text-center" colSpan={2}>{player2.battleReady ? BATTLE_READY_VP : 0}</td>
                        </tr>
                        <tr className="font-bold text-white bg-slate-900/50">
                            <th scope="row" className="px-4 py-3 font-orbitron rounded-bl-lg">Total</th>
                            <td className="px-4 py-3 text-center">{primaryTotal(player1)}</td>
                            <td className="px-4 py-3 text-center">{secondaryTotal(player1)}</td>
                            <td className="px-4 py-3 text-center">{primaryTotal(player2)}</td>
                            <td className="px-4 py-3 text-center rounded-br-lg">{secondaryTotal(player2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="space-y-2">
                <h3 className="font-orbitron text-lg text-center text-gray-300 border-b border-slate-700 pb-2 mb-2">
                    Missions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PlayerMissions player={player1} />
                    <PlayerMissions player={player2} />
                </div>
            </div>
        </div>
    );
};

export default GameSummary;
