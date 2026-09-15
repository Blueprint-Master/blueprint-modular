/**
 * LA VARIANTE `info` DU BADGE — le dernier verrou avant un barrel typé.
 *
 * ## Le défaut, mesuré côté Maker
 *
 * `bpm.badge` rend `bpm-badge bpm-badge-${variant}` en classe et
 * `{ ...TABLE[variant], ...TAILLE[size] }` en style INLINE. Tant que `info`
 * manquait à `BadgeVariant`, `TABLE["info"]` valait `undefined`, `{...undefined}`
 * n'apportait rien — **ni fond, ni bordure, ni encre** : du texte nu au milieu
 * de ses voisins colorés. Or le builder du Maker ÉMET `variant: 'info'` pour son
 * seau « en cours », et « En cours » est le libellé de statut le plus répandu de
 * son corpus (190 apps).
 *
 * ## Ce que sa fermeture débloque, et c'est la vraie raison de ce test
 *
 * Les props `bpm.*` ne sont opposables sur AUCUN composant sauf cinq : le
 * `bpm.d.ts` publié référence ses types par des chemins qui SORTENT du paquet,
 * `skipLibCheck` avale les `TS2307`, et les props valent `any` en silence. En
 * posant les vrais types (mesure du 15/09), la sortie du Maker rend **62
 * diagnostics** — dont **57 sont cette seule variante**. Publier de vrais types
 * exige donc d'abord ce membre d'union : sans lui, tout gate de compilation du
 * Maker partirait rouge sur du code parfaitement sain.
 *
 * ## Ce que le test tient — et ce qu'il refuse de tenir
 *
 * Il ne RÉCITE pas la couleur d'`info`. Il vérifie que le badge la DÉRIVE des
 * décisions que ce paquet a déjà prises pour ce mot (`Message.tsx`), qu'il
 * n'introduit aucune couleur littérale, et que chaque `var()` porte son repli —
 * une `var()` nue qui ne résout pas fait JETER la déclaration, donc rendrait le
 * texte nu que cette variante répare.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Badge, type BadgeVariant } from "@/components/bpm/Badge";

const SRC_BADGE = readFileSync(
  join(process.cwd(), "components/bpm/Badge.tsx"),
  "utf8",
);
const SRC_MESSAGE = readFileSync(
  join(process.cwd(), "components/bpm/Message.tsx"),
  "utf8",
);

/** Retire les commentaires AVANT toute analyse : on borne au CODE, jamais à la prose. */
function sansCommentaires(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/** Le corps d'une entrée de `variantStyles`, DÉRIVÉ de la source. */
function entreeDeVariante(nom: string): string {
  const code = sansCommentaires(SRC_BADGE);
  const debut = code.indexOf(`\n  ${nom}: {`);
  expect(
    debut,
    `entrée \`${nom}\` introuvable dans variantStyles — la source a changé de forme`,
  ).toBeGreaterThan(-1);
  const fin = code.indexOf("\n  },", debut);
  expect(fin).toBeGreaterThan(debut);
  return code.slice(debut, fin);
}

/** Les familles de jetons citées par un fragment (`--bpm-info` -> `info`). */
function famillesCitees(fragment: string): Set<string> {
  const familles = new Set<string>();
  for (const m of fragment.matchAll(/--bpm-([a-z0-9-]+)/g)) {
    const brut = m[1]!;
    // `info-soft` et `info` appartiennent à la même famille ; `radius-sm` non.
    familles.add(brut.replace(/-(soft|text)$/, ""));
  }
  return familles;
}

describe("BadgeVariant porte `info`", () => {
  it("l'union ET la table le déclarent — les deux, jamais l'une sans l'autre", () => {
    // La table est le style INLINE : c'est elle qui peint. L'union seule
    // rendrait `variant="info"` type-valide et toujours non peint.
    const variante: BadgeVariant = "info";
    expect(variante).toBe("info");

    const code = sansCommentaires(SRC_BADGE);
    const union = code.match(/export type BadgeVariant = ([^;]+);/)?.[1] ?? "";
    expect(union, "l'union doit déclarer `info`").toContain('"info"');
    expect(code, "la table doit porter son entrée").toContain("\n  info: {");
  });

  it("le rendu porte la classe `bpm-badge-info` ET un style non vide", () => {
    const html = renderToStaticMarkup(<Badge variant="info">En cours</Badge>);
    expect(html).toContain("bpm-badge-info");
    // Le défaut réparé est précisément « aucun style » : on l'éprouve.
    const style = html.match(/style="([^"]*)"/)?.[1] ?? "";
    expect(style).toMatch(/background/);
    expect(style).toMatch(/border/);
  });

  it("SENTINELLE — une variante inconnue rend bien du texte nu (le défaut d'hier)", () => {
    // Sans elle, « le style n'est pas vide » passerait le jour où la table
    // gagnerait un repli générique : le test cesserait de mesurer l'absence.
    const html = renderToStaticMarkup(
      // @ts-expect-error — variante hors union, exactement ce qu'était `info`
      <Badge variant="pasunevariante">x</Badge>,
    );
    const style = html.match(/style="([^"]*)"/)?.[1] ?? "";
    expect(style).not.toMatch(/background/);
  });
});

