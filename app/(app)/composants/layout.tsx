import type { Metadata } from "next";

/**
 * Vue app du catalogue — référence canonique et indexable des composants. Les
 * fiches sont co-localisées dans ce shell App (/composants/<slug>), évitant
 * l'éjection cross-shell. Le canonical self est défini sur la page index
 * (page.tsx), pas ici, pour ne pas l'imposer aux fiches enfants ; chaque fiche
 * [slug] définit le sien via generateMetadata.
 */
export const metadata: Metadata = {
  title: "Composants",
  description:
    "Catalogue des composants Blueprint Modular — recherche, catégories et aperçus en direct, dans le shell de l'application.",
};

export default function ComposantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
