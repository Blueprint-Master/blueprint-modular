# Sciences : catalogue moléculaire et analyseur

## Passe du 16 septembre 2026 — 153 molécules, composition inverse, mouvement optionnel

- **153 structures** : quatre géométries expérimentales NIST inchangées et 149 conformères calculés PubChem3D. Trois entrées exclues (dihydrogène sans conformère récupérable, deux acides bloqués à la récupération) sont consignées dans le manifeste.
- Recherche par noms FR/EN ou formule ; éditeur inverse par nombres d’atomes et reconnaissance des liaisons. Les isomères restent plusieurs candidats lorsque les seules informations disponibles ne les distinguent pas. La stéréochimie n’est pas déduite.
- Orientation douce optionnelle, cycle de 20 s ; arrêt/pause, vitesse 0,25–2, vignettes fixes et arrêt hors écran/onglet masqué/reduced-motion. Aucun changement de géométrie ni simulation thermique.
- Analyseur : configuration neutre sourcée, populations par couche, sous-couche sélectionnable. La forme est une base **hydrogénoïde à un électron**, pas la densité totale de l’élément. Les signes de ψ sont distincts des charges.
- Trois fonds conservés : nuit, papier et transparent ; quatre calques SVG publics indépendants, paramètres transportables jusqu’à Maker.

### Aperçus consultables

- [Démonstration autonome](layers.html) : télécharger puis ouvrir localement ; vrais composants React et contrôles, aucune requête scientifique distante. Le petit aperçu est fixe.
- [Analyseur, O/Fe/Lr, trois fonds](atom-orbitals-review.png).
- [Six molécules représentatives](molecular-library-review.png).
- [Transparence à 180/520 px, fonds clair et sombre](library-transparent-review.png).
- [Vidéo de la projection animée](molecule-motion.mp4), 20 secondes ; [quatre instants](molecule-motion-instants.png). La vidéo est un rendu du même moteur et de la même fonction d’orientation, **pas une capture du navigateur**.
- SVG individuels `atom-O-*`, `atom-Fe-*`, `atom-Lr-*` et `molecule-*-*` : inspectables et transparents lorsqu’indiqué.
- [Provenance moléculaire](molecular-sources.json), [configurations électroniques](electron-configuration-source.json), [budget mesuré](library-budget.json), [API et limites scientifiques](../../scientific-composition.md).

### Contrôles réellement exécutés

Rendus O/Fe/Lr et six molécules inspectés sur les planches à 360 px ; transparence atomique et moléculaire vérifiée à 180/520 px sur fond clair et sombre ; projection de l’eau, de l’éthanol et du saccharose inspectée à 0/5/10/15 s. Tests React montés sous JSDOM : sélection d’atomes, candidats, choix de géométrie, modifications, une boucle active, arrêt hors écran, onglet masqué, pause et reduced-motion. Tests des 118 comptes électroniques, nœuds analytiques des bases 1s/2s/2p, graphes bornés et imports du paquet construit.

**Limite persistante :** la navigation du navigateur distant vers la démonstration locale a retourné `ERR_BLOCKED_BY_CLIENT`. La manipulation visuelle live, le temps de rendu DOM/GPU, un téléphone physique, le réseau mobile et la batterie ne sont pas validés. Les tests JSDOM et les planches ne remplacent pas cette revue. Toutes les 153 molécules sont vérifiées structurellement ; leur rendu n’a pas été inspecté individuellement dans un navigateur.

Poids : bibliothèque de données ~77 Ko bruts / ~24 Ko gzip ; démonstration autonome avec React ~283 Ko / ~94 Ko gzip. Ce sont des tailles de fichiers, **pas un transfert réseau mesuré**. Rendu serveur React + sharp à 224 px : médianes 10.4–37.1 ms sur Intel Xeon Platinum 8573C virtualisé, Linux x64, Node 24.19. Ces nombres comprennent sérialisation et rasterisation CPU, avec charge partagée ; ce ne sont pas des coûts par frame navigateur. Aucune mesure de batterie n’est extrapolée.

### Régénération

```sh
python scripts/import-science-data.py --cache /chemin/cache
python scripts/import-electron-configurations.py
node --import tsx scripts/render-science-previews.tsx
node scripts/build-science-layer-demo.mjs
npx esbuild scripts/render-science-library-evidence.tsx --bundle --platform=node --packages=external --format=esm --outfile=scripts/.science-library-evidence.mjs
node scripts/.science-library-evidence.mjs
python scripts/assemble-molecule-motion.py
npm run generate:llms
```

Le mode `--offline` du premier importeur régénère depuis son cache et conserve les exclusions. Pour les configurations, `--nist-csv` / `--pubchem-json` acceptent les réponses déjà archivées. Pillow et ffmpeg sont nécessaires pour la planche multi-instants et la vidéo. Les images sont dérivées du code SVG ; aucun raster génératif ni asset tiers n’est utilisé.

### État d’intégration

Le socle des calques et des quatre molécules (Modular #235) est fusionné. Cette extension est en [PR Modular #236](https://github.com/Blueprint-Master/blueprint-modular/pull/236) ; [Maker #2012](https://github.com/Blueprint-Master/blueprint-maker/pull/2012) reste la PR liée. Aucun déploiement, fusion de ces correctifs ou publication npm n’est effectué dans cette passe.
