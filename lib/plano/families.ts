/**
 * Planothèque : chaque composant existe d'abord comme un PLAN cyanotype, dessiné
 * par FAMILLE (la catégorie déclarée dans le registre `bpm-components.json`),
 * jamais composant par composant. Le registre fait foi : une catégorie inconnue
 * retombe sur le plan générique plutôt que d'inventer un dessin.
 *
 * Module PUR (aucun import React) : la correspondance est testée par
 * `tests/plano-families.test.ts`, qui rougit si le registre gagne une catégorie
 * sans plan.
 */

export type PlanFamily =
  | "donnees"
  | "mise-en-page"
  | "interaction"
  | "feedback"
  | "navigation"
  | "media"
  | "graphiques"
  | "utilitaires"
  | "identification"
  | "ia"
  | "generique";

/** Catégories du registre → famille de plan. */
export const CATEGORY_TO_FAMILY: Readonly<Record<string, PlanFamily>> = {
  "Affichage de données": "donnees",
  "Mise en page": "mise-en-page",
  Interaction: "interaction",
  Feedback: "feedback",
  Navigation: "navigation",
  "Média": "media",
  Graphiques: "graphiques",
  Utilitaires: "utilitaires",
  "Identification & traçabilité": "identification",
  "IA & Spécialisés": "ia",
};

export function familyOf(category: string | null | undefined): PlanFamily {
  if (!category) return "generique";
  return CATEGORY_TO_FAMILY[category] ?? "generique";
}

/** Appel Python tel qu'il s'écrit (`bpm.metric`) : le nom du registre, jamais reconstruit. */
export function callOf(name: string): string {
  return name.startsWith("bpm.") ? name : `bpm.${name}`;
}

/**
 * Libellé humain d'un composant à partir de son nom de registre.
 * `bpm.status_tracker` → « Status tracker ». Pas de traduction inventée :
 * le nom technique reste visible juste dessous.
 */
export function humanName(name: string): string {
  const bare = name.replace(/^bpm\./, "").replace(/[_-]+/g, " ").trim();
  if (!bare) return name;
  return bare.charAt(0).toUpperCase() + bare.slice(1);
}

/** Composants mis en avant sur l'accueil : seuls ceux présents au registre sont retenus. */
export const FEATURED_SLUGS = ["metric", "statustracker", "livegauge", "table"] as const;

export function featured<T extends { slug: string }>(components: readonly T[], n = 4): T[] {
  const bySlug = new Map(components.map((c) => [c.slug, c]));
  const picked = FEATURED_SLUGS.map((s) => bySlug.get(s)).filter((c): c is T => Boolean(c));
  for (const c of components) {
    if (picked.length >= n) break;
    if (!picked.includes(c)) picked.push(c);
  }
  return picked.slice(0, n);
}
