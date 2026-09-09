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


describe("contributions — rythme vertical et portée des styles", () => {
  const source = readFileSync(
    new URL("../components/site/ObjectContributions.tsx", import.meta.url),
    "utf8",
  );
  const css = readFileSync(
    new URL("../components/site/ObjectsCatalogue.module.css", import.meta.url),
    "utf8",
  );

  it("sépare explicitement la collection communautaire du formulaire", () => {
    expect(source).toContain("styles.communitySection");
    expect(source).toContain("styles.submissionSection");
    expect(source).toContain("styles.sectionIntro");
    expect(css).toMatch(/\.contribute\{[^}]*gap:56px/);
    expect(css).toMatch(/\.submissionSection\{[^}]*padding-top:48px/);
  });

  it("conserve un espace régulier entre libellés et champs, y compris sur mobile", () => {
    expect(css).toMatch(/\.contribute label\{[^}]*gap:10px/);
    expect(css).toMatch(/\.contribute form\{[^}]*row-gap:24px/);
    expect(css).toMatch(/@media\(max-width:700px\)[\s\S]*\.contribute form\{[^}]*row-gap:24px/);
  });

  it("ne recolore plus globalement les onglets de la communauté", () => {
    expect(source).toContain("styles.contributionButton");
    expect(css).not.toMatch(/(?:^|\n)\.contribute button\{/);
    expect(css).toContain(".tabs button{color:inherit;background:transparent}");
  });
});


describe("sections éditoriales — séparateurs homogènes", () => {
  const css = readFileSync(
    new URL("../components/site/ObjectsCatalogue.module.css", import.meta.url),
    "utf8",
  );

  it("sépare Enrichir la bibliothèque comme les autres parties majeures", () => {
    expect(css).toMatch(/\.sources\{[^}]*border-top:1px solid var\(--bpm-border/);
    expect(css).toMatch(/\.sources\{[^}]*padding-top:48px/);
  });
});
