"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UnreadNotification = { id: string; message: string; title: string | null; createdAt: string };
type Inbox = { status: "loading" | "unavailable" } | { status: "ready"; items: UnreadNotification[] };

/** The bell is keyed by account; only the newest refresh may update its inbox. */
export function usePersonalInbox(enabled: boolean, open: boolean) {
  const [inbox, setInbox] = useState<Inbox>({ status: "loading" });
  const [saving, setSaving] = useState<string | null>(null);
  const [readFailed, setReadFailed] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const pendingRead = useRef<AbortController | null>(null);
  useEffect(() => () => pendingRead.current?.abort(), []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    try {
      const res = await fetch("/api/notifications?read=false", { cache: "no-store", signal: request.signal });
      if (!res.ok) throw new Error();
      const { notifications } = await res.json();
      if (!Array.isArray(notifications)) throw new Error();
      if (!request.signal.aborted) setInbox({ status: "ready", items: notifications });
    } catch {
      if (!request.signal.aborted) setInbox({ status: "unavailable" });
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const refreshIfVisible = () => { if (!document.hidden) void refresh(); };
    const interval = window.setInterval(refreshIfVisible, 60_000);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      controller.current?.abort();
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.clearInterval(interval);
    };
  }, [enabled, open, refresh]);

  const acknowledge = async (id: string) => {
    if (pendingRead.current) return;
    const request = new AbortController();
    pendingRead.current = request;
    setSaving(id);
    setReadFailed(false);
    try {
      const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH", signal: request.signal });
      if (!res.ok) throw new Error();
      // Refresh the capped window as well: another unread item may take this one's place.
      if (!request.signal.aborted) await refresh();
    } catch {
      if (!request.signal.aborted) setReadFailed(true);
    } finally {
      pendingRead.current = null;
      if (!request.signal.aborted) setSaving(null);
    }
  };

  return { inbox, refresh, saving, acknowledge, readFailed };
}
