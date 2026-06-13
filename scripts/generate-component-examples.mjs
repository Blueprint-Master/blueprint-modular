#!/usr/bin/env node
/**
 * Génère lib/generated/component-examples.json : carte légère { slug → exemple }
 * dérivée de lib/generated/mcp-registry.json (champ `example`, lui-même issu de
 * llms.txt). Source unique, zéro maintenance — la galerie /components importe ce
 * fichier (4 Ko) plutôt que le registre complet (224 Ko) pour ne pas alourdir le
 * bundle client.
 *
 * Usage : node scripts/generate-component-examples.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "lib", "generated", "mcp-registry.json");
const OUT = join(ROOT, "lib", "generated", "component-examples.json");

const registry = JSON.parse(readFileSync(SRC, "utf8"));
const components = registry.components ?? [];

const examples = {};
const missing = [];
for (const c of components) {
  if (typeof c.example === "string" && c.example.trim()) {
    examples[c.slug] = c.example.trim();
  } else {
    missing.push(c.slug);
  }
}

// Ordre stable (par slug) pour un diff déterministe.
const ordered = Object.fromEntries(Object.keys(examples).sort().map((k) => [k, examples[k]]));
writeFileSync(OUT, JSON.stringify(ordered, null, 2) + "\n");

console.log(
  `Écrit ${relative(ROOT, OUT)} : ${Object.keys(ordered).length} exemples ` +
    `(${missing.length} composants sans exemple).`
);
