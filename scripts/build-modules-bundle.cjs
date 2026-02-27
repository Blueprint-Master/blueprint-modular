#!/usr/bin/env node
/**
 * Génère un zip "blueprint-modules" (modules UI + components/bpm + lib + prisma)
 * pour que tout développeur puisse intégrer Blueprint sans accès au dépôt Git.
 *
 * Usage: node scripts/build-modules-bundle.cjs
 * Sortie: frontend/static/downloads/blueprint-modules-vX.Y.Z.zip et blueprint-modules-latest.zip
 */

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const ROOT = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const version = pkg.version || "0.0.0";
const OUT_DIR = path.join(ROOT, "frontend", "static", "downloads");
const ZIP_NAME = `blueprint-modules-v${version}.zip`;
const ZIP_LATEST = "blueprint-modules-latest.zip";

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const zipPath = path.join(OUT_DIR, ZIP_NAME);
const zipLatestPath = path.join(OUT_DIR, ZIP_LATEST);

const archive = archiver("zip", { zlib: { level: 9 } });
const out = fs.createWriteStream(zipPath);

out.on("close", () => {
  fs.copyFileSync(zipPath, zipLatestPath);
  console.log(`  → ${ZIP_NAME} (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  → ${ZIP_LATEST} (copie)`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(out);

// Ajouter un README dans le zip
const readme = `# Blueprint Modular — Bundle modules et composants (v${version})

Ce bundle contient les modules métier, composants BPM et dépendances nécessaires pour intégrer Blueprint dans votre application, **sans accès au dépôt Git**.

## Contenu

- \`modules/\` — Tous les modules (app/(app)/modules) : asset-manager, wiki, documents, contracts, newsletter, ia, etc.
- \`components/bpm/\` — Design system BPM (Panel, Button, Table, Badge, etc.)
- \`lib/\` — Bibliothèques partagées (auth, prisma, ai, asset-manager, wiki, etc.)
- \`prisma/\` — Schéma et migrations (à fusionner avec votre schema.prisma)

## Utilisation

1. Téléchargez ce zip depuis : https://docs.blueprint-modular.com/downloads/blueprint-modules-latest.zip
2. Décompressez dans un répertoire temporaire.
3. Copiez les dossiers dans votre projet :
   - \`modules/*\` → votre \`app/(app)/modules/blueprint/\` (ou équivalent)
   - \`components/bpm/\` → votre \`components/bpm/\`
   - \`lib/*\` → votre \`lib/\` (fusionnez avec vos fichiers existants)
   - \`prisma/schema.prisma\` → fusionnez les modèles dans votre schema.prisma (voir docs/DATABASE.md)
4. Installez les dépendances npm si besoin (lucide-react, etc.) et exécutez \`npx prisma generate\`.

Documentation complète : https://docs.blueprint-modular.com/get-started/integration.html

## Licence et propriété intellectuelle

Ce bundle est fourni sous licence MIT. Vous pouvez utiliser, modifier et intégrer le code dans vos projets (y compris commerciaux). Vous restez propriétaire de votre propre code ; la notice de licence et le copyright Blueprint Modular doivent être conservés sur les fichiers réutilisés. Détails : https://docs.blueprint-modular.com/get-started/integration.html#propriete-intellectuelle
`;

archive.append(readme, { name: "README-BUNDLE.md" });

function addDirToArchive(archive, localDir, zipPrefix) {
  if (!fs.existsSync(localDir)) return;
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(localDir, e.name);
    const name = path.join(zipPrefix, e.name);
    if (e.isDirectory()) {
      addDirToArchive(archive, full, name);
    } else {
      archive.file(full, { name });
    }
  }
}

// modules (app/(app)/modules)
const appModules = path.join(ROOT, "app", "(app)", "modules");
if (fs.existsSync(appModules)) {
  addDirToArchive(archive, appModules, "modules");
}

// components/bpm
const bpmComponents = path.join(ROOT, "components", "bpm");
if (fs.existsSync(bpmComponents)) {
  addDirToArchive(archive, bpmComponents, "components/bpm");
}

// lib (fichiers et dossiers utiles)
const libDir = path.join(ROOT, "lib");
if (fs.existsSync(libDir)) {
  addDirToArchive(archive, libDir, "lib");
}

// prisma
const prismaDir = path.join(ROOT, "prisma");
if (fs.existsSync(prismaDir)) {
  addDirToArchive(archive, prismaDir, "prisma");
}

// Extrait des règles CSS BPM (extrait de globals.css pour .bpm-*, .asset-manager-page, variables --bpm-*)
const globalsCssPath = path.join(ROOT, "app", "globals.css");
if (fs.existsSync(globalsCssPath)) {
  archive.file(globalsCssPath, { name: "globals-bpm-reference.css" });
}

archive.finalize();
