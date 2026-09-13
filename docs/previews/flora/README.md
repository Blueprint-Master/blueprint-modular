# Végétation vivante — revue du 2026-09-13

Quatre objets procéduraux originaux, chacun en rendu botanique de studio et en
illustration : Fougère qui s’éveille, Pivoine vivante, Prairie sous le vent et
Branche de ginkgo. Aucun asset tiers ou raster.

## Mouvement caractéristique

- Fougère : déroulement du bourgeon terminal et ouverture séquencée des folioles ; frémissement secondaire.
- Pivoine : ouverture/resserrement local des trois couronnes ; scintillement très discret des étamines.
- Prairie : rafale qui courbe successivement les brins ; quatre semences flottantes au maximum.
- Ginkgo : torsion locale des feuilles sous une rafale ; branche seulement infléchie.

Boucle exacte de 12 s. Une seule horloge par objet actif, plafonnée à 320 px/18 fps
ou 224 px/12 fps sur appareil contraint. Pause, onglet caché, sortie de viewport et
`prefers-reduced-motion` arrêtent l’horloge. Les vignettes sont de vrais posters
SVG fixes de 2,5 à 6,8 Ko ; le moteur et aucun raster ne sont chargés par elles.

[Studio : fougère](../../../public/objects/flora-v1/previews/flora-fern-photorealistic.svg) ·
[illustration](../../../public/objects/flora-v1/previews/flora-fern-illustration.svg) ·
[studio : pivoine](../../../public/objects/flora-v1/previews/flora-blossom-photorealistic.svg) ·
[illustration](../../../public/objects/flora-v1/previews/flora-blossom-illustration.svg) ·
[studio : prairie](../../../public/objects/flora-v1/previews/flora-meadow-photorealistic.svg) ·
[illustration](../../../public/objects/flora-v1/previews/flora-meadow-illustration.svg) ·
[studio : ginkgo](../../../public/objects/flora-v1/previews/flora-branch-photorealistic.svg) ·
[illustration](../../../public/objects/flora-v1/previews/flora-branch-illustration.svg).

## Validation exécutée

Les posters ont été produits comme SVG transparents, consultables sur fond clair
ou sombre et vectoriels à toute taille. Les tests de cycle et de lifecycle sont
inclus dans la PR et doivent être exécutés par la CI.

Le runner local de cette passe n’a pas démarré : aucune inspection animée dans un
navigateur, capture multi-instants, mesure de coût CPU/GPU, test réseau mobile,
téléphone physique ou batterie n’est donc revendiqué. Le harnais
`scripts/flora-preview.html` est fourni pour cette revue. Tant qu’elle n’est pas
faite, le niveau visuel animé reste candidat et la PR demeure en brouillon.
