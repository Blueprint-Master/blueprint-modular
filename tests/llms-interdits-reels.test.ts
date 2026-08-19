/**
 * LA DOC DU MODÈLE NE PUBLIE QUE DES INTERDITS LISIBLES — le cliquet.
 *
 * `public/llms.txt` est la référence de composants que le Maker donne au LLM.
 * Son générateur aspire, dans les sources des composants, toute LIGNE contenant
 * « INTERDIT » / « jamais » / « never », et la publie comme une règle.
 *
 * Or un commentaire fait souvent trois lignes : celle du milieu ou de la fin est
 * un FRAGMENT — ni sujet, ni contexte, et parfois le terminateur de bloc de
 * commentaire en prime.
 *
 * Mesuré avant correctif : sur les **5** lignes `INTERDIT :` publiées, **2**
 * étaient de la prose amputée, dont
 *
 *     INTERDIT : censé ne jamais faire. <terminateur de bloc>
 *
 * (le terminateur réel est retiré de cette citation — il refermerait CE
 * commentaire, ce qui est exactement la raison pour laquelle il n'a rien à
 * faire dans une doc destinée à être relue.)
 *
 * troisième ligne de « Un zéro fabriqué est une valeur qui ment, et c'est
 * précisément ce qu'un total est censé ne jamais faire. » Illisible, et
 * présenté au modèle comme une règle.
 *
 * Ce test porte sur l'ARTEFACT publié, jamais sur le générateur : c'est le
 * fichier que le modèle lit qui doit être propre.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const LLMS = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");

/** Les règles publiées, sans leur préfixe. */
function interdits(): string[] {
  return LLMS.split("\n")
    .filter((l) => l.startsWith("INTERDIT : "))
    .map((l) => l.slice("INTERDIT : ".length).trim());
}

describe("aucun interdit publié n'est un fragment", () => {
  it("il y en a — sinon ce test ne mesurerait rien", () => {
    /* Un fichier sans aucun interdit rendrait tous les tests ci-dessous verts
       pour la pire des raisons. */
    expect(interdits().length).toBeGreaterThan(0);
  });

  /**
   * Règles publiées par un GABARIT du générateur, pas par le scraping des
   * commentaires — elles ne peuvent pas être des fragments, et certaines
   * commencent par du code.
   *
   * Nommées une à une : ma première rédaction appliquait la règle « pas de
   * minuscule initiale » à TOUTES les lignes et rougissait sur celle-ci, qui
   * commence par `import`. Le prédicat vise une continuation de PHRASE ; une
   * ligne de code n'en est pas une.
   */
  const GABARITS = ["import { bpm.modal } ou tout autre destructuring"];

  it("aucune règle ISSUE DES COMMENTAIRES ne commence par une minuscule", () => {
    /* Une ligne qui commence en minuscule est la suite d'une phrase entamée
       plus haut. Les règles réelles commencent par une majuscule, un tiret de
       liste ou le mot INTERDIT. */
    for (const r of interdits()) {
      if (GABARITS.includes(r)) continue;
      expect(r[0] === r[0].toLowerCase() && r[0] !== r[0].toUpperCase(), r).toBe(false);
    }
  });

  it("les exceptions nommées existent VRAIMENT — sinon la liste blanchit à vide", () => {
    /* Une exception qui ne correspond à aucune ligne réelle laisserait croire
       que le cliquet a examiné quelque chose. */
    for (const g of GABARITS) expect(interdits(), g).toContain(g);
  });

  it("aucun ne porte le terminateur de commentaire `*/`", () => {
    /* Il n'appartient pas à la règle énoncée — sa présence signe une ligne
       recopiée telle quelle depuis la fin d'un bloc. */
    for (const r of interdits()) expect(r.endsWith("*/"), r).toBe(false);
  });

  it("le fragment mesuré avant correctif a bien DISPARU", () => {
    /* Le cas fondateur, nommé : sa réapparition dirait que la garde a sauté. */
    expect(LLMS).not.toContain("censé ne jamais faire");
  });
});

describe("les interdits LÉGITIMES sont conservés", () => {
  it("les trois règles réelles des composants sont toujours publiées", () => {
    /* La garde écarte des fragments, pas des règles : si elle se mettait à
       manger celles-ci, elle appauvrirait la doc en silence — le défaut
       inverse, et tout aussi invisible. */
    const tous = interdits().join("\n");
    expect(tous).toContain("destructuring");
    expect(tous).toContain("JSX dans data[]");
    expect(tous).toContain("le curseur seul");
  });
});
