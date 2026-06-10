"use client";

import React from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
  type TrajectoryPoint,
} from "./interpret";

export type SensorStatus = "ok" | "warning" | "error" | "offline";

/**
 * @component bpm.sensorGrid
 * @description Grille de cartes capteur avec valeur, unité, statut coloré et détail optionnel.
 * @example
 * bpm.sensorGrid({ sensors: [{ id: "1", label: "Température", value: 24.5, unit: "°C", status: "ok" }], columns: 3 })
 *
 * @param {object} props
 * @param {SensorReading[]} props.sensors - Liste des capteurs (id, label, value, unit?, status, detail?). Obligatoire.
 * @param {number} [props.columns=3] - Nombre de colonnes de la grille. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.machineStatus, bpm.liveGauge, bpm.metric
 */
export interface SensorReading {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  status: SensorStatus;
  detail?: string;
  /** Historique v(t) [{t, v}] du capteur — révèle la tendance si context est fourni. */
  history?: TrajectoryPoint[];
  /** Contexte de jugement propre au capteur { reference, direction, comparisonFrame? } : la carte est jugée par interpret (bordure colorée par le verdict, ligne écart/tendance). Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

export interface SensorGridProps {
  sensors: SensorReading[];
  columns?: number;
  className?: string;
}

const statusStyle: Record<SensorStatus, { border: string; accent: string }> = {
  ok: { border: "var(--bpm-success)", accent: "color-mix(in srgb, var(--bpm-success) 18%, var(--bpm-surface))" },
  warning: { border: "var(--bpm-warning)", accent: "color-mix(in srgb, var(--bpm-warning) 18%, var(--bpm-surface))" },
  error: { border: "var(--bpm-error)", accent: "color-mix(in srgb, var(--bpm-error) 18%, var(--bpm-surface))" },
  offline: { border: "var(--bpm-border)", accent: "var(--bpm-bg-secondary, var(--bpm-surface))" },
};

/**
 * Grille de cartes capteur avec code couleur de statut.
 */
export function SensorGrid({ sensors, columns = 3, className = "" }: SensorGridProps) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 12,
      }}
    >
      {sensors.map((s) => {
        const st = statusStyle[s.status];
        const numeric =
          typeof s.value === "number"
            ? s.value
            : Number.isFinite(parseFloat(s.value))
              ? parseFloat(s.value)
              : null;
        const judgment =
          s.context && (s.history?.length || numeric != null)
            ? interpret(s.history && s.history.length > 0 ? s.history : (numeric as number), s.context)
            : null;
        return (
          <div
            key={s.id}
            data-judgment={judgment ? judgment.level.status : undefined}
            style={{
              borderRadius: "var(--bpm-radius)",
              border: `1px solid var(--bpm-border)`,
              borderLeft: `4px solid ${judgment ? judgmentColor(judgment) : st.border}`,
              background: st.accent,
              padding: "12px 14px",
              minHeight: 88,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)", fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "var(--bpm-text-primary)" }}>
              {s.value}
              {s.unit ? <span style={{ fontSize: 14, fontWeight: 500, color: "var(--bpm-text-secondary)", marginLeft: 4 }}>{s.unit}</span> : null}
            </div>
            {s.detail ? <div style={{ fontSize: 11, color: "var(--bpm-text-secondary)" }}>{s.detail}</div> : null}
            {judgment ? (
              <div role="status" style={{ fontSize: 11, color: judgmentColor(judgment) }}>
                {judgmentLabel(judgment)}
              </div>
            ) : null}
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: st.border }}>{s.status}</div>
          </div>
        );
      })}
    </div>
  );
}
