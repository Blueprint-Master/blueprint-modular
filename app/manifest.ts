import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blueprint Modular",
    short_name: "Blueprint Modular",
    description: "App Blueprint Modular — Wiki, modules, sandbox, paramètres.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay"],
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "fr",
    icons: [
      {
        src: "/img/logo-bpm.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/img/logo-bpm.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["developer-tools", "productivity", "business"],
    shortcuts: [
      { name: "Sandbox", short_name: "Sandbox", url: "/sandbox", description: "Tester les composants BPM" },
      { name: "Composants", short_name: "Composants", url: "/docs/components", description: "Catalogue des composants BPM" },
      { name: "Modules", short_name: "Modules", url: "/modules", description: "Modules prêts à l'emploi" },
    ],
  };
}
