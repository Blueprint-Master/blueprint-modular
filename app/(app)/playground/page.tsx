import type { Metadata } from "next";
import { Playground } from "@/components/site/Playground";
import { getPlaygroundComponents } from "@/lib/playgroundProps";

/**
 * Playground interactif des composants — route dédiée, additive. Les métadonnées
 * de props sont dérivées côté serveur de public/llms.txt (source de vérité) puis
 * passées à l'îlot client `Playground` qui gère l'édition et le rendu live.
 */
export const metadata: Metadata = {
  title: "Playground",
  description:
    "Éditez les props des composants Blueprint Modular et voyez le rendu en direct, avec les snippets React et Python — sans installation.",
};

export default function PlaygroundPage() {
  const components = getPlaygroundComponents();
  return <Playground components={components} />;
}
