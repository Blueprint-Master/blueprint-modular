/**
 * La signature de la planothèque : chaque pièce a le dessin de SA forme.
 *
 * - tout composant du registre reçoit un archétype (la table explicite couvre
 *   le registre ; un composant ajouté sans entrée retombe sur les motifs, puis
 *   sur sa famille, et ce test le nomme) ;
 * - chaque archétype dessiné sert au moins une pièce ;
 * - les quatre pièces de l'accueil ont quatre dessins DIFFÉRENTS ;
 * - `plano-key-props.json` est DÉRIVÉ du registre MCP, jamais tenu à la main.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import registry from "@/lib/generated/bpm-components.json";
import mcp from "@/lib/generated/mcp-registry.json";
import keyProps from "@/lib/generated/plano-key-props.json";
import { ARCHETYPES, archetypeOf, explicitSlugs, keyPropsFrom } from "@/lib/plano/archetypes";
import { featured } from "@/lib/plano/families";

describe("archétypes de forme", () => {
  it("la table explicite couvre tout le registre", () => {
    const explicit = new Set(explicitSlugs());
    const absents = registry.components.map((c) => c.slug).filter((s) => !explicit.has(s));
    expect(absents).toEqual([]);
  });

  it("la table ne cite aucun composant inexistant", () => {
    const slugs = new Set(registry.components.map((c) => c.slug));
    const fantomes = explicitSlugs().filter((s) => !slugs.has(s));
    expect(fantomes).toEqual([]);
  });

  it("une vingtaine d'archétypes au moins, chacun dessiné et employé", () => {
    expect(ARCHETYPES.length).toBeGreaterThanOrEqual(20);
    const used = new Set(registry.components.map((c) => archetypeOf(c.slug)));
    expect(ARCHETYPES.filter((a) => !used.has(a))).toEqual([]);
    const drawing = readFileSync(resolve(__dirname, "../components/plano/ArchetypeDrawing.tsx"), "utf8");
    for (const a of ARCHETYPES) expect(drawing, a).toContain(`case "${a}":`);
  });

  it("les pièces de l'accueil ont des dessins différents", () => {
    const shapes = featured(registry.components, 4).map((c) => archetypeOf(c.slug));
    expect(new Set(shapes).size).toBe(4);
    expect(shapes).toEqual(["metrique", "etapes", "jauge", "tableau"]);
  });

  it("un composant inconnu suit les motifs de son nom, sinon rien", () => {
    expect(archetypeOf("kpiwall")).toBe("metrique");
    expect(archetypeOf("zzz")).toBeNull();
  });
});

describe("props clés", () => {
  it("lit les requises d'abord, sans handlers ni className", () => {
    const props = "  label*: string  — x\n  onClick?: () => void\n  className?: string\n  delta?: number\n  value*: number";
    expect(keyPropsFrom(props)).toEqual(["label", "value", "delta"]);
    expect(keyPropsFrom(undefined)).toEqual([]);
  });

  it("plano-key-props.json est à jour avec le registre MCP", () => {
    const derived: Record<string, string[]> = {};
    for (const c of mcp.components as { slug: string; props?: string }[]) {
      const k = keyPropsFrom(c.props);
      if (k.length) derived[c.slug] = k;
    }
    expect(keyProps).toEqual(derived);
  });

  it("la métrique annonce label · value · delta", () => {
    expect((keyProps as Record<string, string[]>).metric).toEqual(["label", "value", "delta"]);
  });
});
