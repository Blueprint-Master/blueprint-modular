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
 * @forbidden Valeur chiffrée à juger — utiliser bpm.metric
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

  /**
   * LE LIBELLÉ NOMME LA DONNÉE — il n'est pas décoratif.
   *
   * Il était peint en `--bpm-text-muted`, le jeton le plus clair de l'échelle,
   * à 10-12 px, en capitales, avec 0,04em d'interlettrage. Cette combinaison
   * est le reproche le plus verbatim du parc audité — relevé sur des apps sans
   * rapport entre elles, en thème clair comme en thème sombre :
   *
   *     « Les libellés de champs ('Date de brassage', 'Volume réalisé (L)')
   *       sont en gris très clair sur fond blanc, contraste insuffisant »
   *     « Le contraste des labels en petites capitales gris clair sur fond
   *       sombre dans le panneau détail est insuffisant (ratio estimé < 3:1) »
   *
   * Et le ratio EST bas par contrat : les consommateurs garantissent 4,5:1 sur
   * `--bpm-text-secondary` mais seulement **3:1** sur `--bpm-text-muted`. Or
   * 3:1 est le plancher des GROS textes ; appliqué à 10 px en capitales, il
   * décrit précisément ce que le juge décrit.
   *
   * `--bpm-text-secondary` est le jeton dont le contrat correspond à cet usage.
   * `muted` reste ce qu'il doit être : le registre des affordances accessoires
   * — d'où le bouton « Copier », lui, inchangé.
   *
   * La graisse 500 compense l'interlettrage : à cette taille, en capitales,
   * l'espacement amincit le trait autant qu'il l'aère.
   */
  const labelNode = (
    <span
      style={{
        fontSize: labelSize,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "var(--bpm-text-secondary, var(--bpm-text-muted))",
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
