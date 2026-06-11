"use client";

import React, { useCallback, useMemo, useState } from "react";
import { interpret, judgmentColor, type InterpretContext } from "./interpret";

/**
 * @component bpm.heatmap
 * @description Grille de valeurs numériques avec dégradé de couleur, infobulle au survol et clic optionnel sur cellule.
 * @example
 * bpm.heatmap({ data: [[1,2],[3,4]], xLabels: ["A","B"], yLabels: ["X","Y"], colorScale: { min: "#fff", max: "#f00" } })
 *
 * @param {object} props
 * @param {number[][]} props.data - Matrice 2D de valeurs numériques. Obligatoire.
 * @param {string[]} props.xLabels - Libellés des colonnes. Obligatoire.
 * @param {string[]} props.yLabels - Libellés des lignes. Obligatoire.
 * @param {{ min: string; max: string }} props.colorScale - Couleurs min/max du dégradé. Obligatoire.
 * @param {number} [props.valueMin] - Valeur minimale pour l'échelle. Optionnel, calculé automatiquement.
 * @param {number} [props.valueMax] - Valeur maximale pour l'échelle. Optionnel, calculé automatiquement.
 * @param {boolean} [props.showValues=false] - Affiche les valeurs dans les cellules. Optionnel.
 * @param {function} [props.onCellClick] - Callback au clic sur une cellule (row, col, value). Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : chaque cellule est jugée vs le repère (liseré coloré sur les écarts, anomalies >2σ — comparisonFrame ou matrice — soulignées, infobulle enrichie du verdict). Optionnel.
 */
export interface HeatmapProps {
  data: number[][];
  xLabels: string[];
  yLabels: string[];
  colorScale: { min: string; max: string };
  valueMin?: number;
  valueMax?: number;
  showValues?: boolean;
  onCellClick?: (row: number, col: number, value: number) => void;
  className?: string;
  /** Contexte de jugement { reference, direction, comparisonFrame? } : chaque cellule est jugée par interpret — liseré coloré par verdict (hors zone neutre), data-judgment par cellule, infobulle enrichie. Anomalie >2σ évaluée contre comparisonFrame ou, à défaut, la matrice entière. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

function clamp01(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

/**
 * Grille de valeurs avec dégradé de couleur, infobulle et clic optionnel.
 */
export function Heatmap({
  data,
  xLabels,
  yLabels,
  colorScale,
  valueMin: vminIn,
  valueMax: vmaxIn,
  showValues = false,
  onCellClick,
  className = "",
  context,
}: HeatmapProps) {
  const judgeCell = useCallback(
    (v: number) => {
      if (!context || !Number.isFinite(v)) return null;
      const frame = context.comparisonFrame ?? data.flat().filter((x) => Number.isFinite(x));
      return interpret(v, { ...context, comparisonFrame: frame });
    },
    [context, data]
  );
  const { minV, maxV } = useMemo(() => {
    const flat = data.flat();
    const lo = vminIn ?? (flat.length ? Math.min(...flat) : 0);
    const hi = vmaxIn ?? (flat.length ? Math.max(...flat) : 1);
    return { minV: lo, maxV: hi === lo ? lo + 1 : hi };
  }, [data, vminIn, vmaxIn]);

  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const cellColor = useCallback(
    (v: number) => {
      const t = clamp01((v - minV) / (maxV - minV));
      const p = Math.round(t * 100);
      return `color-mix(in srgb, ${colorScale.max} ${p}%, ${colorScale.min})`;
    },
    [colorScale.max, colorScale.min, minV, maxV]
  );

  const rows = data.length;
  const cols = rows > 0 ? Math.max(...data.map((r) => r.length)) : 0;

  return (
    <div className={className} style={{ position: "relative", display: "inline-block" }}>
      <div style={{ overflow: "auto", maxWidth: "100%" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 2, fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ width: 8 }} />
              {Array.from({ length: cols }, (_, j) => (
                <th
                  key={j}
                  style={{
                    padding: "4px 6px",
                    color: "var(--bpm-text-secondary)",
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  {xLabels[j] ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <th
                  style={{
                    padding: "4px 8px 4px 0",
                    textAlign: "right",
                    color: "var(--bpm-text-secondary)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {yLabels[i] ?? ""}
                </th>
                {Array.from({ length: cols }, (_, j) => {
                  const v = row[j];
                  const num = v ?? NaN;
                  const bg = Number.isFinite(num) ? cellColor(num) : "var(--bpm-bg-secondary)";
                  const judgment = judgeCell(num);
                  const judged = judgment && judgment.level.status !== "neutral";
                  return (
                    <td key={j}>
                      <button
                        data-judgment={judgment ? judgment.level.status : undefined}
                        data-abnormal={judgment?.anomaly?.status === "abnormal" ? "true" : undefined}
                        type="button"
                        disabled={!Number.isFinite(num) || !onCellClick}
                        onClick={() => Number.isFinite(num) && onCellClick?.(i, j, num)}
                        onMouseEnter={(e) => {
                          if (!Number.isFinite(num)) return;
                          const r = e.currentTarget.getBoundingClientRect();
                          setTip({
                            x: r.left + r.width / 2,
                            y: r.top,
                            text:
                              `${xLabels[j] ?? j} × ${yLabels[i] ?? i}: ${num}` +
                              (judgment
                                ? ` — ${judgment.level.status}${judgment.anomaly?.status === "abnormal" ? " · anomalie" : ""}`
                                : ""),
                          });
                        }}
                        onMouseLeave={() => setTip(null)}
                        style={{
                          width: 44,
                          height: 32,
                          border: judged
                            ? `2px solid ${judgmentColor(judgment)}`
                            : "1px solid var(--bpm-border)",
                          borderRadius: "var(--bpm-radius-sm)",
                          background: bg,
                          ...(judgment?.anomaly?.status === "abnormal"
                            ? { boxShadow: `0 0 0 2px ${judgmentColor(judgment)} inset` }
                            : {}),
                          color: "var(--bpm-text-primary)",
                          cursor: onCellClick && Number.isFinite(num) ? "pointer" : "default",
                          fontSize: 10,
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {showValues && Number.isFinite(num) ? String(num) : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tip ? (
        <div
          role="tooltip"
          style={{
            position: "fixed",
            left: tip.x,
            top: tip.y - 8,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 50,
            padding: "6px 10px",
            borderRadius: "var(--bpm-radius-sm)",
            background: "var(--bpm-text-primary)",
            color: "var(--bpm-surface)",
            fontSize: 11,
            boxShadow: "var(--bpm-shadow-sm)",
            whiteSpace: "nowrap",
          }}
        >
          {tip.text}
        </div>
      ) : null}
    </div>
  );
}
