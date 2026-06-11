/**
 * Accès read-only à la couche sémantique des composants bpm.*.
 * Source curée : lib/semantics/bpm-semantics.json — voir types.ts pour la gouvernance.
 */
import data from "./bpm-semantics.json";
import type { ComponentSemantics, SemanticsFile } from "./types";

const FILE = data as unknown as SemanticsFile;
const MAP: Record<string, ComponentSemantics> = FILE.components;

/** Récupère la couche sémantique d'un composant ("bpm.metric", "Metric" ou "metric"). */
export function getSemantics(slugOrName: string): ComponentSemantics | undefined {
  const n = slugOrName.trim().toLowerCase().replace(/^bpm\./, "");
  return MAP[n];
}

export const SEMANTICS_TOTAL = Object.keys(MAP).length;
export const SEMANTICS_ONTOLOGY = FILE.ontology;

export * from "./types";
