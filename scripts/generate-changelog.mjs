#!/usr/bin/env node
/**
 * Génère lib/generated/changelog.json depuis l'historique git — plus aucune
 * saisie manuelle.
 *
 * Source : merges de PR sur la branche principale (first-parent). Chaque PR
 * mergée donne une entrée ; le type vient du préfixe conventional-commit
 * (feat/fix/perf/…). Les types purement internes (chore/ci/build/test/deps)
 * sont exclus — on ne garde que ce qui est visible produit.
 *
 * Regroupement :
 *   - par tag de version `vX.Y.Z` si des tags existent (convention à instaurer
 *     à chaque publication) ;
 *   - sinon par mois (backfill, état actuel : aucun tag).
 *
 * Régénéré au build (cf. package.json). Tolérant : si git est indisponible
 * (clone sans historique), conserve le fichier committé au lieu de l'écraser.
 *
 * Usage : node scripts/generate-changelog.mjs
 */

import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "generated", "changelog.json");

// Types conventional-commit purement internes (non visibles produit).
const EXCLUDED_TYPES = new Set(["chore", "ci", "build", "test", "deps", "release"]);

const REPO_URL = "https://github.com/Blueprint-Master/blueprint-modular";

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

/** Décompose un sujet « type(scope)!: titre » ; sinon type = "other". */
function parseConventional(subject) {
  const m = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/);
  if (m) {
    return { type: m[1].toLowerCase(), scope: m[2] || null, breaking: Boolean(m[3]), title: m[4].trim() };
  }
  return { type: "other", scope: null, breaking: false, title: subject.trim() };
}

/** Entrées { pr, date, type, scope, breaking, title, hash } depuis l'historique first-parent. */
function collectEntries() {
  const raw = git([
    "log",
    "--first-parent",
    "--date=short",
    "--pretty=format:%H%x1f%ad%x1f%s%x1f%b%x1e",
    "HEAD",
  ]);
  const records = raw.split("\x1e").map((s) => s.trim()).filter(Boolean);
  const entries = [];
  const seenPr = new Set();

  for (const rec of records) {
    const [hash, date, subject, body = ""] = rec.split("\x1f");
    let pr = null;
    let rawTitle = null;

    const merge = subject.match(/^Merge pull request #(\d+) from/);
    if (merge) {
      // Vieux style : le titre réel (conventional) est la 1re ligne du corps.
      pr = Number(merge[1]);
      const firstBodyLine = body.split("\n").map((l) => l.trim()).find(Boolean);
      rawTitle = firstBodyLine || subject;
    } else {
      // Style squash : « titre (#NN) ».
      const squash = subject.match(/\(#(\d+)\)\s*$/);
      if (squash) {
        pr = Number(squash[1]);
        rawTitle = subject.replace(/\s*\(#\d+\)\s*$/, "").trim();
      }
    }

    if (!pr || !rawTitle || seenPr.has(pr)) continue; // uniquement les PR mergées, dédupliquées
    seenPr.add(pr);

    const { type, scope, breaking, title } = parseConventional(rawTitle);
    if (EXCLUDED_TYPES.has(type)) continue;

    entries.push({ pr, date, type, scope, breaking, title, hash: hash.slice(0, 9) });
  }
  return entries;
}

/** Tags de version vX.Y.Z, du plus récent au plus ancien, avec leur date. */
function versionTags() {
  let out = "";
  try {
    out = git(["for-each-ref", "--sort=-creatordate", "--format=%(refname:short)|%(creatordate:short)", "refs/tags/v*"]);
  } catch {
    return [];
  }
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name, date] = l.split("|");
      return { name, date };
    });
}

/** Regroupe par tag de version si possible, sinon par mois (YYYY-MM). */
function group(entries) {
  const tags = versionTags();

  if (tags.length > 0) {
    // Un tag = une version. L'entrée appartient à la 1re version publiée à/après sa date.
    const ordered = [...tags].sort((a, b) => a.date.localeCompare(b.date)); // ancien → récent
    const groups = new Map(ordered.map((t) => [t.name, { key: t.name, label: t.name, date: t.date, entries: [] }]));
    const unreleased = { key: "unreleased", label: "unreleased", date: "9999-99-99", entries: [] };

    for (const e of entries) {
      const target = ordered.find((t) => t.date >= e.date);
      (target ? groups.get(target.name) : unreleased).entries.push(e);
    }
    const result = [...(unreleased.entries.length ? [unreleased] : []), ...[...groups.values()].reverse()];
    return { grouping: "version", groups: result.filter((g) => g.entries.length) };
  }

  // Backfill : aucun tag → regroupement par mois.
  const byMonth = new Map();
  for (const e of entries) {
    const key = e.date.slice(0, 7); // YYYY-MM
    if (!byMonth.has(key)) byMonth.set(key, { key, label: key, date: key, entries: [] });
    byMonth.get(key).entries.push(e);
  }
  const groups = [...byMonth.values()].sort((a, b) => b.key.localeCompare(a.key)); // récent → ancien
  return { grouping: "month", groups };
}

function main() {
  let entries;
  try {
    entries = collectEntries();
  } catch (err) {
    if (existsSync(OUT)) {
      console.warn(`⚠ git indisponible (${err.message}) — changelog.json committé conservé.`);
      return;
    }
    throw err;
  }

  const { grouping, groups } = group(entries);
  const payload = {
    generatedFrom: "git first-parent (merges de PR)",
    repoUrl: REPO_URL,
    grouping,
    totalEntries: entries.length,
    groups,
  };
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Écrit ${relative(ROOT, OUT)} : ${entries.length} entrées, ${groups.length} groupes (${grouping}).`);
}

main();
