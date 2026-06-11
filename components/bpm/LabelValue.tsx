"use client";

import React, { useCallback, useState } from "react";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  trendArrow,
  type InterpretContext,
  type TrajectoryPoint,
} from "./interpret";

/**
 * @component bpm.labelValue
 * @description Affiche une paire label/valeur avec options de style, orientation et bouton copier.
 * @example
 * bpm.labelValue({ label: "Référence", value: "REF-001", copyable: true, valueStyle: "bold" })
 *
 * @param {object} props
 * @param {string} props.label - Libellé affiché en majuscules. Obligatoire.
 * @param {string|number|React.ReactNode} props.value - Valeur à afficher. Obligatoire.
 * @param {"horizontal"|"vertical"} [props.orientation="horizontal"] - Disposition label/valeur. Optionnel.
 * @param {"sm"|"md"|"lg"} [props.size="md"] - Taille du texte. Optionnel.
 * @param {"default"|"bold"|"accent"|"muted"} [props.valueStyle="default"] - Style de la valeur. Optionnel.
 * @param {boolean} [props.copyable=false] - Affiche un bouton pour copier la valeur. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {TrajectoryPoint[]} [props.trajectory] - Trajectoire v(t) de la valeur, jugée si context fourni. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement : la valeur est colorée et un verdict écart/tendance est révélé. Optionnel.
 *
 * @parent bpm.card, bpm.panel
 * @associated bpm.metric, bpm.inlineEdit
 */
export interface LabelValueProps {
  label: string;
  value: string | number | React.ReactNode;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  valueStyle?: "default" | "bold" | "accent" | "muted";
  copyable?: boolean;
  className?: string;
  /** Trajectoire v(t) [{t, v}] de la mesure (la valeur affichée reste value) — jugée si context est fourni. */
  trajectory?: TrajectoryPoint[];
  /** Contexte de jugement { reference, direction, comparisonFrame? } : la valeur prend la couleur du verdict et un suffixe écart/tendance role=status est révélé. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

const sizeMap = {
  sm: { labelSize: 10, valueSize: 12 },
  md: { labelSize: 11, valueSize: 14 },
  lg: { labelSize: 12, valueSize: 16 },
};

export function LabelValue({
  label,
  value,
  orientation = "horizontal",
  size = "md",
  valueStyle = "default",
  copyable = false,
  className = "",
  trajectory,
  context,
}: LabelValueProps) {
  const [copied, setCopied] = useState(false);
  const { labelSize, valueSize } = sizeMap[size];

  const numeric =
    trajectory && trajectory.length > 0
      ? trajectory
      : typeof value === "number"
        ? value
        : typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))
          ? Number(value)
          : null;
  const judgment = context && numeric != null ? interpret(numeric, context) : null;

  const valueColor = judgment
    ? judgmentColor(judgment)
    : valueStyle === "accent"
      ? "var(--bpm-accent)"
      : valueStyle === "muted"
        ? "var(--bpm-text-muted)"
        : "var(--bpm-text-primary)";
  const valueWeight = valueStyle === "bold" ? 600 : 400;

  const handleCopy = useCallback(() => {
    const text = typeof value === "string" || typeof value === "number" ? String(value) : "";
    if (!text) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }, [value]);

  const valueNode = (
    <span
      style={{
        fontSize: valueSize,
        fontWeight: valueWeight,
        color: valueColor,
      }}
      data-judgment={judgment ? judgment.level.status : undefined}
    >
      {value}
      {judgment && (
        <span
          role="status"
          aria-label={judgmentLabel(judgment)}
          style={{ marginLeft: 6, fontSize: Math.max(10, valueSize - 3), fontWeight: 400 }}
        >
          {judgment.level.status === "favorable" ? "▲" : judgment.level.status === "unfavorable" ? "▼" : "•"}
          {judgment.trend ? ` ${trendArrow(judgment)}` : ""}
          {judgment.anomaly?.status === "abnormal" ? " ⚠" : ""}
        </span>
      )}
    </span>
  );

  const labelNode = (
    <span
      style={{
        fontSize: labelSize,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "var(--bpm-text-muted)",
      }}
    >
      {label}
    </span>
  );

  if (orientation === "vertical") {
    return (
      <div
        className={className ? `bpm-label-value ${className}`.trim() : "bpm-label-value"}
        style={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        {labelNode}
        {copyable && (typeof value === "string" || typeof value === "number") ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {valueNode}
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copier"
              style={{
                padding: 4,
                border: "none",
                background: "transparent",
                color: "var(--bpm-text-muted)",
                cursor: "pointer",
                fontSize: "var(--bpm-font-size-sm)",
              }}
            >
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
        ) : (
          valueNode
        )}
      </div>
    );
  }

  return (
    <div
      className={className ? `bpm-label-value ${className}`.trim() : "bpm-label-value"}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
      }}
    >
      {labelNode}
      {copyable && (typeof value === "string" || typeof value === "number") ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {valueNode}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copier"
            style={{
              padding: 4,
              border: "none",
              background: "transparent",
              color: "var(--bpm-text-muted)",
              cursor: "pointer",
              fontSize: "var(--bpm-font-size-sm)",
            }}
          >
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
      ) : (
        valueNode
      )}
    </div>
  );
}
