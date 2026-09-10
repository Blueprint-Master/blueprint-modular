# Formes & ondes — revue du 10 septembre 2026

Quatre sculptures originales, deux traitements : matériau synthétique éclairé
en studio (`photorealistic`, pas une photographie) et illustration en aplats
ombrés (`illustration`, pas une peinture raster). Aucun asset tiers ajouté.

| Identifiant stable @1.0.0 | Mouvement principal |
|---|---|
| form-silk | Plis et torsion locale d’un ruban de soie |
| form-shell | Ouverture et flexion des lobes d’une corolle nacrée |
| form-loop | Compression asymétrique d’un anneau souple |
| form-ripple | Crêtes concentriques qui montent, se propagent et s’aplanissent |

La caméra et la lumière restent fixes. Les distances entre points de surface
changent réellement ; il ne s’agit ni d’une rotation de vignette ni d’un défilement
de texture. Cycle de 12 s, sans événement spectaculaire secondaire.

## Preuves consultables

- [Vidéo du moteur réel, 12 s](forms.mp4) : quatre objets en haut, leurs variantes
  illustrées en bas. Le montage anime huit objets **pour comparaison seulement** ;
  le catalogue et la collection générée n’animent que l’objet sélectionné.
- [Petit format 160 px](instants-160.webp), [budget mobile 224 px](instants-224.webp),
  [grand rendu 320 px](instants-320.webp).
- Colonnes : 0, 1, 2, 3, 6, 9, 12 s. Ordre des objets : soie, corolle, anneau,
  onde ; matériaux puis illustrations. Deux lignes par objet : fond sombre/clair.
- [Mesures du moteur logiciel](measurements.json).

Les captures à plusieurs instants sont inspectées. Une première soie trop
rectangulaire a été remplacée par un ruban courbe. **La qualité visuelle live
reste non validée** : le navigateur a refusé la démonstration locale avec
`ERR_BLOCKED_BY_CLIENT`. Aucun autre canal navigateur n’a contourné ce refus.
La vidéo est calculée avec le moteur livré, pas enregistrée depuis un navigateur.
La pause, reduced-motion, le chargement différé, l’erreur et l’arrêt hors écran
sont testés dans React/jsdom, pas inspectés visuellement sur un appareil réel.
Les objets restent des candidats en brouillon, pas des visuels approuvés pour la
production. Cette réserve s’applique à chacun des huit rendus.

## Budget et reproduction

Vignettes fixes, aucun canvas ni boucle. Un objet sélectionné : une horloge,
320 px / 18 fps maximum ; mobile ou économie de données : 224 px / 12 fps.
Zéro boucle après pause, reduced-motion, masquage ou sortie de l’écran.
Le moteur ne charge aucune texture ; seul le poster WebP et le module différé
sont nécessaires. Voir manifest.json pour les octets et SHA-256 des huit posters.
Le poids sur disque/gzip n’est **pas** une mesure de transfert HTTP : cette
dernière, la composition navigateur, le téléphone physique et la batterie
n’ont pas été mesurés. Les timings sont ceux de Node 24 / Linux sur CPU AMD EPYC
9V74 virtualisé, 36 rendus par objet/style/résolution, pas une garantie mobile.

```sh
node scripts/generate-form-previews.cjs --video
packages/core/node_modules/.bin/vite --config scripts/weather-preview.config.ts --host 127.0.0.1
# Ouvrir /forms-preview.html pour la revue interactive restant à faire.
```

`sharp` encode les pixels du moteur ; ffmpeg compose la vidéo de preuve. Aucune
vidéo de démonstration n’est incluse dans les assets runtime du package.
