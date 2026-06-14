import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Composants",
  description:
    "Référence complète des composants BPM : métriques, tableaux, boutons, graphiques et plus de 50 briques Python/React pour vos interfaces métier.",
  // Dédup : /components est le catalogue canonique (cible des CTA, footer, sitemap).
  // Cette variante /docs/components pointe vers lui pour éviter la double indexation.
  alternates: { canonical: "https://blueprint-modular.com/components" },
};

export default function DocsComponentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
