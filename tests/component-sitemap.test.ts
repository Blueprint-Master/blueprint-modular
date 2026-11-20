import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import registry from "@/lib/generated/bpm-components.json";
import { ficheMetadata } from "@/lib/ficheMetadata";

it("lists the canonical URL of each catalogue detail exactly once", () => {
  const urls = sitemap().map(entry => entry.url);
  for (const { slug } of registry.components) {
    const canonical = ficheMetadata(slug).alternates?.canonical;
    expect(urls.filter(url => url === canonical), slug).toHaveLength(1);
  }
});

it("advertises the catalogue's canonical host in robots.txt", () => {
  const robots = readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8");
  const detail = String(ficheMetadata(registry.components[0].slug).alternates?.canonical);
  expect(robots.split(/\r?\n/)).toContain(`Sitemap: ${new URL("/sitemap.xml", detail).href}`);
});
