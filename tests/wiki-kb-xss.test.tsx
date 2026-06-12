/**
 * Stored XSS — rendu de contenu utilisateur (T1_BACKLOG #2b).
 *
 * Deux surfaces étaient vulnérables (contenu utilisateur concaténé dans du
 * HTML puis injecté via `dangerouslySetInnerHTML`) :
 *   1. rendu d'un article de la base de connaissances (asset-manager)
 *   2. surlignage des résultats de recherche wiki (titre + extrait)
 *
 * On rend ici le chemin de rendu RÉEL (via `renderToStaticMarkup`) et l'on
 * prouve qu'une charge active reste inerte : aucune balise `<script>`,
 * `<img>`, `<svg>` vivante ni attribut événementiel `onerror=`/`onload=` ne
 * survit — tout est échappé en entités HTML.
 */
import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/components/bpm/Markdown";
import { HighlightedText } from "@/components/wiki/HighlightedText";
import { splitHighlight } from "@/lib/wiki/highlight";

/**
 * Vérifie qu'aucune balise/attribut actif n'a survécu au rendu. Les charges
 * échappées (`&lt;img … onerror=…&gt;`) sont inertes : le `<` ouvrant est une
 * entité, donc aucune balise réelle ni gestionnaire d'évènement n'existe.
 */
function expectInert(html: string) {
  // Aucune balise dangereuse vivante (le `<` n'a pas été échappé).
  expect(html).not.toMatch(/<script/i);
  expect(html).not.toMatch(/<img/i);
  expect(html).not.toMatch(/<svg/i);
  expect(html).not.toMatch(/<iframe/i);
  // Aucun gestionnaire d'évènement (`on…=`) à l'intérieur d'une balise ouvrante
  // réelle. Le texte échappé n'ouvre pas de balise, il ne peut donc pas matcher.
  expect(html).not.toMatch(/<[a-zA-Z][^>]*\son\w+=/);
}

const PAYLOADS = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(2)</script>',
  '<svg onload=alert(3)></svg>',
  '<iframe src="javascript:alert(4)"></iframe>',
];

describe("#2b — article base de connaissances : rendu Markdown inerte", () => {
  it("neutralise toutes les charges HTML brutes", () => {
    const content = PAYLOADS.join("\n\n");
    const html = renderToStaticMarkup(React.createElement(Markdown, { text: content }));
    expectInert(html);
    // Les charges survivent uniquement sous forme échappée (donc inertes).
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img");
  });

  it("préserve le formatage Markdown légitime", () => {
    const html = renderToStaticMarkup(
      React.createElement(Markdown, { text: "## Titre\n\n**gras** et *italique*" })
    );
    expect(html).toContain("<strong>gras</strong>");
    expect(html).toContain("<em>italique</em>");
    expect(html).toMatch(/<h2[^>]*>Titre<\/h2>/);
  });
});

describe("#2b — surlignage recherche wiki : échappement avant balisage", () => {
  it("rend inerte une charge stockée dans le titre/extrait", () => {
    for (const payload of PAYLOADS) {
      const html = renderToStaticMarkup(
        React.createElement(HighlightedText, { text: `Doc ${payload}`, term: "Doc" })
      );
      expectInert(html);
      expect(html).toContain("<mark"); // le terme légitime est bien surligné
    }
  });

  it("rend inerte une charge passée comme TERME de recherche", () => {
    const term = '<img src=x onerror=alert(1)>';
    const html = renderToStaticMarkup(
      React.createElement(HighlightedText, { text: `avant ${term} apres`, term })
    );
    expectInert(html);
  });

  it("surligne le terme légitime sans HTML parasite", () => {
    const html = renderToStaticMarkup(
      React.createElement(HighlightedText, { text: "Guide réseau interne", term: "réseau" })
    );
    expect(html).toContain("<mark");
    expect(html).toContain("réseau");
  });

  it("splitHighlight ne produit que des segments de texte brut", () => {
    const segments = splitHighlight("a <script>alert(1)</script> b", "script");
    // Aucun segment n'est du HTML : la reconstruction redonne le texte original.
    expect(segments.map((s) => s.text).join("")).toBe("a <script>alert(1)</script> b");
    // Le terme est bien repéré pour le surlignage.
    expect(segments.some((s) => s.match && s.text.toLowerCase() === "script")).toBe(true);
  });
});
