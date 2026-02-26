#!/usr/bin/env node
/**
 * Supprime les caches de build non nécessaires pour libérer de l'espace
 * et éviter des builds obsolètes (Next.js, ESLint, TypeScript, etc.).
 * Usage: node scripts/clear-cache.cjs ou npm run clean
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dirs = [
  ".next",
  path.join("node_modules", ".cache"),
  ".turbo",
];

function rmDir(p) {
  const full = path.join(root, p);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true });
    console.log("Supprimé:", p);
    return true;
  }
  return false;
}

function rmTsbuildinfo() {
  try {
    const files = fs.readdirSync(root);
    let removed = 0;
    for (const f of files) {
      if (f.endsWith(".tsbuildinfo")) {
        fs.rmSync(path.join(root, f), { force: true });
        console.log("Supprimé:", f);
        removed++;
      }
    }
    return removed > 0;
  } catch {
    return false;
  }
}

let removed = 0;
for (const d of dirs) {
  if (rmDir(d)) removed++;
}
if (rmTsbuildinfo()) removed++;

if (removed === 0) {
  console.log("Aucun cache à supprimer.");
} else {
  console.log("Cache nettoyé. Relancez « npm run build » ou « npm run dev » si besoin.");
}
