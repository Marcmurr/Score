
import React from 'react';
import type { GameState, PlayerKey, PlayerState } from '../../types';
import { getDispositionName, getSecondaryName } from '../../data/missions';
import {
  BATTLE_READY_VP,
  FIXED_SECONDARY_CAP,
  PRIMARY_GAME_CAP,
  SECONDARY_GAME_CAP,
  cpBalance,
  primaryInRound,
  primaryTotal,
  remainingPotential,
  secondaryInRound,
  secondaryTotal,
  sumScores,
  totalScore,
} from '../../scoring';
import { SUMMARY_ROUND } from '../../gameReducer';
import {
  LAST_ROUND,
  PLAYER_COLORS,
  cardMovesInRound,
  cpInRound,
  latestScores,
  otherPlayer,
  playedRounds,
  reasonTotals,
  scoreLines,
  tacticalSummary,
  turnOrder,
} from './statsData';

export const Panel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <section className={`bg-slate-800 border border-slate-700 rounded-xl p-4 ${className}`}>
    <h2 className="font-orbitron text-sm uppercase tracking-wider text-amber-400 mb-3">{title}</h2>
    {children}
  </section>
);

const Swatch: React.FC<{ player: PlayerKey }> = ({ player }) => (
  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PLAYER_COLORS[player] }} aria-hidden="true" />
);

const FirstBadge: React.FC = () => (
  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-900 rounded px-1.5 py-0.5">1st</span>
);

