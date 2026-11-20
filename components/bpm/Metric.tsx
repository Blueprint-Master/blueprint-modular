"use client";

import React from "react";
import { useBPMContext } from "@/lib/ai/context";
import {
  interpret,
  judgmentColor,
  judgmentLabel,
  type InterpretContext,
  type Judgment,
  type TrajectoryPoint,
} from "./interpret";
import { Sparkline, type SparklineTrend } from "./Sparkline";

/** Locales courants pour le format nombre (ex. "fr-FR" → 1 000,50, "en-US" → 1,000.50). */
export type MetricValueLocale = "fr-FR" | "en-US" | "de-DE" | string;

/**
 * @component bpm.metric
 * @description Affiche une métrique chiffrée avec label, valeur, variation delta et options de formatage (devise, locale).
 * @example
 * bpm.metric({ label: "Chiffre d'affaires", value: 125000, delta: "+12%", currency: "EUR" })
 *
 * @param {object} props
 * @param {string} props.label - Libellé de la métrique. Obligatoire.
 * @param {string|number} props.value - Valeur principale. Obligatoire.
 * @param {number|string} [props.delta] - Variation affichée (ex: "+12%"). Optionnel.
 * @param {string} [props.name] - Nom pour référencer dans le chat IA. Optionnel.
 * @param {"aucun"|"normal"|"inverse"} [props.deltaType="normal"] - Coloration du delta. Optionnel.
 * @param {string} [props.help] - Texte d'aide au survol. Optionnel.
 * @param {number} [props.deltaDecimals=0] - Décimales pour le delta. Optionnel.
 * @param {string} [props.currency="EUR"] - Devise pour l'affichage. Optionnel.
 * @param {string} [props.valueLocale] - Locale pour formatage (fr-FR, en-US). Optionnel.
 * @param {number} [props.valueDecimals=0] - Décimales pour la valeur. Optionnel.
 * @param {boolean} [props.valueGrouping=true] - Séparateur de milliers. Optionnel.
 * @param {boolean} [props.border=true] - Affiche la bordure. Optionnel.
 * @param {React.ReactNode} [props.icon] - Icône à gauche du label. Optionnel.
 * @param {string} [props.subtext] - Texte contextuel sous la valeur. Optionnel.
 * @param {string} [props.accentColor] - Couleur d'accent. Optionnel.
 * @param {boolean} [props.compact=false] - Mode compact réduit. Optionnel.
 * @param {boolean} [props.trackContext=false] - Expose au contexte IA. Optionnel.
 * @param {InterpretContext} [props.context] - Contexte de jugement { reference, direction, comparisonFrame? } : révèle écart/tendance/anomalie via interpret. Optionnel.
 *
 * @parent bpm.metricRow, bpm.grid, bpm.card
 * @associated bpm.badge, bpm.plotlyChart
 */
