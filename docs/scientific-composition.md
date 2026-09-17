# Composer des calques atomiques et moléculaires

État au 16 septembre 2026 : ajout compatible à Sciences 1.0.0, en revue.
Pas une publication npm, un calcul quantique, ni une validation chimique.

## Calques réutilisables

Les quatre composants publics retournent un groupe SVG sans fond ni carte.
Le parent choisit position, superposition, clip, taille et couleur héritée.

```tsx
import {
  AtomicOrbitalLayer, AtomicDensityLayer, AtomSphereLayer, MoleculeLayer,
  MOLECULE_PRESETS
} from '@blueprint-modular/core/objects';

<svg viewBox="0 0 800 420" style={{color: '#193043'}}>
  <g transform="translate(210 210)">
    <AtomicOrbitalLayer n={2} l={1} opacity={.8} nucleus={false} />
  </g>
  <g transform="translate(610 210)">
    <MoleculeLayer graph={MOLECULE_PRESETS.water.graph}
      layers={{atoms: true, bonds: true, labels: true}} yaw={0} pitch={0} />
  </g>
</svg>
// Une boule indépendante : <AtomSphereLayer element="O" radius={40} />
```

AtomicDensityLayer est un **schéma qualitatif**, pas une carte de densité
calculée, une orbitale, une simulation du noyau ou une surface physique.
Les faux axes quantitatifs, les nucléons inventés et les lobes déduits du
seul bloc périodique ont été retirés. Un nombre de neutrons exige un isotope ;
il n’est pas deviné. Le noyau est un simple repère. Superposer ces schémas
atomiques ne donne PAS la densité électronique d’une molécule.

Le composant complet accepte les fonds `midnight`, `paper`, `transparent`.
Sans fond, le texte et les repères héritent de `currentColor` : définir la
couleur du parent selon son fond. Les boules gardent les couleurs CPK.

## Composition transportable

```tsx
import {useState} from 'react';
import {
  ScienceObject, ScienceControls, DEFAULT_SCIENCE_SETTINGS,
  moleculePresetSettings, type ScienceSettings
} from '@blueprint-modular/core/objects';
const [science,setScience] = useState<ScienceSettings>({
  ...DEFAULT_SCIENCE_SETTINGS, molecule: moleculePresetSettings('water')
});
<ScienceObject id="science-molecule" label="Eau"
  style="transparent" size={520} {...science} />
<ScienceControls id="science-molecule" value={science} onChange={setScience} />
```

Le catalogue expose également `ModularObject` : passer les champs
`atomic={science.atomic}` et `molecule={science.molecule}` avec les autres
réglages. « Ajouter à Maker » exporte une référence `.modular.json`.
Maker utilise le même éditeur et le même moteur embarqué ; le graphe passe
par le chat puis `AppSpec.meta.modularObjects`, sans conversion en image.
Une application générée peut modifier et réexporter sa composition.

Le graphe personnalisé contient uniquement :

- `atoms: [{id, element, position: [x,y,z]}]`, positions en ångströms ;
- `bonds: [{from, to, order: 1|2|3}]`.

La sélection du preset `custom` exige ce graphe. Une seule modification
d’atome, de position ou de liaison enlève le statut sourcé. Les autres presets
refusent un graphe de remplacement pour éviter une fausse attribution.
Les champs `source`, URLs, scripts, HTML et toutes clés inconnues sont refusés.
Le solveur de valence n’existe pas : les quelques alertes de recouvrement et
de valence inhabituelle ne prouvent **jamais** la stabilité ou la faisabilité.

Limites explicites : 48 atomes, 96 liaisons, coordonnées finies ±50 Å ;
éléments H, C, N, O, F, P, S, Cl, Br, I pour le compositeur. Pas de charges,
d’isotopes, de reconnaissance stéréochimique ni d’optimisation. Les cycles aromatiques sont
stockés sous forme de liaisons simples/doubles de Kekulé ; les deux écritures
mésomères ne sont pas canonicalisées par la reconnaissance locale.
Le tableau conserve les 118 éléments ; cette liste réduite ne modifie pas
leurs identités. Une formule seule ne détermine ni connectivité ni isomère.

Les orientations modifient uniquement la projection orthographique, jamais
les coordonnées. Les mesures de la fiche concernent la première liaison et,
si disponible, un angle adjacent identifié par les trois identifiants.
`bondLength` et `bondAngle` sont exportées pour lire le reste du graphe.
Les doubles et triples liaisons sont visibles ; les rayons des boules sont
symboliques, pas des rayons covalents ou de van der Waals.

