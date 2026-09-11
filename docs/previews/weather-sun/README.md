# Grand soleil météo — revue du 11 septembre 2026

`weather-sun@1.0.0` complète les cinq situations météo existantes. Il est
distinct de `sun@2.0.0` : c’est une étude de lumière dans l’atmosphère terrestre,
pas une représentation de l’étoile ni une simulation météorologique.

Deux matières originales ont été générées séparément : optique photographique
et gouache. Le premier essai, trop astronomique, a été rejeté et n’est pas
distribué. Prompts, auteurs et empreintes figurent dans `generation.json` ; les
WebP et posters distribués sont inventoriés dans `manifest.json`.

## Mouvement réel

Le disque reste ancré. Le moteur étire radialement des secteurs différents de
la brume externe, puis les résorbe ; les autres secteurs perdent localement en
densité. Une caustique fine traverse un seul secteur en détail secondaire. Il ne
s’agit ni d’une rotation, ni d’une translation, ni d’un simple pulse global.
La boucle est exactement périodique à 24 secondes.

## Preuves

- [Vidéo 24 s du moteur réel](weather-sun.mp4), réaliste puis gouache, calculée
  hors navigateur. Elle n’est pas distribuée dans le package.
- [160 px](instants-160.webp), [224 px](instants-224.webp) et
  [320 px](instants-320.webp), à 0/1/2/3/6/12/24 s.
- Quatre lignes par planche : réaliste sombre/clair, gouache sombre/clair.
- [Mesures de toute la famille](../weather/measurements.json).

Inspection effectuée sur ces trois planches. La première amplitude était trop
faible en gouache et a été corrigée. Transparence, boucle et stabilité du disque
sont testées. **La fluidité interactive reste non validée** : le navigateur
contrôlé refuse l’URL locale avec `ERR_BLOCKED_BY_CLIENT`. Aucun contournement.
Pause, vitesse, chargement, erreur, arrêt hors écran et reduced-motion restent
validés par tests React/jsdom, pas par recette visuelle sur appareil.

## Budget constaté

Matières 512×512 : poids exact dans le manifeste. Posters 256×256. Une seule
matière et un seul poster sont chargés pour l’objet sélectionné ; vignettes fixes.
Le renderer conserve les plafonds 320 px/18 fps et 224 px/12 fps en mode
contraint. Mesures logicielles : Node 24/Linux x64 sur CPU AMD EPYC virtualisé,
36 échantillons chauds ; elles excluent GPU, navigateur, réseau, téléphone et
batterie. Une seule boucle peut être active dans le catalogue et dans Maker.
