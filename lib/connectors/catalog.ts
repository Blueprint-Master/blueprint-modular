/**
 * Catalogue curé des connecteurs.
 *
 * C'est l'unique source de vérité des connecteurs disponibles : le LLM ne peut
 * CHOISIR qu'un `id` présent ici (validation Maker, track ultérieur). Ajouter un
 * connecteur = ajouter son descripteur ci-dessous, après validation du schéma et
 * passage de la garde secrets.
 *
 * PR2 : seul le connecteur REST générique est seedé. PR3 ajoute Google Sheets,
 * Webhook sortant et Stripe.
 */
import type { ConnectorCategory, ConnectorDescriptor } from "./types";
import { restGeneric } from "./descriptors/rest-generic/descriptor";
import { googleSheets } from "./descriptors/google-sheets/descriptor";
import { outgoingWebhook } from "./descriptors/outgoing-webhook/descriptor";
import { stripe } from "./descriptors/stripe/descriptor";

/** Tous les connecteurs du catalogue, dans l'ordre d'affichage vitrine. */
export const CONNECTORS: ConnectorDescriptor[] = [
  restGeneric,
  googleSheets,
  outgoingWebhook,
  stripe,
];

/** Renvoie un connecteur par son id, ou undefined s'il n'existe pas. */
export function getConnectorById(id: string): ConnectorDescriptor | undefined {
  return CONNECTORS.find((c) => c.id === id);
}

/** Vrai si l'id correspond à un connecteur curé (garde côté Maker). */
export function isKnownConnector(id: string): boolean {
  return CONNECTORS.some((c) => c.id === id);
}

/** Filtre les connecteurs d'une catégorie donnée. */
export function listByCategory(category: ConnectorCategory): ConnectorDescriptor[] {
  return CONNECTORS.filter((c) => c.category === category);
}

/** Catégories effectivement présentes, dans l'ordre d'apparition. */
export function presentCategories(): ConnectorCategory[] {
  const seen: ConnectorCategory[] = [];
  for (const c of CONNECTORS) if (!seen.includes(c.category)) seen.push(c.category);
  return seen;
}
