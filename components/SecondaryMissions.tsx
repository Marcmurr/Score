
import React from 'react';
import type { PlayerKey, PlayerState, ScoreTarget, SecondaryMode, TacticalSecondary } from '../types';
import { newScoreEntry, type GameAction } from '../gameReducer';
import ScoreControl from './ScoreControl';
import { FIXED_SECONDARY_MISSIONS, SECONDARY_MISSIONS, getSecondaryName } from '../data/missions';
import {
  FIXED_SECONDARY_CAP,
  SECONDARY_GAME_CAP,
  SECONDARY_ROUND_CAP,
  headroom,
  secondaryInRound,
  secondaryTotal,
  sumScores,
} from '../scoring';
import { secondaryPresetKey } from '../scoringPresets';

interface SecondaryMissionsProps {
  player: PlayerState;
  playerKey: PlayerKey;
  round: number;
  dispatch: React.Dispatch<GameAction>;
  readOnly?: boolean;
}

// Tactical cards that were in the player's hand at some point during `round`.
const cardsInRound = (cards: TacticalSecondary[], round: number) =>
  cards.filter(c => c.drawnRound <= round && (c.resolvedRound === null || c.resolvedRound >= round));

const MODES: { id: SecondaryMode; label: string }[] = [
  { id: 'tactical', label: 'Tactical' },
  { id: 'fixed', label: 'Fixed' },
];

const actionButtonClass = 'text-xs font-bold uppercase px-2 py-1 rounded-md border transition-colors duration-200';

