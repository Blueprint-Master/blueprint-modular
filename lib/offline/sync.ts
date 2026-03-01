"use client";

import { getQueue, markSynced, markFailed, clearSynced } from "./queue";
import type { SyncResult } from "./types";

const MAX_RETRIES = 3;

export async function sync(): Promise<SyncResult> {
  const queue = await getQueue();
  let synced = 0;
  let failed = 0;

  for (const entry of queue) {
    if (entry.retries >= MAX_RETRIES) {
      failed++;
      continue;
    }
    try {
      const res = await fetch(entry.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.data),
      });
      if (res.ok) {
        await markSynced(entry.id);
        synced++;
      } else {
        await markFailed(entry.id);
        failed++;
      }
    } catch {
      await markFailed(entry.id);
      failed++;
    }
  }

  await clearSynced();
  const remaining = await getQueue();

  return { synced, failed, pending: remaining.length };
}

export function startAutoSync(intervalMs = 30_000): () => void {
  const handle = setInterval(async () => {
    if (typeof navigator !== "undefined" && navigator.onLine) {
      await sync();
    }
  }, intervalMs);
  return () => clearInterval(handle);
}
