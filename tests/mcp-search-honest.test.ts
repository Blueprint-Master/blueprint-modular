/**
 * LE MOTEUR DE RECHERCHE MCP CESSE DE RÉPONDRE QUAND IL NE SAIT PAS — le cliquet.
 *
 * ## Pourquoi ces tests n'existaient pas avant
 *
 * Ils existaient. `tests/mcp-suggest-composition.test.ts` affirmait déjà, mot
 * pour mot, que « CRM » ne doit rien rendre dans `search` et que « salle de
 * réunion » doit rendre un état vide utile — **et ces deux assertions étaient
 * ROUGES sur `master`**. Personne ne l'a vu : le gate ne jouait que
 * `vitest run tests/connectors-*.test.ts`, soit 4 fichiers sur 13.
 *
 * Les tests avaient raison, la mesure leur a donné raison, et ils n'ont servi à
 * rien pendant tout ce temps. C'est le défaut que ce dépôt nomme partout — *un
 * mécanisme muet et un mécanisme mort doivent se voir différemment* — appliqué
 * au juge lui-même.
 *
 * ## Ce que ce fichier tient, et comment
 *
 * Aucune assertion ne récite un nombre mesuré un jour donné : chaque invariant
 * est DÉRIVÉ du registre au moment où il s'exécute. Un composant ajouté demain,
 * un exemple réécrit, une description enrichie — tout cela déplace les nombres
 * et ne casse aucun de ces tests, sauf si le défaut revient.
 */

import { describe, expect, it } from "vitest";

import registry from "@/lib/generated/mcp-registry.json";
import { fieldAnswers, fieldWords, wordAnswers } from "@/lib/mcp/match";
import { searchComponents, suggestComposition } from "@/lib/mcp/registry";

interface Composant {
  name: string;
  slug: string;
  description: string;
  category: string;
  fullDescription?: string;
  props?: string;
  example?: string;
  associated?: string[];
  semantics?: unknown;
  _haystack: string;
}

const COMPOSANTS = (registry as unknown as { components: Composant[] }).components;

/** Les mots d'un texte, même découpage que le moteur. */
const mots = (s: unknown) => fieldWords(String(s ?? ""));

/** Ce que le composant DÉCRIT de lui-même — les champs curés, l'exemple exclu. */
function motsCures(c: Composant): Set<string> {
  return new Set([
    ...mots(c.name),
    ...mots(c.slug),
    ...mots(c.description),
    ...mots(c.category),
    ...mots(c.fullDescription),
    ...mots(c.props),
    ...mots((c.associated ?? []).join(" ")),
    ...mots(JSON.stringify(c.semantics ?? "")),
  ]);
}

/** Les mots que SEUL l'exemple apporte : la fiction, par définition. */
function motsDeFiction(c: Composant): string[] {
  const cures = motsCures(c);
  return [...new Set(mots(c.example))].filter((m) => !cures.has(m) && m.length >= 3);
}

describe("l'index ne contient pas de FICTION", () => {
  it("aucun mot inventé pour la démo n'est indexé", () => {
    /* Le cas fondateur : `bpm.statusBox` portait `label: "Synchronisation CRM"`
       dans son exemple, donc chercher « CRM » le rendait. Le moteur
       recommandait un composant sur la foi d'une chaîne écrite pour illustrer
       la doc. Idem « salle de réunion » → `bpm.scheduler`, dont l'exemple porte
       un événement `title: "Réunion"`. */
    const coupables = COMPOSANTS.flatMap((c) => {
      const dansIndex = new Set(mots(c._haystack));
      return motsDeFiction(c)
        .filter((m) => dansIndex.has(m))
        .map((m) => `${c.name}: « ${m} »`);
    });
    expect(coupables).toEqual([]);
  });

  it("le gisement EXISTE — sinon le test précédent serait vide et vert", () => {
    /* Sonde de prémisse. Sans elle, un exemple vidé de ses chaînes rendrait le
       test ci-dessus trivialement vert et personne ne le saurait. */
    const avecFiction = COMPOSANTS.filter((c) => motsDeFiction(c).length > 0);
    expect(avecFiction.length).toBeGreaterThan(50);
  });

  it("les composants SANS props documentées restent trouvables — le coût est nommé", () => {
    /* `bpm.free` et `bpm.dataExplorer` n'ont aucune `props` documentée :
       l'exemple était leur seul vocabulaire de props, et il quitte l'index. Ce
       n'est acceptable que si le nom, la description et la sémantique suffisent
       — on le vérifie plutôt que de le supposer. */
    const sansProps = COMPOSANTS.filter((c) => !String(c.props ?? "").trim());
    expect(sansProps.length).toBeGreaterThan(0);
    for (const c of sansProps) {
      const r = searchComponents(c.name.replace(/^bpm\./, "")) as unknown as {
        results: { name: string }[];
      };
      expect(r.results.map((x) => x.name), c.name).toContain(c.name);
    }
  });
});

