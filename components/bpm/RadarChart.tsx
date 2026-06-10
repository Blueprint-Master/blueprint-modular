"use client";

import React, { useMemo } from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
} from "./interpret";

/**
 * @component bpm.radarChart
 * @description Graphique radar SVG pour comparer des valeurs sur plusieurs axes.
 * @example
 * bpm.radarChart({ axes: ["Vitesse", "Force", "Endurance"], values: [80, 60, 90], max: 100 })
 *
 * @param {object} props
 * @param {string[]} props.axes - Libellés des axes. Obligatoire.
 * @param {number[]} props.values - Valeurs correspondantes aux axes. Obligatoire.
 * @param {number} [props.max] - Valeur maximale de l'échelle. Optionnel, calculé auto.
 * @param {number} [props.width=320] - Largeur du SVG. Optionnel.
 * @param {number} [props.height=320] - Hauteur du SVG. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.plotlyChart, bpm.lineChart
 */
export interface RadarChartProps {
  axes: string[];
  values: number[];
  max?: number;
  width?: number;
  height?: number;
  className?: string;
  /** Contexte de jugement { reference, direction } : un anneau de repère pointillé est tracé au niveau de reference, le polygone prend la couleur du verdict global (moyenne des axes), aria-label enrichi, data-judgment. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

export function RadarChart({
  axes,
  values,
  max: maxIn,
  width = 320,
  height = 320,
  className = "",
  context,
}: RadarChartProps) {
  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height) * 0.38;
  const n = axes.length;
  const max = maxIn ?? Math.max(1, ...values, 1);

  const pts = useMemo(() => {
    return values.map((v, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const t = Math.min(1, Math.max(0, v / max));
      return {
        x: cx + R * t * Math.cos(a),
        y: cy + R * t * Math.sin(a),
        lx: cx + (R + 14) * Math.cos(a),
        ly: cy + (R + 14) * Math.sin(a),
        a,
      };
    });
  }, [values, n, cx, cy, R, max]);

  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");

  const rings = 4;

  const judgment = useMemo(() => {
    if (!context || values.length === 0) return null;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return interpret(mean, context);
  }, [values, context]);
  const refT = context ? Math.min(1, Math.max(0, context.reference / max)) : 0;
  const refRingPts = judgment
    ? Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return `${cx + R * refT * Math.cos(a)},${cy + R * refT * Math.sin(a)}`;
      }).join(" ")
    : null;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }}
      role="img"
      aria-label={judgment ? `Radar — moyenne : ${judgmentLabel(judgment)}` : "Radar"}
      data-judgment={judgment ? judgment.level.status : undefined}
    >
      {Array.from({ length: rings }, (_, k) => {
        const rr = (R * (k + 1)) / rings;
        const ringPts = Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
        }).join(" ");
        return (
          <polygon
            key={k}
            points={ringPts}
            fill="none"
            stroke="var(--bpm-border)"
            strokeWidth={1}
          />
        );
      })}
      {axes.map((label, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x2 = cx + R * Math.cos(a);
        const y2 = cy + R * Math.sin(a);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="var(--bpm-border-strong)"
            strokeWidth={1}
          />
        );
      })}
      {refRingPts && (
        <polygon
          points={refRingPts}
          fill="none"
          stroke="var(--bpm-text-secondary)"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      )}
      <polygon
        points={poly}
        fill="var(--bpm-accent-soft)"
        stroke={judgment ? judgmentColor(judgment) : "var(--bpm-accent)"}
        strokeWidth={2}
      />
      {axes.map((label, i) => {
        const p = pts[i];
        return (
          <text
            key={`l-${i}`}
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--bpm-text-primary)"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
