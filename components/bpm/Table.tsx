"use client";

import React, { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useBPMContext } from "@/lib/ai/context";
import type { MetricValueLocale } from "./Metric";
import { interpret, judgmentColor, type InterpretContext } from "./interpret";
import { useBpmLocale } from "./i18n";

const STRINGS = {
  fr: { emptyMessage: "Aucune donnée disponible" },
  en: { emptyMessage: "No data available" },
} as const;

/**
 * @component bpm.table
 * @description Tableau de données triable avec colonnes personnalisables, formatage numérique et scroll horizontal.
 * @example
 * bpm.table({ columns: [{ key: "nom", label: "Nom" }, { key: "montant", label: "Montant", align: "right" }], data: rows, striped: true, hover: true })
 *
 * @param {object} props
 * @param {TableColumn[]} props.columns - Définition des colonnes (key, label, align?, render?, decimals?). Obligatoire.
 * @param {Record<string, unknown>[]} props.data - Tableau de données. Obligatoire.
 * @param {boolean} [props.striped=true] - Lignes alternées. Optionnel.
 * @param {boolean} [props.hover=true] - Surbrillance au survol. Optionnel.
 * @param {function} [props.onRowClick] - Callback au clic sur une ligne. Optionnel.
 * @param {string} [props.defaultSortColumn] - Colonne triée par défaut. Optionnel.
 * @param {"asc"|"desc"} [props.defaultSortDirection="asc"] - Direction de tri par défaut. Optionnel.
 * @param {string} [props.name] - Nom pour référence IA. Optionnel.
 * @param {string} [props.keyColumn] - Colonne d'ID unique. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {string} [props.valueLocale="fr-FR"] - Locale pour formatage. Optionnel.
 * @param {number} [props.valueDecimals=0] - Décimales par défaut. Optionnel.
 * @param {boolean} [props.valueGrouping=true] - Séparateur de milliers. Optionnel.
 * @param {number} [props.minWidth] - Largeur minimale en pixels. Optionnel.
 * @param {boolean} [props.trackContext=false] - Expose au contexte IA. Optionnel.
 * @param {string} [props.emptyMessage="Aucune donnée disponible"] - Message si vide. Optionnel.
 *
 * @props
 * - columns (TableColumn[], obligatoire) — Colonnes (key, label, align?, render?, decimals?).
 * - data (Record<string,unknown>[], obligatoire) — Lignes ; jamais de JSX dans data[] (utiliser render).
 * - striped / hover (boolean, optionnel) — Lignes alternées / surbrillance au survol.
 * - onRowClick (function, optionnel) — Callback (row) au clic sur une ligne.
 * - defaultSortColumn / defaultSortDirection (optionnel) — Tri initial.
 * - name / keyColumn (string, optionnel) — Identifiant IA du tableau / colonne-clé React.
 * - valueLocale / valueDecimals / valueGrouping (optionnel) — Formatage numérique des cellules.
 * - minWidth (number, optionnel) — Largeur minimale en px (déclenche le scroll horizontal).
 * - trackContext (boolean, optionnel) — Expose le tableau au contexte IA.
 * - emptyMessage (string, optionnel) — Message affiché quand data est vide.
 * - className (string, optionnel) — Classes CSS additionnelles.
 * @parent bpm.panel, bpm.container
 * @associated bpm.pagination, bpm.input, bpm.badge, bpm.button
 * @forbidden bpm.card (overflow caché)
 */
export interface TableColumn {
  key: string;
  label: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  /** Renderer personnalisé (valeur + ligne). Seule prop supportée — pas renderCell. */
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  /** Décimales pour cette colonne (surcharge valueDecimals du tableau). */
  decimals?: number;
  /** Si true, l'en-tête de colonne ne passe pas à la ligne (whitespace-nowrap). */
  noWrap?: boolean;
  /**
   * Agrégat affiché en PIED de tableau pour cette colonne.
   *
   * Calculé sur les lignes REÇUES (`data`) — c'est-à-dire ce qui est à l'écran.
   * Un total sur des lignes non affichées mentirait : filtrer une liste et voir
   * un total inchangé est le défaut classique de cette fonctionnalité. Le tri
   * ne change rien (même ensemble), la pagination si — l'appelant paginant
   * lui-même, il passe la page courante et le total suit.
   *
   * `sum` et `avg` ignorent les valeurs non numériques ; `count` compte les
   * lignes dont la valeur est renseignée. Une colonne sans aucune valeur
   * numérique ne rend RIEN plutôt que « 0 » — un zéro fabriqué est une valeur
   * qui ment.
   *
   * Additif : absent partout = aucun pied émis, rendu inchangé à l'octet.
   */
  total?: "sum" | "avg" | "count";
  /** Contexte de jugement de la colonne { reference, direction, comparisonFrame? } : chaque cellule numérique est jugée par interpret — valeur colorée par le verdict, écart en title, data-judgment. Ignoré si render est fourni. Additif : sans context, rendu inchangé. */
  context?: InterpretContext;
}

