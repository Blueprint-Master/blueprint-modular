/**
 * Connecteur seed #3 — Webhook sortant (type Slack incoming webhook).
 *
 * Archétype d'auth : `webhookSecret`. Action « fire-and-forget » qui alimente le
 * levier A (actions) : on POSTe un message vers une URL de webhook. L'URL ELLE-MÊME
 * est le secret (elle contient le jeton) — déclarée comme champ `secret` (clé
 * `webhookUrl`), résolue au runtime, jamais committée. Le chemin réel est porté par
 * l'URL résolue ; `pathTemplate` reste "/" côté descripteur.
 *
 * La réponse est un simple accusé (Slack renvoie « ok ») — modélisée ici comme un
 * accusé normalisé { ok, status } pour rester cohérent avec le mapping JSON.
 */
import type { ConnectorDescriptor } from "../../types";
import sampleResponse from "./fixture.json";

export const outgoingWebhook: ConnectorDescriptor = {
  id: "outgoing-webhook",
  name: { fr: "Webhook sortant", en: "Outgoing webhook" },
  category: "messaging",
  description: {
    fr: "Envoie un message vers une URL de webhook (type Slack incoming webhook). Action fire-and-forget qui alimente le levier A ; l'URL contient le secret et n'est jamais committée.",
    en: "Sends a message to a webhook URL (Slack incoming webhook style). Fire-and-forget action feeding lever A; the URL holds the secret and is never committed.",
  },
  auth: {
    method: "webhookSecret",
    fields: [
      {
        key: "webhookUrl",
        label: { fr: "URL du webhook", en: "Webhook URL" },
        type: "secret",
        required: true,
      },
    ],
  },
  hosts: ["hooks.slack.com"],
  operations: [
    {
      id: "postMessage",
      httpMethod: "POST",
      pathTemplate: "/",
      inputSchema: {
        text: { type: "string", required: true },
      },
      responseMapping: [
        { source: "ok", target: "delivered" },
        { source: "status", target: "httpStatus" },
      ],
      sampleResponse,
    },
  ],
};
