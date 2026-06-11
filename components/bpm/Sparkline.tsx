"use client";

import React, { useMemo } from "react";
import {
  interpret,
  judgmentLabel,
  type InterpretContext,
  type Judgment,
  type TrajectoryPoint,
} from "./interpret";

export type SparklineTrend = "up" | "down" | "flat";

/**
 * @component bpm.sparkline
 * @description Courbe SVG compacte pour afficher une tendance avec couleur selon la direction (up/down/flat).
 * @example
 * bpm.sparkline({ values: [10, 15, 12, 18, 22], width: 120, height: 36, trend: "up" })
 *
 * @param {object} props
 * @param {number[]} props.values - Valeurs de la série. Obligatoire.
 * @param {number} [props.width=120] - Largeur du SVG. Optionnel.
 * @param {number} [props.height=36] - Hauteur du SVG. Optionnel.
 * @param {"up"|"down"|"flat"} [props.trend="flat"] - Tendance pour la couleur. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : couleur déduite de la tendance jugée (interpret), ligne de repère pointillée, aria-label descriptif. Optionnel.
 *
 * @associated bpm.metric, bpm.lineChart, bpm.liveChart
 */
export interface SparklineProps {
  /** Valeurs de la série (t implicite = index). Trajectoire v(t) explicite possible via points [{t, v}]. */
  values: number[];
  width?: number;
  height?: number;
  trend?: SparklineTrend;
  className?: string;
  /** Trajectoire v(t) explicite [{t, v}] — prioritaire sur values pour le jugement (les v sont aussi tracés). */
  points?: TrajectoryPoint[];
  /** Contexte de jugement { reference, direction } : la couleur suit la tendance jugée (improving→succès, worsening→erreur) au lieu de la prop trend, et le repère est tracé en pointillé. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

const trendColor: Record<SparklineTrend, string> = {
  up: "var(--bpm-success)",
  down: "var(--bpm-error)",
  flat: "var(--bpm-text-secondary)",
};

/**
 * Courbe SVG compacte avec couleur selon la tendance.
 */
export function Sparkline({
  values,
  width = 120,
  height = 36,
  trend = "flat",
  className = "",
  points: trajPoints,
  context,
}: SparklineProps) {
  const series = useMemo(() => {
    if (trajPoints && trajPoints.length > 0) {
      return [...trajPoints]
        .sort(
          (a, b) =>
            (a.t instanceof Date ? a.t.getTime() : a.t) -
            (b.t instanceof Date ? b.t.getTime() : b.t)
        )
        .map((p) => p.v);
    }
    return values;
  }, [values, trajPoints]);

  const judgment: Judgment | null = useMemo(() => {
    if (!context || series.length === 0) return null;
    const traj = (trajPoints && trajPoints.length > 0
      ? trajPoints
      : series.map((v, i) => ({ t: i, v }))) as TrajectoryPoint[];
    return interpret(traj, context);
  }, [context, series, trajPoints]);

  const geom = useMemo(() => {
    if (!series.length) return { line: "", refY: null as number | null };
    let min = Math.min(...series);
    let max = Math.max(...series);
    if (judgment && context) {
      min = Math.min(min, context.reference);
      max = Math.max(max, context.reference);
    }
    const r = max - min || 1;
    const pad = 2;
    const w = width - pad * 2;
    const h = height - pad * 2;
    const line = series
      .map((v, i) => {
        const x = pad + (i / Math.max(1, series.length - 1)) * w;
        const y = pad + h - ((v - min) / r) * h;
        return `${x},${y}`;
      })
      .join(" ");
    const refY =
      judgment && context ? pad + h - ((context.reference - min) / r) * h : null;
    return { line, refY };
  }, [series, width, height, judgment, context]);

  const judgedTrend: SparklineTrend | null = judgment?.trend
    ? judgment.trend.status === "improving"
      ? "up"
      : judgment.trend.status === "worsening"
        ? "down"
        : "flat"
    : null;
  const stroke = trendColor[judgedTrend ?? trend];

  if (!series.length) {
    return (
      <svg width={width} height={height} className={className} aria-hidden>
        <line x1={2} y1={height / 2} x2={width - 2} y2={height / 2} stroke="var(--bpm-border)" strokeWidth={1} />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden={judgment ? undefined : true}
      role={judgment ? "img" : undefined}
      aria-label={judgment ? judgmentLabel(judgment) : undefined}
      data-judgment={judgment ? judgment.level.status : undefined}
      style={{ display: "block" }}
    >
      {geom.refY != null && (
        <line
          x1={2}
          y1={geom.refY}
          x2={width - 2}
          y2={geom.refY}
          stroke="var(--bpm-text-secondary)"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.6}
        />
      )}
      <polyline fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" points={geom.line} />
    </svg>
  );
}
