#!/usr/bin/env node
/**
 * Dérive les versions RÉELLES par surface livrable vers lib/generated/versions.json.
 *
 * Sources de vérité (une par surface — jamais de numéro saisi ailleurs) :
 *   - app    : package.json (version interne de l'application Next.js)
 *   - python : pyproject.toml (paquet PyPI « blueprint-modular »)
 *   - core   : packages/core/package.json (paquet npm « @blueprint-modular/core »)
 *
 * Le site et llms.txt lisent CE fichier — plus aucune version codée en dur.
 *
 * Usage :
 *   node scripts/generate-versions.mjs           # (re)génère le fichier
 *   node scripts/generate-versions.mjs --check    # échoue si le fichier est périmé (CI/gate)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "generated", "versions.json");

const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

function jsonVersion(rel) {
  const v = JSON.parse(read(rel)).version;
  if (!v) throw new Error(`Champ "version" absent de ${rel}`);
  return v;
}

function tomlVersion(rel) {
  // Première clé `version = "x.y.z"` du fichier (section [project]).
  const m = read(rel).match(/^version\s*=\s*"([^"]+)"/m);
  if (!m) throw new Error(`Clé version introuvable dans ${rel}`);
  return m[1];
}

function derive() {
  return {
    app: jsonVersion("package.json"),
    python: tomlVersion("pyproject.toml"),
    core: jsonVersion("packages/core/package.json"),
  };
}

const versions = derive();
const serialized = JSON.stringify(versions, null, 2) + "\n";

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    /* fichier absent : périmé */
  }
  if (current !== serialized) {
    console.error(
      `✗ ${relative(ROOT, OUT)} est périmé.\n  Attendu : ${JSON.stringify(versions)}\n  Lancez : npm run generate:versions`
    );
    process.exit(1);
  }
  console.log(`✓ ${relative(ROOT, OUT)} à jour (${JSON.stringify(versions)})`);
} else {
  writeFileSync(OUT, serialized);
  console.log(`Écrit ${relative(ROOT, OUT)} :`, versions);
}
