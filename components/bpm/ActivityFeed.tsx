"use client";

import React from "react";
import { useBpmLocale } from "./i18n";

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  icon?: string;
  color?: "default" | "info" | "success" | "warning" | "error";
}

/**
 * @component bpm.activityFeed
 * @description Flux chronologique d'activités métier avec avatars initiaux, horodatages relatifs en français et état vide.
 * @example
 * bpm.activityFeed({
 *   activities: [
 *     { id: "1", actor: "Alice", action: "a validé", target: "le devis DV-001", timestamp: new Date().toISOString(), color: "success" },
 *   ],
 *   maxItems: 10,
 *   onLoadMore: () => fetchMore(),
 *   compact: true,
 * })
 *
 * @param {object} props
 * @param {ActivityItem[]} props.activities - Liste ordonnée ; chaque entrée : `{ id, actor, action, target, timestamp (ISO), icon?, color? }`. Obligatoire.
 * @param {number} [props.maxItems] - Nombre max d'entrées visibles ; si la liste est plus longue, affiche « Charger plus » si onLoadMore est fourni. Optionnel.
 * @param {function} [props.onLoadMore] - Callback du bouton « Charger plus ». Optionnel.
 * @param {string} [props.emptyMessage="Aucune activité récente."] - Message lorsque activities est vide. Optionnel.
 * @param {boolean} [props.compact=false] - Densité réduite (typo et padding plus petits). Optionnel.
 * @param {string} [props.className=""] - Classes CSS sur le conteneur racine. Optionnel.
 *
 * @usage Historique CRM, journal d'audit léger, timeline d'événements sur une fiche.
 * @context PARENT: bpm.panel | bpm.card | colonne dashboard. ASSOCIATED: bpm.timeline, bpm.statusTracker.
 * @note SSR : composant client (`use client`) ; les libellés relatifs utilisent `Date.now()` — prévoir hydratation côté client pour éviter un écart serveur/client sur l'horodatage affiché.
 * @forbidden Chronologie datée structurée — utiliser bpm.timeline
 */
export interface ActivityFeedProps {
  /** Liste des activités à afficher (ordre = ordre d'affichage). */
  activities: ActivityItem[];
  /** Limite d'affichage ; au-delà, le bouton « Charger plus » apparaît si onLoadMore est défini. */
  maxItems?: number;
  /** Déclenché au clic sur « Charger plus » lorsque activities.length > maxItems. */
  onLoadMore?: () => void;
  /** Texte centré affiché quand `activities` est vide. Défaut : « Aucune activité récente. » */
  emptyMessage?: string;
  /** Mode compact : lignes plus serrées et avatars plus petits. Défaut : `false`. */
  compact?: boolean;
  /** Classes CSS additionnelles sur le conteneur `.bpm-activity-feed`. Défaut : `""`. */
  className?: string;
}

const STRINGS = {
  fr: {
    emptyDefault: "Aucune activité récente.",
    feedLabel: "Fil d'activité",
    loadMore: "Charger plus",
    justNow: "à l'instant",
    minAgo: (n: number) => `il y a ${n} min`,
    hAgo: (n: number) => `il y a ${n} h`,
    yesterday: "hier",
    daysAgo: (n: number) => `il y a ${n} j`,
    dateLocale: "fr-FR",
  },
  en: {
    emptyDefault: "No recent activity.",
    feedLabel: "Activity feed",
    loadMore: "Load more",
    justNow: "just now",
    minAgo: (n: number) => `${n} min ago`,
    hAgo: (n: number) => `${n} h ago`,
    yesterday: "yesterday",
    daysAgo: (n: number) => `${n} d ago`,
    dateLocale: "en-US",
  },
} as const;

type ActivityStrings = (typeof STRINGS)[keyof typeof STRINGS];

function formatActivityTime(iso: string, t: ActivityStrings): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return t.justNow;
  const min = Math.floor(sec / 60);
  if (min < 60) return t.minAgo(min);
  const h = Math.floor(min / 60);
  if (h < 24) return t.hAgo(h);
  const days = Math.floor(h / 24);
  if (days === 1) return t.yesterday;
  if (days < 7) return t.daysAgo(days);
  return d.toLocaleDateString(t.dateLocale, { day: "numeric", month: "short" });
}

function colorFor(color: ActivityItem["color"]): string {
  switch (color) {
    case "info":
      return "var(--bpm-info, var(--bpm-accent))";
    case "success":
      return "var(--bpm-success)";
    case "warning":
      return "var(--bpm-warning)";
    case "error":
      return "var(--bpm-error)";
    default:
      return "var(--bpm-accent)";
  }
}

function initial(name: string): string {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

export function ActivityFeed({
  activities,
  maxItems,
  onLoadMore,
  emptyMessage,
  compact = false,
  className = "",
}: ActivityFeedProps) {
  const bpmLocale = useBpmLocale();
  const t = STRINGS[bpmLocale];
  const effEmptyMessage = emptyMessage ?? t.emptyDefault;
  const limit = maxItems ?? activities.length;
  const visible = activities.slice(0, limit);
  const hasMore = maxItems != null && activities.length > maxItems;
  const fs = compact ? 13 : 14;
  const py = compact ? 8 : 12;

  if (activities.length === 0) {
    return (
      <div
        className={`bpm-activity-feed ${className}`.trim()}
        role="status"
        style={{
          textAlign: "center",
          padding: 32,
          color: "var(--bpm-text-secondary)",
          border: "1px dashed var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
        }}
      >
        <span className="material-symbols-outlined" aria-hidden style={{ fontSize: 36, opacity: 0.5, display: "block", marginBottom: 8 }}>
          history
        </span>
        {effEmptyMessage}
      </div>
    );
  }

  return (
    <div className={`bpm-activity-feed ${className}`.trim()} role="feed" aria-label={t.feedLabel}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {visible.map((a) => (
          <li key={a.id}>
            <article
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: `${py}px 10px`,
                fontSize: fs,
                borderRadius: "var(--bpm-radius-sm)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "color-mix(in srgb, var(--bpm-accent) 6%, var(--bpm-surface))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                aria-hidden
                style={{
                  width: compact ? 24 : 28,
                  height: compact ? 24 : 28,
                  borderRadius: "50%",
                  background: colorFor(a.color),
                  color: "var(--bpm-accent-contrast)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: compact ? 11 : 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {initial(a.actor)}
              </div>
              <p style={{ margin: 0, flex: 1, color: "var(--bpm-text-primary)", lineHeight: 1.4 }}>
                <strong>{a.actor}</strong> {a.action} {a.target}{" "}
                <span style={{ color: "var(--bpm-text-secondary)" }}>· {formatActivityTime(a.timestamp, t)}</span>
              </p>
              {a.icon && (
                <span
                  className="material-symbols-outlined"
                  aria-hidden
                  style={{
                    fontFamily: "Material Symbols Outlined",
                    fontSize: 20,
                    color: "var(--bpm-text-secondary)",
                  }}
                >
                  {a.icon}
                </span>
              )}
            </article>
          </li>
        ))}
      </ul>
      {hasMore && onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "10px",
            border: "1px solid var(--bpm-border)",
            borderRadius: "var(--bpm-radius)",
            background: "var(--bpm-surface)",
            color: "var(--bpm-accent)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.loadMore}
        </button>
      )}
    </div>
  );
}