// Names, factions, totals, CP and the current lead.
export const ScoreHeader: React.FC<{ state: GameState }> = ({ state }) => {
  const [first, second] = turnOrder(state);
  const lead = totalScore(state[first]) - totalScore(state[second]);
  const leader = lead >= 0 ? first : second;
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {[first, second].map(key => {
          const player = state[key];
          const disposition = getDispositionName(player.forceDisposition);
          return (
            <div key={key} className="bg-slate-800 border border-slate-700 rounded-xl p-3 sm:p-4 border-t-4" style={{ borderTopColor: PLAYER_COLORS[key] }}>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-orbitron text-lg sm:text-2xl text-white break-words">{player.name}</h1>
                {state.firstPlayer === key && <FirstBadge />}
              </div>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-400 min-h-[1.25rem]">{player.faction || ' '}</p>
              <p className="font-orbitron text-5xl sm:text-6xl font-bold text-white my-2">{totalScore(player)}</p>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:text-sm">
                <dt className="text-gray-400">Primary</dt>
                <dd className="text-white text-right">{primaryTotal(player)}/{PRIMARY_GAME_CAP}</dd>
                <dt className="text-gray-400">Secondary</dt>
                <dd className="text-white text-right">{secondaryTotal(player)}/{SECONDARY_GAME_CAP}</dd>
                <dt className="text-gray-400">Battle Ready</dt>
                <dd className="text-white text-right">{player.battleReady ? `+${BATTLE_READY_VP}` : '—'}</dd>
                <dt className="text-gray-400">CP left</dt>
                <dd className="text-white text-right font-bold">{cpBalance(player)}</dd>
              </dl>
              {(player.primaryMission || disposition) && (
                <p className="mt-3 text-xs sm:text-sm text-gray-300 border-t border-slate-700 pt-2">
                  <span className="text-white">{player.primaryMission || 'Primary mission not set'}</span>
                  {disposition && <span className="block text-xs uppercase tracking-wider text-gray-400">{disposition}</span>}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm text-gray-300" role="status">
        {lead === 0 ? 'Scores are level' : (
          <><span className="font-bold text-white">{state[leader].name}</span> ahead by <span className="font-bold text-white">{Math.abs(lead)}</span></>
        )}
      </p>
    </div>
  );
};

const ScoreLineList: React.FC<{ lines: ReturnType<typeof scoreLines> }> = ({ lines }) => (
  <ul className="ml-4 text-gray-300">
    {lines.map(line => (
      <li key={line.id} className="flex justify-between gap-2">
        <span className="min-w-0">
          {line.kind === 'secondary' && <span className="text-white">{line.mission}</span>}
          {line.kind === 'secondary' && line.reason && <span className="text-gray-400"> · </span>}
          {line.reason || (line.kind === 'primary' ? 'Primary' : '')}
        </span>
        <span className="shrink-0 text-white">+{line.vp}</span>
      </li>
    ))}
  </ul>
);

// e.g. "+1 gained · −3 spent on Command Re-roll ×2 (2 CP), Overwatch (1 CP)"
const describeCpRound = (cp: ReturnType<typeof cpInRound>) => {
  const named = new Map<string, { count: number; cost: number }>();
  cp.stratagems
    .filter(s => s.name !== 'Unnamed')
    .forEach(s => {
      const total = named.get(s.name) ?? { count: 0, cost: 0 };
      named.set(s.name, { count: total.count + 1, cost: total.cost + s.cost });
    });
  const uses = [...named].map(([name, { count, cost }]) => `${name}${count > 1 ? ` ×${count}` : ''} (${cost} CP)`);
  return [
    cp.gained > 0 && `+${cp.gained} gained`,
    cp.spent > 0 && `−${cp.spent} spent${uses.length ? ` on ${uses.join(', ')}` : ''}`,
  ].filter(Boolean).join(' · ');
};

const PlayerRound: React.FC<{ state: GameState; player: PlayerKey; round: number }> = ({ state, player: key, round }) => {
  const player = state[key];
  const lines = scoreLines(player).filter(line => line.round === round);
  const primary = primaryInRound(player, round);
  const secondary = secondaryInRound(player, round);
  const moves = cardMovesInRound(player, round);
  const cp = cpInRound(player, round);
  return (
    <div className="flex flex-col gap-1 text-sm min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-bold text-white min-w-0">
          <Swatch player={key} />
          <span className="truncate">{player.name}</span>
        </span>
        <span className="font-orbitron text-lg text-white">+{primary + secondary}</span>
      </div>
      {lines.length === 0 && <p className="ml-4 text-gray-500 italic">No points yet</p>}
      {primary > 0 && (
        <>
          <p className="flex justify-between text-gray-400 text-xs uppercase tracking-wider ml-4 mt-1"><span>Primary</span><span>+{primary}</span></p>
          <ScoreLineList lines={lines.filter(line => line.kind === 'primary')} />
        </>
      )}
      {secondary > 0 && (
        <>
          <p className="flex justify-between text-gray-400 text-xs uppercase tracking-wider ml-4 mt-1"><span>Secondary</span><span>+{secondary}</span></p>
          <ScoreLineList lines={lines.filter(line => line.kind === 'secondary')} />
        </>
      )}
      {(cp.gained > 0 || cp.spent > 0) && (
        <p className="ml-4 mt-1 text-xs text-gray-400">CP: {describeCpRound(cp)}</p>
      )}
      {(moves.drawn.length > 0 || moves.discarded.length > 0) && (
        <p className="ml-4 mt-1 text-xs text-gray-400">
          {moves.drawn.length > 0 && <>Drew {moves.drawn.join(', ')}</>}
          {moves.drawn.length > 0 && moves.discarded.length > 0 && ' · '}
          {moves.discarded.length > 0 && <>Discarded {moves.discarded.join(', ')}</>}
        </p>
      )}
    </div>
  );
};

// What each player scored in each round and how, latest round first.
export const RoundBreakdown: React.FC<{ state: GameState }> = ({ state }) => {
  const order = turnOrder(state);
  const rounds = [...playedRounds(state)].reverse();
  return (
    <Panel title="Round by round">
      <div className="flex flex-col gap-3">
        {rounds.map(round => (
          <article key={round} className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
            <h3 className="flex items-center gap-2 font-orbitron text-white mb-2">
              Round {round}
              {round === state.round && <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-300 border border-emerald-700 rounded px-1.5 py-0.5">In progress</span>}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.map(key => <PlayerRound key={key} state={state} player={key} round={round} />)}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
};

export const LatestScores: React.FC<{ state: GameState }> = ({ state }) => {
  const items = latestScores(state, 6);
  return (
    <Panel title="Latest scores">
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No points scored yet.</p>
      ) : (
        <ol className="flex flex-col gap-2 text-sm">
          {items.map(item => (
            <li key={item.id} className="flex items-start gap-2">
              <span className="mt-1.5"><Swatch player={item.player} /></span>
              <span className="min-w-0 flex-1">
                <span className="text-white">{state[item.player].name}</span>
                <span className="text-gray-400"> · R{item.round} · {item.mission}</span>
                {item.reason && <span className="block text-gray-300">{item.reason}</span>}
              </span>
              <span className="font-bold text-white">+{item.vp}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
};

// How many VP each player could still add, given the per-round and per-game caps.
export const StillPossible: React.FC<{ state: GameState }> = ({ state }) => {
  if (state.round >= SUMMARY_ROUND) return null;
  const round = Math.min(state.round, LAST_ROUND);
  return (
    <Panel title="Still possible">
      <ul className="flex flex-col gap-3 text-sm">
        {turnOrder(state).map(key => {
          const player = state[key];
          const potential = remainingPotential(player, round);
          const deficit = totalScore(state[otherPlayer(key)]) - totalScore(player);
          return (
            <li key={key} className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 text-white font-bold"><Swatch player={key} />{player.name}</span>
              <span className="text-gray-300 ml-4">
                Up to <span className="font-bold text-white">{potential.primary + potential.secondary}</span> more VP
                <span className="text-gray-400"> ({potential.primary} primary, {potential.secondary} secondary)</span>
              </span>
              <span className="text-gray-300 ml-4">
                Best possible final score: <span className="font-bold text-white">{totalScore(player) + potential.primary + potential.secondary}</span>
              </span>
              {deficit > 0 && (
                <span className="text-gray-400 ml-4">{deficit} behind</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-gray-500">Counts round {round} and later, within the 15 VP per round and 45 VP per game limits.</p>
    </Panel>
  );
};

const ReasonTable: React.FC<{ scores: PlayerState['primaryScores'] }> = ({ scores }) => {
  const totals = reasonTotals(scores);
  if (totals.length === 0) return <p className="text-sm text-gray-500 italic">Nothing scored yet.</p>;
  return (
    <table className="w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
      <tbody>
        {totals.map(total => (
          <tr key={total.reason} className="border-t border-slate-700 first:border-t-0">
            <td className="py-1 pr-2 text-gray-300">{total.reason}</td>
            <td className="py-1 px-2 text-right text-gray-400">×{total.count}</td>
            <td className="py-1 pl-2 text-right text-white font-bold">{total.vp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const cardStatus = (card: PlayerState['tacticalSecondaries'][number], round: number) => {
  if (card.status === 'scored') return `Scored in round ${card.resolvedRound}`;
  if (card.status === 'discarded') return `Discarded in round ${card.resolvedRound}`;
  const held = Math.max(1, Math.min(round, LAST_ROUND) - card.drawnRound + 1);
  return `In hand since round ${card.drawnRound} (${held} round${held === 1 ? '' : 's'})`;
};

// One player's primary scoring by reason and every secondary they played.
export const PlayerMissions: React.FC<{ state: GameState; player: PlayerKey }> = ({ state, player: key }) => {
  const player = state[key];
  const summary = tacticalSummary(player);
  return (
    <section className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-4">
      <h2 className="flex items-center gap-2 font-orbitron text-sm uppercase tracking-wider text-amber-400">
        <Swatch player={key} />
        <span className="truncate">{player.name}: missions</span>
      </h2>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
          Primary · {player.primaryMission || 'not set'} · {primaryTotal(player)}/{PRIMARY_GAME_CAP} VP
        </h3>
        <ReasonTable scores={player.primaryScores} />
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
          {player.secondaryMode === 'fixed' ? 'Fixed' : 'Tactical'} secondaries · {secondaryTotal(player)}/{SECONDARY_GAME_CAP} VP
        </h3>
        {player.secondaryMode === 'fixed' ? (
          <ul className="flex flex-col gap-3">
            {player.fixedSecondaries.filter(slot => slot.missionId).map(slot => {
              const vp = sumScores(slot.scores);
              return (
                <li key={slot.missionId} className="text-sm">
                  <p className="flex justify-between text-white"><span>{getSecondaryName(slot.missionId)}</span><span className="font-bold">{vp}/{FIXED_SECONDARY_CAP}</span></p>
                  <div className="mt-1 h-2 rounded-full bg-slate-700 overflow-hidden" role="meter" aria-valuemin={0} aria-valuemax={FIXED_SECONDARY_CAP} aria-valuenow={vp} aria-label={`${getSecondaryName(slot.missionId)} progress`}>
                    <div className="h-full rounded-full" style={{ width: `${(vp / FIXED_SECONDARY_CAP) * 100}%`, backgroundColor: PLAYER_COLORS[key] }} />
                  </div>
                  <div className="mt-1"><ReasonTable scores={slot.scores} /></div>
                </li>
              );
            })}
            {player.fixedSecondaries.every(slot => !slot.missionId) && <p className="text-sm text-gray-500 italic">No missions chosen yet.</p>}
          </ul>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">
              Drawn {summary.drawn} · Scored {summary.scored} · Discarded {summary.discarded} · In hand {summary.inHand}
              {summary.averageScored !== null && <> · {summary.averageScored.toFixed(1)} VP per scored card</>}
            </p>
            {player.tacticalSecondaries.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No cards drawn yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {player.tacticalSecondaries.map(card => (
                  <li key={card.missionId} className={`text-sm rounded-md bg-slate-900/60 p-2 ${card.status === 'discarded' ? 'opacity-60' : ''}`}>
                    <p className="flex justify-between gap-2">
                      <span className="text-white">{getSecondaryName(card.missionId)}</span>
                      <span className="font-bold text-white">{sumScores(card.scores)} VP</span>
                    </p>
                    <p className="text-xs text-gray-400">{cardStatus(card, state.round)}</p>
                    {card.scores.length > 0 && (
                      <ul className="mt-1 text-xs text-gray-300">
                        {card.scores.map(entry => (
                          <li key={entry.id} className="flex justify-between">
                            <span>R{entry.round} · {entry.reason || 'Score'}</span><span>+{entry.vp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <CommandPoints state={state} player={key} />
    </section>
  );
};

// CP gained, spent and left each round, and every stratagem used.
const CommandPoints: React.FC<{ state: GameState; player: PlayerKey }> = ({ state, player: key }) => {
  const player = state[key];
  const rounds = playedRounds(state);
  const perRound = rounds.map(round => ({ round, ...cpInRound(player, round) }));
  const stratagems = perRound.flatMap(r => r.stratagems.map(s => ({ ...s, round: r.round })));
  const gained = perRound.reduce((sum, r) => sum + r.gained, 0);
  const spent = perRound.reduce((sum, r) => sum + r.spent, 0);
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
        Command points · gained {gained} · spent {spent} · left {cpBalance(player)}
      </h3>
      <table className="w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <thead className="text-xs text-gray-400">
          <tr>
            <th scope="col" className="py-1 pr-2 text-left font-normal">Round</th>
            <th scope="col" className="py-1 px-2 text-right font-normal">Gained</th>
            <th scope="col" className="py-1 px-2 text-right font-normal">Spent</th>
            <th scope="col" className="py-1 pl-2 text-right font-normal">Left</th>
          </tr>
        </thead>
        <tbody>
          {perRound.map(r => (
            <tr key={r.round} className="border-t border-slate-700">
              <th scope="row" className="py-1 pr-2 text-left font-normal text-gray-300">{r.round}</th>
              <td className="py-1 px-2 text-right text-white">{r.gained ? `+${r.gained}` : '—'}</td>
              <td className="py-1 px-2 text-right text-white">{r.spent ? `−${r.spent}` : '—'}</td>
              <td className="py-1 pl-2 text-right text-white font-bold">{r.leftAfter}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {stratagems.length > 0 && (
        <ul className="mt-2 text-xs text-gray-300">
          {stratagems.map(s => (
            <li key={s.id} className="flex justify-between">
              <span>R{s.round} · {s.name}</span><span>−{s.cost} CP</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
