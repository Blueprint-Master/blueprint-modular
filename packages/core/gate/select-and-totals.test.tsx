/**
 * Deux manques trouvés en essayant de CONSOMMER le core, pas en le relisant.
 *
 * ── 1. `bpm.autocomplete` confondait « je tape » et « j'ai choisi » ──────────
 *
 * L'audit du parc rangeait l'autocomplétion parmi « les props que le core porte
 * déjà et que le builder n'appelle jamais ». En essayant de l'employer pour un
 * sélecteur de RELATION, le blocage est apparu : `onChange` part à chaque
 * frappe avec du texte libre, ET `select()` part avec `opt.value`. Le
 * consommateur reçoit les deux par le même canal et **ne peut pas les
 * distinguer**.
 *
 * Conséquences concrètes pour une clé étrangère :
 *
 *   · il poste du texte libre comme identifiant ;
 *   · s'il affiche `value`, il montre le **cuid** dans le champ après la
 *     sélection — le défaut exact de l'audit #68, celui qu'on a passé du temps
 *     à retirer des formulaires.
 *
 * `onSelect` porte l'information manquante : ceci est un CHOIX. Le consommateur
 * tient alors deux états — le texte affiché et la valeur choisie — et c'est LUI
 * qui décide si taper après avoir choisi invalide le choix.
 *
 * ── 2. `bpm.table` n'avait aucun pied ────────────────────────────────────────
 *
 * Zéro occurrence de `tfoot` dans le composant. Les totaux de colonne étaient
 * donc irréalisables, quel que soit l'effort côté générateur.
 *
 * Deux règles, et la seconde est celle qui compte :
 *
 *   · le total porte sur les lignes REÇUES, donc sur ce qui est à l'écran.
 *     Filtrer une liste et voir le total inchangé est le défaut classique de
 *     cette fonctionnalité ;
 *   · une colonne sans aucune valeur numérique ne rend RIEN plutôt que « 0 ».
 *     Un zéro fabriqué est une valeur qui ment — précisément ce qu'un total est
 *     censé ne jamais faire.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Autocomplete } from "../../../components/bpm/Autocomplete";
import { Table } from "../../../components/bpm/Table";

afterEach(cleanup);

const OPTIONS = [
  { value: "cm1a2b3c", label: "Fournisseur Alpha" },
  { value: "cm9z8y7x", label: "Fournisseur Beta" },
];

describe("bpm.autocomplete — distinguer la frappe du choix", () => {
  it("sans `onSelect` : comportement inchangé, `onChange` reste seul", () => {
    const onChange = vi.fn();
    const { container } = render(<Autocomplete options={OPTIONS} value="" onChange={onChange} />);
    fireEvent.change(container.querySelector("input")!, { target: { value: "Alpha" } });
    expect(onChange).toHaveBeenCalledWith("Alpha");
  });

  it("taper NE déclenche PAS `onSelect`", () => {
    /* C'est la moitié qui rend la prop utile : sans elle, `onSelect` serait un
       alias d'`onChange` et ne réglerait rien. */
    const onSelect = vi.fn();
    const { container } = render(
      <Autocomplete options={OPTIONS} value="" onChange={() => {}} onSelect={onSelect} />
    );
    fireEvent.change(container.querySelector("input")!, { target: { value: "Alph" } });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("choisir une option déclenche `onSelect` avec l'option ENTIÈRE", () => {
    /* L'option entière, pas seulement sa valeur : le consommateur a besoin du
       LIBELLÉ pour l'afficher — sinon il remet le cuid dans le champ. */
    const onSelect = vi.fn();
    render(<Autocomplete options={OPTIONS} value="" onChange={() => {}} onSelect={onSelect} />);
    fireEvent.focus(screen.getByRole("textbox"));
    fireEvent.mouseDown(screen.getByText("Fournisseur Alpha"));
    expect(onSelect).toHaveBeenCalledWith({ value: "cm1a2b3c", label: "Fournisseur Alpha" });
  });

  it("`onChange` reste appelé à la sélection — aucun consommateur existant ne casse", () => {
    const onChange = vi.fn();
    render(<Autocomplete options={OPTIONS} value="" onChange={onChange} onSelect={() => {}} />);
    fireEvent.focus(screen.getByRole("textbox"));
    fireEvent.mouseDown(screen.getByText("Fournisseur Beta"));
    expect(onChange).toHaveBeenCalledWith("cm9z8y7x");
  });

  it("`error` : message en role=alert, contour rouge, aria-invalid", () => {
    const { container } = render(
      <Autocomplete options={OPTIONS} value="" onChange={() => {}} error="Fournisseur requis" />
    );
    expect(screen.getByRole("alert").textContent).toBe("Fournisseur requis");
    const champ = container.querySelector("input")!;
    expect(champ.getAttribute("aria-invalid")).toBe("true");
    expect(champ.style.borderColor).toBe("var(--bpm-error, #dc2626)");
  });
});