/**
 * @component bpm.table
 * @description Tableau triable avec colonnes configurables.
 */
export interface TableProps {
  /** PARENT: bpm.panel | bpm.container | page directe. INTERDIT: bpm.card comme parent direct — overflow caché. ASSOCIÉ: bpm.pagination, bpm.input (recherche), bpm.badge (statut colonne), bpm.button (actions). */
  /** Définition des colonnes — obligatoire. */
  columns: TableColumn[];
  /** Tableau de données — obligatoire. INTERDIT : JSX dans data[], utiliser render dans TableColumn. */
  data: Record<string, unknown>[];
  striped?: boolean;
  hover?: boolean;
  /** Callback au clic sur une ligne. */
  onRowClick?: (row: Record<string, unknown>) => void;
  defaultSortColumn?: string | null;
  defaultSortDirection?: "asc" | "desc";
  name?: string | null;
  keyColumn?: string | null;
  className?: string;
  /** Locale pour formater les nombres (ex. "fr-FR", "en-US"). */
  valueLocale?: MetricValueLocale;
  /** Nombre de décimales par défaut pour les cellules numériques. */
  valueDecimals?: number;
  /** Séparateur de milliers (true = 1 000,50). */
  valueGrouping?: boolean;
  /** Largeur minimale du tableau en px (déclenche le scroll horizontal dans le wrapper si conteneur plus étroit). Non défini = pas de min-width. */
  minWidth?: number;
  /** Si true, expose ce tableau au contexte IA. */
  trackContext?: boolean;
  /** Message affiché quand data est vide. Default: "Aucune donnée disponible". */
  emptyMessage?: string;
  /** État chargement : affiche des lignes squelettes (aria-busy). Additif : défaut false. */
  loading?: boolean;
  /** État erreur : affiche le message en ligne role=alert (prioritaire sur loading/empty). Additif : défaut null. */
  error?: string | null;
  /** Densité d'affichage : "normal" (défaut, rendu historique) ou "compact" (padding réduit). */
  density?: "normal" | "compact";
  /** Libellé de la première cellule du pied de totaux. Défaut : "Total". */
  totalsLabel?: string;
}

function getSortValue(val: unknown): string | number {
  if (val == null) return "";
  if (typeof val === "object" && val !== null && "value" in val) {
    return parseFloat((val as { value: unknown }).value as string) ?? "";
  }
  const num = parseFloat(String(val));
  if (!Number.isNaN(num) && isFinite(num)) return num;
  return String(val).toLowerCase();
}

/** Alignement par défaut : nombre → droite, sinon gauche. Surchargeable via col.align. */
function getColumnAlign(
  col: TableColumn,
  data: Record<string, unknown>[]
): "left" | "center" | "right" {
  if (col.align) return col.align;
  const val = data[0]?.[col.key];
  if (val != null && typeof val === "number" && Number.isFinite(val)) return "right";
  if (val != null && typeof val === "string" && /^-?\d+([.,]\d+)?\s*%?$/.test(val.trim())) return "right";
  return "left";
}

function isNumericValue(val: unknown): val is number {
  if (val == null) return false;
  if (typeof val === "number" && Number.isFinite(val)) return true;
  if (typeof val === "string" && /^-?\d+([.,]\d+)?\s*%?$/.test(val.trim())) return true;
  return false;
}

function toNumber(val: unknown): number {
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(",", ".")) || 0;
}