describe("une correspondance est ancrée sur un DÉBUT DE MOT", () => {
  it("tout composant rendu porte VRAIMENT un mot répondant à la requête", () => {
    /* L'invariant central, dérivé : plus aucun résultat ne peut reposer sur une
       sous-chaîne prise au milieu d'un mot (« art » dans « carte », « eur »
       dans « couleur »). */
    for (const q of ["art", "eur", "bar", "chart", "nom", "table", "graphique", "carte", "point"]) {
      const r = searchComponents(q) as unknown as { results: { name: string }[] };
      for (const res of r.results) {
        const c = COMPOSANTS.find((x) => x.name === res.name)!;
        const tousLesMots = [
          ...mots(c.name),
          ...mots(c.description),
          ...mots(c.category),
          ...mots(c._haystack),
          ...mots(JSON.stringify(c.semantics ?? "")),
        ];
        const repond = tousLesMots.some((m) => wordAnswers(m, q) || wordAnswers(m, q.replace(/[sx]$/, "")));
        expect(repond, `${q} → ${res.name} sans mot correspondant`).toBe(true);
      }
    }
  });

  it("le milieu d'un mot ne répond plus, même quand un nouveau préfixe devient légitime", () => {
    /* Avant : « art » rendait 55 composants sur 156, dont ZÉRO pertinent
       (« carte », « écart », « départ », « quart ») ; « eur » en rendait 123
       (« couleur », « valeur », « hauteur », « utilisateur »). Un moteur qui
       répond toujours ne dit rien. */
    // Le nouvel horizon ARTificiel est une vraie correspondance de « art ».
    // Figer le total à zéro empêcherait l'enrichissement légitime du catalogue.
    expect(fieldAnswers("carte écart départ quart", ["art"])).toBe(false);
    expect(fieldAnswers("couleur valeur hauteur utilisateur", ["eur"])).toBe(false);
    expect(fieldAnswers("horizon artificiel", ["art"])).toBe(true);
    const art = searchComponents("art") as unknown as { results: { name: string }[] };
    expect(art.results.map(c => c.name)).toContain("bpm.flightInstruments");
    expect(art.results.map(c => c.name)).not.toContain("bpm.skyMap");
  });

  it("le PRÉFIXE est conservé — il porte le pluriel et la dérivation", () => {
    /* Remplacer l'ancrage par une égalité stricte perdrait `bpm.progress` sur
       « bar » (« barre de progression ») et « graphique » sur « graphiques ».
       On ancre au début, on ne ferme pas la fin. */
    const bar = searchComponents("bar") as unknown as { results: { name: string }[] };
    expect(bar.results.map((x) => x.name)).toContain("bpm.progress");
    expect((searchComponents("graphique") as unknown as { total: number }).total).toBeGreaterThan(0);
  });

  it("le camelCase est DÉCOUPÉ — sans quoi l'ancrage coûterait `bpm.barChart`", () => {
    /* `bpm.barChart` abaissé en casse donne `barchart`, un seul mot : ancrer
       sur un début de mot sans découper la frontière minuscule→majuscule ferait
       perdre la requête « chart ». C'est aussi la raison pour laquelle
       `_haystack` conserve sa casse. */
    for (const q of ["bar", "chart"]) {
      const r = searchComponents(q) as unknown as { results: { name: string }[] };
      expect(r.results.map((x) => x.name), q).toContain("bpm.barChart");
    }
  });

  it("`_haystack` a bien gardé sa casse — le découpage en dépend", () => {
    /* Sonde sur l'ARTEFACT : si le générateur se remettait à abaisser la casse,
       le test précédent tomberait sans qu'on sache pourquoi. Ici on le dit. */
    expect(COMPOSANTS.some((c) => /[A-Z]/.test(c._haystack))).toBe(true);
  });
});

describe("ce que le moteur doit continuer de trouver", () => {
  it("chaque composant est trouvable par son propre nom", () => {
    /* Le garde-fou de la correction : resserrer la correspondance ne doit
       jamais rendre un composant introuvable. Dérivé sur les 156. */
    const introuvables = COMPOSANTS.filter((c) => {
      const terme = c.name.replace(/^bpm\./, "");
      const r = searchComponents(terme) as unknown as { results: { name: string }[] };
      return !r.results.some((x) => x.name === c.name);
    }).map((c) => c.name);
    expect(introuvables).toEqual([]);
  });

  it("les requêtes métier courantes rendent toujours quelque chose", () => {
    for (const q of ["graphique", "tableau", "carte", "formulaire", "agenda", "notification", "filtre", "bouton", "alerte", "jauge"]) {
      expect((searchComponents(q) as unknown as { total: number }).total, q).toBeGreaterThan(0);
    }
  });

  it("l'expansion d'acronymes de `suggest` survit — « CRM » rend toujours bpm.crud", () => {
    /* La correction porte sur l'INDEX et sur la CORRESPONDANCE, jamais sur
       l'expansion sémantique, qui est le mécanisme légitime pour « CRM ». */
    const r = suggestComposition("CRM");
    expect(r.count).toBeGreaterThan(0);
    expect(r.suggestions.map((s) => s.name)).toContain("bpm.crud");
  });
});
