import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("./", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
const stamp = new URL("BUILD-REVISION", root);
function sourceCommit() {
  if (existsSync(stamp)) {
    const revision = readFileSync(stamp, "utf8").trim();
    if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(revision)) throw new Error("Invalid BUILD-REVISION");
    return revision;
  }
  if (existsSync(new URL(".git", root))) {
    try {
      return execFileSync("git", ["rev-parse", "HEAD"], { cwd: fileURLToPath(root), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch { /* Source copies can be built without a Git executable. */ }
  }
  return "";
}

// Racine EXPLICITE (#267) : sans elle, Next remonte jusqu'au premier package-lock.json
// trouvé (/home/ubuntu/package-lock.json sur bpm-prod) et imbrique la sortie
// standalone sous le chemin relatif (« Build standalone introuvable », 19/11).
const rootDir = fileURLToPath(root);

/** @type {import('next').NextConfig} */
// Cache-buster favicon à chaque build (force le rafraîchissement navigateur)
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: rootDir,
  turbopack: { root: rootDir },
  env: {
    MODULAR_SOURCE_COMMIT: sourceCommit(),
    MODULAR_PACKAGE_VERSION: manifest.version,
    NEXT_PUBLIC_FAVICON_V: String(Date.now()),
  },
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/img/logo-bpm.png" },
    ];
  },
  async redirects() {
    return [
      { source: "/docs/components", destination: "/composants", permanent: true },
      { source: "/docs/components/:slug", destination: "/composants/:slug", permanent: true },
      { source: "/components", destination: "/composants", permanent: true },
      // Dédoublonnage fiches (P-DEDUP) : alias sans composant distinct ni entrée
      // au registre → fiche canonique. Les redirects priment sur le routage fichier
      // (la fiche alias devient inatteignable, sans suppression de fichier).
      { source: "/composants/altair", destination: "/composants/altairchart", permanent: true },
      { source: "/composants/plotly", destination: "/composants/plotlychart", permanent: true },
      { source: "/composants/pdf", destination: "/composants/pdfviewer", permanent: true },
      // Fusion des deux fiches highlight-box → fiche canonique unique (highlightbox).
      { source: "/composants/highlight-box", destination: "/composants/highlightbox", permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // Limite body pour les Route Handlers (proxy / upload) — défaut 10 Mo, 413 au-delà (ex. import PPTX Monitor)
    proxyClientMaxBodySize: "100mb",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
