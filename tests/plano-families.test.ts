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

describe("mobile : barre de l'app installée et fiche composant (18/11)", () => {
  it("la barre de titre de l'app installée prend le fond du thème, plus le blanc figé", () => {
    const g = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
    const block = /@media \(display-mode: standalone\) \{\s*\.pwa-title-bar \{([^}]*)\}/.exec(g)?.[1] ?? "";
    expect(block).not.toMatch(/background:\s*#fff/i);
    expect(block).toContain("background: var(--bpm-bg-primary, #0a1626) !important;");
  });
  it("la fiche ne s'élargit plus au contenu sur téléphone", () => {
    const css = readFileSync(resolve(process.cwd(), "app/planotheque.css"), "utf8");
    expect(css).toMatch(/\.sandbox-container > \* \{\s*min-width: 0;/);
    expect(css).toMatch(/grid-template-columns: minmax\(0, 1fr\);/);
  });
});

describe("rail et gabarit commun (18/11)", () => {
  const css = readFileSync(resolve(process.cwd(), "app/planotheque.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  it("rail fermé sans logo, chevron visible au survol et au focus seulement", () => {
    const side = readFileSync(resolve(process.cwd(), "components/Sidebar/Sidebar.tsx"), "utf8");
    expect(side).not.toContain("plano-rail-brand");
    expect(css).toMatch(/\.bpm-app-sidebar \.bpm-sidebar-toggle-btn \{\s*opacity: 0;/);
    expect(css).toMatch(/\.bpm-app-sidebar:hover \.bpm-sidebar-toggle-btn,[\s\S]*?:focus-visible \{\s*opacity: 1;\s*pointer-events: auto;/);
  });
  it("même ligne du haut et même pas d'entrée, rail fermé comme ouvert", () => {
    expect(css).toMatch(/\.bpm-app-sidebar \.bpm-sidebar-toggle-row \{\s*height: 52px;/);
    expect(css).toMatch(/\.bpm-app-sidebar \.bpm-sidebar-nav \.bpm-sidebar-item \{\s*height: 36px;/);
    expect(css).toMatch(/data-sidebar-collapsed="true"\] \.bpm-app-sidebar \.bpm-sidebar-nav \.bpm-sidebar-item \{\s*width: 36px;\s*min-width: 36px;\s*height: 36px;/);
  });
  it("toutes les pages : titres en Instrument Serif, sur-titres en Geist Mono", () => {
    const block = /\.site-hero h1,\s*\.doc-page-header h1,[^{]*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(block).toContain("font-family: var(--font-display);");
    const eyebrow = /\.site-eyebrow,[^{]*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(eyebrow).toContain("font-family: var(--font-code);");
    const nf = readFileSync(resolve(process.cwd(), "app/not-found.tsx"), "utf8");
    expect(nf).toContain('className="plano-notfound-title"');
  });
});

describe("accueil : même fond et même gouttière que les autres pages (19/11)", () => {
  it("aucun dégradé ni gouttière propre sur .plano-home", () => {
    const css = readFileSync(resolve(process.cwd(), "app/planotheque.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const rule = css.match(/\.plano-home \{([^}]*)\}/)?.[1] ?? "";
    expect(rule).not.toMatch(/gradient/);
    expect(css).toMatch(/\.app-main > \.plano-home \{\s*padding-left: 0;\s*padding-right: 0;/);
  });
});

describe("démo « Suivi commercial » : un nombre de commandes n'est pas un montant (19/11)", () => {
  it("la métrique Commandes ne porte pas la devise par défaut (EUR)", () => {
    const src = readFileSync(resolve(process.cwd(), "app/(app)/demo/page.tsx"), "utf8");
    expect(src).toMatch(/<Metric label=\{S\.metricOrders\}[^>]*currency=""/);
  });
});
