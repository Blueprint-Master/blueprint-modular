# Index des familles de visuels

Mis à jour le **2026-09-10**. Cet index décrit le code et sa validation, pas une
disponibilité automatiquement déduite d’un numéro de package.

| Famille | Objets et variantes | État vérifié |
| --- | --- | --- |
| Univers | 8 planètes, Soleil, Lune, Io, Europe, Ganymède, Callisto, Titan, Encelade, Titania, Triton ; réaliste/dessin ; objets 2.0.0 | Modular #214, #217, #218 et Maker #1915, #1917 fusionnées le 2026-09-08 ; disponibilité effective en production non testée ici |
| Bâtiments, mobilité, logistique | 10 objets vectoriels historiques, 1.0.0 | Conservés sans modification |
| Météo & atmosphères | `weather-fair`, `weather-overcast`, `weather-rain`, `weather-storm`, `weather-snow` ; chacun réaliste + gouache ; 1.0.0 | Modular #220/#222 et Maker #1929 fusionnées le 2026-09-09. Reprise de matière Orage/Soleil sur `fix/natural-lightning-and-plasma`. Validation visuelle live requise ; publication npm et disponibilité en production non vérifiées |
| Météo : soleil isolé | À réaliser ; distinct du Soleil astronomique | Essai rejeté pour qualité insuffisante, absent du catalogue et du parseur. Priorité à la reprise de cette famille |
| Formes & ondes | form-silk, form-shell, form-loop, form-ripple ; rendu studio + illustration ; 1.0.0 | Créés sur `feat/forms-waves-20260910`, 8 références et transport Maker. Candidats en brouillon ; revue live non validée. [Preuves et limites](previews/forms/README.md). Non fusionnés, non publiés npm, non disponibles en production par cette passe |
| Eau, végétation, cristaux | Absents de cette passe | À examiner sans dupliquer les familles existantes |

## Continuité

Reprendre la PR météo existante si elle est encore ouverte/incomplète. Ne pas
recréer les cinq identifiants et ne pas réimporter les matériaux. Vérifier les
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
Le soleil météorologique isolé reste explicitement à reprendre ; il n’a pas été
remplacé par le Soleil astronomique ni compté dans la nouvelle famille.

Limite de publication de cette passe : l’ajout à la documentation machine
`public/llms.txt` a été refusé par le contrôle automatique d’autorisation.
Ce fichier et son générateur sont donc conservés inchangés dans la PR ; la
documentation humaine et les exports sont présents, mais la documentation
machine de la famille reste à publier après résolution de ce blocage.
