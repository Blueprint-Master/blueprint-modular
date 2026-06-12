/**
 * Surlignage de recherche — échappement à la sortie (T1_BACKLOG #2b).
 *
 * Le contenu utilisateur (titre, extrait d'article) ne doit JAMAIS être
 * concaténé dans une chaîne HTML avant insertion via `dangerouslySetInnerHTML`
 * (stored XSS). On découpe ici le texte en *segments de données pures* autour
 * des occurrences du terme recherché ; le rendu se fait ensuite par des nœuds
 * React (échappés par défaut), de sorte qu'une charge comme
 * `<img src=x onerror=...>` reste inerte.
 */

/** Échappe les métacaractères regex pour traiter `term` comme littéral. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type HighlightSegment = {
  /** Fragment de texte brut (jamais du HTML). */
  text: string;
  /** `true` si ce fragment correspond au terme recherché → à surligner. */
  match: boolean;
};

/**
 * Découpe `text` autour des occurrences (insensibles à la casse) de `term`.
 * Retourne des segments de texte brut ; aucun balisage HTML n'est produit.
 */
export function splitHighlight(text: string, term: string): HighlightSegment[] {
  if (!text) return [];
  const needle = term.trim();
  if (!needle) return [{ text, match: false }];

  // Le groupe capturant conserve les délimiteurs (les occurrences trouvées)
  // dans le tableau retourné par String.prototype.split.
  const re = new RegExp(`(${escapeRegExp(needle)})`, "gi");
  const lower = needle.toLowerCase();

  return text
    .split(re)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, match: part.toLowerCase() === lower }));
}
