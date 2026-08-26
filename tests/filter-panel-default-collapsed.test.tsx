/**
 * LE PANNEAU DE FILTRES PEUT S'OUVRIR REPLIÉ — le cliquet.
 *
 * ## Le fait
 *
 * `collapsible` posait un bouton « Masquer les filtres » au-dessus d'un panneau
 * DÉJÀ DÉPLIÉ, et rien ne permettait d'en changer : l'état interne partait à
 * `false`, sans prop pour le régler. Une vue liste qui passe `collapsible: true`
 * — ce que le Maker fait EN DUR sur toutes les siennes — obtenait donc un bloc
 * de contrôles bordé, pleine largeur, au-dessus de sa table, à chaque arrivée
 * sur l'écran et même sans un seul filtre actif.
 *
 * C'est la même distinction que celle déjà tranchée pour le flux des champs :
 * `collapsible` décrit l'EN-TÊTE, il ne dit rien de l'état de départ du contenu.
 *
 * ## Ce que ce fichier tient
 *
 * Les assertions portent sur le MARKUP rendu — la présence réelle des champs —
 * jamais sur la valeur d'une prop. Une prop reçue et ignorée passerait un test
 * qui se contente de la lire.
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

const rendu = (props: { collapsible?: boolean; defaultCollapsed?: boolean }) =>
  renderToStaticMarkup(
    <FilterPanel
      filters={DEUX_CHAMPS}
      values={{}}
      onChange={() => {}}
      onReset={() => {}}
      {...props}
    />,
  );

/** Les champs sont-ils RÉELLEMENT peints ? (leurs étiquettes le disent) */
function champsVisibles(html: string): boolean {
  return html.includes("Recherche") && html.includes("Statut");
}

describe("defaultCollapsed", () => {
  it("le défaut est INCHANGÉ : `collapsible` seul rend le panneau déplié", () => {
    const html = rendu({ collapsible: true });
    expect(champsVisibles(html)).toBe(true);
    /* Le bouton dit ce que le clic fait : déplié, il propose de masquer. */
    expect(html).toContain("Masquer les filtres");
  });

  it("`defaultCollapsed` rend le panneau REPLIÉ au premier rendu", () => {
    const html = rendu({ collapsible: true, defaultCollapsed: true });
    expect(champsVisibles(html)).toBe(false);
    expect(html).toContain("Afficher les filtres");
  });

  it("le panneau replié garde son bouton — il est repliable, pas absent", () => {
    const html = rendu({ collapsible: true, defaultCollapsed: true });
    expect(html).toContain("<button");
  });

  it("`defaultCollapsed` sans `collapsible` n'a AUCUN effet (ni en-tête ni bouton)", () => {
    /* La branche non repliable n'a pas de bouton pour rouvrir : y masquer les
       champs les rendrait inatteignables. La prop doit donc y être ignorée. */
    const nu = rendu({});
    const avec = rendu({ defaultCollapsed: true });
    expect(avec).toBe(nu);
    expect(champsVisibles(avec)).toBe(true);
  });

  it("`defaultCollapsed: false` explicite vaut le défaut, à l'octet", () => {
    expect(rendu({ collapsible: true, defaultCollapsed: false })).toBe(
      rendu({ collapsible: true }),
    );
  });

  it("le badge de filtres ACTIFS survit au repli — sinon on masquerait un filtre en vigueur", () => {
    /* Le pire état d'un panneau replié : une liste filtrée dont l'utilisateur ne
       voit plus pourquoi elle l'est. Le compte doit rester lisible fermé. */
    const html = renderToStaticMarkup(
      <FilterPanel
        filters={DEUX_CHAMPS}
        values={{ statut: "a" }}
        onChange={() => {}}
        onReset={() => {}}
        collapsible
        defaultCollapsed
      />,
    );
    expect(champsVisibles(html)).toBe(false);
    expect(html).toContain(">1<");
  });
});
