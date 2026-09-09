# Index des familles de visuels

Mis à jour le **2026-09-09**. Cet index décrit le code et sa validation, pas une
disponibilité automatiquement déduite d’un numéro de package.

| Famille | Objets et variantes | État vérifié |
| --- | --- | --- |
| Univers | 8 planètes, Soleil, Lune, Io, Europe, Ganymède, Callisto, Titan, Encelade, Titania, Triton ; réaliste/dessin ; objets 2.0.0 | Modular #214, #217, #218 et Maker #1915, #1917 fusionnées le 2026-09-08 ; disponibilité effective en production non testée ici |
| Bâtiments, mobilité, logistique | 10 objets vectoriels historiques, 1.0.0 | Conservés sans modification |
| Météo & atmosphères | `weather-fair`, `weather-overcast`, `weather-rain`, `weather-storm`, `weather-snow` ; chacun réaliste + gouache ; 1.0.0 | Socle Modular #220 fusionné le 2026-09-09 par une action externe ; correctif des éclairs sur la branche `fix/weather-visible-lightning-20260909`. Maker #1929 en PR brouillon. Validation visuelle live requise ; publication npm et disponibilité en production non vérifiées |
| Météo : soleil isolé | À réaliser ; distinct du Soleil astronomique | Essai rejeté pour qualité insuffisante, absent du catalogue et du parseur. Priorité à la reprise de cette famille |
| Eau, végétation, cristaux, formes/ondes | Pas de nouvelle famille dans cette passe | À examiner après validation de Météo |

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
