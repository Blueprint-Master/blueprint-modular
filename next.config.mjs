import { fileURLToPath } from "node:url";

// Racine EXPLICITE : sans elle, Next remonte jusqu'au premier package-lock.json
// trouvé (/home/ubuntu/package-lock.json sur bpm-prod) et imbrique la sortie
// standalone sous le chemin relatif. La prod n'y échappait que parce que son
// dossier s'appelle blueprint-modular (cas prévu par run-app.sh) ; constaté le
// 19/11 en préproduction (« Build standalone introuvable »).
const root = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
// Cache-buster favicon à chaque build (force le rafraîchissement navigateur)
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: root,
  turbopack: { root },
  env: {
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