const LIGNES = [
  { produit: "Vis", quantite: 10, prix: 2.5 },
  { produit: "Écrou", quantite: 4, prix: 1.25 },
  { produit: "Boulon", quantite: 6, prix: 3 },
];

const COLS_SANS_TOTAL = [
  { key: "produit", label: "Produit" },
  { key: "quantite", label: "Quantité" },
];

describe("bpm.table — pied de totaux", () => {
  it("aucune colonne ne demande de total : PAS de pied", () => {
    /* La moitié qui rend l'ajout additif : toutes les tables existantes sont
       dans ce cas. */
    const { container } = render(<Table columns={COLS_SANS_TOTAL} data={LIGNES} />);
    expect(container.querySelector("tfoot")).toBeNull();
  });

  it("`sum` additionne les lignes REÇUES", () => {
    const { container } = render(
      <Table
        columns={[
          { key: "produit", label: "Produit" },
          { key: "quantite", label: "Quantité", total: "sum" },
        ]}
        data={LIGNES}
      />
    );
    const pied = container.querySelector("tfoot")!;
    expect(pied).not.toBeNull();
    expect(pied.textContent).toContain("20");
  });

  it("le total suit les lignes REÇUES — filtrer change le total", () => {
    /* Le défaut classique : un total figé sous une liste filtrée. On rejoue le
       rendu avec un sous-ensemble, comme le ferait une liste filtrée. */
    const { container, rerender } = render(
      <Table
        columns={[
          { key: "produit", label: "Produit" },
          { key: "quantite", label: "Quantité", total: "sum" },
        ]}
        data={LIGNES}
      />
    );
    expect(container.querySelector("tfoot")!.textContent).toContain("20");
    rerender(
      <Table
        columns={[
          { key: "produit", label: "Produit" },
          { key: "quantite", label: "Quantité", total: "sum" },
        ]}
        data={LIGNES.slice(0, 1)}
      />
    );
    expect(container.querySelector("tfoot")!.textContent).toContain("10");
    expect(container.querySelector("tfoot")!.textContent).not.toContain("20");
  });

  it("`avg` et `count` rendent leur propre agrégat", () => {
    const { container } = render(
      <Table
        columns={[
          { key: "produit", label: "Produit", total: "count" },
          { key: "prix", label: "Prix", total: "avg", decimals: 2 },
        ]}
        data={LIGNES}
      />
    );
    const texte = container.querySelector("tfoot")!.textContent ?? "";
    expect(texte).toContain("3");
    /* (2,5 + 1,25 + 3) / 3 = 2,25 */
    expect(texte).toMatch(/2[.,]25/);
  });

  it("une colonne SANS valeur numérique ne rend RIEN, jamais « 0 »", () => {
    /* Un zéro fabriqué est une valeur qui ment. C'est le point du 1.7 appliqué
       à un agrégat. */
    const { container } = render(
      <Table
        columns={[
          { key: "produit", label: "Produit", total: "sum" },
          { key: "quantite", label: "Quantité", total: "sum" },
        ]}
        data={LIGNES}
      />
    );
    const cellules = Array.from(container.querySelectorAll("tfoot td")).map((c) => c.textContent);
    expect(cellules[0]).toBe("");
    expect(cellules[1]).toContain("20");
  });

  it("table VIDE : pas de pied — « Total — » n'apprend rien", () => {
    const { container } = render(
      <Table columns={[{ key: "quantite", label: "Quantité", total: "sum" }]} data={[]} />
    );
    expect(container.querySelector("tfoot")).toBeNull();
  });

  it("en ERREUR ou en CHARGEMENT : pas de pied", () => {
    /* Un total sous un message d'erreur porterait sur des lignes qu'on n'a pas
       lues — il affirmerait ce que la table vient de dire qu'elle ignore. */
    const cols = [{ key: "quantite", label: "Quantité", total: "sum" as const }];
    const { container: enErreur } = render(<Table columns={cols} data={LIGNES} error="API hors service" />);
    expect(enErreur.querySelector("tfoot")).toBeNull();
    const { container: enCharge } = render(<Table columns={cols} data={LIGNES} loading />);
    expect(enCharge.querySelector("tfoot")).toBeNull();
  });

  it("le libellé va dans la première colonne SANS total", () => {
    const { container } = render(
      <Table
        columns={[
          { key: "produit", label: "Produit" },
          { key: "quantite", label: "Quantité", total: "sum" },
        ]}
        data={LIGNES}
        totalsLabel="Somme"
      />
    );
    const cellules = Array.from(container.querySelectorAll("tfoot td")).map((c) => c.textContent);
    expect(cellules[0]).toBe("Somme");
  });
});
