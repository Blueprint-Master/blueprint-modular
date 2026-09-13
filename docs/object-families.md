# Index des familles de visuels

Mis à jour le **2026-09-13**. Cet index décrit le code et sa validation, pas une
disponibilité automatiquement déduite d’un numéro de package.

| Famille | Objets et variantes | État vérifié |
| --- | --- | --- |
| Univers | 8 planètes, Soleil, Lune, Io, Europe, Ganymède, Callisto, Titan, Encelade, Titania, Triton ; réaliste/dessin ; objets 2.0.0 | Modular #214, #217, #218 et Maker #1915, #1917 fusionnées le 2026-09-08 ; disponibilité effective en production non testée ici |
| Bâtiments, mobilité, logistique | 10 objets vectoriels historiques, 1.0.0 | Conservés sans modification |
| Météo & atmosphères | `weather-sun`, `weather-fair`, `weather-overcast`, `weather-rain`, `weather-storm`, `weather-snow` ; chacun réaliste + gouache ; 1.0.0 | Cinq objets fusionnés via Modular #220/#222/#223 et Maker #1929/#1933. `weather-sun` en PR brouillon [Modular #226](https://github.com/Blueprint-Master/blueprint-modular/pull/226) et [Maker #1960](https://github.com/Blueprint-Master/blueprint-maker/pull/1960) ; CI verte, revue live non validée. [Preuves](previews/weather-sun/README.md). Non fusionné, non publié npm et non disponible en production par cette passe |
| Formes & ondes | form-silk, form-shell, form-loop, form-ripple ; rendu studio + illustration ; 1.0.0 | Modular #225 et Maker #1951 fusionnées le 2026-09-10. Revue live et disponibilité effective en production non vérifiées |
| Eau & phénomènes naturels | `water-wave`, `water-ripple`, `water-waterfall`, `water-whirlpool` ; réaliste + illustration ; 1.0.0 | Modular #227 ouverte, Maker #1964 fusionnée le 2026-09-12 ; non publié npm |
| Végétation | `flora-fern`, `flora-blossom`, `flora-meadow`, `flora-branch` ; studio botanique + illustration ; 1.0.0 | Branche et PR brouillon du 2026-09-13 ; validation animée live requise |
| Cristaux & matières | Absents | À examiner sans dupliquer les familles existantes |

## Continuité

Reprendre la PR météo existante si elle est encore ouverte/incomplète. Ne pas
recréer les six identifiants et ne pas réimporter les matériaux. Vérifier les
PR ouvertes avant de démarrer une autre famille. Les objets candidats ne sont
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
Modular #226 et Maker #1960 sont publiées en brouillon ; leurs CI sont vertes sur
les commits de tête. Cette validation ne vaut ni fusion, ni publication, ni
déploiement.


Vérification du 2026-09-13 : Eau n’est pas dupliquée ; Modular #227 reste ouverte
et Maker #1964 est fusionnée. La passe ouvre Végétation sur une branche autonome,
sans dépendre de la PR Eau. Les posters et sources sont originaux Apache-2.0 ;
aucun asset tiers. Le runner local était indisponible, donc l’inspection animée,
les mesures de frame et le test téléphone restent explicitement non validés.