describe("`info` ne CHOISIT aucune couleur — il transcrit", () => {
  it("aucune couleur littérale : tout passe par un jeton", () => {
    const entree = entreeDeVariante("info");
    // La règle du bloc d'alias de `variables.css`, appliquée ici : un littéral
    // réintroduirait le rouge du core sous une charte terracotta.
    expect(entree).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(entree).not.toMatch(/\b(rgba?|hsla?)\s*\(/);
  });

  it("la famille de jetons est celle que `Message.tsx` a DÉJÀ élue pour `info`", () => {
    // Dérivation, pas récitation : si Message change d'avis sur ce que `info`
    // veut dire, ce test rougit au lieu de laisser les deux diverger.
    const infoDeMessage =
      sansCommentaires(SRC_MESSAGE).match(/\n\s*info:\s*\{[^}]*\}/)?.[0] ?? "";
    expect(infoDeMessage, "décision `info` de Message introuvable").not.toBe("");

    const attendues = famillesCitees(infoDeMessage);
    const obtenues = famillesCitees(entreeDeVariante("info"));
    // Le badge cite en plus `radius-sm`, comme ses quatre voisines : on exige
    // l'INCLUSION des familles de couleur, pas l'égalité des ensembles.
    for (const f of attendues) {
      expect(
        [...obtenues].some((o) => o === f || o === "info"),
        `la famille \`--bpm-${f}\` de Message doit être honorée par le badge`,
      ).toBe(true);
    }
  });

  it("TOUT jeton cité par une variante est DÉFINI par ce paquet", () => {
    /* Le vrai invariant de sûreté — et celui qui manquait. Les variantes
       emploient des `var()` NUES : une `var()` nue qui ne résout pas fait JETER
       la déclaration, donc le badge redevient le texte nu que ce chantier
       répare. La garde n'est donc pas « ajoute un repli », c'est « ne cite que
       ce que tu définis ».

       C'est aussi ce cliquet qui aurait rendu le verrou visible plus tôt : la
       forme évidente pour l'encre d'`info` était `--bpm-accent-text`, par
       symétrie avec `--bpm-success-text`. Ce jeton N'EXISTE NULLE PART — ni
       dans `variables.css`, ni dans la feuille publiée — et rien ne l'aurait
       dit. Le test le dit. */
    const vars = readFileSync(
      join(process.cwd(), "packages/core/src/variables.css"),
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");
    const definis = new Set(
      [...vars.matchAll(/(--bpm-[a-z0-9-]+)\s*:/g)].map((m) => m[1]!),
    );
    // Sentinelle : un recenseur cassé rendrait l'ensemble vide, et « aucun
    // jeton manquant » serait vrai sur rien.
    expect(definis.size, "aucun jeton lu dans variables.css").toBeGreaterThan(30);
    expect(definis.has("--bpm-info-soft")).toBe(true);
    // Contre-épreuve : le jeton que la symétrie suggère n'existe PAS.
    expect(definis.has("--bpm-accent-text")).toBe(false);

    const manquants: string[] = [];
    for (const nom of ["default", "primary", "success", "warning", "error", "info"]) {
      for (const m of entreeDeVariante(nom).matchAll(/--bpm-[a-z0-9-]+/g)) {
        if (!definis.has(m[0])) manquants.push(`${nom} -> ${m[0]}`);
      }
    }
    expect(manquants, `jetons cités et non définis : ${manquants.join(", ")}`).toEqual([]);
  });
});

describe("les quatre variantes d'hier ne bougent pas d'un octet", () => {
  // Ce chantier AJOUTE ; il ne redessine rien. Sans ce cliquet, une retouche
  // de couleur passerait pour un effet de bord de l'ajout.
  const ATTENDU: Record<string, string[]> = {
    default: ["--bpm-bg-secondary", "--bpm-text", "--bpm-border", "--bpm-radius-sm"],
    primary: ["--bpm-accent", "--bpm-accent-contrast", "--bpm-radius-sm"],
    success: ["--bpm-success-soft", "--bpm-success-text", "--bpm-success", "--bpm-radius-sm"],
    warning: ["--bpm-warning-soft", "--bpm-warning-text", "--bpm-warning", "--bpm-radius-sm"],
    error: ["--bpm-error-soft", "--bpm-error-text", "--bpm-error", "--bpm-radius-sm"],
  };

  for (const [nom, jetons] of Object.entries(ATTENDU)) {
    it(`\`${nom}\` cite exactement ses jetons d'hier`, () => {
      const entree = entreeDeVariante(nom);
      const cites = [...entree.matchAll(/--bpm-[a-z0-9-]+/g)].map((m) => m[0]);
      expect([...new Set(cites)].sort()).toEqual([...new Set(jetons)].sort());
    });
  }
});

describe("la fiche du composant ne peut plus diverger de l'union", () => {
  /* Le défaut trouvé en écrivant ce chantier : la page de documentation du
     badge portait sa PROPRE copie de l'union (`type BadgeVariant = …`) et une
     TROISIÈME sous forme de `<option>` écrites à la main. Ajouter `info` au
     composant laissait donc la page affirmer qu'il n'existe que cinq
     variantes — la doctrine « deux listes tenues à la main divergent »,
     commise par la page qui documente la liste. */
  const SRC_FICHE = readFileSync(
    join(process.cwd(), "app/(app)/composants/badge/Fiche.tsx"),
    "utf8",
  );

  /** L'union, DÉRIVÉE de la source du composant. */
  function unionDuComposant(): string[] {
    const brut =
      sansCommentaires(SRC_BADGE).match(/export type BadgeVariant = ([^;]+);/)?.[1] ?? "";
    return [...brut.matchAll(/"([a-z]+)"/g)].map((m) => m[1]!);
  }

  it("la liste de la fiche EST l'union du composant, dans le même ordre", () => {
    const attendu = unionDuComposant();
    expect(attendu.length, "union du composant illisible").toBeGreaterThan(4);

    const bloc = sansCommentaires(SRC_FICHE).match(
      /const VARIANTES: readonly BadgeVariant\[\] = \[([^\]]*)\]/,
    )?.[1];
    expect(bloc, "liste `VARIANTES` introuvable dans la fiche").toBeDefined();
    const obtenu = [...bloc!.matchAll(/"([a-z]+)"/g)].map((m) => m[1]!);
    expect(obtenu).toEqual(attendu);
  });

  it("la fiche ne REDÉCLARE plus l'union ni ses options", () => {
    // Sans cette garde, le test ci-dessus resterait vert pendant qu'une copie
    // reviendrait à côté : on interdit la FORME, pas seulement l'écart.
    const code = sansCommentaires(SRC_FICHE);
    expect(code).not.toMatch(/type BadgeVariant\s*=/);
    expect(code).not.toMatch(/<option value="success">/);
  });
});
