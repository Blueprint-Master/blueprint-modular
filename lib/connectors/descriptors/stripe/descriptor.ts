/**
 * Connecteur seed #4 — Stripe (lecture des derniers paiements).
 *
 * Archétype d'auth : `bearer`. Vraie API métier ; se rattache aux modules
 * devis/facturation. La clé Stripe (secret) est déclarée comme champ `secretKey`
 * (clé, jamais de valeur) et résolue au runtime via le coffre.
 *
 * `GET /v1/charges` renvoie `{ data: Charge[] }` ; le mapping projette chaque charge
 * vers un paiement de la forme Ω (montant en unité monétaire, date ISO).
 */
import type { ConnectorDescriptor } from "../../types";
import sampleResponse from "./fixture.json";

export const stripe: ConnectorDescriptor = {
  id: "stripe",
  name: { fr: "Stripe (paiements)", en: "Stripe (payments)" },
  category: "payments",
  description: {
    fr: "Lit les derniers paiements (charges) via l'API Stripe authentifiée par jeton Bearer. Chaque charge est mappée vers un paiement : montant en euros, date ISO, statut.",
    en: "Reads recent payments (charges) via the Stripe API authenticated by a Bearer token. Each charge maps to a payment: amount in currency units, ISO date, status.",
  },
  auth: {
    method: "bearer",
    fields: [
      {
        key: "secretKey",
        label: { fr: "Clé secrète Stripe", en: "Stripe secret key" },
        type: "secret",
        required: true,
      },
    ],
  },
  hosts: ["api.stripe.com"],
  operations: [
    {
      id: "listCharges",
      httpMethod: "GET",
      pathTemplate: "/v1/charges?limit={limit}",
      inputSchema: {
        limit: { type: "number", required: false },
      },
      collectionPath: "data",
      responseMapping: [
        { source: "id", target: "id" },
        { source: "amount", target: "amount", transform: "centsToEuros" },
        { source: "currency", target: "currency" },
        { source: "created", target: "date", transform: "isoFromUnix" },
        { source: "status", target: "status" },
      ],
      sampleResponse,
    },
  ],
};
