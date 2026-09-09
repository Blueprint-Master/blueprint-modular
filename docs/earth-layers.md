# Terre composée — 9 septembre 2026

## Fonctionnement livré

Une Terre conserve son identité `earth@2.0.0` et reçoit une composition optionnelle
`earth`. Jour et Nuit sont des vues intégrales indépendantes du Soleil. Le mode
Coordonnés applique sa direction au terminateur et au masque des lumières nocturnes.
Nuages, atmosphère, lumières des villes et aurores sont activables séparément.
Couverture, opacité, dérive et évolution des nuages sont distinctes. Les vitesses
nulles figent la phase courante, sans retour au début. Pause, reduced-motion,
onglet masqué et sortie d'écran arrêtent les horloges. Les budgets existants restent.

`EarthControls` est commun au catalogue, au sélecteur Maker et à la collection de
l'application générée. Quatre préréglages, réglages détaillés, réinitialisation,
export .modular.json et snippet React. Le parseur valide types/bornes/clés ; les
anciens fichiers restent valides. Les références de deux Terres composées
différemment doivent être conservées par l'adaptateur Maker.

Texture nocturne Solar System Scope / INOVE, CC BY 4.0. Conversion WebP 1024×512
sans retournement. Fichier `earth-night-manifest.json` : origine, miroir épinglé,
empreintes source/dérivé. La même carte lumineuse est utilisée dans les deux styles.
Les aurores sont une interprétation artistique, sans données scientifiques/live.

## Vérifications et limites

Captures du véritable moteur logiciel : cinq compositions × deux styles,
`docs/previews/earth-layers/contact-sheet.webp`. Script reproductible :
`node scripts/review-earth-layers.cjs`. Médianes mesurées à 288 px : environ 31–40 ms
sur cette machine Node 24 ; aucun engagement de performance téléphone/batterie.
Les tests isolent jour/nuit forcés, ombre coordonnée, disparition des calques,
quantité de nuages, dérive, évolution, changements à chaud et arrêt sans rembobinage.

**Revue navigateur interactive et shader GPU non validés.** Le navigateur fourni
refuse l'aperçu local (`ERR_BLOCKED_BY_CLIENT`), sans contournement. Les captures
logicielles et tests d'interface ne prouvent pas la qualité du rendu GPU.
Une composition personnalisée n'a pas de poster exact ; elle affiche un état
explicite pendant le chargement/l'échec. L'adaptateur Maker doit exclure ces Terres
du manifeste des posters génériques et conserver leur rendu dans sa collection.

PR en brouillon pour la recette live. Aucun merge, déploiement ni publication npm.
La disponibilité nécessite le déploiement Modular (assets/aperçus), l'adaptateur
Maker synchronisé, et une release core pour les consommateurs npm. Une publication
npm seule ne met pas à jour le moteur embarqué dans Maker.

## Périmètre

Plus de cinq fichiers sont nécessaires pour une seule fonctionnalité : contrat,
rendu WebGL/logiciel, composant contrôlé, catalogue et export, documentation machine
régénérée, tests, texture et preuves reproductibles. Pas de changement d'auth,
de persistance métier ou d'orchestration. L'utilisateur a explicitement autorisé
la poursuite sans les documents PRINCIPLES.md et CONVENTIONS.md introuvables.

Validation locale finale : 399 tests core, 254 tests racine, TypeScript core et
build de production Modular réussis. Le lancement intégral de `npm run gate`
a rencontré trois imports de dépendances manquantes pendant une installation ;
la suite core a ensuite été relancée après installation et ses 399 tests passent.
Ne pas assimiler cette reprise ciblée à un nouveau lancement complet du gate.
Compagnon Maker : 37 tests transport/packaging, TypeScript ciblé et lint ciblé
sans erreur ni avertissement. Son checkout privé est partiel : build/suite Maker
intégraux et parcours authentifié restent des validations CI/recette distinctes.

Actualisation concurrente : Modular #223 a été fusionnée pendant le travail.
Ses corrections de plasma/éclairs sont conservées ; les conflits du moteur logiciel
ont été résolus en gardant le nouveau plasma et l'intensité indépendante du halo.
Après cette reprise : 400 tests core, TypeScript et build core réussis.
Le véritable npm pack a aussi été importé (exports, parser, SSR, calques, assets).
