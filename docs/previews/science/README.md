# Sciences & éléments — suivi qualité au 16 septembre 2026

Cette famille remplace la logique de séries décoratives par quatre vues
transverses d’un même modèle de données :

- science-periodic-table : les 118 éléments, sélection, groupes, périodes,
  blocs et familles ;
- science-atom : noyau et densité électronique schématiques ;
- science-element-card : fiche d’identité recomposable ;
- science-comparator : comparaison de deux éléments.

Chaque vue conserve cinq calques indépendants : structure, identité,
classification, repères et analyse. L’élément, le second élément, le mode de
couleur et le style sont transportés dans `.modular.json`.

Trois styles sont disponibles : `midnight`, `paper` et `transparent`.
Le dernier n’émet aucun rectangle de fond. Il hérite des couleurs de
l’application hôte via `currentColor` et les jetons `--bpm-text`,
`--bpm-text-muted` et `--bpm-border`.

## Sources et limites

- IUPAC, Periodic Table of Elements, version du 4 mai 2022 :
  https://iupac.org/what-we-do/periodic-table-of-elements/
- NIST, Basic Atomic Spectroscopic Data — Periodic Table :
  https://physics.nist.gov/PhysRefData/Handbook/periodictable.htm

Les numéros atomiques, symboles et positions suivent ces références. La vue
atomique est une représentation pédagogique de densité, non un calcul
d’orbitales, non une géométrie d’électrons et non une vue à l’échelle.

## Mouvement caractéristique

L’analyseur n’est plus présenté comme un pictogramme orbital. Il combine un
noyau structuré, des contours d’isodensité et quatre concentrations locales.
Chaque lobe apparaît, se concentre, se dilate puis se dissipe, avec des phases
décalées sur une boucle de 12 s. Une pause fige la phase,
`prefers-reduced-motion` supprime le cycle et les vignettes restent fixes.

[Ouvrir la preuve SVG animée](science-atom-motion.svg).

## Aperçus

| Vue | Nuit | Papier | Transparent |
|---|---|---|---|
| Tableau périodique | ![Tableau périodique nuit](science-periodic-table-midnight.svg) | ![Tableau périodique papier](science-periodic-table-paper.svg) | [SVG transparent](science-periodic-table-transparent.svg) |
| Analyseur atomique | ![Analyseur atomique nuit](science-atom-midnight.svg) | ![Analyseur atomique papier](science-atom-paper.svg) | [SVG transparent](science-atom-transparent.svg) |
| Fiche d’élément | ![Fiche d’élément nuit](science-element-card-midnight.svg) | ![Fiche d’élément papier](science-element-card-paper.svg) | [SVG transparent](science-element-card-transparent.svg) |
| Comparateur | ![Comparateur nuit](science-comparator-midnight.svg) | ![Comparateur papier](science-comparator-paper.svg) | [SVG transparent](science-comparator-transparent.svg) |

## Preuves exécutées

Les douze SVG sont distribués sans raster ni asset tiers. Les quatre variantes
transparentes n’ont aucun aplat couvrant et conservent un canal alpha réel.
Elles ont été composées sur fonds clair et sombre ; le contraste textuel suit
volontairement les jetons ou la couleur héritée de l’hôte.

La structure de l’animation, ses quatre phases locales, la pause, le bornage de
vitesse, la transparence et `prefers-reduced-motion` sont couverts par tests.
Les rendus Nuit et Papier du nouvel analyseur ont été inspectés à 520 px.
Le composant monté dans le catalogue sur téléphone physique, le coût GPU et la
batterie restent non validés.
