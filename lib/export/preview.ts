/**
 * Interface du gestionnaire de preview temporaire (Phase 2).
 * Pas d'implémentation — uniquement le contrat.
 */

import type { GeneratedApp } from "./types";

export interface PreviewManager {
  /** Crée une preview temporaire et retourne l'URL. */
  createPreview(app: GeneratedApp): Promise<string>;
  /** Prolonge la durée de vie de la preview. */
  extendPreview(appId: string, hours: number): Promise<void>;
  /** Supprime la preview. */
  deletePreview(appId: string): Promise<void>;
  /** Nettoie les previews expirées ; retourne le nombre supprimé. */
  cleanExpiredPreviews(): Promise<number>;
}

// TODO Phase 2 : implémenter PreviewManager
