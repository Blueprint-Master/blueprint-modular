"use client";

/**
 * Registre des exemples d'élévation — pilote la section « Élévation » de /components.
 *
 * Chaque composant bpm.* traité par le run d'élévation enregistre ici :
 *  - un exemple par défaut (rendu inchangé, preuve de non-régression visuelle),
 *  - un exemple déviant (context fourni → le jugement est révélé),
 *  - un exemple trajectoire (v(t) → niveau + tendance), pour les instruments.
 *
 * La page /components itère sur ce registre : pas de page à la main par composant.
 */
import React from "react";

export type ShowcaseClass = "INSTRUMENT" | "DATA" | "STRUCTURAL" | "INTERACTIF";

export interface ShowcaseExample {
  /** Nom court : "défaut" | "déviant" | "trajectoire" | libre. */
  name: string;
  /** Ce que l'exemple démontre. */
  note?: string;
  render: () => React.ReactNode;
}

export interface ShowcaseEntry {
  /** Clé bpm.* (ex. "metric"). */
  key: string;
  class: ShowcaseClass;
  examples: ShowcaseExample[];
}

export const SHOWCASE: ShowcaseEntry[] = [
  // Les entrées sont ajoutées composant par composant pendant la phase 2.
];
