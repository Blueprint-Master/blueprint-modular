import type { Metadata } from "next";
import { ComponentsCatalogue } from "@/components/site/ComponentsCatalogue";

/**
 * Catalogue des composants dans le shell App (sidebar + cloche + bascule FR/EN +
 * barre mobile), mise en page homogène avec /modules et /connecteurs. Les fiches
 * de détail sont co-localisées sous /composants/<slug>. Le canonical self vit ici
 * (page index) — pas dans le layout — pour ne pas l'imposer aux fiches.
 */
export const metadata: Metadata = {
  alternates: { canonical: "https://blueprint-modular.com/composants" },
};

export default function ComposantsPage() {
  return <ComponentsCatalogue />;
}
