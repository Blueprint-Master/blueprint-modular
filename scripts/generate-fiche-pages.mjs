#!/usr/bin/env node
/**
 * Générateur structurel des pages de fiches composants.
 *
 * PROBLÈME : chaque `app/(app)/composants/<slug>/page.tsx` était un composant
 * 'use client' (démo interactive) — donc SANS `generateMetadata` possible →
 * 104 pages au `<title>` générique « Composants », sans canonical propre.
 *
 * CORRECTIF (à la couche, pas 104 éditions manuelles) : pour chaque fiche, on
 * déplace l'îlot interactif dans `Fiche.tsx` ('use client', INCHANGÉ — la démo
 * live est préservée à l'identique) et on (re)génère un `page.tsx` SERVEUR
 * uniforme qui exporte `metadata` (via `lib/ficheMetadata.ts`, depuis le
 * registre) et rend `<Fiche />`. Conforme au contrat « interactifs → fichier
 * 'use client' séparé ».
 *
 * Idempotent : si `Fiche.tsx` existe déjà, on régénère seulement le wrapper.
 * Usage : `node scripts/generate-fiche-pages.mjs`
 */
import { readdirSync, readFileSync, writeFileSync, renameSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "app/(app)/composants";

/** slug → identifiant de composant React (PascalCase, sûr pour un nom de fonction). */
function compName(slug) {
  const pascal = slug.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, "");
  return /^[A-Za-z]/.test(pascal) ? pascal : `C${pascal}`;
}

function wrapper(slug) {
  return `import type { Metadata } from "next";
import { ficheMetadata } from "@/lib/ficheMetadata";
import Fiche from "./Fiche";

// Page serveur générée (scripts/generate-fiche-pages.mjs) : porte la métadonnée
// SEO ; la démo interactive vit dans l'îlot client ./Fiche.tsx.
export const metadata: Metadata = ficheMetadata(${JSON.stringify(slug)});

export default function ${compName(slug)}FichePage() {
  return <Fiche />;
}
`;
}

const dirs = readdirSync(ROOT).filter((d) => {
  const p = join(ROOT, d);
  return statSync(p).isDirectory() && d !== "[slug]";
});

let migrated = 0;
let regenerated = 0;
let skipped = 0;
for (const slug of dirs) {
  const dir = join(ROOT, slug);
  const pagePath = join(dir, "page.tsx");
  const fichePath = join(dir, "Fiche.tsx");

  if (existsSync(fichePath)) {
    // Déjà migrée : on régénère seulement le wrapper serveur.
    writeFileSync(pagePath, wrapper(slug), "utf8");
    regenerated++;
    continue;
  }
  if (!existsSync(pagePath)) {
    skipped++;
    continue;
  }
  const src = readFileSync(pagePath, "utf8");
  const isClient = /^\s*["']use client["']/.test(src);
  if (!isClient) {
    // Déjà un composant serveur (rien à isoler) : on ne touche pas.
    skipped++;
    continue;
  }
  // Déplace l'îlot client INCHANGÉ vers Fiche.tsx, puis écrit la page serveur.
  renameSync(pagePath, fichePath);
  writeFileSync(pagePath, wrapper(slug), "utf8");
  migrated++;
}

console.log(`Fiches : ${migrated} migrées, ${regenerated} régénérées, ${skipped} ignorées (sur ${dirs.length} répertoires).`);
