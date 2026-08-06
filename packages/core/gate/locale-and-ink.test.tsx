/**
 * Deux défauts du core, mesurés sur le parc d'applications générées (06/08).
 *
 * Le Maker garde en base la critique vision de chaque app validée. Dépouillement
 * complet : **170 apps auditées, 3 707 constats** ; fenêtre exploitable — depuis
 * le 20/07, date où un artefact de harnais a été retiré — **61 apps, 1 408
 * constats**. Deux familles y pointent vers du code de ce dépôt, pas vers le
 * générateur.
 *
 * ── 1. `bpm.scheduler` parlait anglais quoi qu'il arrive ──────────────────────
 *
 * `Prev` / `Today` / `Next` étaient des littéraux sans échappatoire, et
 * `WEEKDAY_LABELS` un tableau `["Mon", "Tue", …]` FIGÉ — pendant que le titre
 * juste au-dessus passait par `toLocaleDateString`. Le composant affichait donc
 * « août 2026 » surmontant « Mon Tue Wed » : pas seulement une traduction
 * manquante, une **incohérence interne**.
 *
 * Les jours viennent maintenant d'`Intl`, avec la MÊME locale que le titre :
 * ils ne peuvent plus diverger, parce qu'ils lisent la même source. Les trois
 * mots qu'`Intl` ne rend pas passent par une table fermée, dérivée de la locale.
 *
 * ── 2. `bpm.labelValue` peignait ses libellés dans l'encre la plus claire ─────
 *
 * `--bpm-text-muted`, à 10-12 px, en capitales, avec 0,04em d'interlettrage.
 * C'est le reproche le plus VERBATIM du parc, relevé sur des apps sans rapport,
 * en thème clair comme en thème sombre :
 *
 *     « Les libellés de champs sont en gris très clair sur fond blanc,
 *       contraste insuffisant »
 *     « labels en petites capitales gris clair sur fond sombre […] (< 3:1) »
 *
 * Et le ratio EST bas par contrat : les consommateurs garantissent 4,5:1 sur
 * `--bpm-text-secondary` mais seulement **3:1** sur `--bpm-text-muted` — le
 * plancher des GROS textes, appliqué ici à 10 px en capitales.
 *
 * ── Ce que ces tests tiennent ────────────────────────────────────────────────
 *
 * Le comportement OBSERVABLE, jamais l'implémentation : ce qui est rendu à
 * l'écran. Un remaniement qui garde le rendu passe ; un qui réintroduit
 * l'anglais figé ou l'encre `muted` échoue.
 */
import { render, cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LabelValue } from "../../../components/bpm/LabelValue";
import { Scheduler } from "../../../components/bpm/Scheduler";

afterEach(cleanup);

const schedulerProps = {
  view: "week" as const,
  events: [],
  onEventClick: () => {},
  onSlotClick: () => {},
};

describe("bpm.scheduler — la langue de la barre d'outils", () => {
  it("en français : plus aucun mot anglais dans la navigation", () => {
    const { container } = render(<Scheduler {...schedulerProps} locale="fr-FR" />);
    const texte = container.textContent ?? "";
    expect(texte).toContain("Précédent");
    expect(texte).toContain("Aujourd'hui");
    expect(texte).toContain("Suivant");
    for (const anglais of ["Prev", "Today", "Next"]) {
      expect(texte, `« ${anglais} » subsiste en français`).not.toContain(anglais);
    }
  });

  it("en français : les jours suivent la locale, comme le titre", () => {
    /* Le défaut n'était pas seulement « c'est en anglais » : c'est que le titre
       ÉTAIT traduit et pas l'en-tête. Les deux lisent désormais la même source,
       donc on vérifie que l'en-tête a bougé. */
    const { container } = render(<Scheduler {...schedulerProps} locale="fr-FR" />);
    const texte = container.textContent ?? "";
    for (const jour of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      expect(texte, `jour figé « ${jour} » encore rendu`).not.toContain(jour);
    }
    expect(texte.toLowerCase()).toMatch(/lun/);
  });

  it("en anglais : rien ne change — aucune app existante ne bascule sans le demander", () => {
    const { container } = render(<Scheduler {...schedulerProps} locale="en-US" />);
    const texte = container.textContent ?? "";
    expect(texte).toContain("Prev");
    expect(texte).toContain("Today");
    expect(texte).toContain("Next");
    expect(texte).toContain("Mon");
  });

  it("une locale non couverte retombe en anglais, jamais sur une autre langue", () => {
    /* Repli explicite : le pire serait qu'un japonais reçoive du néerlandais
       parce qu'une clé de table s'est trouvée là par hasard. */
    const { container } = render(<Scheduler {...schedulerProps} locale="ja-JP" />);
    const texte = container.textContent ?? "";
    expect(texte).toContain("Today");
  });

  it("`labels` prime sur la locale", () => {
    const { container } = render(
      <Scheduler {...schedulerProps} locale="fr-FR" labels={{ today: "Ce jour" }} />
    );
    const texte = container.textContent ?? "";
    expect(texte).toContain("Ce jour");
    expect(texte).not.toContain("Aujourd'hui");
    // Les deux autres restent dérivés — une surcharge partielle est partielle.
    expect(texte).toContain("Précédent");
  });
});

describe("bpm.labelValue — le libellé nomme la donnée", () => {
  it("n'est plus peint dans l'encre la plus claire", () => {
    render(<LabelValue label="Date de brassage" value="12/03/2026" />);
    const libelle = screen.getByText("Date de brassage");
    const couleur = libelle.style.color;
    /* `muted` a le droit d'apparaître — en REPLI, ce que le test suivant exige.
       Ce qui compte est le jeton de TÊTE : c'est lui que l'hôte définit. */
    expect(couleur, "le libellé est resté sur --bpm-text-muted en premier").toMatch(
      /^var\(\s*--bpm-text-secondary/
    );
  });

  it("garde son repli, pour les hôtes qui ne définissent pas le jeton", () => {
    /* Une `var()` sans repli rend la déclaration INVALIDE et le navigateur la
       jette : le libellé hériterait d'une couleur quelconque. Leçon déjà payée
       côté Maker avec `--bpm-space-*`. */
    render(<LabelValue label="Volume réalisé" value="42" />);
    expect(screen.getByText("Volume réalisé").style.color).toContain("--bpm-text-muted");
  });

  it("le bouton « Copier », lui, reste une affordance accessoire", () => {
    /* La correction vise les libellés, pas tout ce qui est gris. `muted` garde
       son registre — sinon on aurait juste déplacé le problème d'un cran. */
    render(<LabelValue label="Référence" value="REF-001" copyable />);
    expect(screen.getByLabelText("Copier").style.color).toContain("--bpm-text-muted");
  });
});
