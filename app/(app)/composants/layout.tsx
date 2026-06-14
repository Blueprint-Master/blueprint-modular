import type { Metadata } from "next";

/**
 * Vue app du catalogue. Le catalogue public canonique est /components ; on évite
 * le contenu dupliqué en désindexant cette variante et en pointant le canonical
 * vers /components. (Cible à terme — une fois les fiches co-localisées dans le
 * shell App, cf. P2 Lot 1 différé — ce canonical deviendra self.)
 */
export const metadata: Metadata = {
  title: "Composants",
  description:
    "Catalogue des composants Blueprint Modular — recherche, catégories et aperçus en direct, dans le shell de l'application.",
  alternates: { canonical: "https://blueprint-modular.com/components" },
  robots: { index: false, follow: true },
};

export default function ComposantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
