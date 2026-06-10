"use client";

import React, { useMemo } from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
} from "./interpret";

/**
 * @component bpm.scatterChart
 * @description Graphique de dispersion (nuage de points) SVG simple et responsive.
 * @example
 * bpm.scatterChart({ data: [{ x: 1, y: 10 }, { x: 2, y: 25 }], color: "#3b82f6", radius: 5 })
 *
 * @param {object} props
 * @param {ScatterChartDatum[]} props.data - Points { x, y }. Obligatoire.
 * @param {number} [props.width=400] - Largeur du SVG. Optionnel.
 * @param {number} [props.height=200] - Hauteur du SVG. Optionnel.
 * @param {string} [props.color="var(--bpm-accent)"] - Couleur des points. Optionnel.
 * @param {number} [props.radius=4] - Rayon des cercles. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : points colorés par écart individuel, anomalies (>2σ du nuage) cerclées, repère pointillé, verdict global. Optionnel.
 *
 * @associated bpm.lineChart, bpm.areaChart, bpm.plotlyChart
 */
export interface ScatterChartDatum {
  x: number;
  y: number;
}

export interface ScatterChartProps {
  data: ScatterChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  radius?: number;
  className?: string;
  /** Contexte de jugement { reference, direction, comparisonFrame? } : chaque point est jugé (couleur par écart au repère ; anomalie >2σ — du comparisonFrame ou, à défaut, du nuage lui-même — cerclée), repère pointillé tracé, verdict global de la série en aria-label + data-judgment. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

export function ScatterChart({ data, width = 400, height = 200, color = "var(--bpm-accent)", radius = 4, className = "", context }: ScatterChartProps) {
  const judgment = useMemo(() => {
    if (!context || !data.length) return null;
    const traj = [...data].sort((a, b) => a.x - b.x).map((d) => ({ t: d.x, v: d.y }));
    return interpret(traj, context);
  }, [data, context]);

  const geom = useMemo(() => {
    if (!data.length) return { points: [] as { cx: number; cy: number; fill: string; abnormal: boolean }[], refY: null as number | null };
    const xs = data.map((d) => d.x);
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
    const pad = 20;
    const w = width - pad * 2;
    const h = height - pad * 2;
    const frame = context?.comparisonFrame ?? ys;
    return {
      points: data.map((d) => {
        const j = context ? interpret(d.y, { ...context, comparisonFrame: frame }) : null;
        return {
          cx: pad + ((d.x - minX) / rangeX) * w,
          cy: height - pad - ((d.y - minY) / rangeY) * h,
          fill: j ? judgmentColor(j) : color,
          abnormal: j?.anomaly?.status === "abnormal",
        };
      }),
      refY: judgment && context ? height - pad - ((context.reference - minY) / rangeY) * h : null,
    };
  }, [data, width, height, judgment, context, color]);

  if (!data.length) return <div className={"bpm-scatter-chart w-full max-w-full " + className} style={{ aspectRatio: `${width}/${height}`, maxWidth: width, background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }} />;
  return (
    <div className="w-full max-w-full overflow-hidden" style={{ aspectRatio: `${width}/${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={"bpm-scatter-chart " + className}
        style={{ width: "100%", height: "auto" }}
        preserveAspectRatio="xMidYMid meet"
        role={judgment ? "img" : undefined}
        aria-label={judgment ? judgmentLabel(judgment) : undefined}
        data-judgment={judgment ? judgment.level.status : undefined}
      >
        {geom.refY != null && (
          <line
            x1={20}
            y1={geom.refY}
            x2={width - 20}
            y2={geom.refY}
            stroke="var(--bpm-text-secondary)"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.6}
          />
        )}
        {geom.points.map((p, i) => (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={p.abnormal ? radius + 2 : radius}
            fill={p.fill}
            stroke={p.abnormal ? "var(--bpm-text-primary)" : undefined}
            strokeWidth={p.abnormal ? 1.5 : undefined}
            data-abnormal={p.abnormal ? "true" : undefined}
          />
        ))}
      </svg>
    </div>
  );
}
