/**
 * Une gouttière, une colonne, un rythme (18/11). Les mesures viennent d'un build
 * de production servi en local, relevées par scripts/measure-plano-layout.cjs à
 * 384 et 390 px (téléphone) et 1440 px (bureau), sur toutes les routes de l'app
 * et de la vitrine. Ce test exige qu'elles soient IDENTIQUES d'une page à l'autre,
 * et que les règles qui les produisent soient toujours là.
 * Pour les relever de nouveau : next build && next start -p 3457, puis
 *   node scripts/measure-plano-layout.cjs tests/fixtures/plano-layout-mesures.json - <routes>
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Mesure = {
  r: string; w: number; logo: number | null; h1: number | null; ruleLeft: number | null;
  barToTop: number | null; eyeToH1: number | null; h1ToLead: number | null; overflow: number; err?: string;
};
const mesures = JSON.parse(
  readFileSync(resolve(process.cwd(), "tests/fixtures/plano-layout-mesures.json"), "utf8"),
) as Mesure[];
const css = readFileSync(resolve(process.cwd(), "app/planotheque.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("mesures relevées sur le build", () => {
  it("couvrent au moins 19 routes à chacune des trois largeurs, sans erreur", () => {
    for (const w of [384, 390, 1440]) {
      expect(mesures.filter((m) => m.w === w && !m.err).length, String(w)).toBeGreaterThanOrEqual(19);
    }
    expect(mesures.filter((m) => m.err)).toEqual([]);
  });
  it("téléphone : logo, titre et filets à 16 px du bord sur TOUTES les pages", () => {
    for (const m of mesures.filter((x) => x.w < 768)) {
      expect(m.logo, `${m.r} @${m.w}`).toBe(16);
      expect(m.h1, `${m.r} @${m.w}`).toBe(16);
      if (m.ruleLeft !== null) expect(m.ruleLeft, `${m.r} @${m.w}`).toBe(16);
    }
  });
  it("bureau : le même retrait que la planothèque partout, filets compris", () => {
    const ref = mesures.find((m) => m.w === 1440 && m.r === "/composants")!.h1;
    for (const m of mesures.filter((x) => x.w === 1440)) {
      expect(m.h1, m.r).toBe(ref);
      if (m.ruleLeft !== null) expect(m.ruleLeft, m.r).toBe(ref);
    }
  });
  it("en-tête : 32 px barre → sur-titre, 12 px sur-titre → titre, 12 px titre → chapô, partout", () => {
    for (const m of mesures) {
      expect(m.barToTop, `${m.r} @${m.w}`).toBe(32);
      if (m.eyeToH1 !== null) expect(m.eyeToH1, `${m.r} @${m.w}`).toBe(12);
      expect(m.h1ToLead, `${m.r} @${m.w}`).toBe(12);
      expect(m.overflow, `${m.r} @${m.w}`).toBeLessThanOrEqual(0);
    }
  });
});

describe("les règles qui produisent ces mesures", () => {
  it("une gouttière de 16 px zone sûre comprise, une colonne de 1200 px, un pas d'en-tête", () => {
    expect(css).toContain("--plano-gutter-l: max(16px, env(safe-area-inset-left, 0px));");
    expect(css).toContain("--plano-column: 1200px;");
    expect(css).toContain("--plano-head-top: 32px;");
    expect(css).toContain("--plano-head-step: 12px;");
    expect(css).toMatch(/\.app-layout-root \.pwa-title-bar \{\s*padding-left: var\(--plano-gutter-l\);/);
  });
  it("titres de section : une seule règle, Instrument Serif", () => {
    expect(css).toMatch(/:is\(\.plano-family-title, \.site-section h2[^)]*\) \{\s*font-family: var\(--font-display\);\s*font-weight: 400;/);
  });
});

describe("textes visibles", () => {
  it("aucun tiret cadratin dans le dictionnaire français, hors commentaires", () => {
    const fr = readFileSync(resolve(process.cwd(), "lib/i18n/fr.ts"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    expect(fr).not.toContain("—");
  });
  it("la démo : « Démo » en sur-titre, titre sans tiret", () => {
    const s = readFileSync(resolve(process.cwd(), "app/(app)/demo/strings.ts"), "utf8");
    expect(s).toContain('eyebrow: "Démo"');
    expect(s).toContain('pageTitle: "Suivi commercial"');
  });
});
