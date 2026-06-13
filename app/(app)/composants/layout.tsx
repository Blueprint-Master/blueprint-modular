import type { Metadata } from "next";

/**
 * Vue app du catalogue. La référence publique indexable reste /docs/components
 * (et /components) : on évite le contenu dupliqué en désindexant cette variante
 * et en pointant le canonical vers la fiche publique.
 */
export const metadata: Metadata = {
  title: "Composants",
  description:
    "Catalogue des composants Blueprint Modular — recherche, catégories et aperçus en direct, dans le shell de l'application.",
  alternates: { canonical: "https://blueprint-modular.com/docs/components" },
  robots: { index: false, follow: true },
};

export default function ComposantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