const SecondaryMissions: React.FC<SecondaryMissionsProps> = ({ player, playerKey, round, dispatch, readOnly = false }) => {
  const tacticalCards = cardsInRound(player.tacticalSecondaries, round);

  if (readOnly) {
    const names =
      player.secondaryMode === 'fixed'
        ? player.fixedSecondaries.filter(slot => slot.missionId).map(slot => ({
            key: slot.missionId!,
            name: getSecondaryName(slot.missionId),
            note: `${sumScores(slot.scores)}/${FIXED_SECONDARY_CAP}`,
          }))
        : tacticalCards
            .filter(card => !(card.resolvedRound === round && card.status === 'discarded'))
            .map(card => ({
              key: card.missionId,
              name: getSecondaryName(card.missionId),
              note: card.resolvedRound === round && card.status === 'scored' ? `✓ ${sumScores(card.scores, round)}VP` : null,
            }));

    return (
      <div className="flex flex-col gap-3 p-3 bg-slate-900/50 rounded-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 text-center">
          {player.secondaryMode === 'fixed' ? 'Fixed' : 'Tactical'} Secondaries
        </h3>
        {names.length === 0 ? (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 min-h-[50px] flex items-center justify-center text-gray-500 italic">
            No Secondary Missions
          </div>
        ) : (
          names.map(({ key, name, note }) => (
            <div key={key} className="bg-slate-700/50 border border-slate-600 text-white text-xl md:text-2xl font-bold font-orbitron tracking-wide rounded-lg p-3 min-h-[50px] flex items-center justify-center gap-3 text-center shadow-md">
              <span>{name}</span>
              {note && <span className="text-base text-amber-400">{note}</span>}
            </div>
          ))
        )}
      </div>
    );
  }

  const drawnIds = new Set(player.tacticalSecondaries.map(c => c.missionId));
  const deck = SECONDARY_MISSIONS.filter(m => !drawnIds.has(m.id));

  const scoreControl = (target: ScoreTarget, missionId: string, scores: PlayerState['primaryScores']) => (
    <ScoreControl
      label={getSecondaryName(missionId)}
      scores={scores}
      round={round}
      headroom={headroom(player, target, round)}
      presetKey={secondaryPresetKey(missionId)}
      onAdd={(vp, reason) => dispatch({ type: 'addScore', player: playerKey, target, entry: newScoreEntry(round, vp, reason) })}
      onRemove={(entryId) => dispatch({ type: 'removeScore', player: playerKey, target, entryId })}
    />
  );

  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-900/50 rounded-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Secondary (Round {round})</h3>
        <div className="flex shrink-0 rounded-md overflow-hidden border border-slate-600" role="group" aria-label="Secondary mission mode">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => dispatch({ type: 'updatePlayer', player: playerKey, changes: { secondaryMode: mode.id } })}
              aria-pressed={player.secondaryMode === mode.id}
              className={`text-xs font-bold uppercase px-3 py-1 transition-colors duration-200 ${player.secondaryMode === mode.id ? 'bg-amber-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        <span className="font-orbitron text-lg text-white">{secondaryInRound(player, round)}</span>/{SECONDARY_ROUND_CAP} this round
        {' · '}
        <span className="font-orbitron text-lg text-white">{secondaryTotal(player)}</span>/{SECONDARY_GAME_CAP} game
      </p>

      {player.secondaryMode === 'fixed' ? (
        player.fixedSecondaries.map((slot, index) => {
          const slotIndex = index as 0 | 1;
          const otherMissionId = player.fixedSecondaries[slotIndex === 0 ? 1 : 0].missionId;
          return (
            <div key={index} className="flex flex-col gap-2 bg-slate-800 p-2 rounded-md">
              <select
                aria-label={`Select fixed secondary mission ${index + 1}`}
                value={slot.missionId ?? 'none'}
                onChange={(e) => dispatch({ type: 'setFixedSecondary', player: playerKey, slot: slotIndex, missionId: e.target.value === 'none' ? null : e.target.value })}
                className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
              >
                <option value="none">-- Fixed Mission {index + 1} --</option>
                {FIXED_SECONDARY_MISSIONS.filter(m => m.id !== otherMissionId).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {slot.missionId && (
                <>
                  <p className="text-xs text-gray-400">
                    <span className="font-orbitron text-white">{sumScores(slot.scores, round)}</span> VP this round ·{' '}
                    {sumScores(slot.scores)}/{FIXED_SECONDARY_CAP} VP from this mission
                  </p>
                  {scoreControl({ kind: 'fixed', slot: slotIndex }, slot.missionId, slot.scores)}
                </>
              )}
            </div>
          );
        })
      ) : (
        <>
          {tacticalCards.length === 0 && (
            <p className="text-sm text-gray-500 italic text-center">No cards in hand. Draw two at the start of each Command phase.</p>
          )}
          {tacticalCards.map(card => {
            const name = getSecondaryName(card.missionId);
            const resolvedThisRound = card.resolvedRound === round;
            return (
              <div key={card.missionId} className={`flex flex-wrap items-center gap-2 bg-slate-800 p-2 rounded-md ${resolvedThisRound && card.status === 'discarded' ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-[8rem]">
                  <p className="font-bold text-white">{name}</p>
                  <p className="text-xs text-gray-400">
                    {resolvedThisRound ? (card.status === 'scored' ? 'Scored this round' : 'Discarded this round') : `In hand since round ${card.drawnRound}`}
                  </p>
                </div>
                <span className="font-orbitron text-xl text-white" aria-label={`${name} VP this round`}>{sumScores(card.scores, round)}</span>
                {card.status !== 'discarded' && scoreControl({ kind: 'tactical', missionId: card.missionId }, card.missionId, card.scores)}
                <div className="flex gap-1">
                  {resolvedThisRound ? (
                    <button
                      onClick={() => dispatch({ type: 'reopenTactical', player: playerKey, missionId: card.missionId })}
                      className={`${actionButtonClass} bg-slate-700 hover:bg-slate-600 text-gray-200 border-slate-600`}
                    >
                      Undo
                    </button>
                  ) : card.status === 'active' && (
                    <>
                      <button
                        onClick={() => dispatch({ type: 'resolveTactical', player: playerKey, missionId: card.missionId, status: 'scored', round })}
                        className={`${actionButtonClass} bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-800`}
                      >
                        Scored
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'resolveTactical', player: playerKey, missionId: card.missionId, status: 'discarded', round })}
                        className={`${actionButtonClass} bg-slate-700 hover:bg-slate-600 text-gray-200 border-slate-600`}
                      >
                        Discard
                      </button>
                      {card.scores.length === 0 && (
                        <button
                          onClick={() => dispatch({ type: 'returnTactical', player: playerKey, missionId: card.missionId })}
                          aria-label={`Return ${name} to the deck`}
                          title="Drawn by mistake? Return it to the deck"
                          className={`${actionButtonClass} bg-slate-800 hover:bg-red-800 text-gray-400 hover:text-white border-slate-600`}
                        >
                          ✕
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <select
            aria-label="Draw a secondary mission"
            value=""
            disabled={deck.length === 0}
            onChange={(e) => e.target.value && dispatch({ type: 'drawTactical', player: playerKey, missionId: e.target.value, round })}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
          >
            <option value="">{deck.length === 0 ? 'Deck empty' : '+ Draw secondary mission…'}</option>
            {deck.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default SecondaryMissions;
