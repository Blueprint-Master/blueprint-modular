/**
 * L'ONGLET ACTIF PORTE UN REPÈRE STRUCTUREL — le cliquet.
 *
 * ## Le fait, mesuré sur la critique vision de la production (14 j)
 *
 * « l'onglet actif n'est pas visuellement distingué des autres » revient
 * **11 fois**, sous trois formulations, et c'est la famille de défaut la plus
 * fréquente de l'écran Paramètres — lequel est émis DÉTERMINISTEMENT dans toute
 * app non-note, donc identique partout.
 *
 * L'actif n'était marqué que par `color: var(--bpm-accent)` et une graisse. Sur
 * une charte où l'accent est proche de l'encre, l'écart est imperceptible ; il
 * l'est aussi pour un daltonien. Toutes les références de la typologie
 * (Material, GitHub, VS Code, onglets de navigateur) marquent l'actif par un
 * TRAIT, pas par une teinte — on transcrit le geste, on ne le conçoit pas.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Tabs } from "@/components/bpm/Tabs";

const ONGLETS = [
  { label: "Compte", content: <span>c</span> },
  { label: "Apparence", content: <span>a</span> },
  { label: "Données", content: <span>d</span> },
];

/**
 * Rendu SERVEUR (convention du dépôt : `environment: "node"`), puis lecture des
 * `<button role="tab">` par leur balise ouvrante. On lit le HTML RÉELLEMENT
 * produit — un test sur les props du composant prouverait qu'on a écrit un
 * attribut, jamais qu'il atteint la page.
 */
function boutons(defaultTab: number): string[] {
  const html = renderToStaticMarkup(<Tabs tabs={ONGLETS} defaultTab={defaultTab} />);
  return [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map((m) => m[0]);
}

function markup(defaultTab: number): string {
  return renderToStaticMarkup(<Tabs tabs={ONGLETS} defaultTab={defaultTab} />);
}

describe("le repère est STRUCTUREL, pas seulement coloré", () => {
  it("l'onglet actif porte un trait ; les autres non", () => {
    const [compte, apparence, donnees] = boutons(1);
    expect(apparence).toContain("border-bottom:2px solid var(--bpm-accent)");
    for (const inactif of [compte, donnees]) {
      expect(inactif).toContain("border-bottom:2px solid transparent");
    }
  });

  it("les inactifs portent le MÊME trait, transparent — sinon les libellés sautent", () => {
    /* Sans trait transparent sur les inactifs, la boîte de l'actif est 2 px plus
       haute : chaque changement d'onglet déplacerait toute la rangée. */
    const epaisseurs = boutons(0).map(
      (b) => /border-bottom:(\d+px)/.exec(b)?.[1] ?? "absent",
    );
    expect(epaisseurs).toEqual(["2px", "2px", "2px"]);
  });

  it("le trait suit la CHARTE — jamais une couleur littérale", () => {
    /* Un trait codé en dur jurerait sur 101 chartes. */
    for (const b of boutons(0)) {
      const trait = /border-bottom:[^;"]+/.exec(b)?.[0] ?? "";
      expect(trait).not.toMatch(/#[0-9a-f]{3,8}/i);
      expect(trait).not.toMatch(/\brgba?\(/i);
    }
  });

  it("le trait CHEVAUCHE le filet du conteneur au lieu de s'empiler dessous", () => {
    for (const b of boutons(0)) expect(b).toContain("margin-bottom:-1px");
  });
});

describe("la couleur reste, elle n'est plus SEULE", () => {
  it("l'actif garde l'encre d'accent et la graisse", () => {
    const actif = boutons(2)[2];
    expect(actif).toContain("color:var(--bpm-accent)");
    expect(actif).toContain("bpm-tab-active");
    expect(actif).toContain("font-medium");
  });
});

describe("l'onglet actif est aussi ANNONCÉ — pas seulement peint", () => {
  it("`role=tablist` / `role=tab` / `aria-selected` sont posés", () => {
    /* Avant, un lecteur d'écran ne pouvait pas davantage dire quel onglet était
       actif : le défaut visuel avait un jumeau invisible. */
    expect(markup(1)).toContain('role="tablist"');
    const etats = boutons(1).map((b) => /aria-selected="(\w+)"/.exec(b)?.[1]);
    expect(etats).toEqual(["false", "true", "false"]);
  });

  it("un seul onglet est sélectionné à la fois", () => {
    expect(boutons(0).filter((b) => b.includes('aria-selected="true"'))).toHaveLength(1);
  });
});
