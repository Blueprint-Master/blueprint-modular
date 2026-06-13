"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/bpm";
import registry from "@/lib/generated/bpm-components.json";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { fmt } from "@/lib/i18n";

/**
 * Catalogue des composants — même UX que la page /modules : titre + description
 * + recherche + sections par catégorie + grille de cartes. Les données (noms,
 * descriptions, catégories) viennent du registre généré du package ; chaque carte
 * mène à la fiche du composant (/docs/components/<slug>).
 */

interface RegistryComponent {
  slug: string;
  name: string;
  description: string;
  category: string;
}

const COMPONENTS = registry.components as RegistryComponent[];
const COMPONENT_COUNT = COMPONENTS.length;

/** Ordre d'affichage des catégories (libellés FR = clés du registre). */
const CATEGORY_ORDER = [
  "Affichage de données",
  "Mise en page",
  "Interaction",
  "Feedback",
  "Navigation",
  "Média",
  "Graphiques",
  "Utilitaires",
  "Identification & traçabilité",
  "IA & Spécialisés",
] as const;

/** Traduction EN des catégories (le registre ne fournit que le FR). */
const CATEGORY_EN: Record<string, string> = {
  "Affichage de données": "Data display",
  "Mise en page": "Layout",
  Interaction: "Interaction",
  Feedback: "Feedback",
  Navigation: "Navigation",
  "Média": "Media",
  Graphiques: "Charts",
  Utilitaires: "Utilities",
  "Identification & traçabilité": "Identification & tracking",
  "IA & Spécialisés": "AI & Specialized",
};

const linkStyle = { color: "var(--bpm-accent-cyan)" } as const;

export default function ComponentsPage() {
  const { locale, dict } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");

  const keywords = useMemo(
    () => searchQuery.toLowerCase().split(/\s+/).filter(Boolean),
    [searchQuery],
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, RegistryComponent[]>();
    for (const comp of COMPONENTS) {
      if (
        keywords.length &&
        !keywords.every((kw) =>
          `${comp.name} ${comp.description} ${comp.category}`.toLowerCase().includes(kw),
        )
      ) {
        continue;
      }
      const list = map.get(comp.category);
      if (list) list.push(comp);
      else map.set(comp.category, [comp]);
    }
    return map;
  }, [keywords]);

  const categoryLabel = (category: string) =>
    locale === "en" ? CATEGORY_EN[category] ?? category : category;

  const orderedCategories: string[] = CATEGORY_ORDER.filter(
    (cat) => byCategory.get(cat)?.length,
  );
  // Catégories éventuelles hors liste connue (robustesse si le registre évolue).
  for (const cat of byCategory.keys()) {
    if (!CATEGORY_ORDER.includes(cat as (typeof CATEGORY_ORDER)[number])) {
      orderedCategories.push(cat);
    }
  }

  const noResults = orderedCategories.length === 0;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>{dict.catalog.title}</h1>
        <p className="doc-description">{fmt(dict.catalog.lead, { count: COMPONENT_COUNT })}</p>
        <div className="mt-4 max-w-md">
          <Input
            type="search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={dict.catalog.searchPlaceholder}
            aria-label={dict.catalog.searchAria}
          />
        </div>
      </div>

      {noResults ? (
        <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {locale === "en"
            ? "No component matches your search."
            : "Aucun composant ne correspond à votre recherche."}
        </p>
      ) : (
        orderedCategories.map((category) => {
          const items = byCategory.get(category);
          if (!items?.length) return null;
          return (
            <section key={category} className="mb-10">
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--bpm-text-primary)" }}
              >
                {categoryLabel(category)}
              </h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {items.map((comp) => (
                  <Link
                    key={comp.slug}
                    href={`/docs/components/${comp.slug}`}
                    className="flex flex-col p-4 rounded-xl border transition hover:border-[var(--bpm-accent-cyan)] hover:shadow-md min-h-[120px]"
                    style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}
                  >
                    <span
                      className="font-semibold mb-1"
                      style={{
                        color: "var(--bpm-text-primary)",
                        fontFamily: "var(--site-font-mono, monospace)",
                      }}
                    >
                      {comp.name}
                    </span>
                    <p className="text-sm flex-1" style={{ color: "var(--bpm-text-secondary)" }}>
                      {comp.description}
                    </p>
                    <span className="text-sm font-medium mt-3" style={linkStyle}>
                      {locale === "en" ? "View doc →" : "Voir la fiche →"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
