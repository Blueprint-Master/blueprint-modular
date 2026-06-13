/**
 * Connecteur seed #1 — REST générique (clé API en en-tête).
 *
 * Archétype d'auth : `apiKey`. Cas de base : un GET paramétrable sur une API REST
 * arbitraire. L'hôte cible est fourni à la configuration (champ `baseUrl`) et ajouté
 * à l'allow-list d'egress de l'app ; le descripteur déclare ici un hôte d'exemple
 * (`api.exemple.com`) sur lequel tourne la démo/fixture.
 *
 * SÉCURITÉ : la clé API est déclarée comme champ `secret` — clé `apiKey`, jamais de
 * valeur. Résolue au runtime via vault.get(appId, "rest-generic", "apiKey").
 */
import type { ConnectorDescriptor } from "../../types";
import sampleResponse from "./fixture.json";

export const restGeneric: ConnectorDescriptor = {
  id: "rest-generic",
  name: { fr: "REST générique", en: "Generic REST" },
  category: "generic",
  description: {
    fr: "Interroge n'importe quelle API REST authentifiée par clé en en-tête. Un GET paramétrable (ressource + limite) renvoie une collection mappée vers la forme de données de l'app.",
    en: "Query any REST API authenticated by a header key. A parameterized GET (resource + limit) returns a collection mapped to the app's data shape.",
  },
  auth: {
    method: "apiKey",
    fields: [
      {
        key: "apiKey",
        label: { fr: "Clé API", en: "API key" },
        type: "secret",
        required: true,
      },
      {
        key: "baseUrl",
        label: { fr: "URL de base", en: "Base URL" },
        type: "url",
        required: true,
        placeholder: "https://api.exemple.com",
      },
    ],
  },
  hosts: ["api.exemple.com"],
  operations: [
    {
      id: "listResource",
      httpMethod: "GET",
      pathTemplate: "/{resource}?limit={limit}",
      inputSchema: {
        resource: { type: "string", required: true },
        limit: { type: "number", required: false },
      },
      collectionPath: "items",
      responseMapping: [
        { source: "id", target: "id" },
        { source: "title", target: "label" },
        { source: "status", target: "status" },
        { source: "createdAt", target: "createdAt", transform: "isoFromUnix" },
      ],
      sampleResponse,
    },
  ],
};
