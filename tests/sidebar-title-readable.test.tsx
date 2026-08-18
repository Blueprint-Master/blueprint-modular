/**
 * LE NOM DE L'APP RESTE LISIBLE — le cliquet.
 *
 * ## Le fait, mesuré sur la critique vision de la production (20 j)
 *
 * Quatre constats, deux apps sans rapport :
 *
 * - « Le titre de la sidebar est tronqué 'Pilotage Trésore…' **sans tooltip**
 *   ni version courte lisible » ;
 * - « Le titre tronqué 'Pilotage Trésore…' dans la sidebar manque de lisibilité
 *   et **trahit un manque de soin sur l'identité de l'application** » ;
 * - « Le titre tronqué 'Gestion Atelier …' […] **ne donne pas confiance** sur
 *   l'identité de l'application » ;
 * - « 'Gestion Atelier …' est tronqué sans tooltip visible, **perte
 *   d'information contextuelle** ».
 *
 * ## Les deux moitiés du correctif
 *
 * L'infobulle rend l'information au SURVOL — donc à personne sur un écran
 * tactile. Le pavé à deux lignes la rend à l'œil. Les deux ensemble couvrent
 * les deux publics ; l'une sans l'autre en laisse un dehors.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PageLayout } from "@/components/bpm/PageLayout";

const TITRE = "Pilotage Trésorerie TPE";

function rendu(title: unknown = TITRE): string {
  return renderToStaticMarkup(
    <PageLayout
      title={title as string}
      items={[{ key: "a", label: "Accueil", icon: "home" }]}
      currentItem="a"
      onNavigate={() => {}}
    >
      <span>contenu</span>
    </PageLayout>,
  );
}

/** Le `<span>` du titre : le seul à porter la taille `lg` et la graisse 600. */
function spanTitre(html: string): string {
  const m = /<span[^>]*font-size:var\(--bpm-font-size-lg\)[^>]*>/.exec(html);
  return m?.[0] ?? "";
}

describe("l'information est récupérable au SURVOL", () => {
  it("le `<span>` du titre porte le nom complet en `title`", () => {
    expect(rendu()).toContain(`title="${TITRE}"`);
  });

  it("un appelant NON TYPÉ qui passe autre chose ne fabrique pas d'infobulle", () => {
    /* Le contrat déclare `title: string`, mais le consommateur réel est du code
       émis (`bpm.pageLayout({ title })`) qui ne passe pas par ce contrat. Y
       forcer un `String(...)` produirait « [object Object] » au survol — une
       infobulle qui MENT est pire que pas d'infobulle. D'où la garde, et d'où
       le cast ci-dessous : il reproduit l'appelant, il ne triche pas. */
    const html = rendu(<em>Titre riche</em>);
    expect(html).not.toContain("[object Object]");
  });
});

describe("l'information est récupérable À L'ŒIL", () => {
  it("le titre s'étend sur DEUX lignes avant de couper", () => {
    /* Sans ça, le correctif ne servirait qu'aux souris : sur tactile, rien ne
       déclenche l'infobulle. */
    const span = spanTitre(rendu());
    expect(span).toContain("-webkit-line-clamp:2");
    expect(span).toContain("-webkit-box-orient:vertical");
    expect(span).toContain("display:-webkit-box");
  });

  it("le retour à la ligne est AUTORISÉ — `nowrap` l'interdisait", () => {
    /* C'était la cause : une seule ligne, donc ellipse dès le deuxième mot. */
    const span = spanTitre(rendu());
    expect(span).toContain("white-space:normal");
    expect(span).not.toContain("white-space:nowrap");
  });

  it("au-delà de deux lignes, l'ellipse reprend son rôle", () => {
    /* On repousse la coupure, on ne la supprime pas : un nom à rallonge ne doit
       pas pousser la navigation hors de l'écran. */
    expect(spanTitre(rendu())).toContain("overflow:hidden");
  });
});

describe("ce qui ne bouge pas", () => {
  it("taille, graisse et interligne du titre sont conservés", () => {
    const span = spanTitre(rendu());
    expect(span).toContain("font-weight:600");
    expect(span).toContain("line-height:1.2");
    expect(span).toContain("color:var(--bpm-text)");
  });

  it("le titre est bien RENDU, pas seulement stylé", () => {
    expect(rendu()).toContain(TITRE);
  });
});
