/**
 * CE QUI COMPTE COMME UNE CORRESPONDANCE — un seul reconnaisseur, partagé.
 *
 * ## Le défaut, mesuré
 *
 * Le moteur comparait par `champ.includes(jeton)`, c'est-à-dire par SOUS-CHAÎNE
 * nue. En français, où les mots sont longs et composés, c'est une machine à
 * faux positifs. Comptés sur les 156 composants du registre :
 *
 * | requête | composants rendus AVANT | dont un vrai mot | bruit |
 * |---|---|---|---|
 * | `art` | **55** | **0** | 55 (« c**art**e », « gr**art**… » non — « éc**art** », « dép**art** », « qu**art** ») |
 * | `eur` | **123** | 1 | 122 (« coul**eur** », « val**eur** », « haut**eur** », « utilisat**eur** ») |
 * | `bar` | 40 | 10 | 30 |
 * | `nom` | 30 | 12 | 18 (« **nom**bre », « auto**nom**e », « éco**nom**ique ») |
 * | `chart` | 29 | 13 | 16 (« la **chart**e » — le mot français, pas le graphe) |
 *
 * Une requête `art` rendait donc **55 composants sur 156, tous faux**. Le
 * moteur ne s'abstenait jamais : il répondait toujours, avec l'autorité d'une
 * liste. C'est exactement le défaut que le dépôt traque ailleurs — *un
 * mécanisme muet et un mécanisme mort doivent se voir différemment* — pris du
 * côté d'un mécanisme qui, lui, parle sans savoir.
 *
 * ## La règle retenue
 *
 * Une correspondance est ancrée sur un DÉBUT DE MOT : un mot du champ
 * correspond à un jeton de requête s'il lui est égal, ou s'il COMMENCE par lui.
 * Les jetons de requête faisant déjà 3 caractères au minimum (`tokenize`), il
 * n'y a pas de second seuil à régler.
 *
 * Le préfixe est conservé et non remplacé par l'égalité : il porte le pluriel
 * et la dérivation (`graphique` → `graphiques`, `bar` → `barre de progression`,
 * `note` → `notes`). Mesuré, c'est lui qui rend `bpm.progress` et
 * `bpm.lineChart` à la requête `bar` ; l'égalité seule les perdait.
 *
 * ## Le camelCase est DÉCOUPÉ, et c'est ce qui rend l'ancrage acceptable
 *
 * `bpm.barChart` s'écrit en un seul mot une fois abaissé en casse : sans
 * découpage, ancrer sur un début de mot lui ferait perdre la requête `chart`.
 * On coupe donc sur la frontière minuscule→majuscule AVANT d'abaisser la casse
 * — raison pour laquelle l'index `_haystack` conserve sa casse d'origine
 * (`scripts/generate-mcp-registry.mjs`).
 */

/** Sépare sur tout ce qui n'est ni lettre (accents compris) ni chiffre. */
const SEPARATEURS = /[^a-zà-öø-ÿ0-9]+/i;

/** Frontière minuscule/chiffre → majuscule : `barChart` → `bar Chart`. */
const CAMEL = /([a-zà-öø-ÿ0-9])([A-ZÀ-Þ])/g;

/**
 * Les mots d'un champ, prêts pour la comparaison.
 *
 * ⚠️ Prend le champ dans sa CASSE D'ORIGINE — abaisser la casse en amont
 * détruirait la frontière camelCase, donc `bar` cesserait de trouver
 * `bpm.barChart`.
 */
export function fieldWords(field: string): string[] {
  return String(field ?? "")
    .replace(CAMEL, "$1 $2")
    .toLowerCase()
    .split(SEPARATEURS)
    .filter(Boolean);
}

/**
 * Un mot de champ répond-il à un jeton de requête ?
 *
 * Égalité, ou début de mot. Jamais le milieu : c'est toute la correction.
 */
export function wordAnswers(word: string, token: string): boolean {
  return word === token || word.startsWith(token);
}

/**
 * Le champ contient-il un mot répondant à l'une des variantes du jeton ?
 *
 * `variants` est injecté par l'appelant (`tokenVariants` de `registry.ts`) :
 * la tolérance au pluriel a UN producteur, et ce module ne la réimplémente pas.
 */
export function fieldAnswers(field: string, variants: readonly string[]): boolean {
  const words = fieldWords(field);
  return variants.some((v) => words.some((w) => wordAnswers(w, v)));
}