export interface MetricProps {
  /** PARENT: bpm.metricRow (standard) | bpm.grid | bpm.card (isolé). INTERDIT: div custom comme parent — casse le responsive. ASSOCIÉ: bpm.badge (statut), bpm.plotlyChart (tendance), bpm.metricRow. */
  /** Libellé affiché au-dessus de la valeur. */
  label: string;
  /** Valeur principale (string, number, ou trajectoire v(t) [{t, v}] — affiche le dernier point et révèle la tendance si context est fourni). */
  value: string | number | TrajectoryPoint[];
  /** Variation numérique formatée, ou variation avec unité explicite conservée (ex. "-1,2 pt"). */
  delta?: number | string | null;
  /** Nom optionnel pour référencer la métrique dans le chat IA : $metric:name ou @name */
  name?: string | null;
  /** Aucun = pas de couleur, normal = + vert / - rouge, inverse = + rouge / - vert */
  deltaType?: "aucun" | "normal" | "inverse";
  help?: string | null;
  deltaDecimals?: number;
  currency?: string;
  /** Locale pour formater value (et delta) quand ce sont des nombres. Ex. "fr-FR" (1 000,50), "en-US" (1,000.50). */
  valueLocale?: MetricValueLocale;
  /** Nombre de décimales pour value (si value est un number et valueLocale est défini). */
  valueDecimals?: number;
  /** Afficher le séparateur de milliers (true par défaut). false → 1000,50 au lieu de 1 000,50. */
  valueGrouping?: boolean;
  /** Afficher la bordure autour de la métrique (true par défaut). */
  border?: boolean;
  /** Icône distinctive (ex. lucide-react) affichée à gauche du label. */
  icon?: React.ReactNode | null;
  /** Micro-info contextuelle sous la métrique (gris clair). */
  subtext?: string | null;
  /** Couleur d'accent (bordure gauche ou fond icône). */
  accentColor?: string | null;
  /** Mode compact : hauteur réduite (~80px), padding et typo plus serrés. */
  compact?: boolean;
  /** Si true, expose cette métrique au contexte IA. */
  trackContext?: boolean;
  /** Contexte de jugement { reference, direction, comparisonFrame? } : la métrique porte alors un jugement via interpret(value, context) — écart au repère, tendance (si trajectoire), anomalie — révélé sous la valeur. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
  /** Rend la carte CLIQUABLE — ex. « voir les factures impayées » depuis le KPI qui les compte. Ajoute le rôle bouton, le focus clavier et Entrée/Espace : une carte cliquable à la souris seulement serait inatteignable au clavier et muette pour un lecteur d'écran. Absent = rendu et sémantique inchangés. */
  onClick?: (() => void) | null;
  /** Unité de l'écart au repère quand elle ne se déduit pas de `currency` (ex. « pt », « € », « h »). Absent = déduite de `currency`. */
  judgmentUnit?: string | null;
}

// A formatted delta is display text. Read a complete quantity for its
// direction, without interpreting a malformed group as a numeric prefix.
function readDelta(text: string): { number: number | null; literal: boolean } {
  const quantity = /^([+−-]?[\d., \u00a0\u2009\u202f]+?)(?:\s*([\p{L}\p{Sc}%‰°][\p{L}\p{N}\p{Sc}%‰°·/^−-]*))?$/u.exec(text);
  if (!quantity) return { number: null, literal: true };

  const token = quantity[1].trim().replace("−", "-");
  const spaced = /^[+-]?\d{1,3}(?:[ \u00a0\u2009\u202f]\d{3})+(?:[.,]\d+)?$/u.test(token);
  const dotted = /^[+-]?\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(token);
  const plain = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(token);
  if (!(spaced || dotted || plain)) return { number: null, literal: true };

  const digits = dotted ? token.replace(/\./g, "") : token.replace(/\s/g, "");
  const number = Number(digits.replace(",", "."));
  if (!Number.isFinite(number)) return { number: null, literal: true };
  return { number, literal: spaced || dotted || Boolean(quantity[2]) };
}

