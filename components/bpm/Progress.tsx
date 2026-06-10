"use client";

import React from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
  type TrajectoryPoint,
} from "./interpret";

export interface ProgressProps {
  /** Valeur actuelle, ou trajectoire v(t) [{t, v}] (le dernier point remplit la barre ; la tendance est jugée si context est fourni). */
  value?: number | TrajectoryPoint[];
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  /** Contexte de jugement { reference, direction, comparisonFrame? } : la barre prend la couleur du jugement et une ligne écart/tendance est révélée sous la barre. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

/**
 * @component bpm.progress
 * @description Barre de progression (value/max) pour avancement de tâche ou objectif (ex. TRS cible).
 * @example
 * bpm.progress({ value: 74, max: 100, label: "TRS cible 80%", showValue: true })
 * @props
 * - value (number, optionnel) — Valeur actuelle. Default: 0.
 * - max (number, optionnel) — Valeur max. Default: 1.
 * - label (string, optionnel) — Libelle au-dessus.
 * - showValue (boolean, optionnel) — Afficher le pourcentage. Default: true.
 * - className (string, optionnel) — Classes CSS.
 * - context (InterpretContext, optionnel) — Contexte de jugement { reference, direction } : couleur + ligne écart/tendance via interpret.
 * @usage Avancement commande, TRS ligne, objectif commercial.
 * @context PARENT: bpm.panel | bpm.card | bpm.tabs. ASSOCIATED: bpm.metric, bpm.slider. FORBIDDEN: aucun.
 */
export function Progress({
  value = 0,
  max = 1,
  label,
  showValue = true,
  className = "",
  context,
}: ProgressProps) {
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
  const fillColor = judgment ? judgmentColor(judgment) : "var(--bpm-accent)";
  const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
  return (
    <div
      className={`bpm-progress-wrap ${className}`.trim()}
      data-judgment={judgment ? judgment.level.status : undefined}
    >
      {(label != null || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label != null && (
            <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>{label}</span>
          )}
          {showValue && (
            <span className="text-sm tabular-nums" style={{ color: "var(--bpm-text-secondary)" }}>
              {Math.round(pct)} %
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={max > 0 ? current : undefined}
        aria-valuemin={0}
        aria-valuemax={max}
        className="bpm-progress-track h-2 rounded-full overflow-hidden"
        style={{ background: "var(--bpm-bg-secondary)" }}
      >
        <div
          className="bpm-progress-fill h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, background: fillColor }}
        />
      </div>
      {judgment && (
        <div role="status" className="text-xs mt-1" style={{ color: fillColor }}>
          {judgmentLabel(judgment)}
        </div>
      )}
    </div>
  );
}
