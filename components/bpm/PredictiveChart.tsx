"use client";

import React, { useMemo } from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
} from "./interpret";

/**
 * @component bpm.predictiveChart
 * @description Graphique de prévision avec données historiques, prédictions et intervalle de confiance.
 * @example
 * bpm.predictiveChart({ historical: [{x:1,y:10}], predicted: [{x:2,y:15}], confidenceUpper: [{x:2,y:18}], confidenceLower: [{x:2,y:12}], todayX: 1.5 })
 *
 * @param {object} props
 * @param {{ x: number; y: number }[]} props.historical - Points historiques. Obligatoire.
 * @param {{ x: number; y: number }[]} props.predicted - Points prédits (ligne pointillée). Obligatoire.
 * @param {{ x: number; y: number }[]} [props.confidenceUpper] - Borne supérieure de confiance. Optionnel.
 * @param {{ x: number; y: number }[]} [props.confidenceLower] - Borne inférieure de confiance. Optionnel.
 * @param {number} [props.todayX] - Position X de la ligne "aujourd'hui". Optionnel.
 * @param {number} [props.width=520] - Largeur du SVG. Optionnel.
 * @param {number} [props.height=220] - Hauteur du SVG. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : la trajectoire PRÉDITE est jugée par interpret (couleur de la prévision, repère pointillé, verdict). Optionnel.
 *
 * @associated bpm.lineChart, bpm.liveChart, bpm.metric
 */
export interface PredictiveChartProps {
  historical: { x: number; y: number }[];
  predicted: { x: number; y: number }[];
  confidenceUpper?: { x: number; y: number }[];
  confidenceLower?: { x: number; y: number }[];
  todayX?: number;
  width?: number;
  height?: number;
  className?: string;
  /** Contexte de jugement { reference, direction } : la trajectoire prédite est jugée par interpret — la prévision (pointillés) prend la couleur du verdict, le repère est tracé, l'aria-label décrit le jugement. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

function pathLine(pts: { x: number; y: number }[], sx: (x: number) => number, sy: (y: number) => number) {
  if (pts.length === 0) return "";
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x)} ${sy(p.y)}`)
    .join(" ");
}

export function PredictiveChart({
  historical,
  predicted,
  confidenceUpper,
  confidenceLower,
  todayX,
  width = 520,
  height = 220,
  className = "",
  context,
}: PredictiveChartProps) {
  const pad = { l: 36, r: 16, t: 12, b: 28 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const judgment = useMemo(() => {
    if (!context || predicted.length === 0) return null;
    return interpret(
      predicted.map((p) => ({ t: p.x, v: p.y })),
      context
    );
  }, [predicted, context]);

  const { sx, sy } = useMemo(() => {
    const all = [...historical, ...predicted, ...(confidenceUpper ?? []), ...(confidenceLower ?? [])];
    const xs = all.map((p) => p.x);
    const ys = all.map((p) => p.y);
    if (judgment && context) ys.push(context.reference);
    const minX = Math.min(...xs, 0);
    const maxX = Math.max(...xs, 1);
    const minY = Math.min(...ys, 0);
    const maxY = Math.max(...ys, 1);
    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    const sx = (x: number) => pad.l + ((x - minX) / dx) * innerW;
    const sy = (y: number) => pad.t + innerH - ((y - minY) / dy) * innerH;
    return { sx, sy };
  }, [historical, predicted, confidenceUpper, confidenceLower, innerW, innerH, pad.l, pad.t, judgment, context]);

  const histPath = pathLine(historical, sx, sy);
  const predPath = pathLine(predicted, sx, sy);

  let bandPath = "";
  if (
    confidenceUpper &&
    confidenceLower &&
    confidenceUpper.length === confidenceLower.length
  ) {
    const pts: string[] = [];
    confidenceUpper.forEach((p) => pts.push(`${sx(p.x)},${sy(p.y)}`));
    [...confidenceLower].reverse().forEach((p) => pts.push(`${sx(p.x)},${sy(p.y)}`));
    bandPath = `M ${pts.join(" L ")} Z`;
  }

  const tx = todayX != null ? sx(todayX) : null;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }}
      role="img"
      aria-label={judgment ? `Prévision — ${judgmentLabel(judgment)}` : "Prévision"}
      data-judgment={judgment ? judgment.level.status : undefined}
    >
      <rect
        x={pad.l}
        y={pad.t}
        width={innerW}
        height={innerH}
        fill="var(--bpm-surface)"
        stroke="var(--bpm-border)"
      />
      {bandPath ? (
        <path d={bandPath} fill="var(--bpm-accent-soft)" stroke="none" opacity={0.85} />
      ) : null}
      {histPath ? (
        <path
          d={histPath}
          fill="none"
          stroke="var(--bpm-accent)"
          strokeWidth={2.5}
        />
      ) : null}
      {judgment && context ? (
        <line
          x1={pad.l}
          y1={sy(context.reference)}
          x2={pad.l + innerW}
          y2={sy(context.reference)}
          stroke="var(--bpm-text-secondary)"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.6}
        />
      ) : null}
      {predPath ? (
        <path
          d={predPath}
          fill="none"
          stroke={judgment ? judgmentColor(judgment) : "var(--bpm-accent)"}
          strokeWidth={2}
          strokeDasharray="6 4"
          opacity={0.95}
        />
      ) : null}
      {tx != null ? (
        <line
          x1={tx}
          y1={pad.t}
          x2={tx}
          y2={height - pad.b}
          stroke="var(--bpm-warning)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ) : null}
    </svg>
  );
}
