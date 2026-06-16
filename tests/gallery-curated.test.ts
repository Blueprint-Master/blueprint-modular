/**
 * Sanitizer de la galerie publique (`lib/gallery/curated.ts`).
 *
 * Couvre la défense en profondeur sur la réponse réseau de l'endpoint Maker :
 *   - les 5 champs publics historiques restent inchangés ;
 *   - le champ `appSpec` (extension additive) est validé clé par clé :
 *     forme valide acceptée, formes malformées écartées SANS exception,
 *     `null` / absent géré, clés inattendues ignorées.
 */
import { describe, it, expect } from "vitest";
import { sanitizeCuratedApps, sanitizeAppSpec } from "@/lib/gallery/curated";

const VALID_APP_SPEC = {
  entities: [
    {
      name: "Article",
      label: "Article",
      labelPlural: "Articles",
      fields: [
        { name: "titre", label: "Titre", type: "string", required: true },
        { name: "statut", label: "Statut", type: "enum", required: false },
      ],
    },
  ],
  modules: [
    { key: "articles", label: "Articles", layout: "crud-table", entity: "Article" },
    { key: "dashboard", label: "Tableau de bord", layout: "kpi-overview", entity: null },
  ],
  kpis: [
    { label: "Articles publiés", unit: "number", aggregation: "count", entity: "Article" },
  ],
};

function appWith(appSpec: unknown) {
  return { id: "a1", title: "App", prompt: "p", screenshotUrl: null, createdAt: "2026-01-01T00:00:00.000Z", appSpec };
}

describe("sanitizeCuratedApps — champs publics + appSpec", () => {
  it("conserve les 5 champs historiques + appSpec sur une entrée valide", () => {
    const [app] = sanitizeCuratedApps({ apps: [appWith(VALID_APP_SPEC)] });
    expect(Object.keys(app).sort()).toEqual(
      ["appSpec", "createdAt", "id", "prompt", "screenshotUrl", "title"].sort()
    );
    expect(app.id).toBe("a1");
    expect(app.title).toBe("App");
    expect(app.prompt).toBe("p");
    expect(app.screenshotUrl).toBeNull();
    expect(app.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(app.appSpec).toEqual(VALID_APP_SPEC);
  });

  it("appSpec absent → null (non-régression : items historiques sans appSpec)", () => {
    const [app] = sanitizeCuratedApps({
      apps: [{ id: "a1", title: "App", prompt: "p", screenshotUrl: null, createdAt: "x" }],
    });
    expect(app.appSpec).toBeNull();
  });

  it("appSpec null / malformé → null, sans casser l'item", () => {
    expect(sanitizeCuratedApps({ apps: [appWith(null)] })[0].appSpec).toBeNull();
    expect(sanitizeCuratedApps({ apps: [appWith("garbage")] })[0].appSpec).toBeNull();
    expect(sanitizeCuratedApps({ apps: [appWith(42)] })[0].appSpec).toBeNull();
    expect(sanitizeCuratedApps({ apps: [appWith([])] })[0].appSpec).toBeNull();
  });

  it("ignore les items inexploitables (id/title manquants) — comportement inchangé", () => {
    const apps = sanitizeCuratedApps({
      apps: [{ title: "sans id", appSpec: VALID_APP_SPEC }, { id: "x", appSpec: VALID_APP_SPEC }],
    });
    expect(apps).toHaveLength(0);
  });
});

describe("sanitizeAppSpec — validation défensive (defense in depth)", () => {
  it("accepte une forme valide et n'en retient QUE les clés attendues", () => {
    const out = sanitizeAppSpec(VALID_APP_SPEC);
    expect(out).toEqual(VALID_APP_SPEC);
    expect(Object.keys(out!).sort()).toEqual(["entities", "kpis", "modules"]);
  });

  it("ignore les clés inattendues à tous les niveaux (jamais de fuite)", () => {
    const out = sanitizeAppSpec({
      secret: "NE DOIT PAS FUITER",
      rawAppSpec: { meta: { userPrompt: "FUITE" } },
      entities: [
        {
          name: "E",
          label: "E",
          labelPlural: "Es",
          seedContext: "FUITE",
          fields: [{ name: "f", label: "F", type: "string", required: true, defaultValue: "FUITE", enumValues: ["FUITE"] }],
        },
      ],
      modules: [{ key: "m", label: "M", layout: "crud-table", entity: null, customPrompt: "FUITE" }],
      kpis: [{ label: "K", unit: null, aggregation: "count", entity: null, formula: "FUITE", filters: ["FUITE"] }],
    });
    const serialized = JSON.stringify(out);
    expect(serialized).not.toContain("FUITE");
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("seedContext");
    expect(serialized).not.toContain("defaultValue");
    expect(serialized).not.toContain("enumValues");
    expect(serialized).not.toContain("formula");
    expect(serialized).not.toContain("customPrompt");
    expect(out!.entities[0].fields[0]).toEqual({ name: "f", label: "F", type: "string", required: true });
  });

  it("écarte les éléments mal typés sans throw (entité/champ/module/kpi invalides)", () => {
    const out = sanitizeAppSpec({
      entities: [
        null,
        "garbage",
        { label: "sans nom" }, // pas de name → écartée
        { name: "Ok", fields: [null, "x", { label: "champ sans nom" }, { name: "f" }] },
      ],
      modules: [42, { label: "sans clé" }, { key: "k" }],
      kpis: ["nope", { aggregation: "sum" }, { label: "Bon KPI" }],
    });
    expect(out).not.toBeNull();
    expect(out!.entities).toEqual([
      { name: "Ok", label: "Ok", labelPlural: "Ok", fields: [{ name: "f", label: "f", type: "string", required: false }] },
    ]);
    expect(out!.modules).toEqual([{ key: "k", label: "k", layout: "custom", entity: null }]);
    expect(out!.kpis).toEqual([{ label: "Bon KPI", unit: null, aggregation: "count", entity: null }]);
  });

  it("renvoie null pour une entrée non exploitable", () => {
    expect(sanitizeAppSpec(null)).toBeNull();
    expect(sanitizeAppSpec(undefined)).toBeNull();
    expect(sanitizeAppSpec("x")).toBeNull();
    expect(sanitizeAppSpec(7)).toBeNull();
    expect(sanitizeAppSpec([])).toBeNull();
    expect(sanitizeAppSpec({})).toBeNull();
    // Structure entièrement vide → null (pas d'objet partiel incohérent).
    expect(sanitizeAppSpec({ entities: [], modules: [], kpis: [] })).toBeNull();
    // Tableaux du mauvais type → traités comme vides → null.
    expect(sanitizeAppSpec({ entities: "x", modules: 1, kpis: {} })).toBeNull();
  });

  it("ne lève jamais d'exception sur des entrées hostiles", () => {
    const hostile: unknown[] = [
      { entities: [{ name: 123 }], modules: [{ key: {} }], kpis: [{ label: [] }] },
      { entities: [{ name: "E", fields: "not-array" }] },
      { entities: null, modules: undefined, kpis: NaN },
    ];
    for (const h of hostile) {
      expect(() => sanitizeAppSpec(h)).not.toThrow();
    }
  });
});
