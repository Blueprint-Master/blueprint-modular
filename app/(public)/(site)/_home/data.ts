/**
 * Données dérivées pour la vitrine d'accueil.
 * Les compteurs de composants proviennent du registre généré (jamais saisis à la main) ;
 * les familles joignent la catégorie réelle du registre à une clé i18n stable.
 */
import registry from "@/lib/generated/bpm-components.json";

export const COMPONENT_COUNT = registry.components.length;

export type FamilyKey =
  | "dataDisplay"
  | "layout"
  | "interaction"
  | "feedback"
  | "navigation"
  | "media"
  | "charts"
  | "utilities"
  | "identity"
  | "ai";

/** Ordre d'affichage des familles + jointure avec la catégorie brute du registre. */
export const FAMILY_ORDER: { key: FamilyKey; category: string }[] = [
  { key: "dataDisplay", category: "Affichage de données" },
  { key: "interaction", category: "Interaction" },
  { key: "layout", category: "Mise en page" },
  { key: "feedback", category: "Feedback" },
  { key: "charts", category: "Graphiques" },
  { key: "media", category: "Média" },
  { key: "navigation", category: "Navigation" },
  { key: "utilities", category: "Utilitaires" },
  { key: "ai", category: "IA & Spécialisés" },
  { key: "identity", category: "Identification & traçabilité" },
];

/** Compte les composants par catégorie réelle du registre. */
export function familyCounts(): Map<string, number> {
  const byCat = new Map<string, number>();
  for (const c of registry.components) {
    byCat.set(c.category, (byCat.get(c.category) ?? 0) + 1);
  }
  return byCat;
}

export type ModuleCategoryKey =
  | "auth"
  | "content"
  | "data"
  | "process"
  | "integrations"
  | "business";

/**
 * Synthèse des modules métier (groupés comme dans /modules).
 * Les compteurs reflètent les modules réellement livrés sous app/(app)/modules.
 */
export const MODULE_CATEGORIES: { key: ModuleCategoryKey; count: number }[] = [
  { key: "content", count: 9 },
  { key: "data", count: 8 },
  { key: "process", count: 5 },
  { key: "integrations", count: 5 },
  { key: "business", count: 4 },
  { key: "auth", count: 1 },
];

export const MODULE_COUNT = MODULE_CATEGORIES.reduce((sum, c) => sum + c.count, 0);
