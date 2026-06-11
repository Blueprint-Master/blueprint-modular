"use client";

import React, { useMemo } from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
} from "./interpret";

export interface AreaChartDatum {
  x: number | string;
  y: number;
}

/**
 * @component bpm.areaChart
 * @description Graphique en aires.
 */
export interface AreaChartProps {
  data: AreaChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  /** Contexte de jugement { reference, direction, comparisonFrame? } : la série (trajectoire v(t), t = x) est jugée par interpret — repère pointillé, couleur d'aire selon le verdict, aria-label. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

/**
 * @component bpm.areaChart
 * @description Graphique en aire SVG simple pour visualiser une série temporelle ou une distribution.
 * @example
 * bpm.areaChart({ data: [{ x: 1, y: 10 }, { x: 2, y: 25 }], color: "var(--bpm-success)" })
 *
 * @param {object} props
 * @param {AreaChartDatum[]} props.data - Données du graphique [{x, y}]. Obligatoire.
 * @param {number} [props.width=400] - Largeur du graphique. Optionnel.
 * @param {number} [props.height=200] - Hauteur du graphique. Optionnel.
 * @param {string} [props.color="var(--bpm-accent)"] - Couleur de l'aire. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : repère pointillé, couleur d'aire jugée, aria-label descriptif. Optionnel.
 *
 * @associated bpm.lineChart, bpm.barChart, bpm.plotlyChart
 * @parent bpm.card, bpm.grid, bpm.tableauxDeBord
 * @forbidden Comparaison de catégories — utiliser bpm.barChart
 */
export function AreaChart(p: AreaChartProps) {
  const { data, width = 400, height = 200, color = "var(--bpm-accent)", className = "", context } = p;
  const judgment = useMemo(() => {
    if (!context || !data.length) return null;
    const traj = data.map((d, i) => ({
      t: typeof d.x === "number" ? d.x : Number(d.x) || i,
      v: d.y,
    }));
    return interpret(traj, context);
  }, [data, context]);
  const geom = useMemo(() => {
    if (!data.length) return { path: "", refY: null as number | null };
    const xs = data.map((d, i) => (typeof d.x === "number" ? d.x : Number(d.x) || i));
    const ys = data.map((d) => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    let minY = Math.min(...ys);
    let maxY = Math.max(...ys);
    if (judgment && context) {
      minY = Math.min(minY, context.reference);
      maxY = Math.max(maxY, context.reference);
    }
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const pad = 10;
    const w = width - pad * 2;
    const h = height - pad * 2;
    const xScale = (v: number) => pad + ((v - minX) / rangeX) * w;
    const yScale = (v: number) => height - pad - ((v - minY) / rangeY) * h;
    const pts = data.map((_, i) => xScale(xs[i]) + "," + yScale(ys[i]));
    const line = "M" + pts.join("L");
    const lastX = xScale(xs[xs.length - 1]);
    const firstX = xScale(xs[0]);
    const bottom = height - pad;
    return {
      path: line + "L" + lastX + "," + bottom + "L" + firstX + "," + bottom + "Z",
      refY: judgment && context ? yScale(context.reference) : null,
    };
  }, [data, width, height, judgment, context]);
  if (!data.length) return <div className={"bpm-area-chart w-full max-w-full " + className} style={{ aspectRatio: `${width}/${height}`, maxWidth: width, background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }} />;
  const fill = judgment ? judgmentColor(judgment) : color;
  return (
    <div className="w-full max-w-full overflow-hidden" style={{ aspectRatio: `${width}/${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={"bpm-area-chart " + className}
        style={{ width: "100%", height: "auto" }}
        preserveAspectRatio="xMidYMid meet"
        role={judgment ? "img" : undefined}
        aria-label={judgment ? judgmentLabel(judgment) : undefined}
        data-judgment={judgment ? judgment.level.status : undefined}
      >
        {geom.refY != null && (
          <line
            x1={10}
            y1={geom.refY}
            x2={width - 10}
            y2={geom.refY}
            stroke="var(--bpm-text-secondary)"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.6}
          />
        )}
        <path d={geom.path} fill={fill} fillOpacity={0.3} stroke={fill} strokeWidth={1.5} />
      </svg>
    </div>
  );
}