export function Metric({
  label,
  value,
  delta,
  name = null,
  deltaType = "normal",
  help = null,
  deltaDecimals = 0,
  currency = "EUR",
  valueLocale,
  valueDecimals = 0,
  valueGrouping = true,
  border = true,
  icon = null,
  subtext = null,
  accentColor = null,
  compact = false,
  trackContext = false,
  context,
  onClick = null,
  judgmentUnit = null,
}: MetricProps) {
  /* Carte cliquable : on n'ajoute JAMAIS le curseur seul. Une affordance visuelle
     sans affordance clavier fabrique un piège — visible pour la souris, invisible
     pour le reste. Les trois vont donc ensemble : rôle, tabulation, Entrée/Espace. */
  const clickable = typeof onClick === "function";
  // ── Jugement (additif) : trajectoire → dernier point + tendance ──────────
  const trajectory = Array.isArray(value) ? value : null;
  const sortedTraj = trajectory
    ? [...trajectory].sort(
        (a, b) =>
          (a.t instanceof Date ? a.t.getTime() : a.t) -
          (b.t instanceof Date ? b.t.getTime() : b.t)
      )
    : null;
  const numericValue = sortedTraj
    ? sortedTraj.length > 0
      ? sortedTraj[sortedTraj.length - 1].v
      : NaN
    : typeof value === "number"
      ? value
      : NaN;
  const judgment: Judgment | null =
    context && Number.isFinite(numericValue)
      ? interpret(sortedTraj ?? numericValue, context)
      : null;
  const trendToSparkline: Record<string, SparklineTrend> = {
    improving: "up",
    worsening: "down",
    flat: "flat",
  };
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
    CHF: "CHF",
  };
  const sym = currency && currency !== "%" ? (symbols[currency] ?? currency) : "";
  const locale = valueLocale ?? "fr-FR";
  // Écart au repère : en points pour un taux, dans la devise sinon (cf. differenceUnit de l'artefact).
  const judgmentFormat = { locale, unit: judgmentUnit || (currency === "%" ? "pt" : sym || undefined) };
  const formatWithLocale = (n: number, decimals: number) =>
    n.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: valueGrouping,
    });
  const formatDelta = (d: number) => {
    if (typeof d !== "number" || !Number.isFinite(d)) return "";
    const sign = d > 0 ? "+" : d < 0 ? "-" : "";
    const fmt = formatWithLocale(Math.abs(d), deltaDecimals);
    if (currency === "%") return `${sign}${fmt}%`;
    if (!currency || currency === "") return `${sign}${fmt}`;
    return `${sign}${fmt} ${sym}`;
  };
  const displayValue = Array.isArray(value)
    ? Number.isFinite(numericValue)
      ? formatWithLocale(numericValue, valueDecimals)
      : "—"
    : typeof value === "number"
      ? formatWithLocale(value, valueDecimals)
      : value;
  const suppliedText = typeof delta === "string" ? delta : "";
  const deltaStr = suppliedText.trim();
  const parsed = typeof delta === "string" ? readDelta(deltaStr) : null;
  const deltaNum = typeof delta === "number" ? delta : parsed?.number;
  const hasDelta = deltaNum != null && Number.isFinite(deltaNum);
  const hasText = deltaStr.length > 0;
  const positive = hasDelta && deltaType !== "aucun" && (deltaType === "inverse" ? deltaNum < 0 : deltaNum > 0);
  const negative = hasDelta && deltaType !== "aucun" && (deltaType === "inverse" ? deltaNum > 0 : deltaNum < 0);

  useBPMContext(
    { type: "metric", label, value: displayValue },
    trackContext === true
  );

  return (
    <div
      className={`bpm-metric inline-block rounded-lg min-w-[140px] ${compact ? "p-3" : "p-4"} ${border ? "border" : ""}`}
      style={{
        background: "var(--bpm-surface, #ffffff)",
        ...(border ? { borderColor: "var(--bpm-border, #e5e7eb)" } : {}),
        ...(accentColor
          ? { borderLeftWidth: 4, borderLeftColor: accentColor }
          : judgment
            ? { borderLeftWidth: 4, borderLeftColor: judgmentColor(judgment) }
            : {}),
        color: "var(--bpm-text-primary, #111827)",
        minHeight: compact ? "80px" : undefined,
        ...(clickable ? { cursor: "pointer" } : {}),
      }}
      data-metric-name={name && name !== "" ? name : undefined}
      data-judgment={judgment ? judgment.level.status : undefined}
      {...(clickable
        ? {
            role: "button" as const,
            tabIndex: 0,
            onClick: () => onClick?.(),
            onKeyDown: (e: React.KeyboardEvent) => {
              /* Espace déclenche ET défile la page : on retient le défilement,
                 comme le fait un <button> natif. */
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            },
          }
        : {})}
    >
      <div className={`flex items-center gap-2 ${compact ? "mb-0.5" : "mb-1"}`} style={compact ? { marginBottom: "calc(0.125rem + 3px)" } : undefined}>
        {icon != null && (
          <span
            className="flex-shrink-0 flex items-center justify-center rounded"
            style={{ color: accentColor || "var(--bpm-text-secondary, #6b7280)" }}
          >
            {icon}
          </span>
        )}
        {/* HIÉRARCHIE CHIFFRE / LIBELLÉ — voir le bloc sur la valeur ci-dessous.
            Le libellé passe en `em` pour la même raison que la valeur : `rem`
            est relatif à la RACINE, que ni la charte ni l'ergonomie de l'hôte
            ne touchent. `0.875em` et `0.75em` valent exactement `text-sm` et
            `text-xs` à corps 16 px — le rendu par défaut ne bouge pas. */}
        <div
          className="truncate"
          style={{
            fontSize: compact ? "0.75em" : "0.875em",
            color: "var(--bpm-text-secondary, #6b7280)",
          }}
        >
          {label}
          {help && (
            <span className="ml-1" title={help}>
              ⓘ
            </span>
          )}
        </div>
      </div>
      {/* LA VALEUR EST LE CHIFFRE QU'ON LIT — elle en avait à peine l'air.
       *
       * Mesuré sur la critique vision de la production (30 j) : « hiérarchie
       * plate » est la 2ᵉ famille de défauts (346 constats sur 98 apps), et son
       * thème dominant est ce rapport-ci — « les chiffres-clés manquent de
       * hiérarchie », « à peine plus grands que les labels », « même graisse et
       * taille que les labels ».
       *
       * Il valait **1,43** (`text-xl` 20 px contre `text-sm` 14 px), et 1,5 en
       * compact. Toute référence de tableau de bord place un chiffre de tête
       * autour de 2. « À peine plus grands » n'était pas une impression : c'est
       * ce nombre.
       *
       * DEUX CHANGEMENTS, ET LE SECOND COMPTE AUTANT.
       *
       * 1. Le RAPPORT passe à 2,0 en normal (1,8 en compact, dont le budget de
       *    hauteur ~80 px est un contrat du composant).
       * 2. L'unité passe de `rem` à `em`. `rem` est relatif à la RACINE : une
       *    application hôte qui grossit son `body` — pour un mur d'affichage,
       *    une charte à échelle typographique ample — voyait tout grandir SAUF
       *    ses indicateurs. `em` hérite, donc la métrique suit son contexte.
       *
       * Le rendu par défaut ne bouge que sur la valeur : `0.875em` d'un corps à
       * 16 px vaut exactement `text-sm`, et le libellé reste à 14 px. */}
      <div
        className="font-bold"
        style={{
          fontSize: compact ? "1.35em" : "1.75em",
          lineHeight: 1.2,
          ...(compact ? { marginTop: 3 } : {}),
        }}
      >
        {displayValue}
      </div>
      {judgment && (
        <div
          role="status"
          aria-label={`${label} : ${judgmentLabel(judgment, judgmentFormat)}`}
          className={`flex items-center gap-2 ${compact ? "text-[11px] mt-0.5" : "text-xs mt-1"}`}
          style={{ color: judgmentColor(judgment) }}
        >
          <span>{judgmentLabel(judgment, judgmentFormat)}</span>
          {sortedTraj && sortedTraj.length >= 2 && judgment.trend && (
            <Sparkline
              values={sortedTraj.map((p) => p.v)}
              trend={trendToSparkline[judgment.trend.status]}
              width={compact ? 56 : 72}
              height={compact ? 16 : 20}
            />
          )}
        </div>
      )}
      {(subtext != null && subtext !== "") && (
        <div className={`${compact ? "text-[11px]" : "text-sm mt-1"}`} style={{ color: "var(--bpm-text-secondary, #6b7280)", ...(compact ? { marginTop: "calc(0.125rem + 3px)" } : {}) }}>
          {subtext}
        </div>
      )}
      <div
        className={`${compact ? "text-xs mt-0.5" : "text-sm mt-1"} ${hasDelta || hasText ? (positive ? "text-green-600" : negative ? "text-red-600" : "") : "opacity-0"}`}
      >
        {hasDelta ? (
          <>
            {deltaNum! > 0 ? "▲" : deltaNum! < 0 ? "▼" : "—"}
            {parsed?.literal ? deltaStr : formatDelta(deltaNum!)}
          </>
        ) : (
          hasText ? suppliedText : "\u00A0"
        )}
      </div>
    </div>
  );
}
