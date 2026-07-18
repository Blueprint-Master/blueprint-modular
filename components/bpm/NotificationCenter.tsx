"use client";

import React, { useMemo, useState } from "react";
import { useBpmLocale, type BpmLocale } from "./i18n";

const STRINGS = {
  fr: {
    empty: "Aucune notification.",
    unread: "Non lu",
    markRead: "Marquer comme lu",
    remove: "Supprimer",
    markAllRead: "Tout marquer comme lu",
    readSection: "Lues",
    showOlder: "Voir les anciennes",
    justNow: "à l'instant",
    yesterday: "hier",
    dateLocale: "fr-FR",
    minAgo: (n: number) => `il y a ${n} min`,
    hoursAgo: (n: number) => `il y a ${n} h`,
  },
  en: {
    empty: "No notifications.",
    unread: "Unread",
    markRead: "Mark as read",
    remove: "Delete",
    markAllRead: "Mark all as read",
    readSection: "Read",
    showOlder: "Show older",
    justNow: "just now",
    yesterday: "yesterday",
    dateLocale: "en-US",
    minAgo: (n: number) => `${n} min ago`,
    hoursAgo: (n: number) => `${n} h ago`,
  },
} as const;

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * @component bpm.notificationCenter
 * @description Centre de notifications (liste, marquage, suppression).
 */
export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  maxVisible?: number;
  emptyMessage?: string;
  className?: string;
}

function formatNotifTime(iso: string, t: (typeof STRINGS)[BpmLocale]): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return t.justNow;
  const min = Math.floor(sec / 60);
  if (min < 60) return t.minAgo(min);
  const h = Math.floor(min / 60);
  if (h < 24) return t.hoursAgo(h);
  const days = Math.floor(h / 24);
  if (days === 1) return t.yesterday;
  return d.toLocaleDateString(t.dateLocale, { day: "numeric", month: "short" });
}

function TypeGlyph({ type }: { type: NotificationItem["type"] }) {
  const common = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    fontSize: 14,
    fontWeight: 700 as const,
    flexShrink: 0,
  };
  switch (type) {
    case "success":
      return (
        <span aria-hidden style={{ ...common, background: "color-mix(in srgb, var(--bpm-success) 22%, transparent)", color: "var(--bpm-success)" }}>
          ✓
        </span>
      );
    case "warning":
      return (
        <span aria-hidden style={{ ...common, background: "color-mix(in srgb, var(--bpm-warning) 22%, transparent)", color: "var(--bpm-warning)" }}>
          !
        </span>
      );
    case "error":
      return (
        <span aria-hidden style={{ ...common, background: "color-mix(in srgb, var(--bpm-error) 22%, transparent)", color: "var(--bpm-error)" }}>
          ×
        </span>
      );
    default:
      return (
        <span aria-hidden style={{ ...common, background: "color-mix(in srgb, var(--bpm-info, var(--bpm-accent)) 22%, transparent)", color: "var(--bpm-info, var(--bpm-accent))" }}>
          i
        </span>
      );
  }
}

/**
 * @component bpm.notificationCenter
 * @description Liste de notifications groupées (non lues / lues), actions lecture et suppression.
 * @example
 * bpm.notificationCenter({ notifications, onMarkRead: markRead, onDismiss: dismiss })
 * @props
 * - notifications (NotificationItem[], obligatoire) — { id, title, message?, read, date }.
 * - onMarkRead (function, obligatoire) — Callback (id) marque comme lu.
 * - onMarkAllRead (function, optionnel) — Marque toutes les notifications comme lues.
 * - onDismiss (function, optionnel) — Callback (id) supprime une notification.
 * - maxVisible (number, optionnel) — Nombre maximum affiché.
 * - emptyMessage (string, optionnel) — Message liste vide.
 * - className (string, optionnel) — Classes CSS additionnelles.
 * @parent bpm.topNav, bpm.drawer, bpm.page
 * @associated bpm.activityFeed, bpm.toast, bpm.badge
 * @forbidden Message éphémère unique — utiliser bpm.toast
 */
