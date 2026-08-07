/**
 * Erreur AU NIVEAU DU CHAMP — `bpm.input`, `bpm.numberInput`, `bpm.selectbox`,
 * `bpm.dateInput`.
 *
 * ── Ce qui manquait, et depuis quand ─────────────────────────────────────────
 *
 * `bpm.table` porte `error?: string | null` depuis l'ajout de l'enveloppe
 * honnête : une table qui n'a pas pu lire le dit, à la place des lignes, en
 * `role="alert"`. Les trois champs de saisie, eux, n'avaient rien.
 *
 * La conséquence n'est pas cosmétique. Un formulaire refusé par le serveur ne
 * pouvait dire QUE deux choses : un bandeau global au-dessus de la modale, ou
 * rien. « Un champ est invalide » sans dire lequel oblige l'utilisateur à
 * relire tout le formulaire — c'est le même défaut que « une liste vide et une
 * liste illisible se ressemblent », appliqué à la saisie : **l'information
 * existe côté serveur et se perd à l'affichage.**
 *
 * ── Trois choix, chacun contraint par le composant qui le reçoit ─────────────
 *
 * 1. **Le contour ET le message.** La couleur seule ne dit rien à qui ne la
 *    distingue pas, et ne dit pas QUOI corriger. Le message seul laisse l'œil
 *    chercher le champ. Les deux, donc — plus `aria-invalid`, qui est la seule
 *    forme que lit un lecteur d'écran.
 *
 * 2. **`onBlur` RESTAURE, il ne remet pas à neuf.** `Input` repeint son contour
 *    à la main au focus et au blur. Sans branche d'erreur dans le blur, quitter
 *    un champ fautif en effaçait le contour rouge — alors que le message, lui,
 *    restait affiché juste dessous. Un état à moitié effacé est pire que pas
 *    d'état du tout.
 *
 * 3. **Sur `dateInput`, l'ouverture prime sur l'erreur.** Le contour de ce
 *    champ dit déjà quelque chose quand le calendrier est ouvert : « c'est ici
 *    que tu es ». Tant qu'il est ouvert, cette information l'emporte ; refermé,
 *    le contour redit ce qui cloche. Le message, lui, ne bouge jamais.
 *
 * ── Ce que ces tests tiennent ────────────────────────────────────────────────
 *
 * Le rendu OBSERVABLE, et l'ABSENCE de rendu quand la prop est absente : c'est
 * cette seconde moitié qui rend l'ajout additif au sens strict, donc sûr pour
 * les applications déjà livrées.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DateInput } from "../../../components/bpm/DateInput";
import { Input } from "../../../components/bpm/Input";
import { NumberInput } from "../../../components/bpm/NumberInput";
import { Selectbox } from "../../../components/bpm/Selectbox";

afterEach(cleanup);

const ROUGE = "var(--bpm-error, #dc2626)";

describe("bpm.input", () => {
  it("sans `error` : aucune alerte, contour neutre", () => {
    const { container } = render(<Input label="Référence" value="" onChange={() => {}} />);
    expect(screen.queryByRole("alert")).toBeNull();
    const champ = container.querySelector("input")!;
    expect(champ.getAttribute("aria-invalid")).toBeNull();
    expect(champ.style.borderColor).toBe("var(--bpm-border)");
  });

  it("avec `error` : message en role=alert, contour rouge, aria-invalid", () => {
    const { container } = render(
      <Input label="Référence" value="" onChange={() => {}} error="Référence déjà utilisée" />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Référence déjà utilisée");
    const champ = container.querySelector("input")!;
    expect(champ.getAttribute("aria-invalid")).toBe("true");
    expect(champ.style.borderColor).toBe(ROUGE);
  });

  it("le message est RATTACHÉ au champ (aria-describedby), pas seulement posé à côté", () => {
    /* Sans le lien, un lecteur d'écran annonce « invalide » sans jamais lire
       POURQUOI — le texte est à l'écran et hors de portée. */
    const { container } = render(<Input value="" onChange={() => {}} error="Format attendu : AAAA-MM" />);
    const champ = container.querySelector("input")!;
    const cible = champ.getAttribute("aria-describedby");
    expect(cible).toBeTruthy();
    /* `getElementById`, pas `querySelector` : `useId()` rend des identifiants
       de la forme `:r2:`, valides en HTML et illégaux en sélecteur CSS. C'est
       aussi ce que fait le navigateur pour résoudre un IDREF ARIA. */
    expect(container.ownerDocument.getElementById(cible!)?.textContent).toBe("Format attendu : AAAA-MM");
  });

  it("quitter un champ en erreur n'efface PAS son contour rouge", () => {
    /* Le blur repeint le contour à la main. C'est le piège de ce composant :
       le message resterait sous un champ redevenu neutre. */
    const { container } = render(<Input value="" onChange={() => {}} error="Obligatoire" />);
    const champ = container.querySelector("input")!;
    fireEvent.focus(champ);
    fireEvent.blur(champ);
    expect(champ.style.borderColor).toBe(ROUGE);
  });
});

