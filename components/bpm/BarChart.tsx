"use client";

import React, { useMemo } from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
} from "./interpret";

export interface BarChartDatum {
  x: number | string;
  y: number;
}

/**
 * @component bpm.barChart
 * @description Graphique en barres.
 */
export interface BarChartProps {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  /** Contexte de jugement { reference, direction } : chaque barre est jugée individuellement (couleur par écart au repère), le repère est tracé en pointillé et la série entière reçoit un verdict global (aria-label, data-judgment). Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

/**
 * @component bpm.barChart
 * @description Graphique à barres verticales SVG simple pour comparaisons de valeurs.
 * @example
 * bpm.barChart({ data: [{ x: "Jan", y: 100 }, { x: "Fév", y: 150 }], color: "var(--bpm-accent)" })
 *
 * @param {object} props
 * @param {BarChartDatum[]} props.data - Données du graphique [{x, y}]. Obligatoire.
 * @param {number} [props.width=400] - Largeur du graphique. Optionnel.
 * @param {number} [props.height=200] - Hauteur du graphique. Optionnel.
 * @param {string} [props.color="var(--bpm-accent)"] - Couleur des barres. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : barres colorées par écart individuel au repère + verdict global. Optionnel.
 *
 * @associated bpm.lineChart, bpm.areaChart, bpm.plotlyChart
 * @parent bpm.card, bpm.grid, bpm.tableauxDeBord
 * @forbidden Série temporelle continue — utiliser bpm.lineChart
 */
export function BarChart(p: BarChartProps) {
  const { data, width = 400, height = 200, color = "var(--bpm-accent)", className = "", context } = p;
  const judgment = useMemo(() => {
    if (!context || !data.length) return null;
    const traj = data.map((d, i) => ({
      t: typeof d.x === "number" ? d.x : i,
      v: d.y,
    }));
    return interpret(traj, context);
  }, [data, context]);
  const geom = useMemo(() => {
    if (!data.length) return { bars: [], refY: null as number | null };
    const ys = data.map((d) => d.y);
    const reference = judgment && context ? context.reference : 0;
    const maxY = Math.max(0, reference, ...ys);
    const minY = Math.min(0, reference, ...ys);
    const pad = 20;
    const barW = Math.max(2, (width - pad * 2) / data.length - 4);
    const h = height - pad * 2;
    const y = (value: number) => height - pad - ((value - minY) / (maxY - minY || 1)) * h;
    return {
      bars: data.map((d, i) => ({
        x: pad + i * ((width - pad * 2) / data.length) + 2,
        w: barW,
        h: Math.abs(y(d.y) - y(0)),
        y: Math.min(y(d.y), y(0)),
        fill: context ? judgmentColor(interpret(d.y, context)) : color,
      })),
      refY: judgment && context ? y(context.reference) : null,
    };
  }, [data, width, height, judgment, context, color]);
  if (!data.length) {
    return <div className={"bpm-bar-chart w-full max-w-full " + className} style={{ aspectRatio: `${width}/${height}`, maxWidth: width, background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }} />;
  }
  return (
    <div className="w-full max-w-full overflow-hidden" style={{ aspectRatio: `${width}/${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={"bpm-bar-chart " + className}
        style={{ width: "100%", height: "auto" }}
        preserveAspectRatio="xMidYMid meet"
        role={judgment ? "img" : undefined}
        aria-label={judgment ? judgmentLabel(judgment) : undefined}
        data-judgment={judgment ? judgment.level.status : undefined}
      >
        {geom.bars.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} rx={2} />
        ))}
        {geom.refY != null && (
          <line
            x1={20}
            y1={geom.refY}
            x2={width - 20}
            y2={geom.refY}
            stroke="var(--bpm-text-secondary)"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.7}
          />
        )}
      </svg>
    </div>
  );
}
