/**
 * Pilier Connecteurs — application du responseMapping (PR1).
 * Vérifie getByPath/setByPath, les transforms, et applyResponseMapping sur une
 * fixture synthétique (collection + enregistrement unique). Pur, sans réseau.
 */
import { describe, it, expect } from "vitest";
import {
  applyResponseMapping,
  getByPath,
  setByPath,
  TRANSFORMS,
} from "@/lib/connectors/mapping";

describe("getByPath", () => {
  const obj = { a: { b: [{ c: 42 }, { c: 7 }] }, flat: "x" };
  it("résout un chemin plat", () => expect(getByPath(obj, "flat")).toBe("x"));
  it("résout un chemin imbriqué avec index", () =>
    expect(getByPath(obj, "a.b[1].c")).toBe(7));
  it("renvoie undefined sur chemin cassé", () =>
    expect(getByPath(obj, "a.z.c")).toBeUndefined());
  it("renvoie l'objet pour un chemin vide", () => expect(getByPath(obj, "")).toBe(obj));
});

describe("setByPath", () => {
  it("pose une valeur imbriquée en créant les niveaux", () => {
    const t: Record<string, unknown> = {};
    setByPath(t, "payment.amount", 42);
    expect(t).toEqual({ payment: { amount: 42 } });
  });
});

describe("TRANSFORMS", () => {
  it("centsToEuros divise par 100", () => expect(TRANSFORMS.centsToEuros(4200)).toBe(42));
  it("isoFromUnix produit une ISO", () =>
    expect(TRANSFORMS.isoFromUnix(0)).toBe("1970-01-01T00:00:00.000Z"));
  it("toNumber coerce", () => expect(TRANSFORMS.toNumber("12")).toBe(12));
});

describe("applyResponseMapping — collection", () => {
  const operation = {
    collectionPath: "data",
    responseMapping: [
      { source: "amount", target: "payment.amount", transform: "centsToEuros" },
      { source: "currency", target: "payment.currency" },
      { source: "created", target: "payment.date", transform: "isoFromUnix" },
    ],
  };
  const fixture = {
    data: [
      { amount: 4200, currency: "eur", created: 0 },
      { amount: 990, currency: "usd", created: 0 },
    ],
  };

  it("mappe chaque élément du tableau", () => {
    const out = applyResponseMapping(fixture, operation) as Record<string, unknown>[];
    expect(Array.isArray(out)).toBe(true);
    expect(out).toEqual([
      { payment: { amount: 42, currency: "eur", date: "1970-01-01T00:00:00.000Z" } },
      { payment: { amount: 9.9, currency: "usd", date: "1970-01-01T00:00:00.000Z" } },
    ]);
  });

  it("lève si collectionPath ne pointe pas sur un tableau", () => {
    expect(() => applyResponseMapping({ data: 1 }, operation)).toThrow(/tableau/);
  });
});

describe("applyResponseMapping — enregistrement unique", () => {
  it("mappe la réponse entière sans collectionPath", () => {
    const out = applyResponseMapping(
      { id: "abc", nested: { name: "Acme" } },
      { responseMapping: [{ source: "nested.name", target: "company" }] }
    );
    expect(out).toEqual({ company: "Acme" });
  });

  it("lève sur une transform inconnue", () => {
    expect(() =>
      applyResponseMapping({ x: 1 }, { responseMapping: [{ source: "x", target: "y", transform: "nope" }] })
    ).toThrow(/Transform inconnue/);
  });
});
