/**
 * Pilier Connecteurs — validation du schéma ConnectorDescriptor (PR1).
 *
 * Aucun connecteur réel n'existe encore (PR2-3) : on valide le SCHÉMA et ses
 * invariants de sécurité sur un descripteur synthétique.
 */
import { describe, it, expect } from "vitest";
import { validateConnectorDescriptor, parseConnectorDescriptor } from "@/lib/connectors/schema";

/** Descripteur synthétique valide — sert de base aux mutations négatives. */
function validDescriptor(): Record<string, unknown> {
  return {
    id: "demo-rest",
    name: { fr: "Démo REST", en: "Demo REST" },
    category: "generic",
    description: { fr: "Connecteur de démonstration.", en: "Demonstration connector." },
    auth: {
      method: "apiKey",
      fields: [
        { key: "apiKey", label: { fr: "Clé API", en: "API key" }, type: "secret", required: true },
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
        id: "list",
        httpMethod: "GET",
        pathTemplate: "/v1/items?limit={limit}",
        inputSchema: { limit: { type: "number", required: false } },
        collectionPath: "data",
        responseMapping: [{ source: "id", target: "item.id" }],
        sampleResponse: { data: [{ id: "abc" }] },
      },
    ],
  };
}

describe("ConnectorDescriptor — schéma valide", () => {
  it("accepte un descripteur bien formé", () => {
    const res = validateConnectorDescriptor(validDescriptor());
    expect(res.ok).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("parse et renvoie le descripteur typé", () => {
    const d = parseConnectorDescriptor(validDescriptor());
    expect(d.id).toBe("demo-rest");
    expect(d.auth.fields[0].key).toBe("apiKey");
  });
});

describe("ConnectorDescriptor — invariant de sécurité : aucun secret en dur", () => {
  it("REJETTE un champ portant une valeur (propriété excédentaire `value`)", () => {
    const d = validDescriptor();
    (d.auth as any).fields[0].value = "sk_live_oops"; // tentative de secret en dur
    const res = validateConnectorDescriptor(d);
    expect(res.ok).toBe(false);
    expect(res.errors.join(" ")).toMatch(/unrecognized|value/i);
  });

  it("REJETTE un champ `secret` portant un placeholder", () => {
    const d = validDescriptor();
    (d.auth as any).fields[0].placeholder = "ma-vraie-cle";
    const res = validateConnectorDescriptor(d);
    expect(res.ok).toBe(false);
    expect(res.errors.join(" ")).toMatch(/placeholder/i);
  });

  it("REJETTE une propriété `default` excédentaire", () => {
    const d = validDescriptor();
    (d.auth as any).fields[1].default = "https://api.exemple.com";
    expect(validateConnectorDescriptor(d).ok).toBe(false);
  });
});

describe("ConnectorDescriptor — autres invariants", () => {
  it("REJETTE une allow-list d'hôtes vide", () => {
    const d = validDescriptor();
    d.hosts = [];
    expect(validateConnectorDescriptor(d).ok).toBe(false);
  });

  it("EXIGE un bloc oauth2 quand method === oauth2", () => {
    const d = validDescriptor();
    (d.auth as any).method = "oauth2";
    const res = validateConnectorDescriptor(d);
    expect(res.ok).toBe(false);
    expect(res.errors.join(" ")).toMatch(/oauth2/i);
  });

  it("INTERDIT un bloc oauth2 hors method oauth2", () => {
    const d = validDescriptor();
    (d.auth as any).oauth2 = {
      scopes: ["read"],
      authorizationUrl: "https://accounts.exemple.com/o/oauth2/auth",
      tokenUrl: "https://oauth2.exemple.com/token",
      refresh: true,
    };
    expect(validateConnectorDescriptor(d).ok).toBe(false);
  });

  it("REJETTE un pathTemplate qui ne commence pas par /", () => {
    const d = validDescriptor();
    (d.operations as any)[0].pathTemplate = "v1/items";
    expect(validateConnectorDescriptor(d).ok).toBe(false);
  });

  it("REJETTE un id non normalisé", () => {
    const d = validDescriptor();
    d.id = "Demo REST";
    expect(validateConnectorDescriptor(d).ok).toBe(false);
  });
});
