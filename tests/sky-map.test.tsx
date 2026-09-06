/**
 * `bpm.skyMap` — LA CARTE CÉLESTE ENTRE DANS LE CORE, ET ELLE Y ENTRE TESTÉE.
 *
 * ## D'où vient ce composant
 *
 * Il a été écrit dans le **Maker** (`lib/builder/celestial-map.ts`, PR
 * blueprint-maker#1874) sous forme de source EMBARQUÉE dans chaque page
 * générée : 175 lignes de rendu SVG interpolées dans le `_page-content.tsx` de
 * l'app. Ça marche, c'est éprouvé — et c'est au mauvais endroit. Un composant
 * visuel réutilisable (projection, zoom, sélection clavier, liste tactile) est
 * un composant du CORE ; le laisser dans le builder garantissait le doublon le
 * jour où le core en publierait un, et ce dépôt tient une doctrine de déférence
 * explicite là-dessus (`BPM_TAB_ACTIVE_MARKER`, côté Maker).
 *
 * **Ce n'était pas un doublon au moment de l'écrire** — vérifié par quatre
 * chemins concordants avant de commencer : catalogue MCP des 156 composants,
 * bundle publié `0.3.12`, barrel `bpm.d.ts`, et `grep` sur la source de ce
 * dépôt. Aucune capacité céleste nulle part. Et `bpm.mapView` ne pouvait pas
 * la porter : c'est du Leaflet géographique, une projection de Hammer n'y est
 * pas exprimable.
 *
 * ## Ce que ce test tient, et pourquoi ces cas-là
 *
 * La valeur du composant n'est pas le dessin, c'est la LECTURE des
 * coordonnées : une ascension droite s'écrit de six façons légitimes, et une
 * mauvaise lecture place un objet ailleurs dans le ciel sans que rien ne le
 * signale. Les cas ci-dessous sont donc d'abord ceux de `parseCelestialAngle`,
 * puis l'invariant qui rend le composant honnête : **un point illisible est
 * COMPTÉ, jamais escamoté**.
 */
import { describe, expect, it } from "vitest";

import { parseCelestialAngle, projectHammer } from "../components/bpm/SkyMap";

describe("parseCelestialAngle — les six écritures légitimes", () => {
  it("la sonde est VIVANTE : une forme connue-bonne se lit", () => {
    /* Sans ce cas, « tout rend null » passerait tous les tests d'abstention
       ci-dessous — le résultat le plus rassurant serait un parseur mort. */
    expect(parseCelestialAngle("180", "ra")).toBe(180);
  });

  it("une RA DÉCIMALE est en degrés par défaut, en heures si on le dit", () => {
    expect(parseCelestialAngle("12", "ra")).toBe(12);
    expect(parseCelestialAngle("12", "ra", "hours")).toBe(180);
  });

  it("une RA SEXAGÉSIMALE est en heures — c'est ce que la notation VEUT DIRE", () => {
    /* `06:45:09` en ascension droite n'a jamais signifié 6 degrés. L'unité
       décimale (`raUnit`) ne renverse pas cette convention. */
    expect(parseCelestialAngle("06:45:09", "ra")).toBeCloseTo(101.2875, 4);
    expect(parseCelestialAngle("6h45m09s", "ra")).toBeCloseTo(101.2875, 4);
  });

  it("une déclinaison garde son signe et sa borne ±90°", () => {
    expect(parseCelestialAngle("-16:42:58", "dec")).toBeCloseTo(-16.7161, 4);
    expect(parseCelestialAngle("+41 16 09", "dec")).toBeCloseTo(41.2692, 4);
    expect(parseCelestialAngle("91", "dec"), "hors borne").toBeNull();
    expect(parseCelestialAngle("-90.1", "dec"), "hors borne").toBeNull();
  });

  it("une déclinaison en HEURES est refusée, pas réinterprétée", () => {
    /* `41h16m` est une ascension droite écrite dans la mauvaise colonne. La
       deviner placerait l'objet ailleurs dans le ciel, en silence. */
    expect(parseCelestialAngle("41h16m", "dec")).toBeNull();
  });

  it("les signes typographiques et la virgule décimale sont acceptés", () => {
    /* Une saisie française porte « −16,7 » : le moins Unicode et la virgule.
       Les refuser ferait disparaître des lignes parfaitement valides. */
    expect(parseCelestialAngle("−16,7", "dec")).toBeCloseTo(-16.7, 4);
  });

  it("ABSTENTION sur tout le reste — jamais une valeur devinée", () => {
    for (const raw of ["", "  ", "abc", "12:70:00", "12:30:70", null, undefined, {}, [], true]) {
      expect(parseCelestialAngle(raw, "ra"), `forme acceptée à tort : ${JSON.stringify(raw)}`).toBeNull();
    }
    expect(parseCelestialAngle("400", "ra"), "au-delà de 360°").toBeNull();
    expect(parseCelestialAngle("25", "ra", "hours"), "au-delà de 24 h").toBeNull();
  });
});

describe("projectHammer — les repères que la carte dessine", () => {
  it("le centre, les pôles et la coupure 0/24 h tombent où on les attend", () => {
    /* Ces quatre points ancrent le canevas 900×500 : si la projection dérive,
       la grille et les points dérivent ENSEMBLE et le dessin reste plausible —
       c'est exactement le défaut qu'un test de rendu ne verrait pas. */
    expect(projectHammer(180, 0)).toEqual({ x: 450, y: 250 });
    expect(projectHammer(180, 90).y).toBeCloseTo(50, 6);
    expect(projectHammer(180, -90).y).toBeCloseTo(450, 6);
    const bord = projectHammer(0, 0);
    expect(bord.x).toBeCloseTo(850, 6);
    expect(bord.y).toBeCloseTo(250, 6);
  });

  it("l'ascension droite croît vers la GAUCHE — convention du ciel vu de l'intérieur", () => {
    /* Une carte du ciel n'est pas une carte de la Terre : on regarde la sphère
       depuis son centre, donc l'axe est inversé. L'orienter comme une mappemonde
       rendrait un ciel en miroir, lisible et faux. */
    expect(projectHammer(90, 0).x).toBeGreaterThan(projectHammer(270, 0).x);
  });
});
