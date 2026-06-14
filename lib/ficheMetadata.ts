import type { Metadata } from "next";
import registry from "@/lib/generated/bpm-components.json";

/** Base canonique des fiches composants (origine apex, cf. SEO du site). */
const CANON_BASE = "https://blueprint-modular.com/composants";

/**
 * Métadonnée SEO d'une fiche composant `/composants/<slug>`, dérivée du registre
 * (`lib/generated/bpm-components.json`, source de vérité des noms/descriptions).
 *
 * Utilisée par chaque page serveur de fiche (générée, cf.
 * `scripts/generate-fiche-pages.mjs`) et par la route de repli `[slug]`. Garantit
 * un `<title>` distinct, une `description` et un `canonical` self par fiche —
 * sans `noindex`. La démo interactive vit dans l'îlot client `Fiche.tsx`.
 */
export function ficheMetadata(slug: string): Metadata {
  const entry = registry.components.find((c) => c.slug === slug);
  const canonical = `${CANON_BASE}/${slug}`;
  if (!entry) {
    // Slug hors registre (alias) : pas de titre dédié, mais canonical self propre.
    return { alternates: { canonical } };
  }
  return {
    title: { absolute: `${entry.name} — Composants — Blueprint Modular` },
    description: entry.description,
    alternates: { canonical },
  };
}
