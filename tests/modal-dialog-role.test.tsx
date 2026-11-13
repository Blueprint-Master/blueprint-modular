// @vitest-environment jsdom
/**
 * LA FENÊTRE bpm.modal EST UN DIALOGUE — pour les lecteurs d'écran comme pour
 * les outils qui la cherchent.
 *
 * ## Le fait (Maker, mesure 10, 14/11)
 *
 * Une page composée avec Modular a laissé une fenêtre ouverte. Son voile
 * `.bpm-modal-backdrop` ne portait ni `role="dialog"` ni `aria-modal` : le
 * validateur runtime du Maker, qui cherche `[role="dialog"]`, ne l'a pas vue,
 * ne l'a donc pas refermée, et le voile a intercepté les clics de neuf
 * sections sur douze. Un lecteur d'écran, lui, n'annonçait aucun dialogue et
 * laissait lire la page dessous.
 *
 * ## Le piège
 *
 * Le voile reste dans le DOM quand la fenêtre est FERMÉE (`invisible`). Poser
 * le rôle sans condition ferait compter un dialogue qui n'existe pas : le rôle
 * ne vit que fenêtre ouverte.
 */
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { Modal } from "@/components/bpm/Modal";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const monter = (isOpen: boolean, title?: string) => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(
      <Modal isOpen={isOpen} onClose={() => {}} title={title}>
        <input name="client" />
      </Modal>
    );
  });
  return root;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("bpm.modal — sémantique de dialogue", () => {
  it("ouverte : role=dialog, aria-modal, et le titre la nomme", () => {
    monter(true, "Nouvelle commande");
    const d = document.querySelector('[role="dialog"]');
    expect(d).not.toBeNull();
    expect(d!.getAttribute("aria-modal")).toBe("true");
    const id = d!.getAttribute("aria-labelledby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)?.textContent).toBe("Nouvelle commande");
  });

  it("fermée : le voile reste dans le DOM, mais AUCUN dialogue n'est annoncé", () => {
    monter(false, "Nouvelle commande");
    expect(document.querySelector(".bpm-modal-backdrop")).not.toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.querySelector('[aria-modal="true"]')).toBeNull();
  });

  it("sans titre : dialogue, sans référence vers un titre absent", () => {
    monter(true);
    const d = document.querySelector('[role="dialog"]');
    expect(d).not.toBeNull();
    expect(d!.hasAttribute("aria-labelledby")).toBe(false);
  });
});