export function Table({
  columns,
  data = [],
  striped = true,
  hover = true,
  onRowClick,
  defaultSortColumn = null,
  defaultSortDirection = "asc",
  name = null,
  keyColumn = null,
  className = "",
  valueLocale = "fr-FR",
  valueDecimals = 0,
  valueGrouping = true,
  minWidth,
  trackContext = false,
  emptyMessage,
  loading = false,
  error = null,
  density = "normal",
  totalsLabel,
}: TableProps) {
  const bpmLocale = useBpmLocale();
  const t = STRINGS[bpmLocale];
  const effEmptyMessage = emptyMessage ?? t.emptyMessage;
  const isMobile = useIsMobile(768);

  useBPMContext(
    {
      type: "table",
      label: name ?? "Tableau",
      data: data,
      metadata: {
        columns: columns.map((c) => (typeof c.label === "string" ? c.label : c.key)),
        rowCount: data.length,
      },
    },
    trackContext === true
  );
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection);

  const locale = valueLocale ?? "fr-FR";
  const formatNumber = (n: number, decimals: number) =>
    n.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: valueGrouping,
    });

  const formatCellValue = (val: unknown, col: TableColumn): React.ReactNode => {
    if (val == null) return "—";
    if (isNumericValue(val)) {
      const num = toNumber(val);
      const decimals = col.decimals ?? valueDecimals;
      const formatted = formatNumber(num, decimals);
      if (col.context) {
        const j = interpret(num, col.context);
        return (
          <span
            data-judgment={j.level.status}
            title={`écart ${j.level.gap >= 0 ? "+" : ""}${j.level.gap} vs repère ${col.context.reference}`}
            style={{
              color: judgmentColor(j),
              fontWeight: j.level.status === "unfavorable" ? 600 : undefined,
            }}
          >
            {formatted}
          </span>
        );
      }
      return formatted;
    }
    return String(val);
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = getSortValue(a[sortColumn]);
      const bVal = getSortValue(b[sortColumn]);
      const aNum = typeof aVal === "number" ? aVal : 0;
      const bNum = typeof bVal === "number" ? bVal : 0;
      const bothNum = typeof aVal === "number" && typeof bVal === "number";
      if (bothNum) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortColumn, sortDirection]);

  /* UN SEUL CADRE (fix 07/07 — « bordures non fermées aux angles ») : le
     wrapper porte l'unique bordure extérieure (+ radius) ; les cellules ne
     dessinent QUE les séparateurs internes (droite sauf dernière colonne,
     bas sauf dernière ligne). L'ancien double cadre (wrapper + `border`
     4 côtés par cellule) laissait des jointures ouvertes aux angles,
     surtout en radius 0. */
  const cellBorder = (colIdx: number, isLastRow: boolean): React.CSSProperties => ({
    borderStyle: "solid",
    borderColor: "var(--bpm-border, #e5e7eb)",
    borderWidth: `0 ${colIdx === columns.length - 1 ? "0" : "1px"} ${isLastRow ? "0" : "1px"} 0`,
  });

  const tableMinWidthStyle =
    !isMobile && minWidth != null ? { minWidth: `${minWidth}px` } : undefined;

  /* PIED DE TOTAUX — calculé sur `data`, donc sur ce qui est à l'écran. Un
     total portant sur des lignes non affichées mentirait : filtrer une liste et
     voir le total inchangé est le défaut classique de cette fonctionnalité.
     Émis SEULEMENT si au moins une colonne le demande ET qu'il y a des lignes :
     un pied « Total — » sous une table vide n'apprend rien. */
  const wantsTotals = columns.some((c) => c.total) && sortedData.length > 0 && !loading && !error;
  const totalFor = (col: TableColumn): string | null => {
    if (!col.total) return null;
    const bruts = sortedData.map((r) => r[col.key]);
    if (col.total === "count") {
      const n = bruts.filter((v) => v != null && v !== "").length;
      return formatNumber(n, 0);
    }
    const nombres = bruts.filter(isNumericValue).map(toNumber);
    /* Aucune valeur numérique : on ne rend RIEN plutôt que « 0 ». Un zéro
       fabriqué est une valeur qui ment, et c'est précisément ce qu'un total est
       censé ne jamais faire. */
    if (nombres.length === 0) return null;
    const somme = nombres.reduce((a, b) => a + b, 0);
    const val = col.total === "avg" ? somme / nombres.length : somme;
    return formatNumber(val, col.decimals ?? valueDecimals);
  };

  return (
    <div
      className={`bpm-table-wrapper overflow-auto max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-350px)] ${className}`}
      style={{
        border: "1px solid var(--bpm-border, #e5e7eb)",
        borderRadius: "var(--bpm-radius, 8px)",
        boxShadow: "none",
        outline: "none",
        overflowX: "auto",
        overflowY: "auto",
        backgroundColor: "var(--bpm-bg-primary, #ffffff)",
      }}
      data-name={name ?? undefined}
      data-key-column={keyColumn ?? undefined}
      aria-busy={loading || undefined}
    >
      <div className="bpm-table-container w-full" style={tableMinWidthStyle}>
        <table
          className={`bpm-table w-full border-collapse ${
            striped ? "bpm-table-striped" : ""
          } ${hover ? "bpm-table-hover" : ""} ${onRowClick ? "bpm-table-clickable" : ""}`}
          style={tableMinWidthStyle}
        >
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  scope="col"
                  aria-sort={
                    sortColumn === col.key
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={`bpm-table-th ${density === "compact" ? "px-2 py-1" : "px-3 py-2"} text-sm font-medium ${col.noWrap ? "bpm-table-th--nowrap" : ""} ${
                    sortColumn === col.key
                      ? `bpm-table-sorted bpm-table-sorted-${sortDirection}`
                      : ""
                  } ${col.className ?? ""}`}
                  style={{
                    textAlign: getColumnAlign(col, data),
                    cursor: col.key ? "pointer" : "default",
                    backgroundColor: "var(--bpm-bg-secondary, #f8fafc)",
                    ...cellBorder(idx, false),
                    color: "var(--bpm-text-secondary, #64748b)",
                  }}
                  onClick={() => col.key && handleSort(col.key)}
                >
                  <span className="flex items-center gap-2">
                    {col.label}
                    {sortColumn === col.key && (
                      <span className="bpm-table-sort-indicator" aria-hidden>
                        {sortDirection === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td
                  colSpan={columns.length}
                  role="alert"
                  className="px-3 py-8 text-center text-sm"
                  style={{
                    color: "var(--bpm-error, #dc2626)",
                    borderColor: "var(--bpm-border, #e5e7eb)",
                    backgroundColor: "var(--bpm-error-soft, #fef2f2)",
                  }}
                >
                  {error}
                </td>
              </tr>
            ) : loading ? (
              Array.from({ length: 3 }, (_, i) => (
                <tr key={`skeleton-${i}`} className="bpm-table-tr">
                  {columns.map((col, colIdx) => (
                    <td key={col.key || colIdx} className={`${density === "compact" ? "px-2 py-1" : "px-3 py-2"}`} style={cellBorder(colIdx, i === 2)}>
                      <span
                        className="inline-block w-full rounded animate-pulse"
                        style={{ height: 14, background: "var(--bpm-bg-secondary, #f1f5f9)" }}
                        aria-hidden
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-12 text-center text-sm"
                  style={{
                    color: "var(--bpm-text-secondary, #64748b)",
                    borderColor: "var(--bpm-border, #e5e7eb)",
                    backgroundColor: "var(--bpm-bg-primary, #ffffff)",
                  }}
                >
                  <span style={{ display: "inline-block", marginBottom: 8, fontSize: "var(--bpm-font-size-lg, 1.125rem)" }} aria-hidden>—</span>
                  <div>{effEmptyMessage}</div>
                </td>
              </tr>
            ) : sortedData.map((row, rowIdx) => (
              <tr
                key={keyColumn && row[keyColumn] != null ? String(row[keyColumn]) : rowIdx}
                onClick={() => onRowClick?.(row)}
                className="bpm-table-tr"
                style={{
                  cursor: onRowClick ? "pointer" : "default",
                  color: "var(--bpm-text-primary, #111827)",
                }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`${density === "compact" ? "px-2 py-1" : "px-3 py-2"} text-sm ${col.className ?? ""}`}
                    style={{
                      textAlign: getColumnAlign(col, data),
                      ...cellBorder(colIdx, rowIdx === sortedData.length - 1),
                    }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : formatCellValue(row[col.key], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {wantsTotals ? (
            <tfoot className="bpm-table-tfoot">
              <tr style={{ fontWeight: 600, color: "var(--bpm-text-primary, #111827)" }}>
                {columns.map((col, colIdx) => {
                  const v = totalFor(col);
                  return (
                    <td
                      key={col.key || colIdx}
                      className={`${density === "compact" ? "px-2 py-1" : "px-3 py-2"} text-sm`}
                      style={{
                        textAlign: getColumnAlign(col, data),
                        borderTop: "2px solid var(--bpm-border, #e5e7eb)",
                        background: "var(--bpm-bg-secondary, #f8fafc)",
                      }}
                    >
                      {/* Le libellé va dans la PREMIÈRE colonne sans total —
                          sinon il écraserait un chiffre. Si toutes en portent
                          un, il n'est pas rendu : les chiffres priment. */}
                      {v ?? (colIdx === columns.findIndex((c) => !c.total) ? (totalsLabel ?? "Total") : "")}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}
