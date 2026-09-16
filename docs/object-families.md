# Index des familles de visuels

Mis à jour le **2026-09-16**. Cet index décrit le code et sa validation, pas une
disponibilité automatiquement déduite d’un numéro de package.

| Famille | Objets et variantes | État vérifié |
| --- | --- | --- |
| Univers | 8 planètes, Soleil, Lune, Io, Europe, Ganymède, Callisto, Titan, Encelade, Titania, Triton ; réaliste/dessin ; objets 2.0.0 | Modular #214, #217, #218 et Maker #1915, #1917 fusionnées le 2026-09-08 ; disponibilité effective en production non testée ici |
| Bâtiments, mobilité, logistique | 10 objets vectoriels historiques, 1.0.0 | Conservés sans modification |
| Météo & atmosphères | `weather-sun`, `weather-fair`, `weather-overcast`, `weather-rain`, `weather-storm`, `weather-snow` ; chacun réaliste + gouache ; 1.0.0 | Modular #220/#222/#223/#226 et Maker #1929/#1933/#1960 fusionnées, les deux dernières le 2026-09-12. [Preuves Soleil météo](previews/weather-sun/README.md). Revue live, publication npm et disponibilité en production non vérifiées |
| Formes & ondes | form-silk, form-shell, form-loop, form-ripple ; rendu studio + illustration ; 1.0.0 | Modular #225 et Maker #1951 fusionnées le 2026-09-10. Revue live et disponibilité effective en production non vérifiées |
| Eau & phénomènes naturels | `water-wave`, `water-ripple`, `water-waterfall`, `water-whirlpool` ; matière studio + gouache ; 1.0.0 | Modular #227 et Maker #1964 fusionnées le 2026-09-13. [Preuves et limites](previews/water/README.md). Publication npm et disponibilité en production non vérifiées |
| Végétation | flora-fern, flora-blossom, flora-meadow, flora-branch ; 1.0.0 | Fusionnée puis **retirée de la découverte le 2026-09-14** après revue visuelle insuffisante. Identifiants conservés pour compatibilité |
| Cristaux & matières | material-crystal, material-geode, material-liquid-metal, material-dichroic-glass, material-obsidian ; 1.0.0 | Fusionnée via Modular #229 et Maker #1973 puis **retirée de la découverte le 2026-09-14** après revue visuelle insuffisante. Identifiants conservés pour compatibilité |
| Sciences & éléments | science-periodic-table, science-atom, science-element-card, science-comparator ; nuit + papier ; 1.0.0 | Modular #230 et Maker #1982 fusionnées le 2026-09-15. Correction de suivi : la rotation atomique est remplacée par quatre concentrations locales de densité en apparition/évolution/disparition. [Preuves et limites](previews/science/README.md). Revue Chromium/mobile encore requise |

## Continuité

Ne pas recréer les six identifiants météo ni réimporter leurs matériaux. Vérifier
les PR ouvertes avant de démarrer une autre famille. Les objets candidats ne sont
pas « terminés » tant que leur animation en navigateur n’est pas approuvée.

Références et états précis de validation : [Météo](weather-atmospheres.md).
Exemples transportables : `examples/objects/weather-*.modular.json`.

PR du socle : [Modular #220, fusionnée](https://github.com/Blueprint-Master/blueprint-modular/pull/220)
et [Maker #1929](https://github.com/Blueprint-Master/blueprint-maker/pull/1929).
Correction du 2026-09-09 : éclair ramifié perceptible dès les premières secondes
de la grande vue sélectionnée, mobile compris ; éclair fixe sur les deux posters.

Reprise suivante du 2026-09-09 : le trait bleu et les contours solaires ont été
jugés sous le niveau de qualité du reste de l’objet. Canal fin éclairant le
nuage et volume de plasma texturé : [preuves et limites](previews/material-review/README.md).

Vérification du 2026-09-10 : Modular #214/#218/#220/#222/#223 et Maker
#1915/#1917/#1929/#1933 fusionnées. Les calques Terre ont été fusionnés dans
Modular #224 et Maker #1935. Aucune PR ouverte pour Formes & ondes au démarrage.
La date de fusion ne démontre ni une publication npm ni une validation visuelle.
Le soleil météorologique isolé est désormais distinct du Soleil astronomique.

Limite de publication de cette passe : l’ajout à la documentation machine
`public/llms.txt` a été refusé par le contrôle automatique d’autorisation.
Ce fichier et son générateur sont restés inchangés dans #225 ; leur extension
pour Formes & ondes demeure à publier après résolution de ce blocage.

Vérification du 2026-09-11 : Modular #225 et Maker #1951 sont fusionnées. Aucun
doublon météo ouvert n’a été trouvé. La passe complète la famille existante avec
`weather-sun`, sans toucher aux cinq rendus fusionnés ni au Soleil d’Univers.
Modular #226 et Maker #1960 ont été fusionnées le 2026-09-12. Cette fusion ne vaut
ni publication npm, ni déploiement, ni validation visuelle live.

Vérification du 2026-09-13 : Eau est désormais fusionnée dans Modular et Maker,
sans que cela démontre une publication npm. Végétation a ensuite été fusionnée.
Ses posters et sources sont originaux Apache-2.0, sans asset tiers. Le runner
local était indisponible : inspection animée, coût de frame et téléphone restent
explicitement non validés.

Vérification du 2026-09-14 : aucune PR ouverte ; Modular #228 et Maker #1968 sont
fusionnées. Cristaux & matières est la première famille absente. Ses sources et
posters sont originaux Apache-2.0, sans asset tiers. Les planches multi-instants
et la vidéo utilisent le renderer livré via Canvas natif ; la manipulation DOM
dans Chromium n’a pas été exécutée, le binaire du navigateur étant indisponible.

Vérification du 2026-09-15 : Modular #230 et Maker #1982 ont été fusionnées.
Revue du modèle scientifique : le tableau n’expose plus 118 arrêts
successifs au clavier ; une seule cellule est tabulable, les flèches suivent
ligne et colonne, l’état sélectionné est annoncé, et toute vitesse reçue hors
manifeste est bornée. La CI publique du commit correspondant est verte. La
revue visuelle live demeure bloquante avant promotion.

Vérification du 2026-09-16 : la fusion ne clôt pas la dette visuelle. Le simple
mouvement orbital de `science-atom` est remplacé par une évolution locale de
densité en quatre lobes déphasés sur 12 s. Vignettes, données, calques et API
restent inchangés. La qualité animée doit encore être confirmée dans Chromium et
sur mobile avant publication npm ou affirmation de disponibilité en production.
