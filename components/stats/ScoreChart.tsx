
import React, { useEffect, useRef, useState } from 'react';
import type { GameState } from '../../types';
import { LAST_ROUND, PLAYER_COLORS, cumulativeScores, turnOrder } from './statsData';

// Chart chrome for the slate-800 card surface.
const SURFACE = '#1e293b';
const GRID = '#334155';
const BASELINE = '#475569';
const MUTED_TEXT = '#94a3b8';
const PRIMARY_TEXT = '#f8fafc';

const HEIGHT = 220;
const MARGIN = { top: 12, right: 36, bottom: 24, left: 32 };
const X_LABELS = ['Start', ...Array.from({ length: LAST_ROUND }, (_, i) => `R${i + 1}`)];
const MIN_END_LABEL_GAP = 14;

const useWidth = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
};

const niceStep = (max: number) => (max <= 20 ? 5 : max <= 50 ? 10 : 25);

const pointLabel = (index: number) => (index === 0 ? 'Start' : `After round ${index}`);

// Running total of each player's VP, round by round.
const ScoreChart: React.FC<{ state: GameState }> = ({ state }) => {
  const [containerRef, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const order = turnOrder(state);
  const lastIndex = Math.min(state.round, LAST_ROUND);
  const series = order.map(key => ({ key, name: state[key].name, values: cumulativeScores(state[key]).slice(0, lastIndex + 1) }));

  const maxValue = Math.max(10, ...series.flatMap(s => s.values));
  const step = niceStep(maxValue);
  const yMax = Math.ceil(maxValue / step) * step;
  const ticks = Array.from({ length: yMax / step + 1 }, (_, i) => i * step);

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (index: number) => MARGIN.left + (plotWidth * index) / LAST_ROUND;
  const y = (value: number) => MARGIN.top + plotHeight - (plotHeight * value) / yMax;
  const bandWidth = plotWidth / LAST_ROUND;

  // End labels only when they don't collide; otherwise the legend, tooltip and table carry the values.
  const endYs = series.map(s => y(s.values[s.values.length - 1]));
  const showEndLabels = Math.abs(endYs[0] - endYs[1]) >= MIN_END_LABEL_GAP;

  const summary = series.map(s => `${s.name} ${s.values[s.values.length - 1]}`).join(', ');

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300" aria-label="Legend">
        {series.map(s => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="inline-block w-4 h-0.5 rounded-full" style={{ backgroundColor: PLAYER_COLORS[s.key] }} aria-hidden="true" />
            {s.name}
          </li>
        ))}
      </ul>

      <div ref={containerRef} className="relative w-full" style={{ height: HEIGHT }} onPointerLeave={() => setActive(null)}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} role="img" aria-label={`Score over time. ${pointLabel(lastIndex)}: ${summary}.`}>
            {ticks.map(tick => (
              <g key={tick}>
                <line x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? BASELINE : GRID} strokeWidth={1} />
                <text x={MARGIN.left - 6} y={y(tick)} dy="0.32em" textAnchor="end" fontSize={11} fill={MUTED_TEXT} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {tick}
                </text>
              </g>
            ))}
            {X_LABELS.map((label, index) => (
              <text key={label} x={x(index)} y={HEIGHT - 6} textAnchor="middle" fontSize={11} fill={index <= lastIndex ? MUTED_TEXT : GRID}>
                {label}
              </text>
            ))}

            {active !== null && <line x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} stroke={BASELINE} strokeWidth={1} />}

            {series.map(s => (
              <g key={s.key}>
                <polyline
                  points={s.values.map((value, index) => `${x(index)},${y(value)}`).join(' ')}
                  fill="none"
                  stroke={PLAYER_COLORS[s.key]}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {(active === null ? [s.values.length - 1] : [active]).map(index => (
                  <circle key={index} cx={x(index)} cy={y(s.values[index])} r={4} fill={PLAYER_COLORS[s.key]} stroke={SURFACE} strokeWidth={2} />
                ))}
                {showEndLabels && active === null && (
                  <text x={x(s.values.length - 1) + 8} y={y(s.values[s.values.length - 1])} dy="0.32em" fontSize={12} fontWeight={700} fill={PRIMARY_TEXT}>
                    {s.values[s.values.length - 1]}
                  </text>
                )}
              </g>
            ))}

            {/* Hover and keyboard targets: one band per round, so the reader aims at a round, not a 2px line */}
            {Array.from({ length: lastIndex + 1 }, (_, index) => (
              <rect
                key={index}
                x={x(index) - bandWidth / 2}
                y={MARGIN.top}
                width={bandWidth}
                height={plotHeight}
                fill="transparent"
                tabIndex={0}
                aria-label={`${pointLabel(index)}: ${series.map(s => `${s.name} ${s.values[index]}`).join(', ')}`}
                onPointerEnter={() => setActive(index)}
                onPointerDown={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                style={{ outline: 'none' }}
              />
            ))}
          </svg>
        )}

        {active !== null && width > 0 && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-md border border-slate-600 bg-slate-900/95 px-3 py-2 text-xs shadow-lg"
            style={x(active) > width / 2 ? { right: width - x(active) + 10 } : { left: x(active) + 10 }}
          >
            <p className="text-gray-400 mb-1">{pointLabel(active)}</p>
            {series.map(s => (
              <p key={s.key} className="flex items-center gap-2 whitespace-nowrap">
                <span className="inline-block w-3 h-0.5 rounded-full" style={{ backgroundColor: PLAYER_COLORS[s.key] }} aria-hidden="true" />
                <span className="font-bold text-white text-sm">{s.values[active]}</span>
                <span className="text-gray-400">{s.name}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <details className="text-sm text-gray-300">
        <summary className="cursor-pointer text-gray-400 hover:text-gray-200">Show as table</summary>
        <table className="mt-2 w-full text-left" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <thead className="text-xs uppercase text-gray-400">
            <tr>
              <th scope="col" className="py-1 pr-2 font-normal"></th>
              {series.map(s => <th key={s.key} scope="col" className="py-1 px-2 font-normal text-right">{s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {series[0].values.map((_, index) => (
              <tr key={index} className="border-t border-slate-700">
                <th scope="row" className="py-1 pr-2 font-normal text-gray-400">{pointLabel(index)}</th>
                {series.map(s => <td key={s.key} className="py-1 px-2 text-right text-white">{s.values[index]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
};

export default ScoreChart;

