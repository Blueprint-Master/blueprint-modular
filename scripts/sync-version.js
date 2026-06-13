#!/usr/bin/env node
/**
 * Synchronisation des versions — flux UNIDIRECTIONNEL et correct.
 *
 * Chaque surface a sa propre source de vérité (cf. scripts/generate-versions.mjs) :
 *   - Python : pyproject.toml          → propage vers bpm/__init__.py
 *   - npm    : packages/core/package.json (autonome, rien à propager)
 *   - app    : package.json racine     (autonome)
 *
 * Ce script NE touche PLUS pyproject.toml et n'injecte JAMAIS la version du site
 * dans le paquet Python (ancien comportement = numéro fantôme). Il se contente
 * d'aligner bpm/__init__.py sur pyproject.toml, puis de régénérer le fichier
 * dérivé lu par le site (lib/generated/versions.json).
 *
 * Usage : node scripts/sync-version.js
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

// 1. Source Python = pyproject.toml
const pyproject = fs.readFileSync(path.join(ROOT, "pyproject.toml"), "utf8");
const m = pyproject.match(/^version\s*=\s*"([^"]+)"/m);
if (!m) {
  console.error("pyproject.toml : clé version introuvable.");
  process.exit(1);
}
const pythonVersion = m[1];
console.log("Version Python (source pyproject.toml) :", pythonVersion);

// 2. Propagation pyproject.toml → bpm/__init__.py
const bpmInitPath = path.join(ROOT, "bpm", "__init__.py");
const bpmInit = fs.readFileSync(bpmInitPath, "utf8");
const updated = bpmInit.replace(/^__version__\s*=\s*"[^"]*"/m, `__version__ = "${pythonVersion}"`);
if (updated !== bpmInit) {
  fs.writeFileSync(bpmInitPath, updated);
  console.log("  → bpm/__init__.py aligné sur pyproject.toml");
} else {
  console.log("  → bpm/__init__.py déjà à jour");
}

// 3. Régénère le fichier dérivé lu par le site + llms.txt
execFileSync("node", [path.join(ROOT, "scripts", "generate-versions.mjs")], { stdio: "inherit" });

console.log("Sync version terminé.");
