/**
 * Pilier Connecteurs — intégrité du catalogue (PR2).
 *
 * Garantit que chaque descripteur curé : (1) valide contre le schéma zod,
 * (2) ne porte aucune valeur de secret (champs = clés seulement), (3) a un mapping
 * qui s'applique réellement à sa fixture. Plus le mapping attendu du REST générique.
 */
import { describe, it, expect } from "vitest";
import { CONNECTORS, getConnectorById, isKnownConnector, listByCategory } from "@/lib/connectors/catalog";
import { validateConnectorDescriptor } from "@/lib/connectors/schema";
import { applyResponseMapping } from "@/lib/connectors/mapping";

const ALLOWED_FIELD_KEYS = new Set(["key", "label", "type", "required", "placeholder"]);

describe("Catalogue — intégrité", () => {
  it("contient au moins un connecteur", () => {
    expect(CONNECTORS.length).toBeGreaterThan(0);
  });

  it("les ids sont uniques", () => {
    const ids = CONNECTORS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(CONNECTORS.map((c) => [c.id, c] as const))(
    "%s — valide contre le schéma",
    (_id, connector) => {
      const res = validateConnectorDescriptor(connector);
      expect(res.errors).toEqual([]);
      expect(res.ok).toBe(true);
    }
  );

  it.each(CONNECTORS.map((c) => [c.id, c] as const))(
    "%s — aucun champ ne porte de valeur (clés seulement)",
    (_id, connector) => {
      for (const field of connector.auth.fields) {
        for (const key of Object.keys(field)) {
          expect(ALLOWED_FIELD_KEYS.has(key)).toBe(true);
        }
      }
    }
  );

  it.each(CONNECTORS.map((c) => [c.id, c] as const))(
    "%s — chaque opération mappe sa fixture sans lever",
    (_id, connector) => {
      for (const op of connector.operations) {
        expect(() => applyResponseMapping(op.sampleResponse, op)).not.toThrow();
      }
    }
  );
});

describe("Catalogue — helpers", () => {
  it("getConnectorById trouve un connecteur existant et rate un inconnu", () => {
    expect(getConnectorById("rest-generic")?.id).toBe("rest-generic");
    expect(getConnectorById("inexistant")).toBeUndefined();
  });

  it("isKnownConnector garde les ids hors catalogue", () => {
    expect(isKnownConnector("rest-generic")).toBe(true);
    expect(isKnownConnector("rm -rf")).toBe(false);
  });

  it("listByCategory filtre", () => {
    expect(listByCategory("generic").every((c) => c.category === "generic")).toBe(true);
  });
});

describe("REST générique — mapping sur fixture", () => {
  it("projette items -> {id,label,status,createdAt ISO}", () => {
    const op = getConnectorById("rest-generic")!.operations[0];
    const out = applyResponseMapping(op.sampleResponse, op) as Record<string, unknown>[];
    expect(out).toEqual([
      { id: "rec_001", label: "Demande d'accès — Atelier 4", status: "active", createdAt: "2023-11-14T22:13:20.000Z" },
      { id: "rec_002", label: "Renouvellement licence CAO", status: "active", createdAt: "2023-11-15T22:13:20.000Z" },
      { id: "rec_003", label: "Audit annuel — clôturé", status: "archived", createdAt: "2023-11-13T22:13:20.000Z" },
    ]);
  });
});
