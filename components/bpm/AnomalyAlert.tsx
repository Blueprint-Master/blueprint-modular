"use client";

import React from "react";
import {
  interpret,
  judgmentLabel,
  type InterpretContext,
  type TrajectoryPoint,
} from "./interpret";

export type AnomalySeverity = "info" | "warning" | "critical";

export interface AnomalyAlertProps {
  title?: string;
  expected: string | number;
  actual: string | number;
  /** Niveau de gravité. Si omis et context fourni, dérivé automatiquement de interpret().severity. */
  severity?: AnomalySeverity;
  className?: string;
  onDismiss?: () => void;
  /** Historique v(t) [{t, v}] de la mesure — révèle la tendance dans le verdict si context est fourni. */
  history?: TrajectoryPoint[];
  /** Contexte de jugement { reference, direction, comparisonFrame? } : gravité auto-dérivée de la sévérité combinée (≥0.5 critical, >0.15 warning, sinon info) et verdict écart/tendance révélé. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

const SEV_BG: Record<AnomalySeverity, string> = {
  info: "var(--bpm-accent-soft)",
  warning: "var(--bpm-warning-soft)",
  critical: "var(--bpm-error-soft)",
};

const SEV_BORDER: Record<AnomalySeverity, string> = {
  info: "var(--bpm-accent-border)",
  warning: "var(--bpm-warning)",
  critical: "var(--bpm-error)",
};

const SEV_TEXT: Record<AnomalySeverity, string> = {
  info: "var(--bpm-text-primary)",
  warning: "var(--bpm-warning-text)",
  critical: "var(--bpm-error-text)",
};

/**
 * @component bpm.anomalyAlert
 * @description Alerte d'anomalie affichant l'écart entre valeur attendue et mesurée avec niveau de gravité.
 * @example
 * bpm.anomalyAlert({ expected: "100 kg", actual: "85 kg", severity: "warning" })
 *
 * @param {object} props
 * @param {string} [props.title="Anomalie détectée"] - Titre de l'alerte. Optionnel.
 * @param {string|number} props.expected - Valeur attendue. Obligatoire.
 * @param {string|number} props.actual - Valeur mesurée. Obligatoire.
 * @param {"info"|"warning"|"critical"} [props.severity="warning"] - Niveau de gravité. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {function} [props.onDismiss] - Callback pour fermer l'alerte. Optionnel.
 * @param {TrajectoryPoint[]} [props.history] - Historique v(t) de la mesure pour la tendance. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : gravité auto-dérivée + verdict interpret révélé. Optionnel.
 *
 * @associated bpm.alarmPanel, bpm.statusBox, bpm.panel
 */
export function AnomalyAlert({
  title = "Anomalie détectée",
  expected,
  actual,
  severity,
  className = "",
  onDismiss,
  history,
  context,
}: AnomalyAlertProps) {
  const numericActual =
    typeof actual === "number"
      ? actual
      : Number.isFinite(parseFloat(actual))
        ? parseFloat(actual)
        : null;
  const judged =
    context && (history?.length || numericActual != null)
      ? interpret(history && history.length > 0 ? history : (numericActual as number), context)
      : null;
  const derivedSeverity: AnomalySeverity | null = judged
    ? judged.severity >= 0.5
      ? "critical"
      : judged.severity > 0.15
        ? "warning"
        : "info"
    : null;
  const sev: AnomalySeverity = severity ?? derivedSeverity ?? "warning";
  return (
    <div
      role="alert"
      className={className}
      data-judgment={judged ? judged.level.status : undefined}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        borderRadius: "var(--bpm-radius)",
        border: `1px solid ${SEV_BORDER[sev]}`,
        background: SEV_BG[sev],
        color: SEV_TEXT[sev],
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>
          <span style={{ opacity: 0.9 }}>Attendu :</span>{" "}
          <strong>{expected}</strong>
          <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
          <span style={{ opacity: 0.9 }}>Mesuré :</span>{" "}
          <strong>{actual}</strong>
        </div>
        {judged && (
          <div role="status" style={{ fontSize: 12, marginTop: 4, opacity: 0.95 }}>
            {judgmentLabel(judged)} · sévérité {(judged.severity * 100).toFixed(0)} %
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fermer"
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