describe("bpm.selectbox", () => {
  it("sans `error` : aucune alerte, contour neutre", () => {
    const { container } = render(<Selectbox label="Statut" options={["A", "B"]} onChange={() => {}} />);
    expect(screen.queryByRole("alert")).toBeNull();
    const declencheur = container.querySelector('[role="button"]') as HTMLElement;
    expect(declencheur.getAttribute("aria-invalid")).toBeNull();
    expect(declencheur.style.borderColor).toBe("var(--bpm-border)");
  });

  it("avec `error` : message en role=alert, contour rouge, aria-invalid", () => {
    const { container } = render(
      <Selectbox label="Statut" options={["A", "B"]} onChange={() => {}} error="Choisis un statut" />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Choisis un statut");
    const declencheur = container.querySelector('[role="button"]') as HTMLElement;
    expect(declencheur.getAttribute("aria-invalid")).toBe("true");
    expect(declencheur.style.borderColor).toBe(ROUGE);
  });
});

describe("bpm.dateInput", () => {
  it("sans `error` : aucune alerte, contour neutre", () => {
    const { container } = render(<DateInput label="Échéance" onChange={() => {}} />);
    expect(screen.queryByRole("alert")).toBeNull();
    const declencheur = container.querySelector('[role="button"]') as HTMLElement;
    expect(declencheur.getAttribute("aria-invalid")).toBeNull();
    expect(declencheur.style.borderColor).toBe("var(--bpm-border)");
  });

  it("avec `error` : message en role=alert, contour rouge, aria-invalid", () => {
    const { container } = render(<DateInput label="Échéance" onChange={() => {}} error="Date passée" />);
    expect(screen.getByRole("alert").textContent).toBe("Date passée");
    const declencheur = container.querySelector('[role="button"]') as HTMLElement;
    expect(declencheur.getAttribute("aria-invalid")).toBe("true");
    expect(declencheur.style.borderColor).toBe(ROUGE);
  });

  it("calendrier ouvert : le contour dit OÙ ON EST, le message dit ce qui cloche", () => {
    /* Les deux informations coexistent — l'une dans le contour, l'autre sous le
       champ. Aucune n'écrase l'autre. */
    const { container } = render(<DateInput label="Échéance" onChange={() => {}} error="Date passée" />);
    const declencheur = container.querySelector('[role="button"]') as HTMLElement;
    fireEvent.click(declencheur);
    expect(declencheur.style.borderColor).toBe("var(--bpm-accent)");
    expect(screen.getByRole("alert").textContent).toBe("Date passée");
  });
});

/**
 * ── `bpm.numberInput`, ajouté après coup et pour une raison précise ──────────
 *
 * Les trois premiers champs couvraient la saisie ordinaire. `numberInput` est
 * celui qui porte la validation la plus RICHE — les bornes `min` / `max`, donc
 * les messages « minimum 0 » / « maximum 100 » — et il était le seul à ne pas
 * pouvoir les dire. Un formulaire aurait affiché l'erreur au champ partout SAUF
 * là où la règle est la plus fine : exactement le genre de couverture partielle
 * qui se remarque à l'usage et pas à la relecture.
 */
describe("bpm.numberInput", () => {
  it("sans `error` : aucune alerte, contour neutre", () => {
    const { container } = render(<NumberInput label="Quantité" onChange={() => {}} />);
    expect(screen.queryByRole("alert")).toBeNull();
    const champ = container.querySelector("input")!;
    expect(champ.getAttribute("aria-invalid")).toBeNull();
    expect(champ.style.borderColor).toBe("var(--bpm-border)");
  });

  it("avec `error` : message en role=alert, contour rouge, aria-invalid", () => {
    const { container } = render(
      <NumberInput label="Quantité" min={0} onChange={() => {}} error="Quantité : minimum 0" />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Quantité : minimum 0");
    const champ = container.querySelector("input")!;
    expect(champ.getAttribute("aria-invalid")).toBe("true");
    expect(champ.style.borderColor).toBe(ROUGE);
  });

  it("quitter un champ en erreur n'efface PAS son contour rouge", () => {
    /* `handleBlur` normalise la valeur ET repeint le contour — le même piège
       que sur `input`, sur un composant écrit indépendamment. */
    const { container } = render(<NumberInput onChange={() => {}} error="Obligatoire" />);
    const champ = container.querySelector("input")!;
    fireEvent.focus(champ);
    fireEvent.blur(champ);
    expect(champ.style.borderColor).toBe(ROUGE);
  });
});
