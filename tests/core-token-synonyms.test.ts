/**
 * LES SYNONYMES DE JETONS — le cliquet.
 *
 * Le code des vues libres et des zones des apps générées est écrit par un LLM,
 * qui atteint les jetons par leur nom LE PLUS ATTENDU. Mesuré sur la production
 * Maker (60 j, 363 apps) : `--bpm-danger` demandé par 57 apps et défini par
 * ZÉRO, `--bpm-info` par 86 pour 44 définitions, `--bpm-color-border` par 10
 * avec 68 usages et AUCUN repli.
 *
 * Deux issues, toutes deux fausses : avec repli, le navigateur peint la
 * constante (donc le rouge du core, jamais celui de la charte) ; sans repli, la
 * déclaration est invalide et jetée en silence.
 *
 * Ce que ce test protège, ce n'est pas la présence des alias — c'est leur
 * FORME : un alias qui porterait une couleur littérale réintroduirait
 * exactement le défaut qu'il corrige, en le rendant invisible.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const BRUT = readFileSync(join(process.cwd(), "packages/core/src/variables.css"), "utf8");

/**
 * COMMENTAIRES RETIRÉS AVANT TOUTE ANALYSE.
 *
 * Première rédaction : le découpage cherchait `[data-theme="dark"]` dans le
 * texte brut — et le trouvait dans la PROSE du bloc d'alias, qui explique
 * justement le thème sombre. Le bloc clair était donc coupé avant les alias, et
 * trois tests rougissaient en accusant le CSS. C'est le piège que le dépôt
 * nomme ailleurs pour `grep BPM_` : un marqueur CITÉ passe pour un marqueur
 * POSÉ. Retirer les commentaires le ferme pour de bon, et protège au passage le
 * parseur d'une déclaration mise en commentaire.
 */
const CSS = BRUT.replace(/\/\*[\s\S]*?\*\//g, "");

/** Les alias livrés, avec le jeton canonique que chacun doit suivre. */
const SYNONYMES: Record<string, string> = {
  "--bpm-danger": "--bpm-error",
  "--bpm-danger-soft": "--bpm-error-soft",
  "--bpm-danger-text": "--bpm-error-text",
  "--bpm-info": "--bpm-accent",
  "--bpm-info-soft": "--bpm-accent-soft",
  "--bpm-color-text": "--bpm-text-primary",
  "--bpm-color-text-muted": "--bpm-text-muted",
  "--bpm-color-surface": "--bpm-surface",
  "--bpm-color-border": "--bpm-border",
};

/** Toutes les déclarations `--jeton: valeur` du fichier, par bloc. */
function declarations(bloc: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of bloc.matchAll(/(--bpm-[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const BLOC_CLAIR = CSS.slice(CSS.indexOf(":root {"), CSS.indexOf('[data-theme="dark"]'));
const BLOC_SOMBRE = CSS.slice(CSS.indexOf('[data-theme="dark"]'));

describe("chaque synonyme suit un jeton canonique, jamais une couleur", () => {
  it("la valeur est EXACTEMENT `var(--canonique)`", () => {
    const d = declarations(BLOC_CLAIR);
    for (const [alias, canonique] of Object.entries(SYNONYMES)) {
      expect(d[alias], alias).toBe(`var(${canonique})`);
    }
  });

  it("AUCUN alias ne porte de littéral de couleur — c'est le défaut qu'on corrige", () => {
    const d = declarations(BLOC_CLAIR);
    for (const alias of Object.keys(SYNONYMES)) {
      expect(d[alias], alias).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(d[alias], alias).not.toMatch(/\brgba?\s*\(/i);
    }
  });

  it("le canonique de chaque alias est RÉELLEMENT défini par le fichier", () => {
    /* Un alias vers un jeton inexistant ne résoudrait pas : la déclaration
       serait jetée, soit le mode d'échec d'avant, réintroduit par son propre
       correctif. */
    const d = declarations(BLOC_CLAIR);
    for (const canonique of new Set(Object.values(SYNONYMES))) {
      expect(d[canonique], canonique).toBeDefined();
    }
  });
});

describe("définis UNE fois — la justesse en thème sombre est une CONSÉQUENCE", () => {
  it("aucun alias n'est répété dans le bloc sombre", () => {
    /* Chaque alias vaut `var(--canonique)`, résolu à l'usage : il suit donc ce
       que le bloc sombre redéfinit, sans être redéclaré. Le répéter créerait
       deux tables à tenir, qui divergeraient au premier changement. */
    const sombre = declarations(BLOC_SOMBRE);
    for (const alias of Object.keys(SYNONYMES)) {
      expect(sombre[alias], `${alias} redéclaré en sombre`).toBeUndefined();
    }
  });

  it("chaque canonique visé est bien redéfini OU volontairement stable en sombre", () => {
    /* On ne l'exige pas de tous : `--bpm-error` n'est pas redéfini en sombre et
       c'est un choix du core. Le test dit seulement qu'AUCUN canonique n'est
       inconnu des deux blocs — sinon l'alias suivrait un jeton fantôme. */
    const clair = declarations(BLOC_CLAIR);
    const sombre = declarations(BLOC_SOMBRE);
    for (const canonique of new Set(Object.values(SYNONYMES))) {
      expect(canonique in clair || canonique in sombre, canonique).toBe(true);
    }
  });
});

describe("la décision `info` = `accent` n'est pas inventée ici", () => {
  it("`Message.tsx` la prenait déjà — l'alias la PUBLIE", () => {
    /* Si le composant changeait d'avis, cet alias deviendrait une seconde
       source de vérité sur la couleur d'une information. Le test le dirait. */
    const msg = readFileSync(join(process.cwd(), "components/bpm/Message.tsx"), "utf8");
    expect(msg).toContain('info: { bg: "var(--bpm-accent-soft)", border: "var(--bpm-accent)" }');
  });
});
