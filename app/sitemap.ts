import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://blueprint-modular.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/modules`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
}
