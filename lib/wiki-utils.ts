/**
 * Utilitaires pour le module Wiki : comptage de mots, temps de lecture, extraction des liens [[slug]].
 */

/** Compte les mots (séparés par espaces / sauts de ligne) dans un texte. */
export function countWords(text: string): number {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Temps de lecture estimé en minutes (≈ 200 mots/min). */
export function readingTimeMinutes(text: string): number {
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / 200));
}

/** Extrait les slugs référencés par [[slug]] ou [[slug|label]] dans le contenu. */
export function extractWikiSlugs(content: string): string[] {
  if (!content) return [];
  const regex = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;
  const slugs = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    slugs.add(m[1].trim().toLowerCase().replace(/\s+/g, "-"));
  }
  return Array.from(slugs);
}
