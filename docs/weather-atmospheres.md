# Météo & atmosphères — 2026-09-09

**Socle et éclairs fusionnés via #220/#222 le 2026-09-09 ; reprise de matière en PR brouillon.
Qualité visuelle live non validée.**

Cinq objets 1.0.0, chacun en photoréalisme et gouache : éclaircies, ciel couvert,
pluie, orage, neige. Deux matières originales générées séparément avec l’outil
de génération d’images intégré, puis compactées ; prompts complets, attribution
et empreintes dans `public/objects/weather-v1/generation.json` et `manifest.json`.
Aucune ressource client, marque, métier ou donnée privée.

Le premier nuage procédural ressemblait à une roche : rejeté. Le soleil météo
isolé était trop simple : reporté, pas ajouté pour gonfler le lot. Le Soleil
astronomique existant n’est pas modifié.

## Mouvements

Deux zones de convection font évoluer localement la silhouette ; la condensation
et l’évaporation modifient la densité, sans déplacer toute la vignette. Les
éclaircies ouvrent davantage le nuage ; le couvert reste un banc plus plat.
Pluie et neige apparaissent, tombent puis disparaissent ; le nuage accompagne
doucement ce mouvement. L’orage ajoute un éclair progressif rare en grande vue
seulement (largeur CSS ≥ 280 px), mobile compris, sans stroboscope ni flash plein
écran. Le canal se forme dès 1 s à vitesse normale, se ramifie puis se dissipe
avant 2,8 s ; un seul événement par boucle analytique de 24 s. Le poster fixe
capture 1,35 s pour distinguer l’orage de la pluie sans animer les vignettes.
Correction du 9 septembre : la limite mobile ne supprime plus les éclairs ;
elle conserve les plafonds 224 px / 12 fps. Reduced-motion supprime la décharge.
La reprise de matière suivante remplace le trait bleu par un canal irrégulier
fin, avec lumière diffuse dans le nuage. [Comparaison multi-instants et limites](previews/material-review/README.md).

Un seul minuteur par objet sélectionné, zéro sur les vignettes, en pause,
hors écran, onglet masqué ou reduced-motion. Les tests avec horloge simulée
vérifient ces nombres et l’absence de rattrapage après pause. Les limites
restent des plafonds ; afficher une seule sélection animée est le contrat hôte.

## Aperçus et contrôles

- [Planche à l’arrêt](previews/weather/contact-sheet.png).
- [Séquence réaliste, 24 s / 12 images/s](previews/weather/photorealistic.mp4).
- [Séquence gouache, 24 s / 12 images/s](previews/weather/illustration.mp4).
- [Mesures reproductibles](previews/weather/measurements.json).

Les cinq objets des vidéos sont, de gauche à droite : éclaircies, couvert,
pluie, orage, neige. Il s’agit du moteur réel rendu hors navigateur ; ces vidéos
de preuve ne sont ni chargées à l’exécution ni distribuées dans npm.

Inspection effectuée : planches à l’arrêt 320 px, frames des deux vidéos aux
instants 0, 2, 5,5 et 8 s à 192 px ; fond sombre pour le réaliste, clair pour
la gouache. Cette inspection a fait corriger la visibilité des précipitations
sur fond clair et la forme trop géométrique de l’éclair.
Après le signalement « l’orage n’a pas d’éclairs », nouvelles captures inspectées
dans les deux styles à 192 px : 0, 1,08, 1,33, 1,83, 2,5 et 3,17 s. Formation,
ramification et disparition du canal visibles ; le test de composant vérifie
désormais la grande vue tactile avec rendu limité à 224 px et une seule boucle.

**Non exécutés / à approuver avant merge :** lecture live fluide en navigateur,
deux fonds dans chaque style, petits/grands formats interactifs, inspection
visuelle de la pause/reduced-motion et des états d’erreur/chargement. Les tests
automatisés de ces états ne remplacent pas la recette visuelle. L’accès aux
aperçus locaux a été bloqué par la politique du navigateur ; aucun contournement.
Pas de téléphone physique, mesure batterie, profil GPU ou test authentifié Maker.

## Coût et disponibilité

Matériaux : 512×512 ; posters transparents : 256×256. Un objet charge un matériau
de son style et son poster, pas les cinq scènes ni les deux styles. Les tailles
exactes de fichiers transférables sont dans le manifeste. Ce sont les octets
des fichiers, pas une mesure réseau HTTP dans le navigateur. Pas de vidéo runtime.
Canvas logiciel plafonné à 320×320 / 18 fps, 224×224 / 12 fps en mode contraint.

`measurements.json` mesure le seul rendu RGBA, hors composition du navigateur,
sous Node 24 / Linux x64 / AMD EPYC 9V74 virtualisé. 4 échauffements puis
36 échantillons par objet/style/résolution. Le coût du mobile physique et la
consommation énergétique ne sont pas mesurés.

Intégration : exports publics `/objects`, catégorie météo, catalogue 33 objets,
API, références `.modular.json`, assets copiés par le build core, documentation
machine régénérée depuis son générateur. Maker doit embarquer la même source,
valider les IDs météo 1.0.0 et choisir `WeatherObject`, pas `PlanetObject`.

Publication npm et déploiement sont des étapes distinctes, non autorisées ici.
La fusion du socle #220 ne prouve ni publication npm ni disponibilité Maker.
Le correctif des éclairs est distinct ; le package empaqueté localement est testé,
mais la version npm actuellement distribuée et la production ne sont pas vérifiées.
