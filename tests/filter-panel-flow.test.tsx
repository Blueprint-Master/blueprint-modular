/**
 * LE PANNEAU DE FILTRES CESSE D'EMPILER SES CHAMPS — le cliquet.
 *
 * ## Le fait, mesuré sur la critique vision de la production (14 j)
 *
 * Six constats, quatre formulations indépendantes :
 *
 * - « Le panneau de filtres occupe une zone disproportionnée (≈40 % de la
 *   hauteur utile) pour seulement deux champs » ;
 * - « occupe toute la largeur et repousse le tableau hors de l'écran, créant un
 *   désert visuel sans données visibles au premier regard » ;
 * - « ≈200 px de hauteur avec seulement deux champs centrés » ;
 * - « occupe une large zone centrale sans séparation visuelle claire ».
 *
 * ## La cause
 *
 * La branche `collapsible` rendait le cadre en `flexDirection: column` avec les
 * champs en enfants DIRECTS : chacun prenait sa ligne, pleine largeur. La
 * branche non repliable les fait couler en ligne — c'est la mise en page voulue.
 *
 * Et le Maker passe `collapsible: true` EN DUR sur toutes ses vues liste : la
 * branche empilée est la seule que la production connaisse.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FilterPanel } from "@/components/bpm/FilterPanel";

const DEUX_CHAMPS = [
  { key: "__q", label: "Recherche", type: "text" as const },
  {
    key: "statut",
    label: "Statut",
    type: "select" as const,
    options: [{ value: "a", label: "Ouvert" }],
  },
];

const rendu = (collapsible: boolean) =>
  renderToStaticMarkup(
    <FilterPanel
      filters={DEUX_CHAMPS}
      values={{}}
      onChange={() => {}}
      onReset={() => {}}
      collapsible={collapsible}
    />,
  );

/**
 * Les `flex-direction` dans l'ordre du DOM.
 *
 * ⚠️ Ils ne décrivent PAS que des conteneurs : chaque champ en porte un
 * (`column`, pour poser son libellé au-dessus de sa saisie). Une première
 * rédaction attendait `["row"]` seul sur la branche non repliable et mesurait
 * `["row","column","column"]` — le marqueur n'était pas ce que je croyais.
 * On compare donc la SÉQUENCE complète, où la position dit le rôle.
 */
function directions(html: string): string[] {
  return [...html.matchAll(/flex-direction:(\w+)/g)].map((m) => m[1]);
}

/**
 * Le CADRE, et lui seul : `--bpm-surface` n'est employé nulle part ailleurs
 * dans ce composant (les saisies prennent `--bpm-bg-primary`). Compter le filet
 * ou le remplissage ne marcherait pas — les `<input>` portent les mêmes.
 */
function cadres(html: string): number {
  return (html.match(/background:var\(--bpm-surface\)/g) ?? []).length;
}

describe("les champs COULENT, ils ne s'empilent pas", () => {
  it("repliable : cadre en COLONNE, puis contenu en RANGÉE", () => {
    /* La séquence dit tout : le cadre empile l'en-tête et le contenu ; le
       contenu fait couler les champs ; chaque champ pose son libellé au-dessus
       de sa saisie. Avant, la rangée n'existait pas — les deux `column` de
       queue étaient enfants directs du cadre, donc une ligne chacun. */
    expect(directions(rendu(true))).toEqual(["column", "row", "column", "column"]);
  });

  it("repliable : le contenu RETOURNE À LA LIGNE au lieu de déborder", () => {
    /* Sans `wrap`, quatre champs sortiraient du cadre au lieu de passer
       dessous — on échangerait un défaut de hauteur contre un de largeur. */
    expect(rendu(true)).toContain("flex-wrap:wrap");
  });

  it("la branche NON repliable est inchangée — cadre et flux au même endroit", () => {
    const html = rendu(false);
    expect(html).toContain("flex-wrap:wrap");
    /* Un seul conteneur porte le flux : on n'a pas déporté ce qui était déjà
       bon. Les deux `column` de queue sont les champs. */
    expect(directions(html)).toEqual(["row", "column", "column"]);
  });
});

describe("le CADRE ne bouge pas", () => {
  it("surface, filet, rayon et remplissage sont là dans les deux branches", () => {
    for (const collapsible of [true, false]) {
      const html = rendu(collapsible);
      expect(html, `collapsible=${collapsible}`).toContain("background:var(--bpm-surface)");
      expect(html, `collapsible=${collapsible}`).toContain("border:1px solid var(--bpm-border)");
      expect(html, `collapsible=${collapsible}`).toContain("border-radius:var(--bpm-radius)");
      expect(html, `collapsible=${collapsible}`).toContain("padding:12px");
    }
  });

  it("le cadre n'est PAS dupliqué dans la branche repliable", () => {
    /* Deux cadres imbriqués doubleraient le remplissage et dessineraient deux
       filets — l'inverse du défaut qu'on corrige. Compté sur `--bpm-surface`,
       le seul marqueur propre au cadre : filet et remplissage sont aussi portés
       par les `<input>`, et les compter rendait 3 au lieu de 1. */
    expect(cadres(rendu(true))).toBe(1);
    expect(cadres(rendu(false))).toBe(1);
  });
});

describe("l'en-tête de repli reste au-dessus", () => {
  it("le bouton de repli est rendu, et le contenu avec lui", () => {
    const html = rendu(true);
    expect(html).toContain("<button");
    expect(html).toContain("Statut");
  });
});
