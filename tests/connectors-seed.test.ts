/**
 * Pilier Connecteurs — mappings des 3 connecteurs seed de la PR3
 * (Google Sheets oauth2, Webhook sortant webhookSecret, Stripe bearer).
 *
 * La validité de schéma et l'absence de valeur dans les champs sont déjà couvertes
 * pour TOUS les connecteurs par tests/connectors-catalog.test.ts (it.each). Ici on
 * vérifie le RÉSULTAT du mapping sur chaque fixture, et la couverture des 4 archétypes.
 */
import { describe, it, expect } from "vitest";
import { CONNECTORS, getConnectorById } from "@/lib/connectors/catalog";
import { applyResponseMapping } from "@/lib/connectors/mapping";

function firstOp(id: string) {
  return getConnectorById(id)!.operations[0];
}

describe("Couverture des 4 archétypes d'auth", () => {
  it("le catalogue couvre apiKey, oauth2, webhookSecret, bearer", () => {
    const methods = new Set(CONNECTORS.map((c) => c.auth.method));
    expect(methods).toEqual(new Set(["apiKey", "oauth2", "webhookSecret", "bearer"]));
  });
});

describe("Google Sheets (oauth2) — mapping positionnel des lignes", () => {
  it("déclare scopes + refresh sans secret", () => {
    const c = getConnectorById("google-sheets")!;
    expect(c.auth.oauth2?.refresh).toBe(true);
    expect(c.auth.oauth2?.scopes.length).toBeGreaterThan(0);
    // le refreshToken est une clé secrète, jamais une valeur
    const rt = c.auth.fields.find((f) => f.key === "refreshToken")!;
    expect(rt.type).toBe("secret");
    expect(Object.keys(rt).includes("value")).toBe(false);
  });

  it("projette chaque ligne vers {site,status,count}", () => {
    const op = firstOp("google-sheets");
    const out = applyResponseMapping(op.sampleResponse, op);
    expect(out).toEqual([
      { site: "Atelier 4", status: "actif", count: 12 },
      { site: "Atelier 7", status: "maintenance", count: 3 },
    ]);
  });
});

describe("Webhook sortant (webhookSecret) — action fire-and-forget", () => {
  it("l'URL du webhook est un champ secret", () => {
    const c = getConnectorById("outgoing-webhook")!;
    expect(c.auth.method).toBe("webhookSecret");
    expect(c.auth.fields[0].key).toBe("webhookUrl");
    expect(c.auth.fields[0].type).toBe("secret");
  });

  it("mappe l'accusé vers {delivered,httpStatus}", () => {
    const op = firstOp("outgoing-webhook");
    expect(applyResponseMapping(op.sampleResponse, op)).toEqual({
      delivered: true,
      httpStatus: 200,
    });
  });
});

describe("Stripe (bearer) — derniers paiements", () => {
  it("projette les charges vers des paiements (euros + ISO)", () => {
    const op = firstOp("stripe");
    const out = applyResponseMapping(op.sampleResponse, op);
    expect(out).toEqual([
      { id: "ch_demo_001", amount: 42, currency: "eur", date: "2023-11-14T22:13:20.000Z", status: "succeeded" },
      { id: "ch_demo_002", amount: 159, currency: "eur", date: "2023-11-15T22:13:20.000Z", status: "succeeded" },
    ]);
  });
});
