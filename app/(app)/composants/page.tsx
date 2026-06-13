import { ComponentsCatalogue } from "@/components/site/ComponentsCatalogue";

/**
 * Catalogue des composants dans le shell applicatif (sidebar + cloche + bascule
 * FR/EN + barre de navigation mobile), pour une mise en page identique à
 * /modules. Le contenu est partagé avec la vue vitrine /docs/components via
 * <ComponentsCatalogue> ; les fiches de détail restent sous /docs/components/<slug>.
 */
export default function ComposantsPage() {
  return <ComponentsCatalogue />;
}
