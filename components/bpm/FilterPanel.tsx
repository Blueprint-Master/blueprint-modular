"use client";

import React, { useState } from "react";
import { Selectbox } from "./Selectbox";
import { useBpmLocale } from "./i18n";

const STRINGS = {
  fr: {
    all: "Tous",
    searchPlaceholder: "Rechercher...",
    reset: "Réinitialiser",
    showFilters: "Afficher les filtres",
    hideFilters: "Masquer les filtres",
    filters: "Filtres",
  },
  en: {
    all: "All",
    searchPlaceholder: "Search...",
    reset: "Reset",
    showFilters: "Show filters",
    hideFilters: "Hide filters",
    filters: "Filters",
  },
} as const;

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "multiselect" | "daterange" | "text" | "toggle";
  options?: FilterOption[];
}

/**
 * @component bpm.filterPanel
 * @description Panneau de filtres (select, multiselect, daterange, text, toggle).
 */
export interface FilterPanelProps {
  /** Liste des filtres à afficher. */
  filters: FilterConfig[];
  /** Valeurs courantes (clé = filter.key). */
  values?: Record<string, unknown>;
  /** Callback à chaque changement d'un filtre. */
  onChange: (key: string, value: unknown) => void;
  /** Callback réinitialisation. */
  onReset: () => void;
  /** Disposition : horizontal (flex row) ou vertical (colonne 240px). */
  orientation?: "horizontal" | "vertical";
  /** Afficher un bouton pour replier le panneau (avec badge si filtres actifs). */
  collapsible?: boolean;
}

function getActiveCount(filters: FilterConfig[], values: Record<string, unknown>): number {
  let n = 0;
  for (const f of filters) {
    const v = values[f.key];
    if (f.type === "multiselect") {
      const arr = Array.isArray(v) ? v : [];
      if (arr.length > 0) n++;
    } else if (f.type === "daterange") {
      const range = v as { start?: unknown; end?: unknown } | undefined;
      if (range && (range.start != null || range.end != null)) n++;
    } else if (v !== undefined && v !== null && v !== "") n++;
  }
  return n;
}

/**
 * @component bpm.filterPanel
 * @description Panneau de filtres dynamiques (select, multiselect, daterange, text, toggle) avec réinitialisation.
 * @example
 * bpm.filterPanel({ filters: [...], values: { status: "active" }, onChange: handleChange, onReset: reset })
 *
 * @param {object} props
 * @param {FilterConfig[]} props.filters - Configuration des filtres {key, label, type, options?}. Obligatoire.
 * @param {Record<string, unknown>} [props.values={}] - Valeurs courantes des filtres. Optionnel.
 * @param {function} props.onChange - Callback (key, value). Obligatoire.
 * @param {function} props.onReset - Callback de réinitialisation. Obligatoire.
 * @param {"horizontal"|"vertical"} [props.orientation="horizontal"] - Disposition. Optionnel.
 * @param {boolean} [props.collapsible=false] - Panneau repliable avec badge. Optionnel.
 *
 * @associated bpm.table, bpm.dataExplorer, bpm.chip
 * @parent bpm.drawer, bpm.card, bpm.dataExplorer
 * @forbidden aucun
 */
