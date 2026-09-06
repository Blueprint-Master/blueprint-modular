/**
 * LA GARDE CONTRE LE RETARD DE PUBLICATION.
 *
 * Le 19/08, huit commits touchant le core dormaient non publiés — dont trois
 * qui corrigeaient des défauts que blueprint-maker mesurait au même moment en
 * production, et un qu'une tâche Maker attendait explicitement depuis des
 * semaines. Le workflow marchait ; il attendait un bump manuel que rien ne
 * signalait.
 *
 * Ces tests tiennent la seule chose qui compte pour un détecteur de silence :
 * **qu'il ne se taise jamais pour la mauvaise raison.**
 */
import { describe, expect, it } from "vitest";

import {
  CHEMINS_PUBLIES,
  commitsDepuisLaVersion,
  versionDeclaree,
  verdict,
} from "../scripts/check-core-publish-drift.mjs";

describe("les TROIS états, jamais deux", () => {
  it("« indéterminé » n'est pas « à jour »", () => {
    /* npm injoignable, ou clone superficiel : le script n'a rien pu vérifier.
       Rendre « à jour » ici serait exactement la faute qu'il existe pour
       corriger — un mécanisme muet et un mécanisme mort doivent se voir
       différemment. */
    expect(verdict({ publiee: null, commits: [] })).toBe("indetermine");
    /* Publiée MAIS historique illisible : là, on ne sait vraiment pas. */
    expect(verdict({ publiee: true, commits: null })).toBe("indetermine");
  });

  it("publiée + des commits derrière ⇒ EN RETARD", () => {
    expect(verdict({ publiee: true, commits: ["abc fix(x)"] })).toBe("en-retard");
  });

  it("publiée + rien derrière ⇒ à jour", () => {
    expect(verdict({ publiee: true, commits: [] })).toBe("a-jour");
  });

  it("pas encore publiée ⇒ à publier, jamais « en retard »", () => {
    /* C'est l'état NORMAL d'une PR qui vient de bumper : rien à signaler. */
    expect(verdict({ publiee: false, commits: ["abc"] })).toBe("a-publier");
  });

  it("⚠️ non publiée + historique ILLISIBLE ⇒ à publier quand même", () => {
    /* Le cas qui a fait rougir la PR qui corrige le défaut. Une version qu'on
       vient de bumper n'existe PAS encore dans l'historique — le commit n'est
       pas fait — donc `commits` vaut `null`. La première rédaction testait
       l'historique en premier et annonçait « je n'ai pas pu vérifier » sur
       l'état exactement sain qu'elle est censée récompenser.

       Version non publiée ⇒ rien n'est en retard, et l'historique est hors
       sujet. Un détecteur qui crie sur le bon comportement cesse d'être lu. */
    expect(verdict({ publiee: false, commits: null })).toBe("a-publier");
  });
});

describe("le périmètre publié", () => {
  it("couvre les deux dossiers qui atteignent le paquet", () => {
    /* `components/` est la source des composants, `packages/core/` le paquet
       lui-même. Un changement ailleurs (docs, scripts, connecteurs) n'a pas
       besoin d'une publication — l'inclure ferait crier le détecteur en
       permanence, et un détecteur qui crie toujours ne se lit plus. */
    expect(CHEMINS_PUBLIES).toEqual(["components/", "packages/core/"]);
  });
});

describe("la lecture du dépôt", () => {
  it("lit la version réellement déclarée", () => {
    expect(versionDeclaree()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("une version jamais posée dans l'historique rend `null`, pas une liste vide", () => {
    /* Une liste vide se lirait « rien à publier ». `null` se lit « je n'ai pas
       su remonter l'historique » — et c'est ce que rend un clone superficiel. */
    expect(commitsDepuisLaVersion("0.0.0-inexistante")).toBeNull();
  });
});
