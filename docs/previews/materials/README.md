# Cristaux & matières — revue du 14 septembre 2026

Cinq études procédurales originales, sans texture raster ni asset tiers. Le style
`photorealistic` désigne une matière de studio synthétique, pas une photographie ;
le second style ajoute contours et aplats d’illustration.

| Référence stable @1.0.0 | Mouvement principal | Détail secondaire |
|---|---|---|
| `material-crystal` | Cinq pointes poussent à des rythmes décalés puis se résorbent | Caustique étroite |
| `material-geode` | Les couronnes et dents cristallines éclosent localement | Reflet irisé du cœur |
| `material-liquid-metal` | Une goutte rejoint, étire puis quitte la masse | Reflet spéculaire |
| `material-dichroic-glass` | Le ruban se plie et inverse sa courbure | Bande d’interférence |
| `material-obsidian` | Les fissures naissent, se ramifient puis cicatrisent | Lueur interne brève |

Les captures [160 px](instants-160.webp), [224 px](instants-224.webp) et
[320 px](instants-320.webp) montrent 0, 1, 2, 3, 6, 9 et 12 secondes, chaque
style sur fonds sombre puis clair. La [vidéo de 12 s](materials.mp4) utilise le
même `drawMaterial` que le composant livré ; elle n’entre pas dans le paquet npm.
L’inspection des planches confirme les silhouettes, la transparence, le contraste,
la variation locale et le raccord 0/12 s aux trois tailles.

Pause, vitesse, `prefers-reduced-motion`, sortie d’écran, onglet masqué, erreur et
miniature fixe sont couverts par tests React. Une miniature charge seulement un
poster SVG. La vue sélectionnée charge le renderer différé, avec une seule boucle
plafonnée à 320 px/18 fps ou 224 px/12 fps sur appareil contraint.

Les mesures portent sur 36 appels réels par objet/style/résolution via
`@napi-rs/canvas`, Node/Linux sur Intel Xeon Platinum 8370C. Elles excluent la
composition d’un navigateur, le réseau, le téléphone physique et la batterie :
[données brutes](measurements.json). La manipulation interactive dans Chromium
reste à exécuter : Playwright était présent, mais aucun binaire Chromium local ne
l’était et le téléchargement a expiré. Les tests et images ne remplacent donc pas
une approbation tactile ou GPU.

```sh
node scripts/generate-material-previews.mjs
node scripts/generate-material-proofs.cjs
```
