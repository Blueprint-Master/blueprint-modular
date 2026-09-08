# Revue : bibliothèque d’objets Modular et intégration Maker

Cette branche prépare la bibliothèque animée et son intégration Maker. Publication des branches et PR en brouillon autorisée le 8 septembre 2026. Aucun déploiement ni publication npm.

## Résultat

- Univers : huit planètes, Soleil et Lune, chacun en photoréaliste et en peinture. Surfaces en rotation, éclairage fixe, nuages indépendants, anneaux avec profondeur, pause, vitesse, glisser et clavier.
- Catalogue par thèmes, avec aperçus légers et une scène interactive. Vingt objets existants sélectionnables dans Maker.
- Import initial des textures Solar System Scope (CC BY 4.0), crédits et empreintes conservés. Liens vers Poly Haven, ambientCG et Kenney pour enrichissement manuel. Dix textures peintes originales générées et intégrées au moteur.
- Contributions PNG/JPEG/WebP et textures de planètes : compte requis, stockage persistant configurable, validation par administrateur, affichage public paginé et filtre thématique. Les créations originales peuvent être proposées sans URL externe.
- Maker : sélection dans le chat ou dépôt d’un fichier `.modular.json`, conservation dans le plan, vérification des versions et empreintes, inclusion des textures, du moteur et des licences dans l’application exportée.

Les modèles GLB, la génération publique d’objets par IA et leur placement libre sur chaque page ne sont pas implémentés. La création communautaire passe actuellement par l’import d’une création ou d’une texture.

## Vérifications

- Build de production Modular et build core réussis.
- Vérifications TypeScript Modular/core réussies ; vérification stricte des modules d’intégration Maker réussie.
- 344 tests core, 235 tests racine existants, 12 tests de permissions/contributions et 21 tests ciblés Maker réussis lors de cette session.
- Les tests Maker couvrent la référence conservée dans le plan, les fichiers embarqués, les versions invalides, un bâtiment et neuf combinaisons de disposition/thème. Les directives client et les paramètres de fonction sont préservés.
- Rendu logiciel inspecté dans le navigateur : Terre, Saturne, variantes, thèmes et commande de pause. La rotation change les pixels de surface. Le navigateur de contrôle ne fournit pas WebGL ; le chemin GPU reste à vérifier.
- Le script lint existant de Modular appelle `next lint`, indisponible avec son Next.js 16 installé. Il échoue avant toute analyse. Le build ne remplace pas ce contrôle.

## Avant mise en service

La migration `20260908150000_object_contributions` n’a pas été appliquée. Prévoir `OBJECT_UPLOAD_DIR` sur un volume persistant, puis valider connexion, import et modération sur l’environnement cible. Exécuter le build, lint et les tests complets Maker, puis une création authentifiée chat → plan → application. Le checkout Maker local est partiel : ces contrôles complets ne sont pas annoncés comme réussis.

Le changement dépasse cinq fichiers car il relie un même contrat entre catalogue, moteur, assets, API, schéma, contributions, chat, AppSpec et export. Les fichiers visuels représentent l’essentiel du nombre de fichiers. Les anciens objets restent accessibles à leur version 1.0.0.

## Publication et dépendance Maker

Modular : branche `feat/universe-objects-community`, basée sur `2afabd863223ec841991176e33fc0b0a37801d9b` de `Blueprint-Master/blueprint-modular` (`master`).

Maker : branche locale `feat/modular-objects-chat`. Ses fichiers d’origine ont été vérifiés contre les blobs du commit distant `90d8944a64cc4f1f57b3f7737165aebd75fdf6ff` de `Blueprint-Master/blueprint-maker` (`main`). Son historique local est un **instantané partiel**, pas un clone complet : publier uniquement les chemins modifiés sur l’arbre distant via l’intégration GitHub ; ne pas pousser cet historique partiel. Vérifier la tête distante avant application. Le manifeste d’assets doit référencer le commit Modular effectivement publié.

La mise à jour préserve les corrections de mise en page (#213), l’icône (#211) et la préparation core 0.3.15 (#212) déjà présentes sur master. La validation complète Maker, le rendu GPU et la migration restent des prérequis de mise en service.

La publication du code source, des schémas, de la documentation et des assets dans le dépôt public Modular et le dépôt privé Maker, avec ouverture de deux PR en brouillon, a été explicitement autorisée le 8 septembre 2026. La fusion et la mise en service restent des étapes distinctes.
