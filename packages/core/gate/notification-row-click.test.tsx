/**
 * `bpm.notificationCenter` — LE CLIC SUR LA LIGNE (#191).
 *
 * ## Le manque, et sa taille exacte
 *
 * Le ticket d'origine côté Maker affirmait que ce composant « n'expose AUCUN
 * rappel de clic par élément ». C'était faux : `NotificationItem.actionLabel` +
 * `onAction` existent et rendent un BOUTON par notification. L'affirmation ne
 * valait que pour les deux NOMS cherchés (`onItemClick`, `onSelect`).
 *
 * Ce qui manquait réellement est le geste de la RÉFÉRENCE — la boîte Gmail /
 * GitHub : on clique la notification, pas un bouton *dans* la notification. Sur
 * vingt éléments, la forme bouton ajoute vingt boutons ; le clic de ligne n'en
 * ajoute aucun.
 *
 * ## Ce que ce fichier tient, et pourquoi chaque cas existe
 *
 * 1. **absente = octet d'hier** — ni `role`, ni `tabIndex`, ni curseur. Sans ce
 *    cas, on pourrait poser l'affordance en permanence et faire entrer chaque
 *    ligne de chaque app existante dans l'ordre de tabulation ;
 * 2. **`stopPropagation` sur les boutons INTERNES** — c'est le cœur. Sans lui,
 *    « marquer comme lu », « supprimer » et `onAction` remonteraient au `<li>`
 *    et ouvriraient AUSSI la fiche. Le piège est identique à celui payé côté
 *    Maker sur la case « tout sélectionner » posée dans un `<th>` qui portait
 *    déjà un `onClick` de tri : un geste en déclenche deux, et le second est
 *    invisible jusqu'à ce qu'un utilisateur le subisse ;
 * 3. **clavier** — un élément qui se dit `button` doit Entrée ET Espace, et
 *    Espace ne doit pas faire défiler la page sous la liste.
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NotificationCenter } from "../../../components/bpm/NotificationCenter";

afterEach(cleanup);

const ITEMS = [
  {
    id: "n1",
    title: "Commande 1042",
    message: "Passée en préparation",
    type: "info" as const,
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: "n2",
    title: "Commande 1041",
    message: "Livrée",
    type: "success" as const,
    timestamp: new Date().toISOString(),
    read: true,
  },
];

describe("bpm.notificationCenter — clic sur la ligne", () => {
  it("SANS `onItemClick` : aucune affordance — le comportement d'hier, à l'octet", () => {
    const { container } = render(
      <NotificationCenter notifications={ITEMS} onMarkRead={() => {}} />,
    );
    const lignes = container.querySelectorAll("li");
    expect(lignes.length).toBeGreaterThan(0);
    for (const li of lignes) {
      // Ni rôle usurpé, ni entrée dans l'ordre de tabulation, ni curseur.
      expect(li.getAttribute("role")).toBeNull();
      expect(li.getAttribute("tabindex")).toBeNull();
      expect(li.style.cursor).toBe("");
    }
  });

  it("AVEC `onItemClick` : la ligne devient une cible, et le clic porte son id", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <NotificationCenter notifications={ITEMS} onMarkRead={() => {}} onItemClick={onItemClick} />,
    );
    const premiere = container.querySelector("li")!;
    expect(premiere.getAttribute("role")).toBe("button");
    expect(premiere.getAttribute("tabindex")).toBe("0");
    expect(premiere.style.cursor).toBe("pointer");

    fireEvent.click(premiere);
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith("n1");
  });

  it("clavier : Entrée ET Espace ouvrent, et Espace ne fait pas défiler", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <NotificationCenter notifications={ITEMS} onMarkRead={() => {}} onItemClick={onItemClick} />,
    );
    const premiere = container.querySelector("li")!;

    fireEvent.keyDown(premiere, { key: "Enter" });
    expect(onItemClick).toHaveBeenCalledWith("n1");

    onItemClick.mockClear();
    // `defaultPrevented` : sans lui, Espace ferait défiler la page SOUS la liste.
    const espace = fireEvent.keyDown(premiere, { key: " " });
    expect(onItemClick).toHaveBeenCalledWith("n1");
    expect(espace).toBe(false);
  });

  it("une autre touche ne déclenche RIEN — on ne capture pas le clavier", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <NotificationCenter notifications={ITEMS} onMarkRead={() => {}} onItemClick={onItemClick} />,
    );
    fireEvent.keyDown(container.querySelector("li")!, { key: "a" });
    fireEvent.keyDown(container.querySelector("li")!, { key: "Tab" });
    expect(onItemClick).not.toHaveBeenCalled();
  });
});

describe("les boutons INTERNES ne déclenchent JAMAIS le clic de ligne", () => {
  it("« marquer comme lu » marque, et n'ouvre pas", () => {
    const onItemClick = vi.fn();
    const onMarkRead = vi.fn();
    const { container } = render(
      <NotificationCenter notifications={ITEMS} onMarkRead={onMarkRead} onItemClick={onItemClick} />,
    );
    // Le bouton n'apparaît qu'au survol de la ligne non lue.
    const premiere = container.querySelector("li")!;
    fireEvent.mouseEnter(premiere);
    fireEvent.click(screen.getByText("Marquer comme lu"));

    expect(onMarkRead).toHaveBeenCalledWith("n1");
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("« supprimer » supprime, et n'ouvre pas", () => {
    const onItemClick = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(
      <NotificationCenter
        notifications={ITEMS}
        onMarkRead={() => {}}
        onDismiss={onDismiss}
        onItemClick={onItemClick}
      />,
    );
    // Le bouton de suppression n'apparaît qu'au survol d'une ligne LUE.
    const lues = container.querySelectorAll("li");
    fireEvent.mouseEnter(lues[lues.length - 1]);
    fireEvent.click(screen.getByText("Supprimer"));

    expect(onDismiss).toHaveBeenCalledWith("n2");
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("`onAction` s'exécute, et n'ouvre pas — les deux gestes COHABITENT", () => {
    const onItemClick = vi.fn();
    const onAction = vi.fn();
    render(
      <NotificationCenter
        notifications={[{ ...ITEMS[0], actionLabel: "Ouvrir la fiche", onAction }]}
        onMarkRead={() => {}}
        onItemClick={onItemClick}
      />,
    );
    fireEvent.click(screen.getByText("Ouvrir la fiche"));

    expect(onAction).toHaveBeenCalledTimes(1);
    // Sans `stopPropagation`, ce clic aurait ouvert la fiche DEUX fois.
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("SANS `onItemClick`, les boutons internes se comportent exactement comme avant", () => {
    const onAction = vi.fn();
    const onMarkRead = vi.fn();
    const { container } = render(
      <NotificationCenter
        notifications={[{ ...ITEMS[0], actionLabel: "Ouvrir la fiche", onAction }]}
        onMarkRead={onMarkRead}
      />,
    );
    fireEvent.click(screen.getByText("Ouvrir la fiche"));
    expect(onAction).toHaveBeenCalledTimes(1);

    fireEvent.mouseEnter(container.querySelector("li")!);
    fireEvent.click(screen.getByText("Marquer comme lu"));
    expect(onMarkRead).toHaveBeenCalledWith("n1");
  });
});
