/**
 * Contrat « Connecteurs » — point d'entrée public publié dans
 * `@blueprint-modular/core/connectors`.
 *
 * Source unique de vérité (D3) : types + schéma (zod) + mapping pur + catalogue
 * curé + interface de coffre. Consommé par le site Modular ET par le builder
 * Maker (émetteur d'intégrations). Aucun secret ici — les descripteurs ne
 * portent que des clés (cf. schema.ts `.strict()`).
 */
export * from "./types";
export * from "./schema";
export * from "./mapping";
export * from "./catalog";
export * from "./vault";
