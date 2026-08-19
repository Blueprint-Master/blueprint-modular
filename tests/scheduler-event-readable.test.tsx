/**
 * UN ÉVÉNEMENT D'AGENDA RESTE LISIBLE — le cliquet.
 *
 * ## Le fait, mesuré sur la critique vision de la production
 *
 * Cinq constats : « les libellés d'événement sont tronqués sans infobulle ».
 * Relu dans la source, la cause est dans le rendu et elle est double :
 *
 * - vue MOIS : `whiteSpace: "nowrap"` + `textOverflow: "ellipsis"` dans une
 *   cellule large d'un septième de grille ;
 * - vue SEMAINE / JOUR : la hauteur de la pastille est DÉRIVÉE DE LA DURÉE
 *   (`Math.max(18, durH * hourRowPx - 2)`) sous `overflow: "hidden"` — un
 *   rendez-vous d'un quart d'heure fait 18 px et coupe son titre.
 *
 * Dans les deux cas, l'information n'était récupérable par aucun chemin.
 *
 * ## Ce que ce fichier NE prétend pas
 *
 * Il ne teste pas le tactile. L'infobulle ne s'y déclenche pas, et c'est assumé :
 * la pastille est un `<button>` qui appelle `onEventClick`, donc le contenu
 * complet y est atteignable en un doigt. Deux mécanismes, deux publics — dire
 * qu'une infobulle « couvre tout le monde » serait faux.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Scheduler, type SchedulerEvent } from "@/components/bpm/Scheduler";

const TITRE_LONG = "Revue de production hebdomadaire — atelier Sud";

/**
 * L'événement est ancré sur AUJOURD'HUI, et ce n'est pas un détail.
 *
 * Le composant ouvre sur la date courante et ne rend que les jours de la
 * fenêtre affichée : une date fixe (« 2024-01-15 ») ne serait rendue par aucune
 * des trois vues, et les tests seraient verts sans avoir rien exercé — le
 * mécanisme MUET pris pour un mécanisme VIVANT.
 */
function aujourdHuiA(heure: number): string {
  const d = new Date();
  d.setHours(heure, 0, 0, 0);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(heure)}:00:00`;
}

const EV: SchedulerEvent = {
  id: "e1",
  title: TITRE_LONG,
  start: aujourdHuiA(9),
  end: aujourdHuiA(10),
  resourceId: "r1",
};

function rendu(vue: "day" | "week" | "month", ev: SchedulerEvent = EV): string {
  return renderToStaticMarkup(
    <Scheduler
      view={vue}
      events={[ev]}
      resources={[{ id: "r1", label: "Atelier Sud" }]}
      onEventClick={() => {}}
      onSlotClick={() => {}}
      locale="fr-FR"
    />,
  );
}

/** Les valeurs des attributs `title` présents dans le balisage rendu. */
function infobulles(html: string): string[] {
  return [...html.matchAll(/title="([^"]*)"/g)].map((m) => m[1]);
}

describe("l'information est récupérable au SURVOL, dans les trois vues", () => {
  it("la pastille du mois porte le texte entier", () => {
    const t = infobulles(rendu("month"));
    expect(t.some((x) => x.includes(TITRE_LONG))).toBe(true);
  });

  it("la pastille de la semaine aussi — c'est là que la DURÉE coupe", () => {
    const t = infobulles(rendu("week"));
    expect(t.some((x) => x.includes(TITRE_LONG))).toBe(true);
  });

  it("et celle du jour", () => {
    const t = infobulles(rendu("day"));
    expect(t.some((x) => x.includes(TITRE_LONG))).toBe(true);
  });
});

describe("ce que l'infobulle DIT, et dans quel ordre", () => {
  it("l'heure vient en premier — en vue mois elle n'est écrite nulle part ailleurs", () => {
    /* Le geste d'Outlook et de Google Agenda : on copie le geste, jamais le
       chrome. Sans l'heure, l'infobulle du mois ne rendrait que ce que la
       cellule montrait déjà en partie. */
    const bulle = infobulles(rendu("month")).find((x) => x.includes(TITRE_LONG))!;
    expect(bulle).toMatch(/^\d{2}[:h]\d{2}/);
    expect(bulle.indexOf("–")).toBeLessThan(bulle.indexOf(TITRE_LONG));
  });

  it("la ressource est nommée quand il y en a une", () => {
    expect(infobulles(rendu("month")).some((x) => x.includes("Atelier Sud"))).toBe(true);
  });

  it("sans ressource, aucun séparateur ne pend", () => {
    const sansRes: SchedulerEvent = { ...EV, resourceId: undefined };
    const bulle = infobulles(rendu("month", sansRes)).find((x) => x.includes(TITRE_LONG))!;
    expect(bulle.endsWith(TITRE_LONG)).toBe(true);
  });
});

describe("l'abstention — une infobulle qui ment est pire que pas d'infobulle", () => {
  it("aucune date illisible ne peut écrire « Invalid Date » dans le balisage", () => {
    /* La garde de `eventTimeRange` existe parce que `new Date("non plus")` rend
       `Invalid Date`, et que le formater écrirait ces mots au survol avec
       l'autorité d'une valeur.

       ⚠️ **Sa branche NaN est aujourd'hui INATTEIGNABLE par le rendu, et il faut
       le dire** : le placement filtre déjà sur `en > dayStart && s < dayEnd`,
       comparaisons toutes fausses avec `NaN`, donc un événement à date cassée
       n'est posé sur aucun jour et n'a pas d'infobulle du tout. La garde reste
       un fail-safe utile — elle couvre aussi le `throw` d'`Intl` sur un moteur
       sans ICU complet, et elle survivrait à un assouplissement du filtre — mais
       ce test ne prétend PAS la prouver. Il prouve la propriété qui compte pour
       l'utilisateur : quoi qu'on donne au composant, ces mots ne s'affichent
       jamais. */
    for (const cassé of [
      { ...EV, end: "non plus" },
      { ...EV, start: "pas une date", end: "non plus" },
    ] as SchedulerEvent[]) {
      for (const vue of ["day", "week", "month"] as const) {
        const html = rendu(vue, cassé);
        expect(html, `${vue}`).not.toMatch(/Invalid Date/i);
        expect(html, `${vue}`).not.toMatch(/NaN/);
      }
    }
  });
});

describe("ce qui ne bouge pas", () => {
  it("le titre reste RENDU dans la pastille, pas seulement en infobulle", () => {
    /* Déplacer le texte dans l'attribut aurait « réglé » la troncature en
       supprimant le contenu. */
    expect(rendu("month")).toContain(TITRE_LONG);
  });

  it("la pastille reste un bouton — le clic est l'autre moitié du geste", () => {
    expect(rendu("month")).toMatch(/<button[^>]*type="button"/);
  });
});
