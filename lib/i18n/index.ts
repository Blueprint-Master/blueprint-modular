import fr from "./fr";

/** Structure de référence : dérivée du dictionnaire FR. */
export type Dictionary = typeof fr;

export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "bpm-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === "en") return (await import("./en")).default;
  return fr;
}

/** Interpolation des placeholders {nom} d'une chaîne de dictionnaire. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}

/**
 * Formes plurielles d'une chaîne (accord FR/EN simple).
 * zero (0) / one (1) / other (n>1) — sélectionnées selon count.
 */
export type PluralForms = { zero: string; one: string; other: string };
export function plural(forms: PluralForms, count: number): string {
  if (count === 0) return forms.zero;
  if (count === 1) return forms.one;
  return forms.other;
}
