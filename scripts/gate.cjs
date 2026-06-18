#!/usr/bin/env node
/**
 * Convergence gate orchestrator.
 * Run from repo root: node scripts/gate.cjs
 *
 * Steps:
 *   a. tsc --noEmit (type check packages/core/src)
 *   b. vite build (build packages/core/dist + style.css)
 *   c. Doc sync check (llms.txt + bpm-components.json vs. committed)
 *   c ter. Catalogue convergence (catalogue MCP ≡ barrel bpm.* − internes)
 *   c quater. Couche sémantique — forme valide (bloquant) ; backlog curation (informatif)
 *   d. Smoke render tests (vitest — each bpm.* renders without throw)
 *   e. Prop-surface snapshot (vitest — prop names frozen vs. snapshot)
 */

"use strict";

const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const REPO_ROOT = path.resolve(__dirname, "..");
const CORE_DIR = path.join(REPO_ROOT, "packages", "core");

let exitCode = 0;

function step(label) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${label}`);
  console.log("─".repeat(60));
}

function run(cmd, opts = {}) {
  const { cwd = REPO_ROOT, label = cmd } = opts;
  try {
    execSync(cmd, {
      cwd,
      stdio: "inherit",
      env: { ...process.env },
    });
    console.log(`  ✓ ${label}`);
    return true;
  } catch (err) {
    console.error(`  ✗ FAIL: ${label}`);
    if (!opts.continueOnFail) exitCode = 1;
    return false;
  }
}

function runPython(script, opts = {}) {
  const { cwd = REPO_ROOT } = opts;
  const python = process.platform === "win32" ? "python" : "python3";
  const result = spawnSync(python, [path.join(REPO_ROOT, "scripts", script)], {
    cwd,
    stdio: "inherit",
    env: { ...process.env },
  });
  if (result.status !== 0) {
    console.error(`  ✗ FAIL: ${script}`);
    exitCode = 1;
    return false;
  }
  console.log(`  ✓ ${script}`);
  return true;
}

// ── Install dependencies ──────────────────────────────────────────────────────
step("Installing dependencies");
run("npm install", { cwd: CORE_DIR, label: "npm install (packages/core)" });
// React types at repo root so tsc can resolve them from components/bpm/*.tsx
// --no-save keeps package.json unchanged; --ignore-scripts skips postinstall (prisma etc.)
run(
  "npm install --no-save --ignore-scripts react react-dom @types/react @types/react-dom",
  { cwd: REPO_ROOT, label: "install minimal React types at root (tsc)" }
);

// ── Step a: Type check ────────────────────────────────────────────────────────
step("Step a — TypeScript type check (tsc --noEmit)");
run("npx tsc --noEmit", { cwd: CORE_DIR, label: "tsc --noEmit" });

// ── Step b: Build ─────────────────────────────────────────────────────────────
step("Step b — Library build (vite build)");
const buildOk = run("npm run build", { cwd: CORE_DIR, label: "vite build" });

// ── Step c: Doc sync ──────────────────────────────────────────────────────────
step("Step c — Doc sync check");
runPython("gate-docs-sync.py");

// ── Step c ter: Catalogue convergence ─────────────────────────────────────────
// Échoue si le catalogue MCP diverge de sa source TS (barrel bpm.tsx − internes).
// Empêche mécaniquement la désync 104↔154 corrigée en PR1 de se reproduire.
step("Step c ter — Catalogue convergence (catalogue ⊆ barrel TS)");
runPython("gate-catalogue-convergence.py");

// ── Step c quater: Forme de la couche sémantique ──────────────────────────────
// Valide la FORME des sémantiques présentes sur les 154 composants (rôle/frame/
// indicator/guidance/relations/status/câblage). BLOQUE sur forme invalide ;
// le backlog de curation (composants non curés) est exposé mais NON bloquant.
step("Step c quater — Couche sémantique (forme valide ; backlog visible)");
runPython("validate-semantics.py");

// ── Step c bis: Version consistency ──────────────────────────────────────────
// lib/generated/versions.json doit refléter pyproject.toml / core package.json / package.json.
step("Step c bis — Version consistency (versions.json à jour)");
run("node scripts/generate-versions.mjs --check", {
  cwd: REPO_ROOT,
  label: "versions.json vs sources",
});

// ── Steps d + e: Vitest (smoke + prop snapshot) ───────────────────────────────
step("Steps d+e — Smoke render + prop-surface snapshot (vitest)");
run("npx vitest run gate/", { cwd: CORE_DIR, label: "vitest gate/" });

// ── Step f: Garde secrets connecteurs ─────────────────────────────────────────
// Échoue si une VALEUR de secret est committée sous lib/connectors/**.
// Pur Node, aucune dépendance — la garde précède ce qu'elle garde (PR1).
step("Step f — Garde secrets connecteurs (lib/connectors/**)");
run("node scripts/check-connector-secrets.mjs", {
  cwd: REPO_ROOT,
  label: "check-connector-secrets.mjs",
});

// ── Step g: Tests du pilier Connecteurs (schéma + mapping) ────────────────────
// Tests racine, isolés à tests/connectors-* (n'entraînent pas prisma/next).
// On installe vitest + zod à la racine comme le gate le fait déjà pour React.
// vitest est ÉPINGLÉ sur ^2 (même major que packages/core) : vitest >=3 tire
// rolldown, dont le binding natif optionnel (@rolldown/binding-*) n'est pas
// installé de façon fiable par npm (bug npm/cli#4828) → « Cannot find native
// binding » en CI. vitest 2 n'a pas cette dépendance et suffit à ces tests.
step("Step g — Tests connecteurs (schéma + mapping)");
run(
  "npm install --no-save --ignore-scripts vitest@^2 zod",
  { cwd: REPO_ROOT, label: "install vitest + zod (tests connecteurs)" }
);
run("npx vitest run tests/connectors-*.test.ts", {
  cwd: REPO_ROOT,
  label: "vitest tests/connectors-*",
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
if (exitCode === 0) {
  console.log("  ✅  GATE GREEN — all checks passed");
} else {
  console.log("  ❌  GATE RED — one or more checks failed (see above)");
}
console.log("═".repeat(60) + "\n");

process.exit(exitCode);
