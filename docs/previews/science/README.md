# Sciences & éléments — candidat du 14 septembre 2026

Cette famille remplace la logique de séries décoratives par quatre vues
transverses d’un même modèle de données :

- science-periodic-table : les 118 éléments, sélection, groupes, périodes,
  blocs et familles ;
- science-atom : noyau et densité électronique schématiques ;
- science-element-card : fiche d’identité recomposable ;
- science-comparator : comparaison de deux éléments.

Chaque vue conserve cinq calques indépendants : structure, identité,
classification, repères et analyse. L’élément, le second élément et le mode de
couleur sont transportés dans .modular.json. Les styles midnight et paper ne
changent pas les données.

## Sources et limites

- IUPAC, Periodic Table of Elements, version du 4 mai 2022 :
  https://iupac.org/what-we-do/periodic-table-of-elements/
- NIST, Basic Atomic Spectroscopic Data — Periodic Table :
  https://physics.nist.gov/PhysRefData/Handbook/periodictable.htm

Les numéros atomiques, symboles et positions suivent ces références. La vue
atomique est une représentation pédagogique de densité, non un calcul
d’orbitales, non une géométrie d’électrons et non une vue à l’échelle.

## Aperçus issus du composant

| Vue | Nuit | Papier |
|---|---|---|
| Tableau périodique | ![Tableau périodique nuit](science-periodic-table-midnight.svg) | ![Tableau périodique papier](science-periodic-table-paper.svg) |
| Analyseur atomique | ![Analyseur atomique nuit](science-atom-midnight.svg) | ![Analyseur atomique papier](science-atom-paper.svg) |
| Fiche d’élément | ![Fiche d’élément nuit](science-element-card-midnight.svg) | ![Fiche d’élément papier](science-element-card-paper.svg) |
| Comparateur | ![Comparateur nuit](science-comparator-midnight.svg) | ![Comparateur papier](science-comparator-paper.svg) |

## Preuves exécutées

Les huit SVG statiques ont été rendus depuis le composant réel puis inspectés
dans les deux styles. Leur poids transféré avec `gzip -9` va de 592 octets à
3,13 Kio. Aucun raster ni asset tiers n’est chargé.

Chromium n’a pas pu être installé : le CDN Playwright a répondu par des délais
dépassés puis une erreur 502. L’interaction réelle, l’animation CSS et le rendu
sur téléphone physique restent donc non validés. La famille doit rester en
brouillon jusqu’à cette revue.
