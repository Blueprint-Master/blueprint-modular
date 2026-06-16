import type { Metadata } from "next";

/**
 * Layout du playground dans le shell App (sidebar + cloche + bascule FR/EN),
 * homogène avec /composants. Server Component — l'interactivité vit dans l'îlot
 * client `Playground`.
 */
export const metadata: Metadata = {
  title: "Playground",
  description:
    "Playground interactif des composants Blueprint Modular — édition de props et rendu live.",
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
