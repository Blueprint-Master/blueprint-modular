# Composer des calques atomiques et moléculaires

État au 16 septembre 2026 : ajout compatible à Sciences 1.0.0, en revue.
Pas une publication npm, un calcul quantique, ni une validation chimique.

## Calques réutilisables

Les trois composants publics retournent un groupe SVG sans fond ni carte.
Le parent choisit position, superposition, clip, taille et couleur héritée.

```tsx
import {
  AtomicDensityLayer, AtomSphereLayer, MoleculeLayer,
  MOLECULE_PRESETS
} from '@blueprint-modular/core/objects';

<svg viewBox="0 0 800 420" style={{color: '#193043'}}>
  <g transform="translate(210 210)">
    <AtomicDensityLayer settings={{density: true, nucleus: false, opacity: .6}} />
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

Limites explicites : 24 atomes, 48 liaisons, coordonnées finies ±50 Å ;
éléments H, C, N, O, F, P, S, Cl, Br, I pour le compositeur. Pas de charges,
d’isotopes, de stéréochimie nommée, de liaisons aromatiques ou d’optimisation.
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

## Mouvement, poids et validation

Aucune pulsation ou rotation automatique : une densité stationnaire n’a pas
à « respirer » pour paraître vivante. On manipule l’orientation et la composition
sans inventer de mouvement physique. Zéro boucle CSS/JavaScript, aucune texture,
aucun chargement scientifique distant. Pause et reduced-motion n’ont donc
aucun mouvement à arrêter. Les anciens champs playing/speed restent lisibles
pour compatibilité ; les commandes inutiles sont retirées des vues scientifiques.

Voir [preuves et limites](previews/science/README.md), la démonstration hors
ligne, les trois styles et les mesures reproductibles.
