"use client";

import { useEffect, useState } from "react";
import { getQueueSize, sync } from "@/lib/offline";

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [queueSize, setQueueSize] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const updateQueue = async () => setQueueSize(await getQueueSize());
    updateQueue();

    const onOnline = async () => {
      setOnline(true);
      await updateQueue();
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const interval = setInterval(updateQueue, 10_000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await sync();
    setQueueSize(await getQueueSize());
    setSyncing(false);
  };

  if (online && queueSize === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        borderRadius: 6,
        background: online ? "var(--bpm-surface)" : "#fef3c7",
        border: "1px solid",
        borderColor: online ? "var(--bpm-border)" : "#f59e0b",
        fontSize: 12,
        color: online ? "var(--bpm-text-secondary)" : "#92400e",
      }}
    >
      <span>{online ? "🔄" : "⚠️"}</span>
      <span>
        {online
          ? `${queueSize} entrée${queueSize > 1 ? "s" : ""} en attente`
          : `Hors ligne — ${queueSize} entrée${queueSize > 1 ? "s" : ""} en attente`}
      </span>
      {online && queueSize > 0 && (
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
            cursor: syncing ? "not-allowed" : "pointer",
            fontSize: 11,
          }}
        >
          {syncing ? "Sync…" : "Synchroniser"}
        </button>
      )}
    </div>
  );
}
