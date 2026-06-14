/**
 * Connecteur seed #2 — Google Sheets (lecture).
 *
 * Archétype d'auth : `oauth2`. Lecture d'une plage d'une feuille de calcul. Le flux
 * OAuth (scopes + refresh) est DÉCLARÉ, jamais implémenté en dur : seul le
 * `refreshToken` (secret, clé) est résolu au runtime via le coffre.
 *
 * La Sheets API renvoie une matrice de lignes (`values: string[][]`). Le mapping
 * projette par POSITION de colonne (source "0", "1", "2") vers la forme de l'app.
 */
import type { ConnectorDescriptor } from "../../types";
import sampleResponse from "./fixture.json";

export const googleSheets: ConnectorDescriptor = {
  id: "google-sheets",
  name: { fr: "Google Sheets (lecture)", en: "Google Sheets (read)" },
  category: "data",
  description: {
    fr: "Lit une plage d'une feuille Google Sheets via OAuth2 (lecture seule). Chaque ligne de la plage est mappée par position de colonne vers la forme de données de l'app.",
    en: "Reads a range from a Google Sheet via OAuth2 (read-only). Each row in the range is mapped by column position to the app's data shape.",
  },
  auth: {
    method: "oauth2",
    fields: [
      {
        key: "refreshToken",
        label: { fr: "Jeton de rafraîchissement", en: "Refresh token" },
        type: "secret",
        required: true,
      },
      {
        key: "spreadsheetId",
        label: { fr: "Identifiant de la feuille", en: "Spreadsheet ID" },
        type: "text",
        required: true,
        placeholder: "1AbC…xyz",
      },
    ],
    oauth2: {
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      refresh: true,
    },
  },
  hosts: ["sheets.googleapis.com", "oauth2.googleapis.com"],
  operations: [
    {
      id: "readRange",
      httpMethod: "GET",
      pathTemplate: "/v4/spreadsheets/{spreadsheetId}/values/{range}",
      inputSchema: {
        spreadsheetId: { type: "string", required: true },
        range: { type: "string", required: true },
      },
      collectionPath: "values",
      responseMapping: [
        { source: "0", target: "site" },
        { source: "1", target: "status" },
        { source: "2", target: "count", transform: "toNumber" },
      ],
      sampleResponse,
    },
  ],
};
