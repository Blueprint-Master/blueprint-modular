# Univers vivant, avec un budget limité

## Périmètre

Huit lunes ajoutées à Univers : Io, Europe, Ganymède, Callisto, Titan, Encelade, Titania et Triton. Le catalogue les regroupe par planète parente. Elles sont disponibles en photoréaliste et en dessin procédural à partir de la même carte source (pas de nouvelles peintures générées). Les objets v1 restent inchangés ; les nouvelles lunes existent uniquement en v2. Le catalogue découvrable contient 28 objets.

Les nuages terrestres dérivent indépendamment du sol et leur densité varie localement : des bancs se forment et se dissipent. Le Soleil présente trois protubérances de plasma décalées dans le temps : elles montent au-dessus du disque, s’élargissent et s’estompent, avec une surface lumineuse évolutive. Les enveloppes gazeuses gardent leur léger mouvement par latitude ; les terrains sans atmosphère restent rigides. Les cycles solaires de 14 secondes sont une animation artistique accélérée, pas une simulation de physique solaire.

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
- Suite racine : 250 tests. Suite core complète : 366 tests. Maker : 23 tests ciblés, dont les huit lunes dans les deux styles et neuf dispositions/thèmes.
- Tests sur les pixels réellement produits : orientation géographique conservée ; atmosphères mobiles à rotation fixe ; terrain sans atmosphère stable ; même instant = même image.
- Tests de cycle de vie : aucune initialisation hors écran, une seule minuterie, arrêt complet en pause/reduced-motion/hors écran, absence de moteur dans les vignettes.
- Catalogue, groupes, sélection, styles, crédit NASA et rendu logiciel d'Europe inspectés dans le navigateur de contrôle. Les fichiers sources NASA ont été vérifiés contre leurs identifiants de blobs Git et SHA-256.
- Le navigateur de contrôle ne fournit pas WebGL. Validation visuelle GPU et mesures sur appareils mobiles réels encore nécessaires.
- Le script lint existant appelle `next lint`, indisponible avec Next.js 16 ; il échoue avant analyse. Le checkout Maker est partiel : le build des applications et les tests complets sont vérifiés en CI ; la création authentifiée reste à vérifier dans l’environnement cible.

Le changement dépasse cinq fichiers car un seul contrat relie rendu, catalogue, API, assets, documentation et export. Les images constituent l'essentiel des fichiers. PR en brouillon, sans fusion, déploiement ni publication npm. Pour npm, fusionner la PR puis publier core et recopier les assets dans les applications consommatrices. Maker doit recevoir sa PR puis être déployé ; les applications déjà générées doivent être reconstruites pour bénéficier du nouveau moteur.

Titania and Triton: initial NASA maps with large black unmapped regions were rejected during visual review. Their replacement maps come from CelestiaContent and retain CC BY-SA 4.0 (Titania) / CC BY 3.0 (Triton), including the compact textures and both derived posters. Full authors, source links and changes ship in ATTRIBUTION.txt and moon-manifest.json. Unobserved regions remain neutral rather than invented terrain.

## Renforcement de l’activité et correctif lint

Le contrôle Maker rejetait 250 avertissements pour un plafond de 249. La nouvelle référence `settings` était modifiée pendant le rendu React. Elle est maintenant synchronisée après validation du rendu. Les abonnements aux observateurs précèdent la première mesure ; l’acquisition du moteur est différée et annulable avant toute allocation si l’effet devient obsolète. Aucun seuil ou règle ESLint modifié. Le moteur copié passe le lint sans avertissement.

Les nouveaux effets ne changent ni les fichiers visuels téléchargés, ni les plafonds de résolution/fréquence, ni le nombre de minuteries. Les trois états d’éruption sont calculés une fois par image en logiciel ; projection polaire et halo de base sont mis en cache. Les tests isolent les pixels au-dessus du bord solaire à rotation fixe et utilisent une carte de nuages uniforme : un simple déplacement de texture ne peut pas faire passer ces contrôles. Pause/reduced-motion testés pour Terre et Soleil, dans les deux styles pour la silhouette solaire.

Mesure supplémentaire, même environnement et méthode que ci-dessus, avant/après cette passe à taille identique :

| Objet | Taille | Avant, médiane | Après, médiane | Après, p95 |
|---|---:|---:|---:|---:|
| Soleil | 224 px | 11,34 ms | 14,32 ms | 63,13 ms |
| Soleil | 288 px | 17,33 ms | 21,79 ms | 29,82 ms |
| Terre | 224 px | 13,87 ms | 13,12 ms | 15,27 ms |
| Terre | 288 px | 19,76 ms | 21,10 ms | 28,42 ms |

Les pics (notamment Soleil 224 px) restent visibles dans le rapport ; ces mesures Node sur serveur ne prédisent pas la batterie ni la fluidité d’un téléphone. Pas de texture supplémentaire ; le surcoût est du calcul. Le rendu logiciel du Soleil a été inspecté en mouvement et dans les deux styles.