export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  maxVisible = 50,
  emptyMessage,
  className = "",
}: NotificationCenterProps) {
  const bpmLocale = useBpmLocale();
  const t = STRINGS[bpmLocale];
  const effEmptyMessage = emptyMessage ?? t.empty;
  const [showAll, setShowAll] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const cap = showAll ? notifications.length : Math.min(maxVisible, notifications.length);
  const list = useMemo(() => {
    const slice = notifications.slice(0, cap);
    const unread = slice.filter((n) => !n.read);
    const read = slice.filter((n) => n.read);
    return { unread, read, hasMore: notifications.length > maxVisible && !showAll };
  }, [notifications, cap, maxVisible, showAll]);

  if (notifications.length === 0) {
    return (
      <div
        className={`bpm-notification-center ${className}`.trim()}
        role="status"
        style={{
          textAlign: "center",
          padding: 40,
          color: "var(--bpm-text-secondary)",
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          background: "var(--bpm-surface)",
        }}
      >
        <span className="material-symbols-outlined" aria-hidden style={{ fontSize: 40, opacity: 0.45, display: "block", marginBottom: 8 }}>
          notifications_off
        </span>
        {effEmptyMessage}
      </div>
    );
  }

  const renderRow = (n: NotificationItem) => {
    const hover = hoverId === n.id;
    return (
      <li
        key={n.id}
        style={{
          borderBottom: "1px solid var(--bpm-border)",
          padding: "12px 14px",
          background: hover ? "color-mix(in srgb, var(--bpm-accent) 6%, var(--bpm-surface))" : n.read ? "color-mix(in srgb, var(--bpm-border) 35%, var(--bpm-surface))" : "var(--bpm-surface)",
          opacity: n.read ? 0.85 : 1,
          transition: "background 0.12s ease",
        }}
        onMouseEnter={() => setHoverId(n.id)}
        onMouseLeave={() => setHoverId(null)}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <TypeGlyph type={n.type} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, color: "var(--bpm-text-primary)" }}>{n.title}</span>
              {!n.read && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "var(--bpm-accent)" }}>
                  <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--bpm-accent)" }} />
                  {t.unread}
                </span>
              )}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--bpm-text-secondary)" }}>{n.message}</p>
            <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 6 }}>{formatNotifTime(n.timestamp, t)}</div>
            {n.actionLabel && (
              <button
                type="button"
                onClick={() => n.onAction?.()}
                style={{
                  marginTop: 8,
                  padding: "4px 10px",
                  fontSize: 12,
                  borderRadius: "var(--bpm-radius-sm)",
                  border: "1px solid var(--bpm-border)",
                  background: "var(--bpm-surface)",
                  cursor: "pointer",
                  color: "var(--bpm-accent)",
                  fontWeight: 600,
                }}
              >
                {n.actionLabel}
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            {hover && !n.read && (
              <button
                type="button"
                onClick={() => onMarkRead(n.id)}
                style={{
                  fontSize: 11,
                  padding: "4px 8px",
                  border: "1px solid var(--bpm-border)",
                  borderRadius: "var(--bpm-radius-sm)",
                  background: "var(--bpm-surface)",
                  cursor: "pointer",
                  color: "var(--bpm-text-primary)",
                }}
              >
                {t.markRead}
              </button>
            )}
            {hover && n.read && onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(n.id)}
                style={{
                  fontSize: 11,
                  padding: "4px 8px",
                  border: "1px solid var(--bpm-border)",
                  borderRadius: "var(--bpm-radius-sm)",
                  background: "var(--bpm-surface)",
                  cursor: "pointer",
                  color: "var(--bpm-error)",
                }}
              >
                {t.remove}
              </button>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <section
      className={`bpm-notification-center ${className}`.trim()}
      aria-label="Notifications"
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-surface)",
        overflow: "hidden",
        maxWidth: 440,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "12px 14px",
          borderBottom: "1px solid var(--bpm-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--bpm-text-primary)" }}>Notifications</h2>
          {unreadCount > 0 && (
            <span
              style={{
                minWidth: 22,
                height: 22,
                padding: "0 6px",
                borderRadius: 999,
                background: "var(--bpm-accent)",
                color: "var(--bpm-accent-contrast)",
                fontSize: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {onMarkAllRead && unreadCount > 0 && (
          <button
            type="button"
            onClick={() => onMarkAllRead()}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 10px",
              border: "none",
              background: "transparent",
              color: "var(--bpm-accent)",
              cursor: "pointer",
            }}
          >
            {t.markAllRead}
          </button>
        )}
      </header>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 420, overflowY: "auto" }}>
        {list.unread.map(renderRow)}
        {list.read.length > 0 && list.unread.length > 0 && (
          <li style={{ padding: "8px 14px", fontSize: 11, fontWeight: 600, color: "var(--bpm-text-secondary)", background: "var(--bpm-bg-app, var(--bpm-bg-secondary))" }}>
            {t.readSection}
          </li>
        )}
        {list.read.map(renderRow)}
      </ul>
      {list.hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          style={{
            width: "100%",
            padding: 10,
            border: "none",
            borderTop: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-app, var(--bpm-bg-secondary))",
            color: "var(--bpm-accent)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.showOlder}
        </button>
      )}
    </section>
  );
}
