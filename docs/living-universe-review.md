# Univers vivant, avec un budget limité

## Périmètre

Huit lunes ajoutées à Univers : Io, Europe, Ganymède, Callisto, Titan, Encelade, Titania et Triton. Le catalogue les regroupe par planète parente. Elles sont disponibles en photoréaliste et en dessin procédural à partir de la même carte source (pas de nouvelles peintures générées). Les objets v1 restent inchangés ; les nouvelles lunes existent uniquement en v2. Le catalogue découvrable contient 28 objets.

Les nuages terrestres dérivent indépendamment du sol. Les enveloppes gazeuses ont un léger mouvement par latitude ; le Soleil une modulation de luminosité discrète. Les terrains sans atmosphère restent rigides. Rotation de présentation et mouvements artistiques, sans simulation météo, éruptions, tornades ni jets ajoutés dans cette passe.

## Budget

Un mouvement principal et un détail secondaire au maximum. Les vignettes ne créent aucun moteur. Le moteur et ses textures sont initialisés à l'entrée dans la vue, libérés à la sortie et quand l'onglet est masqué. Pause et reduced-motion arrêtent toute l'horloge. Une minuterie par objet actif, sans interrogation RAF à 60 Hz. La projection et l'éclairage logiciel sont mis en cache.

| Mode | Taille maximale du canevas | Fréquence maximale |
|---|---:|---:|
| GPU ordinateur | 512 px | 24 i/s |
| GPU écran étroit, pointeur tactile ou économie de données | 320 px | 18 i/s |
| Logiciel ordinateur | 288 px | 12 i/s |
| Logiciel contraint | 224 px | 12 i/s |

Ces valeurs sont des plafonds. Les rendus lents abaissent encore la cadence. La largeur réellement affichée limite le canevas ; les textures WebP font au maximum 1024 pixels de large, les aperçus 256. Aucun nouveau moteur 3D ni dépendance de simulation.

## Poids mesurés

Mesures des fichiers locaux, hors en-têtes HTTP et cache. Carte, éventuelle couche de nuages/anneaux et aperçu photoréaliste nécessaires à l'ouverture d'un objet :

| Objet | Avant | Maintenant |
|---|---:|---:|
| Terre | 1 607 391 octets | 205 056 octets |
| Jupiter | 697 765 octets | 55 736 octets |
| Saturne | 316 656 octets | 34 617 octets |
| Europe | absent | 70 852 octets |

Les 65 nouveaux fichiers WebP occupent 2 828 068 octets. Le répertoire d'assets d'objets destiné à npm occupe 2 932 791 octets, crédits et vecteurs compris. Les sources JPG et anciens aperçus PNG restent disponibles dans le dépôt/site, mais ne sont plus copiés dans la distribution npm. Le packager Maker inclut seulement les fichiers nécessaires au style sélectionné et les crédits.

## Coût du rendu logiciel

Mesure du 8 septembre 2026, Node 24.19.0, Linux, AMD EPYC 9V74. Cinq images de chauffe puis vingt images chronométrées par scène, mêmes cartes compactes pour les deux moteurs, angles fixes et rotation changeante. Médianes en millisecondes :

| Objet | Ancien moteur, 384 px | Nouveau moteur, 288 px | Nouveau moteur, 224 px |
|---|---:|---:|---:|
| Terre | 39,66 | 19,35 | 13,28 |
| Jupiter | 25,14 | 12,35 | 8,68 |
| Saturne | 35,39 | 19,30 | 19,08 |
| Europe | 25,19 | 11,58 | 7,06 |

La comparaison intègre la baisse de résolution prévue par le budget. À taille égale les gains sont plus modestes et certaines mesures fluctuent. Ce n'est pas un benchmark mobile, une mesure GPU, ni une mesure de batterie. Reproduction : `node scripts/benchmark-universe.cjs /chemin/ancien-planet-canvas-renderer.ts`.

## Vérification

- Build de production Modular et build core réussis ; types Modular et intégration Maker vérifiés.
- Suite racine : 250 tests. Suite core complète : 361 tests. Maker : 23 tests ciblés, dont les huit lunes dans les deux styles et neuf dispositions/thèmes.
- Tests sur les pixels réellement produits : orientation géographique conservée ; atmosphères mobiles à rotation fixe ; terrain sans atmosphère stable ; même instant = même image.
- Tests de cycle de vie : aucune initialisation hors écran, une seule minuterie, arrêt complet en pause/reduced-motion/hors écran, absence de moteur dans les vignettes.
- Catalogue, groupes, sélection, styles, crédit NASA et rendu logiciel d'Europe inspectés dans le navigateur de contrôle. Les fichiers sources NASA ont été vérifiés contre leurs identifiants de blobs Git et SHA-256.
- Le navigateur de contrôle ne fournit pas WebGL. Validation visuelle GPU et mesures sur appareils mobiles réels encore nécessaires.
- Le script lint existant appelle `next lint`, indisponible avec Next.js 16 ; il échoue avant analyse. Le checkout Maker est partiel : build complet et création authentifiée restent à exécuter en CI/environnement cible.

Le changement dépasse cinq fichiers car un seul contrat relie rendu, catalogue, API, assets, documentation et export. Les images constituent l'essentiel des fichiers. PR en brouillon, sans fusion, déploiement ni publication npm. Pour npm, fusionner la PR puis publier core et recopier les assets dans les applications consommatrices. Maker doit recevoir sa PR puis être déployé ; les applications déjà générées doivent être reconstruites pour bénéficier du nouveau moteur.

Titania and Triton: initial NASA maps with large black unmapped regions were rejected during visual review. Their replacement maps come from CelestiaContent and retain CC BY-SA 4.0 (Titania) / CC BY 3.0 (Triton), including the compact textures and both derived posters. Full authors, source links and changes ship in ATTRIBUTION.txt and moon-manifest.json. Unobserved regions remain neutral rather than invented terrain.
