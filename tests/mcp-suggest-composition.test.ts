/**
 * Tests de suggest_composition : expansion d'acronymes métier + état vide utile,
 * et NON-RÉGRESSION de search_components (moteur de score mutualisé, mais expansion
 * scopée à suggest). Source de vérité : lib/mcp/registry.ts.
 */
import { describe, expect, it } from "vitest";
import { suggestComposition, searchComponents } from "@/lib/mcp/registry";

describe("suggest_composition — expansion d'acronymes", () => {
  it("'CRM' renvoie des composants pertinents (dont bpm.crud) via la sémantique dépliée", () => {
    const r = suggestComposition("CRM");
    expect(r.count).toBeGreaterThan(0);
    const names = r.suggestions.map((s) => s.name);
    expect(names).toContain("bpm.crud");
    expect(r.fallback).toBeUndefined();
  });

  it("'tableau de bord financier' reste pertinent (pas de régression)", () => {
    const r = suggestComposition("tableau de bord financier");
    expect(r.count).toBeGreaterThan(0);
  });
});

describe("suggest_composition — état vide utile", () => {
  it("'salle de réunion' : Ω ne couvre pas → count 0, état vide utile, AUCUN faux positif", () => {
    const r = suggestComposition("salle de réunion");
    expect(r.count).toBe(0);
    expect(r.suggestions).toHaveLength(0);
    // Orientation honnête plutôt qu'un tableau nu.
    expect(r.fallback).toBeDefined();
    expect(r.fallback?.message).toMatch(/Aucun composant/);
    expect(r.fallback?.categories.length).toBeGreaterThan(0);
    // Pas de faux positif injecté pour remplir le vide.
    const names = r.suggestions.map((s) => s.name);
    expect(names).not.toContain("bpm.colorPicker");
    expect(names).not.toContain("bpm.timeInput");
  });
});

describe("search_components — non-régression (moteur partagé)", () => {
  it("'graphique' renvoie toujours des résultats", () => {
    const r = searchComponents("graphique");
    expect(r.total).toBeGreaterThan(0);
  });

  it("'CRM' reste sans résultat dans search (l'expansion est scopée à suggest)", () => {
    const r = searchComponents("CRM");
    expect(r.total).toBe(0);
  });
});
