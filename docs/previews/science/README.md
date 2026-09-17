# Sciences : catalogue moléculaire et analyseur

## Nouvelle PR après #236 — 17 septembre 2026

- **340 molécules, soit 187 ajouts** : quatre géométries expérimentales NIST et 336 conformères calculés PubChem3D. Les coordonnées et identifiants des 153 molécules du socle sont conservés. Les trois exclusions sont consignées : dihydrogène sans conformère récupérable, squalène au-delà des limites de l’éditeur et alias de l’aspirine déjà présente.
- La recherche inverse ne remplace plus le modèle affiché par des atomes sans liaisons. Le choix d’un candidat charge sa géométrie ; les réglages de mouvement et de calques restent conservés.
- « Analyser la composition affichée » compare les liaisons existantes. « Vider les quantités » réinitialise seulement le formulaire ; un changement des quantités efface les résultats précédents.
- Champs adaptatifs et cibles de 44 px ; sous-couches atomiques regroupées par niveau et sélectionnables au clavier. Configuration électronique sur sa propre ligne, couche sélectionnée mise en évidence, orbitale et légendes séparées.
- Démonstration autonome corrigée : une seule copie de React, vérifiée au build. Les contrôles utilisent les composants réels.
- Importeur extensible : `--extend --workers 4` conserve les structures archivées ; débit global limité, refus des coordonnées non finies ou hors limites, exclusions consignées.

## Comportements et limites conservés

Recherche FR/EN/formule et reconnaissance par composition puis connectivité ; plusieurs isomères restent proposés lorsque la stéréochimie les distingue. L’absence de résultat signifie seulement « absent de ce catalogue ». Aucun calcul de stabilité n’est revendiqué.

Mouvement optionnel du point de vue, cycle de 20 s et vitesse 0,25–2 ; arrêt hors écran, onglet masqué ou préférence de réduction des animations. Les mesures 3D ne changent pas. Ce comportement provient de #236 ; cette passe préserve ses réglages lors du choix d’un candidat.

L’analyseur conserve les configurations électroniques sourcées des 118 éléments. Les contours sont une base **hydrogénoïde à un électron**, pas la densité totale de l’élément. Les signes de ψ ne sont pas des charges. Nuit/Papier/Transparent et les calques indépendants restent disponibles.

## Aperçus

- [Démonstration autonome](layers.html) : télécharger puis ouvrir localement ; composants React et contrôles, sans requête scientifique distante.
- [Analyseur O/Fe/Lr sur trois fonds](atom-orbitals-review.png).
- [Douze molécules, dont six ajouts](molecular-library-review.png) : lysine, adénosine, vanilline, cubane, camphre et tréhalose.
- [Transparence à 180/520 px](library-transparent-review.png).
- [Vidéo du mouvement](molecule-motion.mp4), [quatre instants](molecule-motion-instants.png) : rendus de la fonction de projection, pas des captures navigateur.
- [Provenance et exclusions](molecular-sources.json), [configurations électroniques](electron-configuration-source.json), [budget mesuré](library-budget.json), [API et limites scientifiques](../../scientific-composition.md).

## Validation

501 tests Core et 267 tests racine, contrôle TypeScript, compilation Core et site. Tests de non-régression sur la préservation de la composition pendant la recherche, la conservation des réglages et la sélection des sous-couches. Les 340 graphes sont vérifiés structurellement ; les 149 anciens enregistrements PubChem sont comparés intégralement à la base fusionnée et sont identiques. Régénération `--offline --extend` effectuée. Installation du véritable paquet construit dans un consommateur isolé : 1 020 combinaisons molécule/fond, références et assets distribués vérifiés.

La démonstration générée se monte dans JSDOM sans erreur de runtime. Les rendus SVG sont inspectés séparément. L’accès du navigateur à la démonstration locale retourne encore `ERR_BLOCKED_BY_CLIENT` : **validation visuelle interactive, temps de frame DOM/GPU et téléphone physique non vérifiés**. Les 340 molécules n’ont pas toutes été inspectées visuellement.

La commande historique `npm run lint` utilise `next lint`, non pris en charge par la version de Next installée ; elle échoue avant analyse des fichiers. Ce problème préexistant n’est pas modifié dans cette PR.

Le budget décrit les tailles brutes/gzip et le rendu React serveur + rasterisation CPU à 224 px, dans l’environnement indiqué. Il ne mesure ni réseau réel, ni coût par frame navigateur, ni batterie.

## Régénération

```sh
python scripts/import-science-data.py --extend --workers 4 --cache /chemin/cache
node --import tsx scripts/render-science-previews.tsx
node scripts/build-science-layer-demo.mjs
npx esbuild scripts/render-science-library-evidence.tsx --bundle --platform=node --packages=external --format=esm --outfile=scripts/.science-library-evidence.mjs
node scripts/.science-library-evidence.mjs
python scripts/assemble-molecule-motion.py
```

`--offline --extend` utilise les réponses en cache pour les ajouts tout en conservant les structures archivées. Le mode sans `--extend` reconstruit l’ensemble depuis les sources/cache. Aucun raster génératif ou artwork tiers n’est utilisé.

## Intégration

Cette passe part de [Modular #236 fusionnée](https://github.com/Blueprint-Master/blueprint-modular/pull/236) et doit être relue dans une **nouvelle PR**. [Maker #2012](https://github.com/Blueprint-Master/blueprint-maker/pull/2012) reste une intégration distincte, épinglée à la version antérieure ; elle n’est pas synchronisée par cette PR. Aucun déploiement ni publication npm n’est effectué ici.
