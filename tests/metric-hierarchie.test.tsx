/**
 * LA VALEUR D'UNE MÉTRIQUE EST LE CHIFFRE QU'ON LIT — elle en avait à peine l'air.
 *
 * Critique vision de la production, 30 jours : « hiérarchie plate » est la 2ᵉ
 * famille de défauts (346 constats sur 98 apps) et son thème dominant est le
 * rapport typographique entre le chiffre d'un indicateur et son libellé.
 *
 * Ces tests tiennent le RAPPORT et l'UNITÉ, jamais des noms de classes — c'est
 * le rapport qui porte la hiérarchie, et l'unité qui décide si le composant
 * suit son hôte.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Metric } from "@/components/bpm/Metric";

/**
 * Le harnais du dépôt rend en MARKUP statique (`environment: "node"`), pas dans
 * un DOM : on lit donc les tailles dans le HTML produit. C'est même plus sûr
 * ici — on mesure ce qui est ÉMIS, sans qu'un moteur de style s'interpose.
 */
function html(compact: boolean): string {
  return renderToStaticMarkup(
    <Metric label="Chiffre d'affaires" value={5780} compact={compact} />
  );
}

/** Les `font-size` du markup, dans l'ordre d'apparition : libellé puis valeur. */
function tailles(compact: boolean): { libelle: number; valeur: number; unites: string[] } {
  const trouves = [...html(compact).matchAll(/font-size:\s*([0-9.]+)(r?em)/g)];
  /* Sonde : sans les deux tailles, les rapports ci-dessous seraient calculés
     sur du vide et le test passerait pour la mauvaise raison. */
  if (trouves.length < 2) throw new Error(`tailles introuvables dans le markup (${trouves.length})`);
  return {
    libelle: Number.parseFloat(trouves[0]![1]!),
    valeur: Number.parseFloat(trouves[1]![1]!),
    unites: trouves.map((m) => m[2]!),
  };
}

describe("le rapport chiffre / libellé", () => {
  it("vaut 2,0 en rendu normal", () => {
    /* Il valait 1,43 — `text-xl` (20 px) contre `text-sm` (14 px). */
    const t = tailles(false);
    expect(t.valeur / t.libelle).toBeCloseTo(2, 5);
  });

  it("vaut 1,8 en compact — le budget de hauteur est un contrat", () => {
    /* Le mode compact annonce ~80 px de hauteur dans le catalogue curé. Lui
       appliquer le rapport de 2,0 le ferait mentir : on relève la hiérarchie
       sans casser la promesse. */
    const t = tailles(true);
    expect(t.valeur / t.libelle).toBeCloseTo(1.8, 5);
  });
});

describe("l'unité — c'est elle qui décide si le composant SUIT son hôte", () => {
  it("les deux tailles sont en `em`, jamais en `rem`", () => {
    /* `rem` est relatif à la RACINE. Une application hôte qui grossit son
       `body` — mur d'affichage, charte à échelle ample — voyait tout grandir
       SAUF ses indicateurs. C'est le défaut mesuré côté Blueprint Maker, où
       l'axe d'ergonomie multiplie le corps par 1,4 : le chiffre KPI, très
       exactement ce qu'on lit à distance, ne bougeait pas. */
    for (const compact of [false, true]) {
      expect(tailles(compact).unites, `compact=${compact}`).toEqual(["em", "em"]);
    }
  });

  it("le LIBELLÉ garde sa taille rendue au réglage par défaut", () => {
    /* `0.875em` d'un corps à 16 px vaut exactement `text-sm`, et `0.75em`
       vaut `text-xs` : seul le chiffre grandit. Le changement relève la
       hiérarchie, il ne redessine pas la carte. */
    expect(tailles(false).libelle).toBeCloseTo(0.875, 5);
    expect(tailles(true).libelle).toBeCloseTo(0.75, 5);
  });
});

describe("ce qui ne change pas", () => {
  it("la graisse du chiffre reste posée", () => {
    expect(html(false)).toContain("font-bold");
  });

  it("le libellé reste tronqué proprement", () => {
    /* `truncate` était accolé à la classe de TAILLE ; en sortant la taille vers
       le style inline, il aurait pu partir avec elle. */
    expect(html(false)).toContain("truncate");
    expect(html(true)).toContain("truncate");
  });
});
