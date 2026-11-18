/**
 * Planothèque : le registre fait foi, et la langue tient les contrastes AA.
 *
 * - chaque catégorie du registre a un plan de famille (une catégorie nouvelle
 *   sans dessin rougit ici, au lieu de retomber en silence sur le générique) ;
 * - les composants mis en avant existent au registre ;
 * - les paires texte / fond de `app/planotheque.css` sont LUES dans le fichier
 *   (jamais recopiées) et tenues au seuil WCAG AA, dans les deux thèmes.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import registry from "@/lib/generated/bpm-components.json";
import { CATEGORY_TO_FAMILY, FEATURED_SLUGS, callOf, familyOf, featured, humanName } from "@/lib/plano/families";

describe("familles de plans", () => {
  it("chaque catégorie du registre a son plan", () => {
    const categories = [...new Set(registry.components.map((c) => c.category))];
    const sansPlan = categories.filter((c) => !(c in CATEGORY_TO_FAMILY));
    expect(sansPlan).toEqual([]);
  });

  it("une catégorie inconnue retombe sur le plan générique", () => {
    expect(familyOf("Catégorie inventée")).toBe("generique");
    expect(familyOf(undefined)).toBe("generique");
  });

  it("les pièces mises en avant existent au registre, sans doublon", () => {
    const slugs = new Set(registry.components.map((c) => c.slug));
    for (const s of FEATURED_SLUGS) expect(slugs.has(s)).toBe(true);
    const picked = featured(registry.components, 4);
    expect(picked).toHaveLength(4);
    expect(new Set(picked.map((c) => c.slug)).size).toBe(4);
  });

  it("l'appel et le nom humain dérivent du nom du registre", () => {
    expect(callOf("bpm.metric")).toBe("bpm.metric");
    expect(callOf("metric")).toBe("bpm.metric");
    expect(humanName("bpm.status_tracker")).toBe("Status tracker");
  });
});

/* ---------- Contrastes ---------- */

const css = readFileSync(resolve(__dirname, "../app/planotheque.css"), "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`bloc ${selector} introuvable`);
  const body = css.slice(start, css.indexOf("\n}", start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(--plano-[a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)) out[m[1]] = m[2];
  return out;
}

function luminance(hex: string): number {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = n.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const light = block("html:root");
const dark = { ...light, ...block('html[data-theme="dark"]') };

const PAIRES: [string, string, number][] = [
  ["--plano-text", "--plano-bg", 4.5],
  ["--plano-text", "--plano-panel", 4.5],
  ["--plano-muted", "--plano-bg", 4.5],
  ["--plano-muted", "--plano-panel", 4.5],
  ["--plano-link", "--plano-bg", 4.5],
  ["--plano-on-accent", "--plano-accent", 4.5],
  ["--plano-control-border", "--plano-panel", 3],
];

describe.each([
  ["clair", light],
  ["sombre", dark],
])("contrastes AA, thème %s", (_nom, t) => {
  it.each(PAIRES)("%s sur %s", (fg, bg, seuil) => {
    expect(t[fg], fg).toMatch(/^#/);
    expect(t[bg], bg).toMatch(/^#/);
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(seuil);
  });

  it("le texte des plans (papier) se lit sur le bleu de Prusse", () => {
    expect(ratio(t["--plano-paper"], t["--plano-prusse"])).toBeGreaterThanOrEqual(4.5);
  });
});

/* ---------- Encre sur l'accent ---------- */


function tsxFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = resolve(dir, name);
    if (statSync(p).isDirectory()) tsxFiles(p, out);
    else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

describe("aucun texte blanc posé sur l'accent", () => {
  /* Le vermillon de la nuit de Prusse ne porte pas le blanc (2,9:1) : l'encre
     de l'accent est `--bpm-accent-contrast`. Un « #fff » à côté d'un fond
     d'accent rougit ici. */
  it("les fonds d'accent lisent --bpm-accent-contrast", () => {
    const fautes: string[] = [];
    for (const dir of ["app", "components"]) {
      for (const f of tsxFiles(resolve(__dirname, "..", dir))) {
        const lines = readFileSync(f, "utf8").split("\n");
        lines.forEach((l, i) => {
          if (!/background[^,]*var\(--bpm-accent(-cyan)?\)/.test(l) || /couleur|\+ "/.test(l)) return;
          const fenetre = [l, lines[i + 1] ?? "", lines[i + 2] ?? ""].join("\n");
          if (/color:[^,\n]*"(#fff|#ffffff|white)"/.test(fenetre)) fautes.push(`${f}:${i + 1}`);
        });
      }
    }
    expect(fautes).toEqual([]);
  });
});
