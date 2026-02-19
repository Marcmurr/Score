
import React from 'react';
import type { GameState, TurnScore } from '../types';
import { SECONDARY_MISSIONS } from '../data/missions';

interface GameSummaryProps {
  gameState: GameState;
}

const GameSummary: React.FC<GameSummaryProps> = ({ gameState }) => {
    const { player1, player2 } = gameState;
    const turns = [1, 2, 3, 4, 5];

    const getMissionName = (missionId: string | null | undefined): string => {
        if (!missionId) return '—';
        const mission = SECONDARY_MISSIONS.find(m => m.id === missionId);
        return mission ? mission.name : 'Unknown Mission';
    };

    const calculateTotals = (player: typeof player1) => {
        const scores = Object.values(player.scores) as TurnScore[];
        const primary = scores.reduce((sum, s) => sum + s.primary, 0);
        const secondary = scores.reduce((sum, s) => sum + s.secondary, 0);
        return { primary, secondary, total: primary + secondary };
    };

    const p1Totals = calculateTotals(player1);
    const p2Totals = calculateTotals(player2);

    return (
        <div className="mt-4 w-full bg-slate-800/70 border-2 border-slate-700 rounded-lg p-4 shadow-lg">
            <h2 className="font-orbitron text-2xl text-center text-amber-400 mb-4 border-b-2 border-slate-700 pb-2">Game Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
                <div className="bg-slate-900/50 p-3 rounded-md">
                    <p className="font-orbitron text-xl text-amber-400 truncate">{player1.name}</p>
                    <p className="font-orbitron text-4xl font-bold text-white">{p1Totals.total}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-md">
                    <p className="font-orbitron text-xl text-amber-400 truncate">{player2.name}</p>
                    <p className="font-orbitron text-4xl font-bold text-white">{p2Totals.total}</p>
                </div>
            </div>

            <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-amber-400 uppercase bg-slate-900/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 rounded-tl-lg">Turn</th>
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
                        {turns.map(turn => (
                            <tr key={turn} className="border-b border-slate-700 bg-slate-800/50">
                                <th scope="row" className="px-4 py-3 font-orbitron font-medium text-white whitespace-nowrap">
                                    {turn}
                                </th>
                                <td className="px-4 py-3 text-center">{player1.scores[turn].primary}</td>
                                <td className="px-4 py-3 text-center">{player1.scores[turn].secondary}</td>
                                <td className="px-4 py-3 text-center">{player2.scores[turn].primary}</td>
                                <td className="px-4 py-3 text-center">{player2.scores[turn].secondary}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold text-white bg-slate-900/50">
                            <th scope="row" className="px-4 py-3 font-orbitron rounded-bl-lg">Total</th>
                            <td className="px-4 py-3 text-center">{p1Totals.primary}</td>
                            <td className="px-4 py-3 text-center">{p1Totals.secondary}</td>
                            <td className="px-4 py-3 text-center">{p2Totals.primary}</td>
                            <td className="px-4 py-3 text-center rounded-br-lg">{p2Totals.secondary}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="space-y-2">
                <h3 className="font-orbitron text-lg text-center text-gray-300 border-b border-slate-700 pb-2 mb-2">
                    Secondary Objectives
                </h3>
                {turns.map(turn => (
                    <div key={turn} className="bg-slate-900/50 p-3 rounded-md">
                        <h4 className="font-orbitron text-md text-center text-amber-400 mb-2">Turn {turn}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-300 font-bold text-center mb-1 truncate">{player1.name}</p>
                                <ul className="text-gray-300 space-y-1">
                                    <li className="bg-slate-800 p-2 rounded-md truncate">1: {getMissionName(player1.secondaryMissions[turn]?.[0])}</li>
                                    <li className="bg-slate-800 p-2 rounded-md truncate">2: {getMissionName(player1.secondaryMissions[turn]?.[1])}</li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-gray-300 font-bold text-center mb-1 truncate">{player2.name}</p>
                                <ul className="text-gray-300 space-y-1">
                                    <li className="bg-slate-800 p-2 rounded-md truncate">1: {getMissionName(player2.secondaryMissions[turn]?.[0])}</li>
                                    <li className="bg-slate-800 p-2 rounded-md truncate">2: {getMissionName(player2.secondaryMissions[turn]?.[1])}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameSummary;
