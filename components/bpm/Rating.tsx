"use client";

import React from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  trendArrow,
  type InterpretContext,
  type TrajectoryPoint,
} from "./interpret";

/**
 * @component bpm.rating
 * @description Composant d'évaluation par étoiles cliquables avec taille personnalisable.
 * @example
 * bpm.rating({ value: 3, max: 5, onChange: setRating, size: "medium" })
 *
 * @param {object} props
 * @param {number} [props.value=0] - Note actuelle. Optionnel.
 * @param {number} [props.max=5] - Nombre maximum d'étoiles. Optionnel.
 * @param {function} [props.onChange] - Callback au clic sur une étoile. Optionnel.
 * @param {boolean} [props.disabled=false] - Désactive l'interaction. Optionnel.
 * @param {"small"|"medium"|"large"} [props.size="medium"] - Taille des étoiles. Optionnel.
 * @param {TrajectoryPoint[]} [props.history] - Historique v(t) de la note, pour la tendance. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement (ex. note cible) : étoiles colorées par le verdict + suffixe écart/tendance. Optionnel.
 *
 * @associated bpm.slider, bpm.metric
 */
export interface RatingProps {
  value?: number;
  max?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  /** Historique v(t) [{t, v}] de la note — révèle la tendance si context est fourni. */
  history?: TrajectoryPoint[];
  /** Contexte de jugement { reference, direction } (ex. note cible 4.0) : les étoiles pleines prennent la couleur du verdict et un suffixe écart/tendance role=status est révélé. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

const sizeClasses: Record<string, string> = { small: "text-lg", medium: "text-2xl", large: "text-3xl" };

export function Rating(props: RatingProps) {
  const { value = 0, max = 5, onChange, disabled = false, size = "medium", history, context } = props;
  const v = Math.max(0, Math.min(max, Math.round(value)));
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const judgment = context
    ? interpret(history && history.length > 0 ? history : value, context)
    : null;
  const filledColor = judgment ? judgmentColor(judgment) : "var(--bpm-accent)";

  return (
    <div
      className="bpm-rating flex gap-0.5 items-center"
      role="group"
      aria-label={"Note " + v + " sur " + max + (judgment ? " — " + judgmentLabel(judgment) : "")}
      data-judgment={judgment ? judgment.level.status : undefined}
    >
      {stars.map((star) => {
        const filled = star <= v;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange && onChange(star)}
            className={"p-0.5 rounded transition-opacity " + (sizeClasses[size] || sizeClasses.medium)}
            style={{
              color: filled ? filledColor : "var(--bpm-border)",
              cursor: disabled ? "default" : "pointer",
            }}
            aria-pressed={filled}
          >
            ★
          </button>
        );
      })}
      {judgment && (
        <span role="status" className="text-xs ml-1" style={{ color: filledColor }}>
          {judgment.level.gap >= 0 ? "▲" : "▼"} {Math.abs(judgment.level.gap).toFixed(1)} vs cible
          {judgment.trend ? ` ${trendArrow(judgment)}` : ""}
        </span>
      )}
    </div>
  );
}
