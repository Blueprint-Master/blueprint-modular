import type { Metadata } from "next";
import { ficheMetadata } from "@/lib/ficheMetadata";
import Fiche from "./Fiche";

// Page serveur générée (scripts/generate-fiche-pages.mjs) : porte la métadonnée
// SEO ; la démo interactive vit dans l'îlot client ./Fiche.tsx.
export const metadata: Metadata = ficheMetadata("plotlychart");

export default function PlotlychartFichePage() {
  return <Fiche />;
}
