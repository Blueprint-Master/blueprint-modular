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
