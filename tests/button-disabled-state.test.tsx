/**
 * L'ÉTAT DÉSACTIVÉ D'UN BOUTON SE VOIT — le cliquet.
 *
 * ## Le fait, mesuré sur la critique vision de la production (14 j)
 *
 * Quatre constats concordants, sur des apps sans rapport :
 *
 * - « Le bouton 'Supprimer' en état désactivé (grisé) manque d'un style
 *   disabled explicite — **il ressemble à un bouton actif pâle** » ;
 * - « son style est **quasi identique au bouton 'Exporter'**, la distinction
 *   d'état inactif n'est pas assez marquée » ;
 * - « son statut (désactivé ou actif ?) est **ambigu** » ;
 * - « manque de contraste et son état n'est pas clairement signalé ».
 *
 * ## Les deux causes
 *
 * 1. **`opacity` est déjà le canal de l'EMPHASE** — un bouton secondaire ou
 *    fantôme est, par dessein, plus pâle. Un primaire désactivé à 42 % rend
 *    donc ce qu'un tertiaire ACTIF rend. Deux sens, un seul canal.
 * 2. **`pointerEvents: none` rendait le curseur invisible.** Un élément qui
 *    n'est pas cible de pointeur ne voit jamais son `cursor` appliqué — le
 *    signal était posé et annulé par la ligne suivante. Et il ne protégeait
 *    rien : l'attribut natif `disabled` bloque déjà le clic.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/bpm/Button";

const html = (props: Record<string, unknown>) =>
  renderToStaticMarkup(<Button label="Supprimer" {...props} />);

describe("le curseur peut enfin se voir", () => {
  it("désactivé : `not-allowed`, la convention du Web", () => {
    expect(html({ disabled: true })).toContain("cursor:not-allowed");
  });

  it("en chargement : `wait`", () => {
    expect(html({ loading: true })).toContain("cursor:wait");
  });

  it("actif : `pointer`, inchangé", () => {
    expect(html({})).toContain("cursor:pointer");
  });

  it("`pointer-events:none` ne masque plus le curseur", () => {
    /* LE cœur du correctif : avec `pointer-events: none`, l'élément n'est pas
       cible de pointeur, donc son `cursor` n'est JAMAIS appliqué — le
       navigateur prend celui du dessous. Le signal existait et ne pouvait pas
       se voir. */
    for (const props of [{ disabled: true }, { loading: true }]) {
      expect(html(props), JSON.stringify(props)).not.toContain("pointer-events:none");
    }
  });
});

describe("le clic reste bloqué — on n'a pas échangé un signal contre une faille", () => {
  it("l'attribut natif `disabled` est posé dans les deux cas", () => {
    /* C'est lui qui bloque le clic, pas `pointerEvents` : le retrait ne rouvre
       rien. Sur un `<button>`, l'attribut natif supprime l'événement. */
    expect(html({ disabled: true })).toContain("disabled=");
    expect(html({ loading: true })).toContain("disabled=");
  });
});

describe("la teinte disparaît — l'opacité ne peut pas dire l'état à elle seule", () => {
  it("désactivé : désaturé", () => {
    expect(html({ disabled: true })).toContain("filter:grayscale(1)");
  });

  it("actif ET en chargement : aucune désaturation", () => {
    /* Un bouton en chargement reste une action EN COURS, pas indisponible :
       le griser dirait le contraire de ce qui se passe. */
    expect(html({})).not.toContain("grayscale");
    expect(html({ loading: true })).not.toContain("grayscale");
  });

  it("l'opacité d'avant est CONSERVÉE — on ajoute un canal, on n'en retire pas", () => {
    expect(html({ disabled: true })).toContain("opacity:0.42");
    expect(html({ loading: true })).toContain("opacity:0.7");
  });
});

describe("deux boutons de même variante se distinguent enfin", () => {
  it("désactivé et actif ne rendent PAS le même style", () => {
    /* Le constat du juge, transcrit : « quasi identique au bouton Exporter ».
       Les deux rendus doivent différer sur plus que l'opacité. */
    const actif = html({ variant: "secondary" });
    const inactif = html({ variant: "secondary", disabled: true });
    expect(inactif).not.toBe(actif);
    expect(inactif).toContain("grayscale(1)");
    expect(inactif).toContain("cursor:not-allowed");
  });
});