## Géométries sourcées

Coordonnées individuelles transcrites depuis le NIST CCCBDB, consulté le
16 septembre 2026. Modèles de petites molécules **neutres en phase gazeuse**,
pas des configurations thermiques instantanées ni de l’eau liquide.
Valeurs ci-dessous arrondies, calculées depuis les coordonnées cartésiennes
à quatre décimales fournies par la source ; une dernière décimale n’implique
pas la précision expérimentale.

| Preset | Liaison (Å) | Angle | Géométrie | Source primaire |
|---|---:|---:|---|---|
| Eau H₂O | O–H ≈ 0,9578 | H–O–H ≈ 104,48° | coudée | [NIST H₂O](https://cccbdb.nist.gov/exp2x.asp?casno=7732185&charge=0) |
| CO₂ | C=O ≈ 1,1621 | O–C–O = 180° | linéaire | [NIST CO₂](https://cccbdb.nist.gov/exp2x.asp?casno=124389&charge=0) |
| CH₄ | C–H ≈ 1,0870 | H–C–H ≈ 109,47° | tétraédrique | [NIST CH₄](https://cccbdb.nist.gov/exp2x.asp?casno=74828&charge=0) |
| NH₃ | N–H ≈ 1,0124 | H–N–H ≈ 106,67° | pyramidale | [NIST NH₃](https://cccbdb.nist.gov/exp2x.asp?casno=7664417&charge=0) |

Les pages NIST donnent les références originales : Hoy & Bunker (1979),
DOI 10.1016/0022-2852(79)90019-5 pour H₂O ; Herzberg (1966) pour CO₂ et NH₃ ;
les entrées 1979Hir:213 et 1974sve/kov pour CH₄. CCCBDB : SRD 101, Release 22,
mai 2022, éditeur Russell D. Johnson III.

Couleurs conventionnelles [CPK/Jmol](https://jmol.sourceforge.net/jscolors/) :
H blanc, O rouge, C gris foncé, N bleu. Elles ne sont pas une propriété
physique. Le noir pour H est donc évité. Aucun code Jmol n’est importé.

Les rendus et le moteur sont originaux, Apache-2.0. Seuls les faits numériques
ci-dessus sont transcrits : pas d’illustration, de logiciel, de fichier de base
NIST ni d’extrait rédigé redistribué. La licence du moteur ne s’applique pas
aux sources NIST. Le manifeste conserve les empreintes SHA-256 des aperçus.

## Bibliothèque étendue et recherche inverse

Le catalogue généré dans `molecule-library.generated.ts` contient uniquement
les graphes factuels et les coordonnées 3D produites par PubChem. Les quatre
presets NIST précédents restent inchangés. Recherche par nom français/anglais
ou formule, y compris `C2H6O`. Les molécules, identifiants CID, conformères,
requêtes, empreintes SHA-256 et exclusions sont consignés dans
[molecular-sources.json](previews/science/molecular-sources.json).

`moleculeFormula(graph)` calcule une formule de Hill depuis les atomes explicites.
`recognizeMolecule(graph)` retourne `candidates` (même formule), `connectivity`
(mêmes éléments et ordres de liaison, indépendamment des identifiants,
coordonnées et ordre des atomes) et `unresolved` (limite de calcul atteinte).
Aucune correspondance n’est une preuve de stabilité, de charge, d’isotopie ou
de stéréochimie. Les formes cis/trans restent plusieurs candidats. Une absence
signifie seulement « absent du catalogue ». Le budget de comparaison est borné ;
un dépassement n’est pas transformé en résultat négatif.

Les graphes personnalisés ne prennent pas automatiquement la provenance d’un
candidat. Le bouton de candidat charge explicitement la géométrie sourcée.
La recherche par quantités ne modifie pas la molécule affichée. « Analyser la
composition affichée » utilise son graphe et ses liaisons ; « Vider les quantités »
ne touche qu’au formulaire de recherche. Les réglages de calques et de mouvement
sont conservés lors du chargement d’un candidat.
L’éditeur accepte jusqu’à 48 atomes et 96 liaisons ; les références Maker restent
bornées à 32 K caractères et cinq objets par création.

### Sources, méthode et réutilisation

[PubChem3D](https://pubchem.ncbi.nlm.nih.gov/pcfe/docs/markdown/pubchem3d.md)
produit des conformères calculés avec OMEGA/MMFF94s. Ils ne sont ni des mesures
expérimentales, ni nécessairement des minima d’énergie. Le moteur les affiche
comme **conformères calculés**. Les acides aminés représentés sous forme neutre
ne prétendent pas représenter leur forme dominante dans l’eau à un pH donné.

Le même document indique que NCBI ne restreint pas la distribution de ses données
moléculaires, tout en réservant les droits éventuels des déposants. Ici seuls
les faits structuraux et les conformères numériques **générés par PubChem** sont
repris, avec auteur, CID, source et empreinte. Aucun texte de déposant, image,
logiciel OpenEye ou fichier de fournisseur n’est redistribué. Le code et les
illustrations vectorielles sont originaux et restent Apache-2.0 ; cette licence
ne prétend pas couvrir les sources. L’importeur refuse charges formelles,
isotopes explicites, coordonnées absentes et graphes hors limites.

Reproduction : `python scripts/import-science-data.py --cache /chemin/cache`.
Pour enrichir sans remplacer les structures archivées : ajouter des graines à
`scripts/molecule-seeds.json`, puis lancer avec `--extend --workers 4`. Les requêtes
partagent une limite globale inférieure à cinq départs par seconde. Le mode
`--offline --extend` conserve les données déjà publiées et utilise les réponses
en cache pour les ajouts ; aucune géométrie absente n’est inventée. Les coordonnées
non finies ou hors des bornes de l’éditeur sont rejetées.
Requêtes séquentielles, moins de cinq par seconde, conformément au
[contrat PUG REST](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest).
Aucun appel distant à PubChem n’est fait dans une application consommatrice.

## Analyseur atomique : une lecture inspectable

La vue par défaut présente la configuration de référence de l’atome neutre,
les populations par couche et une sous-couche sélectionnable. NIST ASD fournit
les configurations 1–108 ; PubChem fournit les références théoriques 109–118.
Les éléments Z ≥ 104 sont explicitement marqués comme prédits. L’entrée Lr
utilise 7p¹ du NIST, et non l’ancienne entrée 6d¹ de PubChem. Les 118 sommes
électroniques et capacités sont vérifiées. Sources et empreintes dans
[electron-configuration-source.json](previews/science/electron-configuration-source.json).

`AtomicOrbitalLayer` trace une coupe xz de la base hydrogénoïde à un électron,
Z = 1, m = 0 : polynômes de Laguerre pour R(n,l), polynômes de Legendre pour
la partie angulaire. Références : [NIST DLMF 18.39(ii)](https://dlmf.nist.gov/18.39#ii)
et [14.30](https://dlmf.nist.gov/14.30). Le rayon est réduit pour l’affichage.
Les six contours sont des niveaux relatifs de |ψ|² dans une coupe, pas des
surfaces contenant un pourcentage donné de probabilité. Bleu/ambre codent les
signes de ψ, pas des charges ni deux catégories d’électrons.

Ce modèle n’est **pas** la densité totale calculée d’un atome polyélectronique.
Il ne déduit pas la forme de cette densité de son seul bloc périodique. La
configuration factuelle et la base mathématique illustrée restent distinctes.
Les anciens calques `density` et `sphere` restent disponibles ; les références
explicites existantes ne changent pas de représentation. Un isotope est toujours
requis avant d’annoncer un nombre de neutrons.

Reproduction : `python scripts/import-electron-configurations.py` ; les options
`--nist-csv` et `--pubchem-json` permettent de régénérer depuis des réponses
archivées. Les données sources ne sont jamais exécutées.

## Mouvement, poids et validation

`molecule.motion` est optionnel, désactivé par défaut. `motionSpeed` va de 0,25
à 2. Le mouvement oscille de ±9° en orientation et ±4° en inclinaison, dans une
boucle de 20 secondes à vitesse 1. Il modifie uniquement le point de vue :
aucune liaison, distance ni géométrie ne change. Ce n’est pas une simulation
thermique ou une vibration moléculaire.

`playing={false}` fige la phase. `thumbnail`, `prefers-reduced-motion`, l’absence
d’intersection ou un onglet masqué empêchent la boucle. Un seul objet sélectionné
est animé dans les interfaces livrées ; 12 fps sous 640 px, 18 fps ailleurs.
Pas de boucle pour l’analyseur atomique : une orbitale stationnaire n’a pas à
« respirer ». Voir les preuves et limites dans [les aperçus](previews/science/README.md).
