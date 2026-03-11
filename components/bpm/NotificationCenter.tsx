"use client";

import React, { useState } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onDelete?: (id: string) => void;
  maxVisible?: number;
  /** Élément déclencheur (bouton cloche par défaut). */
  trigger?: React.ReactNode;
  className?: string;
}

function formatGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return "Aujourd'hui";
  if (d.getTime() === yesterday.getTime()) return "Hier";
  return "Plus ancien";
}

export function NotificationCenter({
  notifications,
  onRead,
  onReadAll,
  onDelete,
  maxVisible = 50,
  trigger,
  className = "",
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const list = notifications.slice(0, maxVisible);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const byGroup = list.reduce<Record<string, NotificationItem[]>>((acc, n) => {
    const g = formatGroup(n.timestamp);
    if (!acc[g]) acc[g] = [];
    acc[g].push(n);
    return acc;
  }, {});

  const defaultTrigger = (
    <button
      type="button"
      style={{
        position: "relative",
        padding: 8,
        border: "none",
        borderRadius: "var(--bpm-radius-sm)",
        background: "var(--bpm-bg-secondary)",
        color: "var(--bpm-text-primary)",
        cursor: "pointer",
        fontSize: 18,
      }}
    >
      🔔
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            padding: "0 5px",
            borderRadius: 9,
            background: "var(--bpm-error)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <div
      className={className ? `bpm-notification-center ${className}`.trim() : "bpm-notification-center"}
      style={{ position: "relative", display: "inline-block" }}
    >
      <div onClick={() => setOpen((o) => !o)}>{trigger ?? defaultTrigger}</div>
      {open && (
        <>
          <div
            role="presentation"
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 8,
              zIndex: 9999,
              width: 360,
              maxHeight: 420,
              border: "1px solid var(--bpm-border)",
              borderRadius: "var(--bpm-radius-md)",
              background: "var(--bpm-bg-primary)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                borderBottom: "1px solid var(--bpm-border)",
                background: "var(--bpm-bg-secondary)",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--bpm-text-primary)" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => { onReadAll(); }}
                  style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    border: "none",
                    borderRadius: 4,
                    background: "var(--bpm-accent)",
                    color: "var(--bpm-accent-contrast)",
                    cursor: "pointer",
                  }}
                >
                  Tout marquer lu
                </button>
              )}
            </div>
            <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
              {["Aujourd'hui", "Hier", "Plus ancien"].map((group) => {
                const items = byGroup[group];
                if (!items?.length) return null;
                return (
                  <div key={group}>
                    <div
                      style={{
                        padding: "8px 12px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--bpm-text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      {group}
                    </div>
                    {items.map((n) => (
                      <div
                        key={n.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onRead(n.id);
                          if (n.link) window.open(n.link, "_self");
                          setOpen(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRead(n.id);
                            if (n.link) window.open(n.link, "_self");
                            setOpen(false);
                          }
                        }}
                        style={{
                          padding: 12,
                          borderBottom: "1px solid var(--bpm-border)",
                          background: n.read ? "transparent" : "var(--bpm-bg-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: n.read ? 400 : 600,
                            fontSize: 14,
                            color: "var(--bpm-text-primary)",
                          }}
                        >
                          {n.title}
                        </div>
                        {n.message && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--bpm-text-secondary)",
                              marginTop: 4,
                            }}
                          >
                            {n.message}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--bpm-text-muted)",
                            marginTop: 4,
                          }}
                        >
                          {n.timestamp.toLocaleString("fr-FR")}
                        </div>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                            style={{
                              marginTop: 8,
                              padding: "2px 8px",
                              fontSize: 11,
                              border: "none",
                              borderRadius: 4,
                              background: "transparent",
                              color: "var(--bpm-error)",
                              cursor: "pointer",
                            }}
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
              {list.length === 0 && (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--bpm-text-muted)",
                    fontSize: 14,
                  }}
                >
                  Aucune notification
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
