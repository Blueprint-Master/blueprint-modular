# Orage et Soleil — reprise de matière du 9 septembre 2026

Les anciens ajouts paraissaient plaqués : trait bleu épais et arches solaires
géométriques. Cette passe reprend les trois moteurs publics, sans nouvel asset
raster runtime ni bibliothèque graphique.

- Orage : canal fractal fin, branches ancrées sur le tronc, couverture maximale
  par pixel (pas d’accumulation de tampons qui épaissit le trait). Lumière diffuse
  dans la matière du nuage ; émergence depuis sa base, puis extinction.
- Soleil : un volume éruptif local ancré dans le limbe, texturé avec la même carte
  solaire que la surface. Densité, expansion et dissipation remplacent les trois
  contours d’arches. Une première tentative à filaments sinusoïdaux trop réguliers
  a été rejetée après inspection : elle ressemblait à un peigne.

[Vidéo 24 s, 12 images/s](sun-storm.mp4) : Soleil / Orage réalistes en haut,
leurs variantes illustrées en bas. Pas de vidéo chargée dans l’application.

[Planche 224 px](instants-224.webp) · [Planche 320 px](instants-320.webp).
Colonnes : 0, 1,12, 1,35, 2, 4, 8, 12, 16 s. Paires de lignes sombre/clair :
Soleil réaliste, Orage réaliste, Soleil illustré, Orage illustré.
Les planches proviennent du moteur logiciel réellement distribué ; la vidéo
montre son évolution, pas une animation générée indépendante du code.

## Vérifications et limites

Captures inspectées dans les deux styles, sur fond clair/sombre à 224 et 320 px.
L’orage conserve son événement à 1 s par cycle de 24 s. La protubérance se
développe et disparaît sur un cycle de forme de 18 s ; la texture solaire et sa
rotation continuent leur mouvement. Ce sont des accélérations artistiques.

Les horloges, pause, reduced-motion, arrêt hors écran et budgets ne changent pas.
Les tests de cycle de vie et de rendu restent requis. Les mesures dans
[measurements.json](measurements.json) concernent le RGBA logiciel sous Node 24,
Linux x64, AMD EPYC 9V74 virtualisé, hors composition du navigateur et GPU.
Aucune conclusion sur une batterie ou un téléphone physique.

**Reste à valider : lecture live et shader WebGL sur appareil réel, interactions
pause/reduced-motion et chargement/erreur en inspection visuelle.** La politique
du navigateur avait bloqué les aperçus locaux ; elle n’a pas été contournée.
Les équations GLSL/CPU sont alignées dans le code, ce qui ne prouve pas leur
parité visuelle sur GPU. Ces candidats restent en PR brouillon pour cette raison.

Reproduction : `node scripts/generate-material-review.cjs --video` ; ffmpeg est
nécessaire pour la preuve MP4. Les posters météo et leur manifeste se régénèrent
avec `node scripts/generate-weather-previews.cjs --video`.
