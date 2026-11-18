import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// 18/11 : `--bpm-sidebar-width: 0` (sans unité) rendait invalide
// `calc(var(--bpm-sidebar-width) + var(--plano-gutter-l))` dans l'app installée :
// le titre « Blueprint Modular » collait au bord gauche.
describe("--bpm-sidebar-width", () => {
  it("porte toujours une unité (utilisable dans calc)", () => {
    const css = readFileSync("app/globals.css", "utf8") + readFileSync("app/planotheque.css", "utf8");
    const decls = [...css.matchAll(/--bpm-sidebar-width:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(decls.length).toBeGreaterThan(0);
    for (const v of decls) expect(v).toMatch(/^\d+(\.\d+)?px$/);
  });
});

describe("APK : barre système Android", () => {
  it("n'a pas de liseré clair au-dessus des boutons (séparateur = fond)", () => {
    const m = JSON.parse(readFileSync("android/twa-manifest.json", "utf8"));
    expect(m.navigationDividerColor.toUpperCase()).toBe(m.navigationColor.toUpperCase());
    expect(m.navigationDividerColorDark.toUpperCase()).toBe(m.navigationColorDark.toUpperCase());
  });
});
