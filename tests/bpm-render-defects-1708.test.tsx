/**
 * Trois défauts de RENDU du core, relevés sur des captures de production du
 * 17/08 (app « Portefeuille Clients », charte rouge).
 *
 * Aucun n'est visible en lisant le composant : ils naissent tous d'un style
 * calculé pour un contexte et réutilisé dans un autre. On rend donc le
 * composant RÉEL et on lit le MARKUP, jamais la source.
 *
 * 1. `FilterPanel` repliable — le bouton « Filtres » et les champs
 *    apparaissaient centrés et rétrécis au milieu du panneau. Cause :
 *    `containerStyle` calcule `alignItems` pour l'orientation HORIZONTALE
 *    (donc `center`), et la branche repliable surchargeait `flexDirection`
 *    sans le recalculer.
 *
 * 2. Le même bouton portait `collapsed ? t.filters : t.filters` — la MÊME
 *    valeur dans les deux branches. Le libellé ne changeait jamais ; seul
 *    l'attribut `title` bougeait.
 *
 * 3. `NotificationCenter` était plafonné à `maxWidth: 440` **en dur** — la
 *    largeur d'une popover de cloche. Employé comme PAGE, il laissait les deux
 *    tiers de l'écran vides. Et son badge « non lu », posé dans une ligne
 *    `flexWrap: "wrap"`, restait à droite d'un titre court mais TOMBAIT sous un
 *    titre long : deux éléments voisins ne le portaient pas au même endroit.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FilterPanel } from "@/components/bpm/FilterPanel";
import { NotificationCenter } from "@/components/bpm/NotificationCenter";

const FILTRES = [
  { key: "__q", label: "Recherche", type: "text" as const },
  { key: "__period", label: "Période", type: "select" as const, options: [{ value: "", label: "Tous" }] },
];

const panneau = (collapsible: boolean) =>
  renderToStaticMarkup(
    <FilterPanel
      filters={FILTRES}
      values={{}}
      onChange={() => {}}
      onReset={() => {}}
      collapsible={collapsible}
    />,
  );

/** Le style du conteneur RACINE, tel qu'il part au navigateur. */
function styleRacine(markup: string): string {
  return /style="([^"]*)"/.exec(markup)?.[1] ?? "";
}

describe("FilterPanel repliable — le panneau occupe sa largeur", () => {
  it("le conteneur ne centre plus ses enfants", () => {
    const style = styleRacine(panneau(true));
    /* Sonde : on lit bien le conteneur et pas autre chose. */
    expect(style, "conteneur en colonne").toContain("flex-direction:column");
    expect(style, "enfants étirés, pas centrés").toContain("align-items:stretch");
    expect(style.includes("align-items:center"), "plus de centrage hérité").toBe(false);
  });

  it("la branche NON repliable est inchangée — elle, centre à bon droit", () => {
    /* Contre-épreuve : le défaut vient du COUPLE colonne+centrage, pas du
       centrage lui-même. En rangée, `center` aligne verticalement et reste
       correct — le correctif ne doit pas déborder dessus. */
    const style = styleRacine(panneau(false));
    expect(style).toContain("align-items:center");
    expect(style.includes("flex-direction:column"), "toujours en rangée").toBe(false);
  });

  it("le bouton DIT ce que le clic fait", () => {
    const markup = panneau(true);
    /* ⚠️ On lit le TEXTE du bouton, jamais le markup entier — l'attribut
       `title` porte déjà « Masquer les filtres » depuis toujours, donc un
       `toContain` global passait AVANT correction, pour la mauvaise raison.
       Constaté en rouge : 3 défauts attrapés sur 4 assertions attendues. */
    const texteBouton = /<button[^>]*>([\s\S]*?)<\/button>/.exec(markup)?.[1] ?? "";
    expect(texteBouton, "le bouton a bien été isolé").not.toBe("");
    /* Déplié au montage → le bouton propose de MASQUER. Le ternaire mort
       (`collapsed ? t.filters : t.filters`) affichait « Filtres » aux deux. */
    expect(texteBouton).toContain("Masquer les filtres");
    expect(texteBouton.includes(">Filtres<"), "plus l'étiquette inerte").toBe(false);
  });
});

const NOTIFS = [
  {
    id: "1",
    title: "Absence de contact depuis 5 mois - relance recommandée",
    message: "Client inactif",
    type: "info" as const,
    timestamp: "2026-06-10T09:00:00.000Z",
    read: false,
  },
  {
    id: "2",
    title: "Échéance courte",
    message: "Échéance proche",
    type: "info" as const,
    timestamp: "2026-06-22T09:00:00.000Z",
    read: false,
  },
];

const centre = (maxWidth?: number | string) =>
  renderToStaticMarkup(
    <NotificationCenter notifications={NOTIFS} onMarkRead={() => {}} {...(maxWidth === undefined ? {} : { maxWidth })} />,
  );

describe("NotificationCenter — le cadre et le badge", () => {
  it("sans prop, la largeur de popover est CONSERVÉE à l'octet", () => {
    /* Le correctif ne doit rien déplacer pour la cloche du dashboard, qui est
       l'usage historique et majoritaire. */
    expect(styleRacine(centre())).toContain("max-width:440px");
  });

  it("une PAGE peut réclamer toute la largeur", () => {
    expect(styleRacine(centre("100%"))).toContain("max-width:100%");
  });

  it("le badge « non lu » ne bouge pas selon la longueur du titre", () => {
    const markup = centre();
    /* La sonde d'abord : les deux titres du jeu d'essai sont bien de longueurs
       très différentes, donc le cas qui déclenchait le défaut est présent. */
    expect(NOTIFS[0].title.length).toBeGreaterThan(3 * NOTIFS[1].title.length);
    /* Le badge est émis DEUX fois — un par notification non lue — et chaque
       ligne de titre refuse le repli, donc la position ne dépend plus du
       titre. `flex-wrap:wrap` sur cette ligne était la cause. */
    expect(markup.split("Non lu").length - 1, "un badge par non-lu").toBe(2);
    expect(markup).toContain("flex-wrap:nowrap");
    expect(markup).toContain("flex-shrink:0");
  });
});
