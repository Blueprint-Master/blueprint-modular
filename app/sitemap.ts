import type { MetadataRoute } from "next";

import registry from "@/lib/generated/bpm-components.json";
import { componentCanonical } from "@/lib/ficheMetadata";

// Origine canonique unique = apex (cohérent avec les canonical des pages).
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://blueprint-modular.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/presentation`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/manifeste`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/register`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/dashboard`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/composants`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/resources`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/mcp`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/docs/getting-started`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/modules`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/connecteurs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/modules/ia`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/modules/wiki`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/modules/veille`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/modules/auth`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/modules/contracts`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/modules/documents`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/modules/notification`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/sandbox`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/legal`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...registry.components.map(({ slug }) => ({ url: componentCanonical(slug) })),
  ];
}
