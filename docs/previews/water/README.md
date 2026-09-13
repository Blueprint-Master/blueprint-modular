# Eau & phénomènes naturels — revue du 12 septembre 2026

Quatre études procédurales originales, sans texture tierce : matériau aquatique
synthétique (`photorealistic`, pas une photographie) et gouache originale. Les
deux matières raster ont été générées spécialement pour ce lot ; prompts,
auteurs, transformations et empreintes sont conservés avec les assets distribués.

| Référence stable @1.0.0 | Mouvement principal | Détail secondaire |
|---|---|---|
| `water-wave` | La crête se lève, se creuse puis retombe | Écume du bord |
| `water-ripple` | La couronne d’impact apparaît et les anneaux s’aplanissent | Reflets courts |
| `water-waterfall` | Les filaments changent de largeur jusqu’au bassin | Brume d’impact |
| `water-whirlpool` | La gorge respire et les bras spiraux se déforment | Écume intérieure |

Les captures 160, 224 et 320 px montrent 0, 1, 2, 3, 6, 9 et 12 secondes,
chaque style sur fonds sombre puis clair : [160 px](instants-160.webp),
[224 px](instants-224.webp), [320 px](instants-320.webp). La [vidéo 12 s](water.mp4)
est calculée avec le moteur réellement livré ; elle n’est pas distribuée dans npm.

Le raccord 0/12 s et la modification locale d’alpha/profondeur/écume sont testés.
Pause, vitesse, reduced-motion, sortie d’écran, onglet masqué, erreur et miniature
fixe sont couverts par tests React. **La lecture interactive dans un navigateur et
la validation sur téléphone physique restent à exécuter** ; les objets sont des
candidats de revue, pas des visuels approuvés en production.

Une miniature charge un poster uniquement. Une vue sélectionnée charge le petit
module différé et crée une boucle plafonnée à 320 px/18 fps, ou 224 px/12 fps sur
mobile/économie de données. Zéro boucle hors écran, en pause ou avec reduced-motion.
Les mesures Node/Linux portent sur 36 rendus par objet/style/résolution et excluent
composition navigateur, transfert HTTP, téléphone et batterie : [données](measurements.json).

```sh
node scripts/generate-water-previews.cjs --video
```