export function FilterPanel({
  filters,
  values = {},
  onChange,
  onReset,
  orientation = "horizontal",
  collapsible = false,
}: FilterPanelProps) {
  const bpmLocale = useBpmLocale();
  const t = STRINGS[bpmLocale];
  const [collapsed, setCollapsed] = useState(false);
  const activeCount = getActiveCount(filters, values);
  const hasActive = activeCount > 0;

  /**
   * LE FLUX DES CHAMPS — extrait du cadre, parce que les deux branches de rendu
   * doivent le partager.
   *
   * ## Le défaut, mesuré sur la critique vision de la production (14 j)
   *
   * « Le panneau de filtres occupe une zone disproportionnée (≈40 % de la
   * hauteur utile) pour seulement deux champs », « repousse le tableau hors de
   * l'écran », « ≈200 px de hauteur avec seulement deux champs centrés » —
   * six constats, quatre formulations indépendantes.
   *
   * ## La cause
   *
   * La branche `collapsible` rendait `{ ...containerStyle, flexDirection:
   * "column" }` avec les champs en enfants DIRECTS : chacun prenait sa propre
   * ligne, pleine largeur. La branche non repliable, elle, les fait couler
   * horizontalement avec retour à la ligne — c'est la mise en page voulue.
   *
   * Or le Maker passe `collapsible: true` en DUR sur toutes ses vues liste :
   * la branche empilée est donc la SEULE que la production connaisse.
   *
   * `collapsible` ajoute un EN-TÊTE au-dessus du contenu ; ça ne dit rien de la
   * façon dont les champs s'organisent entre eux. Le flux est donc sorti du
   * cadre et appliqué à un conteneur INTERNE, identique dans les deux branches.
   */
  const contentFlowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: orientation === "vertical" ? "column" : "row",
    flexWrap: orientation === "horizontal" ? "wrap" : "nowrap",
    gap: 12,
    alignItems: orientation === "vertical" ? "stretch" : "center",
  };

  /** Le CADRE : surface, filet, rayon, largeur. Rien sur l'agencement interne. */
  const frameStyle: React.CSSProperties = {
    width: orientation === "vertical" ? 240 : "100%",
    padding: 12,
    background: "var(--bpm-surface)",
    border: "1px solid var(--bpm-border)",
    borderRadius: "var(--bpm-radius)",
  };

  /* La forme non repliable est INCHANGÉE à l'octet : cadre + flux, exactement
     ce que `containerStyle` valait avant la séparation. */
  const containerStyle: React.CSSProperties = { ...contentFlowStyle, ...frameStyle };

  const FILTER_FIELD_HEIGHT = 40;

  const labelStyle: React.CSSProperties = {
    fontSize: "var(--bpm-font-size-sm)",
    fontWeight: 600,
    color: "var(--bpm-text-muted)",
    marginBottom: 4,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px",
    height: FILTER_FIELD_HEIGHT,
    minHeight: FILTER_FIELD_HEIGHT,
    border: "1px solid var(--bpm-border)",
    borderRadius: "var(--bpm-radius)",
    background: "var(--bpm-bg-primary)",
    color: "var(--bpm-text)",
    fontSize: "var(--bpm-font-size-base)",
    minWidth: orientation === "vertical" ? "100%" : 120,
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    border: "1px solid var(--bpm-border)",
    borderRadius: "var(--bpm-radius-sm)",
    background: "var(--bpm-bg-primary)",
    color: "var(--bpm-text-muted)",
    fontSize: "var(--bpm-font-size-base)",
    cursor: "pointer",
  };

  const buttonDangerStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "var(--bpm-error)",
    color: "var(--bpm-accent-contrast)",
    borderColor: "var(--bpm-error)",
  };

  const renderFilter = (f: FilterConfig) => {
    const v = values[f.key];
    const common = { key: f.key, label: f.label };

    if (f.type === "select") {
      const opts = f.options ?? [];
      const selectOptions: { value: string; label: string }[] = [
        { value: "", label: t.all },
        ...opts.map((o) => ({ value: o.value, label: o.label })),
      ];
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", minWidth: 140 }}>
          <label style={labelStyle}>{f.label}</label>
          <Selectbox
            options={selectOptions}
            value={(v as string) ?? ""}
            onChange={(val) => onChange(f.key, val || null)}
            placeholder={t.all}
            triggerHeight={FILTER_FIELD_HEIGHT}
          />
        </div>
      );
    }

    if (f.type === "multiselect") {
      const selected = (Array.isArray(v) ? v : []) as string[];
      const opts = f.options ?? [];
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", minWidth: 160 }}>
          <label style={labelStyle}>{f.label}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {opts.map((o) => {
              const checked = selected.includes(o.value);
              return (
                <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--bpm-font-size-base)", color: "var(--bpm-text)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked ? selected.filter((x) => x !== o.value) : [...selected, o.value];
                      onChange(f.key, next);
                    }}
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    if (f.type === "daterange") {
      const range = (v as { start?: string; end?: string }) ?? {};
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", minWidth: 200 }}>
          <label style={labelStyle}>{f.label}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="date"
              style={{ ...inputStyle, flex: 1 }}
              value={range.start ?? ""}
              onChange={(e) => onChange(f.key, { ...range, start: e.target.value || undefined })}
            />
            <span style={{ color: "var(--bpm-text-muted)", fontSize: "var(--bpm-font-size-base)" }}>–</span>
            <input
              type="date"
              style={{ ...inputStyle, flex: 1 }}
              value={range.end ?? ""}
              onChange={(e) => onChange(f.key, { ...range, end: e.target.value || undefined })}
            />
          </div>
        </div>
      );
    }

    if (f.type === "text") {
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", minWidth: 140 }}>
          <label style={labelStyle}>{f.label}</label>
          <input
            type="text"
            className="bpm-input"
            style={inputStyle}
            value={(v as string) ?? ""}
            onChange={(e) => onChange(f.key, e.target.value)}
            onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.borderColor = "var(--bpm-accent)";
              e.target.style.boxShadow = "var(--bpm-focus-ring)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--bpm-border)";
              e.target.style.boxShadow = "none";
            }}
            placeholder={t.searchPlaceholder}
          />
        </div>
      );
    }

    if (f.type === "toggle") {
      const on = v === true || v === "true";
      return (
        <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{f.label}</label>
          <input
            type="checkbox"
            checked={on}
            onChange={(e) => onChange(f.key, e.target.checked)}
            style={{ width: 18, height: 18, cursor: "pointer" }}
          />
        </div>
      );
    }

    return null;
  };

  const content = (
    <>
      {filters.map(renderFilter)}
      {hasActive && (
        <button type="button" style={buttonDangerStyle} onClick={onReset}>
          {t.reset}
        </button>
      )}
    </>
  );

  if (collapsible) {
    /* `alignItems` vient de `containerStyle`, calculé pour l'orientation
       HORIZONTALE — donc `center`. Passer la direction à `column` sans le
       recalculer centrait et rétrécissait CHAQUE enfant : le bouton comme les
       champs, au lieu qu'ils occupent la largeur du panneau. */
    return (
      <div style={{ ...frameStyle, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: collapsed ? 0 : 8 }}>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? t.showFilters : t.hideFilters}
          >
            {/* Le libellé DIT ce que le clic fait. La forme d'avant —
                `collapsed ? t.filters : t.filters` — rendait la même valeur
                dans les deux branches : seul `title` changeait, donc le bouton
                se lisait comme une étiquette, pas comme un contrôle. */}
            {collapsed ? t.showFilters : t.hideFilters}
            {activeCount > 0 && (
              <span style={{ marginLeft: 8, background: "var(--bpm-accent)", color: "var(--bpm-accent-contrast)", padding: "2px 8px", borderRadius: "var(--bpm-radius-sm)", fontSize: "var(--bpm-font-size-sm)" }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
        {/* Le contenu retrouve le FLUX de la branche non repliable : les champs
            coulent en ligne et reviennent à la ligne quand ils débordent, au
            lieu de s'empiler un par ligne. */}
        {!collapsed && <div style={contentFlowStyle}>{content}</div>}
      </div>
    );
  }

  return <div style={containerStyle}>{content}</div>;
}
