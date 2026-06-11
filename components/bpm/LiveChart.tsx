"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
} from "./interpret";

/**
 * @component bpm.liveChart
 * @description Graphique temps réel avec fenêtre glissante, seuils en pointillés et rafraîchissement automatique.
 * @example
 * bpm.liveChart({ data: [{ timestamp: Date.now(), value: 42 }], bufferDuration: 60, refreshInterval: 1000 })
 *
 * @param {object} props
 * @param {LiveChartDatum[]} props.data - Points { timestamp, value }. Obligatoire.
 * @param {number} [props.bufferDuration=120] - Durée de la fenêtre en secondes. Optionnel.
 * @param {{ value: number; label?: string }[]} [props.thresholds=[]] - Lignes de seuil horizontales. Optionnel.
 * @param {number} [props.refreshInterval] - Intervalle de rafraîchissement en ms. Optionnel.
 * @param {number} [props.width=400] - Largeur du graphique. Optionnel.
 * @param {number} [props.height=180] - Hauteur du graphique. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : courbe colorée par le verdict, repère pointillé, verdict sous le graphique. Optionnel.
 *
 * @associated bpm.liveGauge, bpm.lineChart, bpm.sparkline
 */
export interface LiveChartDatum {
  timestamp: number;
  value: number;
}

export interface LiveChartProps {
  data: LiveChartDatum[];
  bufferDuration?: number;
  thresholds?: { value: number; label?: string }[];
  refreshInterval?: number;
  width?: number;
  height?: number;
  className?: string;
  /** Contexte de jugement { reference, direction, comparisonFrame? } : la fenêtre courante est jugée par interpret (couleur de courbe selon le verdict, repère pointillé, verdict écart/tendance sous le graphique). Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

interface ChartGeom {
  linePath: string;
  pad: number;
  wInner: number;
  minT: number;
  maxT: number;
  minV: number;
  maxV: number;
  rT: number;
  rV: number;
  sx: (t: number) => number;
  sy: (v: number) => number;
}

/**
 * Série temporelle filtrée par fenêtre glissante, seuils en pointillés et rafraîchissement optionnel.
 */
export function LiveChart({
  data,
  bufferDuration = 120,
  thresholds = [],
  refreshInterval,
  width = 400,
  height = 180,
  className = "",
  context,
}: LiveChartProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (refreshInterval == null || refreshInterval <= 0) return;
    const id = setInterval(() => setNow(Date.now()), refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval]);

  const windowMs = bufferDuration * 1000;
  const filtered = useMemo(
    () => data.filter((d) => d.timestamp >= now - windowMs).sort((a, b) => a.timestamp - b.timestamp),
    [data, now, windowMs]
  );

  const judgment = useMemo(() => {
    if (!context || !filtered.length) return null;
    return interpret(
      filtered.map((d) => ({ t: d.timestamp, v: d.value })),
      context
    );
  }, [filtered, context]);

  const geom = useMemo((): ChartGeom | null => {
    if (!filtered.length) return null;
    const ts = filtered.map((x) => x.timestamp);
    const vs = filtered.map((x) => x.value);
    const thr = thresholds.map((t) => t.value);
    if (judgment && context) thr.push(context.reference);
    const minT = Math.min(...ts);
    const maxT = Math.max(...ts);
    const minV = Math.min(...vs, ...(thr.length ? thr : [0]));
    const maxV = Math.max(...vs, ...(thr.length ? thr : [1]));
    const rT = maxT - minT || 1;
    const rV = maxV - minV || 1;
    const pad = 12;
    const wInner = width - pad * 2;
    const hInner = height - pad * 2;
    const sx = (t: number) => pad + ((t - minT) / rT) * wInner;
    const sy = (v: number) => height - pad - ((v - minV) / rV) * hInner;
    const linePath = filtered.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.timestamp)} ${sy(p.value)}`).join(" ");
    return { linePath, pad, wInner, minT, maxT, minV, maxV, rT, rV, sx, sy };
  }, [filtered, width, height, thresholds, judgment, context]);

  const thresholdLines = useMemo(() => {
    if (!geom) return [];
    return thresholds.map((th) => ({
      y: geom.sy(th.value),
      x1: geom.pad,
      x2: geom.pad + geom.wInner,
      label: th.label,
    }));
  }, [geom, thresholds]);

  return (
    <div className={className} style={{ width: "100%", maxWidth: width }}>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role={judgment ? "img" : undefined}
        aria-label={judgment ? judgmentLabel(judgment) : undefined}
        data-judgment={judgment ? judgment.level.status : undefined}
        style={{
          display: "block",
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          background: "var(--bpm-surface)",
        }}
      >
        {thresholdLines.map((ln, i) => (
          <line
            key={i}
            x1={ln.x1}
            x2={ln.x2}
            y1={ln.y}
            y2={ln.y}
            stroke="var(--bpm-warning)"
            strokeWidth={1}
            strokeDasharray="6 4"
            opacity={0.9}
          />
        ))}
        {judgment && context && geom && (
          <line
            x1={geom.pad}
            x2={geom.pad + geom.wInner}
            y1={geom.sy(context.reference)}
            y2={geom.sy(context.reference)}
            stroke="var(--bpm-text-secondary)"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.6}
          />
        )}
        {geom?.linePath ? (
          <path
            d={geom.linePath}
            fill="none"
            stroke={judgment ? judgmentColor(judgment) : "var(--bpm-accent)"}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <text x={width / 2} y={height / 2} textAnchor="middle" fill="var(--bpm-text-secondary)" fontSize={12}>
            Aucune donnée dans la fenêtre
          </text>
        )}
      </svg>
      {judgment && (
        <div role="status" style={{ fontSize: 12, marginTop: 4, color: judgmentColor(judgment) }}>
          {judgmentLabel(judgment)}
        </div>
      )}
    </div>
  );
}
