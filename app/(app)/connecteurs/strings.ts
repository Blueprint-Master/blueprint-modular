/**
 * Chaînes bilingues du PILIER Connecteurs (surface vitrine /connecteurs).
 *
 * i18n LOCAL (pas le dictionnaire partagé lib/i18n, en zone gelée) : `en` est typé
 * sur `fr`, donc toute clé manquante ou excédentaire casse la compilation.
 *
 * NB : distinct du module d'ingestion homonyme (app/(app)/modules/connecteurs).
 */
import type { AuthMethod, ConnectorCategory, CredentialFieldType } from "@/lib/connectors/types";

const fr = {
  // ----- Méta -----
  metaTitle: "Connecteurs — Blueprint Modular",
  metaDescription:
    "Catalogue curé d'intégrations API pré-codées et vérifiées. Le LLM choisit un connecteur ; le builder le câble. Aucun secret dans le dépôt : seules des clés de champ déclarées.",

  // ----- Liste -----
  eyebrow: "Pilier Connecteurs",
  listTitle: "Connecteurs",
  listLead:
    "Des intégrations API pré-codées et vérifiées. Un connecteur déclare ses champs et son mapping — jamais de secret. Le LLM en choisit un dans ce catalogue curé ; il n'écrit aucun code d'intégration.",
  countLabel: (n: number) => `${n} connecteur${n > 1 ? "s" : ""}`,
  viewConnector: "Voir la fiche",

  // ----- Catégories -----
  category: {
    generic: "Générique",
    data: "Données",
    messaging: "Messagerie",
    payments: "Paiements",
  } as Record<ConnectorCategory, string>,

  // ----- Méthodes d'auth -----
  authMethod: {
    apiKey: "Clé API",
    oauth2: "OAuth 2.0",
    webhookSecret: "Secret de webhook",
    bearer: "Jeton Bearer",
  } as Record<AuthMethod, string>,

  // ----- Types de champ -----
  fieldType: {
    secret: "secret",
    text: "texte",
    url: "URL",
  } as Record<CredentialFieldType, string>,

  // ----- Fiche -----
  breadcrumb: "Connecteurs",
  secAuth: "Authentification",
  secAuthLead: "Champs déclarés — saisis au runtime, jamais stockés ici.",
  secHosts: "Hôtes autorisés (egress)",
  secHostsLead: "Un connecteur ne peut appeler que ces hôtes (allow-list).",
  secOauth: "OAuth 2.0 (déclaré)",
  oauthScopes: "Portées",
  oauthRefresh: "Rafraîchissement",
  oauthAuthUrl: "URL d'autorisation",
  oauthTokenUrl: "URL de jeton",
  yes: "oui",
  no: "non",
  secOps: "Opérations",
  secMapping: "Mapping de la réponse",
  secDemo: "Démo (réponse fixture)",
  secDemoLead:
    "Aucun appel réseau, aucun secret : le mapping est appliqué à une réponse fixture committée.",
  demoInput: "Réponse fixture (forme API)",
  demoOutput: "Résultat mappé (forme Ω)",

  // ----- En-têtes de tableaux -----
  thField: "Champ",
  thType: "Type",
  thRequired: "Requis",
  thExample: "Exemple",
  thSource: "Source (API)",
  thTarget: "Cible (Ω)",
  thTransform: "Transformation",
  thMethod: "Méthode",
  thPath: "Chemin",
  thInputs: "Entrées",
  none: "—",
  secretLocked: "résolu via le coffre au runtime",
  required: "requis",
  optional: "optionnel",

  // ----- Sécurité -----
  securityNote:
    "Invariant : un descripteur ne porte que des clés de champ (fields[].key). Les valeurs de secrets sont résolues à l'exécution par vault.get(appId, connectorId, key) — jamais committées.",

  // ----- Schéma Simulateur / Documentation -----
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",
  simulatorLead:
    "Testez le mapping de réponse de chaque opération sur une fixture : réponse brute de l'API → sortie normalisée par le connecteur.",
};

const en: typeof fr = {
  metaTitle: "Connectors — Blueprint Modular",
  metaDescription:
    "A curated catalog of pre-coded, verified API integrations. The LLM picks a connector; the builder wires it. No secret in the repository: only declared field keys.",

  eyebrow: "Connectors pillar",
  listTitle: "Connectors",
  listLead:
    "Pre-coded, verified API integrations. A connector declares its fields and mapping — never a secret. The LLM picks one from this curated catalog; it writes no integration code.",
  countLabel: (n: number) => `${n} connector${n > 1 ? "s" : ""}`,
  viewConnector: "View connector",

  category: {
    generic: "Generic",
    data: "Data",
    messaging: "Messaging",
    payments: "Payments",
  } as Record<ConnectorCategory, string>,

  authMethod: {
    apiKey: "API key",
    oauth2: "OAuth 2.0",
    webhookSecret: "Webhook secret",
    bearer: "Bearer token",
  } as Record<AuthMethod, string>,

  fieldType: {
    secret: "secret",
    text: "text",
    url: "URL",
  } as Record<CredentialFieldType, string>,

  breadcrumb: "Connectors",
  secAuth: "Authentication",
  secAuthLead: "Declared fields — entered at runtime, never stored here.",
  secHosts: "Allowed hosts (egress)",
  secHostsLead: "A connector may only call these hosts (allow-list).",
  secOauth: "OAuth 2.0 (declared)",
  oauthScopes: "Scopes",
  oauthRefresh: "Refresh",
  oauthAuthUrl: "Authorization URL",
  oauthTokenUrl: "Token URL",
  yes: "yes",
  no: "no",
  secOps: "Operations",
  secMapping: "Response mapping",
  secDemo: "Demo (fixture response)",
  secDemoLead:
    "No network call, no secret: the mapping is applied to a committed fixture response.",
  demoInput: "Fixture response (API shape)",
  demoOutput: "Mapped result (Ω shape)",

  thField: "Field",
  thType: "Type",
  thRequired: "Required",
  thExample: "Example",
  thSource: "Source (API)",
  thTarget: "Target (Ω)",
  thTransform: "Transform",
  thMethod: "Method",
  thPath: "Path",
  thInputs: "Inputs",
  none: "—",
  secretLocked: "resolved via the vault at runtime",
  required: "required",
  optional: "optional",

  securityNote:
    "Invariant: a descriptor only carries field keys (fields[].key). Secret values are resolved at runtime by vault.get(appId, connectorId, key) — never committed.",

  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",
  simulatorLead:
    "Test each operation's response mapping on a fixture: raw API response → output normalized by the connector.",
};

export const STR = { fr, en } as const;
