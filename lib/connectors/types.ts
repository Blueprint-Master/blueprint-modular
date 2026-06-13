/**
 * Pilier « Connecteurs » — schéma du descripteur.
 *
 * Un ConnectorDescriptor décrit une INTÉGRATION API pré-codée et vérifiée. Le LLM
 * ne fait qu'en CHOISIR un par son `id` ; il n'écrit jamais de code d'intégration
 * et ne voit jamais de secret.
 *
 * INVARIANT DE SÉCURITÉ (non négociable, cf. docs/connecteurs/PLAN.md) :
 *   - Un descripteur déclare DES CHAMPS et DU MAPPING, JAMAIS DES SECRETS.
 *   - `auth.fields[].key` est une CLÉ logique, résolue au runtime via
 *     `vault.get(appId, connectorId, key)` (voir lib/connectors/vault.ts) —
 *     jamais une valeur.
 *   - `hosts` est l'allow-list d'egress (un connecteur ne peut appeler que ces hôtes).
 *   - Les démos vitrine tournent sur `Operation.sampleResponse` (fixture committée,
 *     données factices) — jamais sur une API réelle avec un secret du dépôt.
 *
 * RAPPEL (cf. PLAN §2.1) : ce type est DISTINCT du `Connector` de l'AppSpec
 * (packages/core/src/schema/app-spec.ts), qui est IoT/protocole
 * (mqtt|opcua|modbus|rest|websocket). On ne réutilise pas `Ω.connectors` pour ce
 * concept ; le lien se fait par convention d'`id` côté Maker (track ultérieur).
 */

/** Texte bilingue — parité FR/EN imposée partout dans le catalogue. */
export interface I18nText {
  fr: string;
  en: string;
}

/** Les 4 archétypes d'authentification couverts par les connecteurs seed. */
export type AuthMethod = "apiKey" | "oauth2" | "webhookSecret" | "bearer";

/** Familles de connecteurs (sert au regroupement vitrine). */
export type ConnectorCategory = "generic" | "data" | "messaging" | "payments";

/**
 * Type d'un champ d'identifiant.
 *  - "secret" : valeur sensible, jamais lisible/loggée/committée, résolue au runtime.
 *  - "text"   : identifiant non sensible (ex. un spreadsheetId).
 *  - "url"    : URL non sensible (ex. une baseUrl paramétrable).
 */
export type CredentialFieldType = "secret" | "text" | "url";

/**
 * DÉCLARATION d'un champ d'identifiant — porte une CLÉ, jamais une valeur.
 * Le schéma (lib/connectors/schema.ts) rejette toute propriété excédentaire
 * (`value`, `default`, …) : un secret ne peut pas être déclaré « en dur ».
 */
export interface CredentialField {
  /** Identifiant logique résolu au runtime via vault.get(appId, connectorId, key). */
  key: string;
  label: I18nText;
  type: CredentialFieldType;
  required: boolean;
  /**
   * Hint d'UI — JAMAIS une valeur réelle. Interdit sur un champ `secret`
   * (un placeholder de secret serait un vecteur de fuite).
   */
  placeholder?: string;
}

/** Bloc OAuth2 — DÉCLARÉ, jamais implémenté en dur (cf. Google Sheets seed). */
export interface OAuth2Config {
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  /** Le flux s'appuie-t-il sur un refresh token long-lived. */
  refresh: boolean;
}

/** Authentification d'un connecteur : méthode + champs déclarés (vides). */
export interface ConnectorAuth {
  method: AuthMethod;
  fields: CredentialField[];
  /** Requis si et seulement si method === "oauth2". */
  oauth2?: OAuth2Config;
}

/**
 * Règle de mapping : projette la forme de l'API vers la forme de données Ω.
 * Structurellement compatible avec `ConnectorField` de l'AppSpec
 * (`{ source, target, transform? }`) — le builder Maker pourra projeter
 * `responseMapping` → `Ω.connectors[].fields` sans changement de forme.
 */
export interface ResponseMappingRule {
  /** Chemin dans la réponse API (dot-path + index, ex. "data[0].amount" ou "amount"). */
  source: string;
  /** Champ Ω cible (dot-path, ex. "payment.amount"). */
  target: string;
  /** Nom d'une transformation pure déclarée dans lib/connectors/mapping.ts. */
  transform?: string;
}

/** Méthodes HTTP supportées au MVP : lecture (GET) + action fire-and-forget (POST). */
export type HttpMethod = "GET" | "POST";

/** Type d'un paramètre d'entrée d'opération. */
export interface OperationInput {
  type: "string" | "number";
  required: boolean;
}

/** Une opération exposée par un connecteur. */
export interface Operation {
  id: string;
  httpMethod: HttpMethod;
  /** Chemin relatif à un host de l'allow-list, ex. "/v1/charges?limit={limit}". */
  pathTemplate: string;
  /** Paramètres injectables dans pathTemplate / le corps de requête. */
  inputSchema: Record<string, OperationInput>;
  /**
   * Chemin (dot-path) vers le tableau d'enregistrements dans la réponse, si l'API
   * renvoie une collection. Absent => la réponse entière est un enregistrement unique.
   * Quand présent, `responseMapping` mappe les champs RELATIFS à chaque élément.
   */
  collectionPath?: string;
  /** Mapping forme-API → forme-Ω, appliqué par applyResponseMapping(). */
  responseMapping: ResponseMappingRule[];
  /**
   * Réponse fixture (données 100 % factices, aucun secret). Sert la démo vitrine
   * et les tests de mapping. JAMAIS le produit d'un appel réel.
   */
  sampleResponse: unknown;
}

/** Descripteur d'un connecteur du catalogue curé. */
export interface ConnectorDescriptor {
  /** Identifiant stable, référencé par convention par Ω.connectors[].id (Maker). */
  id: string;
  name: I18nText;
  category: ConnectorCategory;
  description: I18nText;
  auth: ConnectorAuth;
  /** Allow-list d'egress : un connecteur ne peut appeler que ces hôtes. */
  hosts: string[];
  operations: Operation[];
}
