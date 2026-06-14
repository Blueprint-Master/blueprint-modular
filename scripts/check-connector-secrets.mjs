#!/usr/bin/env node
/**
 * Garde CI du pilier Connecteurs — échoue (exit 1) si une VALEUR de secret est
 * committée sous lib/connectors/** (descripteurs, catalogue, fixtures).
 *
 * Principe (cf. docs/connecteurs/PLAN.md §8) : un descripteur ne porte que des CLÉS
 * de champ ; aucune valeur de secret ne doit exister dans le dépôt. Cette garde
 * scanne les fichiers du pilier pour :
 *   1. des motifs de secrets réels (clés Stripe/Slack/GitHub/AWS/Google, JWT, clés
 *      privées PEM, webhook Slack complet) ;
 *   2. une valeur non triviale affectée à une clé sensible (secret/token/password/…).
 *
 * Portée : lib/connectors/** UNIQUEMENT. Les fichiers de test (tests/**) contiennent
 * volontairement des chaînes en forme de secret pour vérifier le REJET — ils sont
 * hors périmètre. L'invariant structurel « pas de propriété `value` sur un champ »
 * est, lui, garanti par le schéma zod (.strict()) et ses tests.
 *
 * Pur Node, aucune dépendance — sûr à appeler depuis scripts/gate.cjs.
 */
"use strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
// Source canonique du contrat = packages/core/src/connectors (D3) ; lib/connectors
// ne contient plus que des ré-exports (scanné aussi, par sécurité).
const SCAN_ROOTS = [
  path.join(REPO_ROOT, "packages", "core", "src", "connectors"),
  path.join(REPO_ROOT, "lib", "connectors"),
];
const SCAN_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"]);

/** Motifs de secrets réels. Chaque entrée : { name, re }. */
const SECRET_PATTERNS = [
  { name: "Stripe secret key", re: /\bsk_(?:live|test)_[0-9A-Za-z]{16,}\b/ },
  { name: "Slack token", re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { name: "Slack incoming webhook (avec jeton)", re: /hooks\.slack\.com\/services\/T[0-9A-Z]+\/B[0-9A-Z]+\/[0-9A-Za-z]+/ },
  { name: "GitHub token", re: /\bgh[pousr]_[0-9A-Za-z]{30,}\b/ },
  { name: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Google API key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: "JWT", re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
  { name: "Clé privée PEM", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
];

/** Clé sensible affectée à une valeur littérale non triviale. */
const SENSITIVE_ASSIGN =
  /\b(secret|password|passwd|token|api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|webhook[_-]?url)\b\s*[:=]\s*["'`]([^"'`]{12,})["'`]/gi;

/** Valeurs qui sont manifestement des placeholders, pas des secrets. */
const PLACEHOLDER = /(process\.env|YOUR_|<[^>]+>|\{\{|exemple|example|placeholder|xxxx|\.\.\.|changeme|votre[_-])/i;

function walk(dir) {
  /** @type {string[]} */
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      out.push(...walk(full));
    } else if (SCAN_EXT.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

/** @type {{file:string, line:number, kind:string, snippet:string}[]} */
const findings = [];

for (const file of SCAN_ROOTS.flatMap((root) => walk(root))) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const rel = path.relative(REPO_ROOT, file);

  lines.forEach((line, idx) => {
    for (const { name, re } of SECRET_PATTERNS) {
      if (re.test(line)) {
        findings.push({ file: rel, line: idx + 1, kind: name, snippet: line.trim().slice(0, 120) });
      }
    }
    SENSITIVE_ASSIGN.lastIndex = 0;
    let m;
    while ((m = SENSITIVE_ASSIGN.exec(line)) !== null) {
      const value = m[2];
      if (!PLACEHOLDER.test(value)) {
        findings.push({
          file: rel,
          line: idx + 1,
          kind: `valeur affectée à une clé sensible (${m[1]})`,
          snippet: line.trim().slice(0, 120),
        });
      }
    }
  });
}

if (findings.length > 0) {
  console.error("\n  ✗ Garde secrets connecteurs — SECRET POTENTIEL DÉTECTÉ :\n");
  for (const f of findings) {
    console.error(`    ${f.file}:${f.line}  [${f.kind}]`);
    console.error(`      ${f.snippet}`);
  }
  console.error(
    "\n  Un descripteur ne porte que des CLÉS de champ (fields[].key), jamais de valeur.\n" +
      "  Les secrets sont résolus au runtime via vault.get() — voir docs/connecteurs/PLAN.md.\n"
  );
  process.exit(1);
}

console.log("  ✓ Garde secrets connecteurs — aucun secret committé sous lib/connectors/**");
process.exit(0);
