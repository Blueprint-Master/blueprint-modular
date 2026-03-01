"use client";

import { get, set, del, keys } from "idb-keyval";
import type { OfflineEntry } from "./types";

const PREFIX = "bpm-offline-";

export async function enqueue(
  entry: Omit<OfflineEntry, "id" | "synced" | "retries">
): Promise<void> {
  const id = `${PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const full: OfflineEntry = { ...entry, id, synced: false, retries: 0 };
  await set(id, full);
}

export async function getQueue(): Promise<OfflineEntry[]> {
  const allKeys = await keys();
  const offlineKeys = allKeys.filter((k) => String(k).startsWith(PREFIX));
  const entries = await Promise.all(
    offlineKeys.map((k) => get<OfflineEntry>(k))
  );
  return entries.filter((e): e is OfflineEntry => e != null && !e.synced);
}

export async function markSynced(id: string): Promise<void> {
  const entry = await get<OfflineEntry>(id);
  if (entry) await set(id, { ...entry, synced: true });
}

export async function markFailed(id: string): Promise<void> {
  const entry = await get<OfflineEntry>(id);
  if (entry) await set(id, { ...entry, retries: entry.retries + 1 });
}

export async function clearSynced(): Promise<void> {
  const allKeys = await keys();
  const offlineKeys = allKeys.filter((k) => String(k).startsWith(PREFIX));
  const entries = await Promise.all(
    offlineKeys.map((k) => get<OfflineEntry>(k))
  );
  await Promise.all(
    entries
      .filter((e): e is OfflineEntry => e?.synced === true)
      .map((e) => del(e.id))
  );
}

export async function getQueueSize(): Promise<number> {
  return (await getQueue()).length;
}
