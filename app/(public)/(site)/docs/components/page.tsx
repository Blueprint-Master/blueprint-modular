import { ComponentsCatalogue } from "@/components/site/ComponentsCatalogue";

/**
 * Catalogue des composants dans le shell public (vitrine + docs). Le contenu
 * — recherche, catégories, aperçus en direct — vit dans <ComponentsCatalogue>,
 * partagé avec la vue app /composants pour une UX identique.
 */
export default function DocsComponentsPage() {
  return <ComponentsCatalogue />;
}
