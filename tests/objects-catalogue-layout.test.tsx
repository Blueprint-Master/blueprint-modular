import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/i18n/LocaleProvider", () => ({
  useI18n: () => ({ locale: "fr" }),
}));

import { ObjectsCatalogue } from "@/components/site/ObjectsCatalogue";

describe("catalogue Objets — parité de mise en page", () => {
  const html = renderToStaticMarkup(<ObjectsCatalogue />);

  it("emploie le hero partagé des catalogues", () => {
    expect(html).toContain('class="site-hero"');
    expect(html).toContain("<h1>Objets</h1>");
    expect(html).toContain(">CATALOGUE<");
    expect(html).toMatch(/\d+ objets/);
  });

  it("place le contenu dans la même section et les mêmes gouttières que Modules", () => {
    expect(html).toContain('class="site-section site-section-bordered"');
    expect(html).toContain('class="site-container"');
  });

  it("ne réintroduit pas un cadrage parallèle au gabarit partagé", () => {
    const css = readFileSync(
      new URL("../components/site/ObjectsCatalogue.module.css", import.meta.url),
      "utf8",
    );

    expect(css).not.toContain("max-width:1240px");
    expect(css).not.toContain("padding:clamp(20px,4vw,56px)");
  });
});
