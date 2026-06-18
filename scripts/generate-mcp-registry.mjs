#!/usr/bin/env node
/**
 * Génère lib/generated/mcp-registry.json — la source de vérité consommée par le
 * connecteur MCP (app/api/mcp/route.ts).
 *
 * Le fichier est DÉRIVÉ (jamais écrit à la main) de trois artefacts :
 *   - lib/generated/bpm-components.json  → liste canonique (slug, name, description, category)
 *   - public/llms.txt                    → détail par composant (props, @example, @associated…)
 *   - lib/semantics/bpm-semantics.json   → couche sémantique CURÉE (rôle, frame Ω, indicateur,
 *                                          guidance agent) — valeurs proposées par la boucle,
 *                                          jamais figées sans curation humaine (voir lib/semantics/types.ts)
 *
 * Lancer depuis la racine du repo :
 *   node scripts/generate-mcp-registry.mjs
 *   (ou: npm run generate:mcp-registry)
 *
 * Régénérer après chaque mise à jour de bpm-components.json / llms.txt.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const COMPONENTS_JSON = path.join(REPO_ROOT, "lib", "generated", "bpm-components.json");
const LLMS_TXT = path.join(REPO_ROOT, "public", "llms.txt");
const SEMANTICS_JSON = path.join(REPO_ROOT, "lib", "semantics", "bpm-semantics.json");
const OUT_FILE = path.join(REPO_ROOT, "lib", "generated", "mcp-registry.json");

/** Texte de recherche dérivé de la couche sémantique (sens, pas rendu). */
function semanticHaystack(sem) {
  if (!sem) return "";
  const ind = sem.indicator;
  return [
    sem.semanticRole,
    sem.frame,
    ...(ind ? [...ind.indicatorType, ind.directionality, ind.temporality] : []),
    sem.agentGuidance?.use,
    ...(sem.agentGuidance?.pairWith ?? []),
    sem.agentGuidance?.avoid,
    ...(sem.contextHints ?? []),
    ...(sem.indicatorRelations ?? []).map((r) => `${r.type} ${r.target} ${r.note ?? ""}`),
  ]
    .filter(Boolean)
    .join(" ");
}

/** Extrait la valeur d'un tag @x d'une ligne de métadonnées jsdoc-like, jusqu'au prochain @tag. */
function extractTag(meta, tag) {
  const re = new RegExp(`@${tag}\\s+([\\s\\S]*?)(?=\\s+@[a-zA-Z]|$)`);
  const m = meta.match(re);
  return m ? m[1].trim() : undefined;
}

/** Parse public/llms.txt en map { "bpm.xxx": { props, example, fullDescription, associated, parent } }. */
function parseLlmsTxt(text) {
  const map = {};
  // Découpe sur les titres de section "## bpm.xxx"
  const parts = text.split(/^## (bpm\.\w+)\s*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i];
    const body = parts[i + 1] ?? "";

    // Bloc de props : premier bloc ``` ... ```
    const fence = body.match(/```[\s\S]*?\n([\s\S]*?)```/);
    const props = fence ? fence[1].trimEnd() : undefined;

    // Métadonnées : tout ce qui précède le bloc de code (contient les @tags sur une ligne)
    const meta = fence ? body.slice(0, body.indexOf("```")) : body;

    const example = extractTag(meta, "example");
    const fullDescription = extractTag(meta, "description");
    const associatedRaw = extractTag(meta, "associated");
    const parentRaw = extractTag(meta, "parent");

    const splitList = (s) =>
      s
        ? s
            .split(/[,\s]+/)
            .map((x) => x.trim())
            .filter((x) => x.startsWith("bpm."))
        : undefined;

    // Clé en minuscules : bpm-components.json et llms.txt diffèrent parfois
    // sur la casse (ex. bpm.jsonviewer vs bpm.jsonView­er, bpm.plotlychart vs bpm.plotlyChart).
    map[name.toLowerCase()] = {
      canonicalName: name,
      props,
      example,
      fullDescription,
      associated: splitList(associatedRaw),
      parent: splitList(parentRaw),
    };
  }
  return map;
}

function main() {
  const catalogue = JSON.parse(fs.readFileSync(COMPONENTS_JSON, "utf-8")).components;
  const detail = parseLlmsTxt(fs.readFileSync(LLMS_TXT, "utf-8"));
  const semantics = JSON.parse(fs.readFileSync(SEMANTICS_JSON, "utf-8")).components;

  let withProps = 0;
  let withExample = 0;
  let withSemantics = 0;

  const components = catalogue.map((c) => {
    const d = detail[c.name.toLowerCase()] ?? {};
    const sem = semantics[c.slug];
    if (d.props) withProps++;
    if (d.example) withExample++;
    if (sem) withSemantics++;
    // Tokens de recherche : nom + description + catégorie + props + exemple + sémantique.
    const haystack = [
      c.name,
      c.slug,
      c.description,
      c.category,
      d.fullDescription,
      d.props,
      d.example,
      ...(d.associated ?? []),
      semanticHaystack(sem),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return {
      slug: c.slug,
      name: c.name,
      description: c.description,
      category: c.category,
      // Statut de curation HONNÊTE, dérivé de la présence d'une couche sémantique.
      // "curated"   : le composant porte un bloc sémantique (frame Ω, guidance…).
      // "uncurated" : exposé (nom + description + props) mais sans sémantique —
      //               champ honnête, aucune guidance fabriquée (cf. semantics:null).
      status: sem ? "curated" : "uncurated",
      fullDescription: d.fullDescription,
      props: d.props,
      example: d.example,
      associated: d.associated,
      parent: d.parent,
      semantics: sem,
      _haystack: haystack,
    };
  });

  const categories = [...new Set(components.map((c) => c.category))].sort();

  const out = {
    generatedAt: new Date().toISOString(),
    source:
      "lib/generated/bpm-components.json + public/llms.txt + lib/semantics/bpm-semantics.json",
    total: components.length,
    categories,
    components,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf-8");

  console.log(
    `Wrote ${path.relative(REPO_ROOT, OUT_FILE)} — ${components.length} composants ` +
      `(${withSemantics} curated, ${components.length - withSemantics} uncurated ; ` +
      `${withProps} avec props, ${withExample} avec exemple), ` +
      `${categories.length} catégories.`,
  );
}

main();
