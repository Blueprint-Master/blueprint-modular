"use client";

import React, { useMemo } from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  trendArrow,
  type InterpretContext,
  type TrajectoryPoint,
} from "./interpret";

/**
 * @component bpm.progressRing
 * @description Anneau de progression circulaire SVG avec animation de transition.
 * @example
 * bpm.progressRing({ value: 75, max: 100, size: 80, strokeWidth: 8 })
 *
 * @param {object} props
 * @param {number} props.value - Valeur actuelle (ou trajectoire v(t) [{t,v}] : dernier point). Obligatoire.
 * @param {number} [props.max=100] - Valeur maximale. Optionnel.
 * @param {number} [props.size=72] - Diamètre en pixels. Optionnel.
 * @param {number} [props.strokeWidth=8] - Épaisseur du trait. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : couleur de l'anneau selon l'écart au repère, flèche de tendance au centre si trajectoire. Optionnel.
 *
 * @associated bpm.progress, bpm.liveGauge, bpm.metric
 */
export interface ProgressRingProps {
  /** Valeur actuelle, ou trajectoire v(t) [{t, v}] (le dernier point remplit l'anneau, la tendance est révélée au centre si context est fourni). */
  value: number | TrajectoryPoint[];
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** Contexte de jugement { reference, direction, comparisonFrame? } : l'anneau prend la couleur du jugement (favorable/neutre/défavorable) au lieu de l'accent. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

/**
 * Anneau de progression SVG avec transition sur le segment rempli.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 72,
  strokeWidth = 8,
  className = "",
  context,
}: ProgressRingProps) {
  const r = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const c = 2 * Math.PI * r;
  const current = Array.isArray(value)
    ? value.length > 0
      ? [...value].sort(
          (a, b) =>
            (a.t instanceof Date ? a.t.getTime() : a.t) -
            (b.t instanceof Date ? b.t.getTime() : b.t)
        )[value.length - 1].v
      : 0
    : value;
  const judgment =
    context && Number.isFinite(current)
      ? interpret(Array.isArray(value) ? value : current, context)
      : null;
  const stroke = judgment ? judgmentColor(judgment) : "var(--bpm-accent)";
  const pct = Math.min(1, Math.max(0, max <= 0 ? 0 : current / max));
  const dash = c * (1 - pct);

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={max}
      role="progressbar"
      aria-label={judgment ? judgmentLabel(judgment) : undefined}
      data-judgment={judgment ? judgment.level.status : undefined}
    >
      {judgment && <title>{judgmentLabel(judgment)}</title>}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--bpm-border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${c}`}
        strokeDashoffset={dash}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: "stroke-dashoffset 0.45s ease",
        }}
      />
      {judgment?.trend && (
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.28}
          fill={stroke}
        >
          {trendArrow(judgment)}
        </text>
      )}
    </svg>
  );
}
