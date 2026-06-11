"use client";

import React, { useMemo } from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
} from "./interpret";

/**
 * @component bpm.lineChart
 * @description Graphique en ligne SVG simple et responsive pour afficher une série de données.
 * @example
 * bpm.lineChart({ data: [{ x: 0, y: 10 }, { x: 1, y: 25 }], color: "#3b82f6" })
 *
 * @param {object} props
 * @param {LineChartDatum[]} props.data - Tableau de points { x, y }. Obligatoire.
 * @param {number} [props.width=400] - Largeur du SVG. Optionnel.
 * @param {number} [props.height=200] - Hauteur du SVG. Optionnel.
 * @param {string} [props.color="var(--bpm-accent)"] - Couleur de la ligne. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : ligne de repère pointillée, couleur de série jugée, aria-label descriptif. Optionnel.
 *
 * @associated bpm.areaChart, bpm.barChart, bpm.scatterChart
 * @parent bpm.card, bpm.grid, bpm.tableauxDeBord
 * @forbidden Catégories discrètes — utiliser bpm.barChart
 */
export interface LineChartDatum {
  x: number | string;
  y: number;
}/**
 * @component bpm.lineChart
 * @description Graphique en courbes.
 */
export interface LineChartProps {
  data: LineChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  /** Contexte de jugement { reference, direction, comparisonFrame? } : la série (lue comme trajectoire v(t), t = x) est jugée par interpret — repère tracé en pointillé, couleur de ligne selon le verdict, aria-label. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}export function LineChart(p: LineChartProps) {
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
    return {
      path: "M" + data.map((_, i) => xScale(xs[i]) + "," + yScale(ys[i])).join("L"),
      refY: judgment && context ? yScale(context.reference) : null,
    };
  }, [data, width, height, judgment, context]);
  if (!data.length) return <div className={"bpm-line-chart w-full max-w-full " + className} style={{ aspectRatio: `${width}/${height}`, maxWidth: width, background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }} />;
  const stroke = judgment ? judgmentColor(judgment) : color;
  return (
    <div className="w-full max-w-full overflow-hidden" style={{ aspectRatio: `${width}/${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={"bpm-line-chart " + className}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
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
        <path d={geom.path} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}