# Atlas, scènes célestes et aviation — API React

Cette extension ajoute quinze composants à `@blueprint-modular/core`, sous le namespace `bpm.*`. **Trois primitives suffisent à composer la cartographie terrestre** : `cartographicMap`, `mapLayerControl`, `mapLegend`. Les sujets sont des compositions de données et de styles, pas de nouveaux composants. La carte `bpm.skyMap` existante conserve son API et sa projection équatoriale. La distribution npm suit la publication du core après intégration de la PR.

```tsx
import { bpm, createSolarSystemBodies } from '@blueprint-modular/core';
import type { OrbitalBody, CelestialObject, FlightPosition, CabinRow } from '@blueprint-modular/core';
import '@blueprint-modular/core/style.css';
```

| Composant | Rôle | Liberté de composition |
| --- | --- | --- |
| `cartographicMap` | Moteur de carte à pile de calques | GeoJSON, XYZ/TMS, WMS, images, grilles scalaires, adaptateurs React |
| `mapLayerControl` | Pile, groupes imbriqués, visibilité, opacité et ordre | État JSON partagé, fonds exclusifs, commandes au clavier |
| `mapLegend` | Règles, classes, seuils, unités et symboles | Même état que la carte, items libres supplémentaires |
| `celestialScene` | Scène cartésienne projetée, objets, chemins, particules, caméra | `renderObject`, `renderOverlay`, `renderDetails`, données libres |
| `celestialBody` | Étoile, planète, lune, astéroïde, trou noir stylisé | Couleur, anneaux, inclinaison, contenu SVG `children` |
| `orbitalSystem` | Orbites elliptiques et hiérarchie de satellites | Corps, parents, éléments orbitaux, temps, options de scène |
| `solarSystem` | Soleil et huit planètes, vue interne | Remplacement du préréglage, distances relatives/schématiques, toutes les options orbitales |
| `galaxyView` | Distribution procédurale spirale/barrée/elliptique/irrégulière | Graine, bras, torsion, épaisseur, palette, repères et couches SVG |
| `moonPhase` | Apparence et fraction éclairée de la Lune | Fraction de cycle, hémisphère, taille, couleur |
| `aircraftMarker` | Avion, hélice, hélicoptère, drone | Cap, couleur, taille, silhouette SVG libre |
| `flightMap` | Positions, aéroports, routes et traces | Données externes, frontières géographiques, symbole, couche SVG et fiche libres |
| `flightInstruments` | Attitude, cap, altitude, vitesse et variomètre | Télémétrie, unités, provenance et panneau complémentaire |
| `flightProfile` | Altitude selon le temps ou la distance | Échantillons, unités, référence, sélection |
| `airportBoard` | Départs/arrivées, recherche, horaires, portes, statuts | Données, ordre, fuseau affiché, rendu du statut et sélection |
| `seatMap` | Cabine, rangées, couloirs et sélection de sièges | Géométrie libre, classes, issues, états et rendu des sièges |

## Contrat commun

- Aucune nouvelle dépendance. Les scènes célestes et aviation ne font aucun fetch. La cartographie réutilise le chargement dynamique de Leaflet déjà présent ; elle charge seulement les sources explicitement fournies et n’ajoute aucun fond implicite. GeoJSON, grilles et ressources locales permettent une composition sans service distant.
- Les scènes sont des vues SVG **orthographiques** avec une géométrie 3D projetée. Elles ne sont pas un moteur de rendu volumétrique avec occlusion physique.
- Rendu initial reproductible en SSR ; les particules utilisent une graine, jamais `Math.random()` ou une date système.
- L'animation orbitale démarre uniquement sur « Animer » ; pause, saisie temporelle et réinitialisation sont disponibles. Les scènes ne capturent pas le défilement vertical du téléphone.
- Les callbacks conservent les objets de l'appelant. La sélection et la caméra sont contrôlables : si une prop contrôlée est fournie, son propriétaire doit la mettre à jour dans le callback.
- Les styles d'interface suivent les variables BPM. Les couleurs des astres, du ciel et des cartes sont des paramètres de visualisation.
- Dans les scènes SVG, `renderOverlay` produit du SVG React et reçoit `project`. Dans `cartographicMap`, il produit du HTML React ancré au viewport ; les annotations géographiques appartiennent aux calques. Les callbacks vivent dans un composant client ; les seules données restent sérialisables.

## Grammaire cartographique

Le LLM choisit les sources, les géométries, les attributs, les filtres, les règles et l’ordre. Le moteur détermine le rendu et les interactions. Une couche peut représenter n’importe quel sujet : la propriété `kind` décrit **le format**, pas le domaine.

| `kind` | Données | Utilisations possibles |
| --- | --- | --- |
| `geojson` | `data` : géométrie, Feature ou FeatureCollection | Parcelles, limites, bâtiments avec trous, fleuves, courbes de niveau, réseaux, isobathes, routes, positions, zones, libellés |
| `tile` | `url` XYZ `{z}/{x}/{y}` ou TMS (`tms: true`) | Orthophotos, satellites, fonds topographiques, scans tuilés, relief pré-rendu ; WMTS via un modèle d’URL compatible avec la grille de la carte |
| `wms` | `url`, `layers`, `parameters?` | Cadastre, occupation du sol, géologie, bathymétrie, météo, imagerie, archives ; paramètres `styles`, `time`, `elevation`, `cql_filter` selon le service |
| `image` | `url`, `bounds` | Plan ancien géoréférencé, orthophoto locale, plan de niveau, fond arbitraire |
| `raster` | `bounds`, `columns`, `rows`, `values`, `stops` | Altitude, profondeur, température, pollution, indice de végétation, densité, modèle numérique avec ombrage |
| `custom` | `data?` + `renderLayer` | Adaptateur fourni par l’application : tuiles vectorielles, clustering, grille hexagonale, champs de vecteurs, autre moteur compatible Leaflet |

Toutes les couches ont `{ id, label, groupId?, visible?, opacity?, blendMode?, source?, minZoom?, maxZoom?, fromTime?, toTime?, interactive?, description? }`. Les identifiants doivent être uniques et stables. Les modes de fusion proposés sont `normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `difference`. L’opacité est bornée à `[0,1]` et s’applique à **toute** la couche, y compris ses contours, marqueurs et libellés. `interactive: false` laisse les clics traverser le calque.

La pile peut comprendre autant de niveaux que le jeu de données le nécessite ; les groupes sont imbriquables et ne fixent aucune taxonomie :

| Famille possible | Calques possibles, librement séparables |
| --- | --- |
| Référentiel | Projection, fond, imagerie, scan, repères, grille, toponymie |
| Sous-sol | Géologie, nappes, conduites, câbles, tunnels, niveaux d’infrastructure |
| Milieu physique | Altitude, ombrage, pentes pré-calculées, courbes de niveau, bassins versants, fleuves, lacs |
| Milieu marin | Profondeur, isobathes, nature des fonds, habitats, chenaux, mouillages, ports, bouées |
| Foncier et agriculture | Cadastre, parcelles, sous-parcelles, îlots, cultures, irrigation, sols, indices et rendements |
| Ville | Limites administratives, quartiers, îlots, bâtiments, cours, étages en plan, voirie, équipements |
| Mobilités | Routes, rails, chemins, itinéraires, positions, traces, vitesses |
| Aérien | Aéroports, pistes, balises, routes, avions, espaces aériens filtrés par plancher/plafond |
| Secteurs et événements | Périmètres, zones, positions, événements, contraintes, scénarios temporels |
| Lecture | Symboles, libellés, annotations, sélection et surbrillance |

Ces familles sont des **exemples de groupes**, jamais une liste fermée de composants ni une promesse de données disponibles. Les propriétés de profondeur, altitude, étage ou niveau restent des attributs filtrables ; cette carte est un rendu 2D et ne simule pas des volumes souterrains ou aériens.

### Coordonnées, projection et sources

- Les positions GeoJSON sont `[longitude, latitude, altitude?]` (ou `[x,y,z?]` en mode local). `center` et chaque coin de `bounds` suivent Leaflet : `[latitude, longitude]` / `[y,x]`. L’altitude GeoJSON n’est pas projetée en 3D.
- `projection: 'mercator'` = EPSG:3857 ; `'geographic'` = EPSG:4326 ; `'simple'` = coordonnées locales, pour un plan ou une image. `crs` permet une projection applicative supplémentaire ; remonter le composant si elle change. Le fournisseur de tuiles doit utiliser la même grille/projection.
- `bounds: [[south,west],[north,east]]` doit être croissante et ne pas traverser le méridien 180°. Mercator limite les emprises à ±85,0511°. Découper les géométries qui traversent l’antiméridien en MultiLineString/MultiPolygon, conformément au [RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.9). Le composant ne devine pas une réparation ni un ordre de coordonnées.
- Polygon accepte anneau extérieur et trous ; MultiPolygon, MultiPoint, MultiLineString et GeometryCollection sont acceptés. Anneaux fermés obligatoires. Géométries invalides, nulles et doublons sont signalés et ignorés ; la validation ne vérifie pas la topologie cadastrale (auto-intersections, partage exact de limites).
- `source: { attribution, url?, license?, date? }` est obligatoire pour `tile`, `wms` et `image`. Ce sont des textes et liens fournis par l’application. Les attributions des couches visibles restent affichées même si leurs contrôles sont masqués. Les erreurs de chargement d’images/tuiles sont signalées.
- Une image doit déjà être géoréférencée et rectifiée dans la projection de la carte. Le composant ne géoréférence pas automatiquement un scan, ne décode pas les GeoTIFF et ne reprojette pas des tuiles. Un service WMS peut effectuer la reprojection côté serveur s’il la prend en charge.
- Les requêtes distantes sont celles du navigateur : accès, CORS, autorisation du fournisseur et clés éventuelles relèvent du consommateur. Les clés privées ne doivent pas être incorporées dans l’URL publique ; utiliser une source applicative adaptée. Le contrat ne propose aucune URL de fournisseur supposée universelle.

Le moteur reprend les formats et couches de [Leaflet 1.9](https://leafletjs.com/reference.html). Les options de `MapView` existantes restent compatibles ; `baseLayer`, `projection`, `crs` et `renderLayers({rl,L})` y ajoutent une extension réutilisée par l’atlas.

### Pile et groupes

```tsx
import React from 'react';
import { bpm } from '@blueprint-modular/core';
import type { CartographicLayer, MapLayerGroup, MapLayerState } from '@blueprint-modular/core';

const groups: MapLayerGroup[] = [
  { id: 'fonds', label: 'Fonds', exclusive: true },
  { id: 'territoire', label: 'Territoire' },
  { id: 'foncier', label: 'Foncier', parentId: 'territoire' },
  { id: 'reseaux', label: 'Réseaux', parentId: 'territoire' },
];
const layers: CartographicLayer[] = [{
  id: 'parcelles', label: 'Parcelles agricoles', kind: 'geojson', groupId: 'foncier',
  data: { type: 'FeatureCollection', features: [{
    type: 'Feature', id: 'A01', properties: { nom: 'A01', culture: 'Blé', ndvi: .62 },
    geometry: { type: 'Polygon', coordinates: [
      [[2.34,48.85],[2.35,48.85],[2.35,48.86],[2.34,48.86],[2.34,48.85]],
    ] },
  }] },
  labelField: 'nom', labels: 'hover',
  style: { color: '#567347', weight: 1.5, fillOpacity: .55 },
  rules: [{ label: 'Blé', when: [{ field: 'culture', operator: 'eq', value: 'Blé' }],
    style: { fillColor: '#d8c278' } }],
}];

function MonAtlas() {
  const [state, setState] = React.useState<MapLayerState>({
    order: ['parcelles'], visible: { parcelles: true }, opacity: { parcelles: .8 },
  });
  return bpm.cartographicMap({ title: 'Foncier', layers, groups, state,
    onStateChange: setState, center: [48.855, 2.345], zoom: 14,
    onFeatureSelect: item => console.log(item?.layerId, item?.feature.properties),
  });
}
```

L’ordre de `layers` est **du bas vers le haut** ; `state.order` le remplace par identifiants (les nouveaux identifiants sont ajoutés ensuite dans l’ordre déclaré). L’interface affiche la couche du dessus en premier. Les groupes changent la visibilité de leurs descendants sans perdre leurs préférences. Un groupe `exclusive` choisit une couche enfant directe à la fois ; en cas de plusieurs fonds activés initialement, le plus haut gagne. Les cycles et parents absents sont signalés et désactivés.

`state` est contrôlé si fourni ; l’appelant doit alors appliquer `onStateChange`. Sinon la carte et le contrôle autonome gèrent leur état local. Pour des panneaux séparés ou deux cartes comparées, partager le même état avec `bpm.mapLayerControl` et `bpm.mapLegend`, en masquant les panneaux intégrés via `showLayerControl: false` / `showLegend: false`. Partager également `zoom` (reçu dans `onViewChange`) et `time` pour synchroniser les filtres de légende.

### Règles, mesures, niveaux et dates

`filter` est une conjonction de `{ field, operator, value? }` : `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `exists`. Les champs sont des noms exacts de propriétés propres ; pas de chemin JavaScript, d’expression évaluée ni de coercition de chaîne en nombre. `rules` applique, dans l’ordre, `{ label?, when: MapFilter[], style }` ; la dernière règle correspondante gagne. Puis `colorBy` et `sizeBy` appliquent les mesures continues.

```tsx
// Même couche, n’afficher que les espaces aériens contenant l’altitude choisie.
const altitude = 2500;
const filtreVertical = [
  { field: 'plancher', operator: 'lte' as const, value: altitude },
  { field: 'plafond', operator: 'gte' as const, value: altitude },
];

// Même principe pour un étage, une profondeur, une culture, un statut ou un réseau.
const filtreEtage = [{ field: 'etage', operator: 'eq' as const, value: -2 }];

// Coloration continue : les stops sont des valeurs dans l’unité des données.
const vegetation = {
  field: 'ndvi', unit: 'indice',
  stops: [{ value: 0, color: '#e3d3a0' }, { value: .5, color: '#9ebd67' }, { value: 1, color: '#215f40' }],
};
```

Styles : `{ color, weight, opacity, fillColor, fillOpacity, dashArray, radius, symbol, heading }`. `radius` est une taille de symbole en **pixels**, pas un rayon de zone en mètres. Symboles : circle, square, triangle, diamond, aircraft, cross. `headingField` oriente le symbole depuis un attribut (degrés horaires depuis le nord). `colorBy` utilise `{field, stops, target?: 'fill'|'stroke', missingColor?, unit?}` ; `sizeBy` utilise `{field,min,max,minRadius?,maxRadius?}`. Couleurs continues interpolées en RGB hexadécimal ; valeurs hors domaine bornées aux extrémités.

La légende est construite avec les mêmes styles, règles et rampes. Les classes déclarées peuvent rester dans la légende même si leur filtre ne retient actuellement aucun objet. Les libellés restent dans le même plan que leur couche : pour une toponymie toujours au-dessus, dupliquer uniquement les données nécessaires dans un calque de libellés final, avec contours et remplissages invisibles.

`time` est une valeur numérique explicite ; `fromTime` et `toTime` sont des bornes inclusives dans cette même unité. Sans `time`, aucun filtre de période n’est appliqué. Les dates d’édition sont des métadonnées `source.date`, distinctes du temps de filtrage ; une palette sépia ne transforme pas les données modernes en archive. Les paramètres WMS `time`/`elevation` sont ceux du service ; ils ne sont pas déduits de `time` automatiquement.

### Raster, profondeur et relief

```tsx
const profondeur: CartographicLayer = {
  id: 'profondeur', label: 'Profondeur illustrative', kind: 'raster',
  bounds: [[43, 3], [44, 4]], columns: 3, rows: 2,
  values: [-1000, -400, null, -800, -300, 0], unit: 'm',
  stops: [{ value: -1000, color: '#09223f' }, { value: -400, color: '#166c8c' }, { value: 0, color: '#8edac9' }],
  source: { attribution: 'Exemple synthétique' },
};
```

La grille est stockée ligne par ligne, **du nord vers le sud**, de l’ouest vers l’est ; chaque cellule remplit son emprise. `null`, NaN et `noData` restent transparents. Maximum 16 384 cellules par raster, erreur explicite au-delà : pour de grands MNT, rasters scientifiques ou imageries, utiliser des tuiles/WMS ou un adaptateur. Le moteur produit une image SVG déterministe et adapte la hauteur des lignes à Mercator. Les autres CRS applicatifs nécessitent un raster déjà reprojeté par un adaptateur.

`hillshade: { cellSize, azimuth?:315, elevation?:45, exaggeration?:1, strength?:.55 }` ajoute un ombrage par différences centrales ; `cellSize` et les hauteurs doivent être exprimés dans la même unité. La légende montre la palette avant ombrage. Les pentes, bassins, courbes de niveau et isobathes peuvent venir de traitements spécialisés, puis être superposés en GeoJSON ; cette API n’est pas un moteur complet d’analyse SIG.

### Compositions et extension libre

`CARTOGRAPHIC_THEMES` expose dix recettes de présentation : modern, dark, terrain, bathymetric, nautical, hydrographic, historical, tactical, agricultural, aerial. Chaque thème est aussi remplaçable par `{background, vector: MapFeatureStyle}`. Les exemples de la page `cartographicmap` montrent un territoire synthétique avec les mêmes primitives et des configurations différentes :

| Carte voulue | Composition, du fond vers les annotations |
| --- | --- |
| Relief | Raster d’altitude + ombrage → courbes de niveau GeoJSON → chemins → toponymie |
| Fonds marins | Grille de profondeur → isobathes → habitats/substrats → repères |
| Maritime | Fond fourni → côtes → chenaux/zones → routes → ports et bouées |
| Fleuves | Relief → bassins → cours d’eau → stations → mesures et libellés |
| Ville | Fond → limites → parcelles → bâtiments/cours → voirie → réseaux/niveaux → équipements |
| Ancienne et moderne | Image rectifiée ou scan tuilé → limites actuelles en transparence → annotations ; partager le même état entre deux cartes pour comparer |
| Aérienne | Orthophoto fournie → pistes → espaces aériens filtrés → routes → positions orientées → télémétrie liée |
| Secteurs militaires | Fond fourni → secteurs → positions/symboles applicatifs → itinéraires → événements ; la palette ne constitue pas une symbologie réglementaire |
| Agricole | Orthophoto ou relief → cadastre → sous-parcelles → cultures → irrigation → grille d’indice/mesure |

Les exemples de tuiles et WMS doivent prendre leurs URL et attributions depuis une configuration vérifiée :

```tsx
function couchesExternes(config: { orthophotoUrl: string; wmsUrl: string; cadastralLayer: string; attribution: string }): CartographicLayer[] {
  return [
    { id: 'ortho', label: 'Orthophoto', kind: 'tile', url: config.orthophotoUrl,
      source: { attribution: config.attribution } },
    { id: 'cadastre', label: 'Cadastre', kind: 'wms', url: config.wmsUrl,
      layers: config.cadastralLayer, opacity: .7, parameters: { styles: '' },
      source: { attribution: config.attribution } },
  ];
}
```

`renderLayer(layer, {rl,L,pane,projection})` s’exécute dans le contexte Leaflet. Retourner `undefined` laisse le rendu standard ; retourner `null` masque le rendu ; un nœud React le remplace. Pour `custom`, cet adaptateur est requis. Il peut monter un composant applicatif qui utilise `rl.useMap()` et gère son nettoyage, ou des primitives React Leaflet. Sa couche conserve son rang, son opacité et sa fusion. L’intégration peut ainsi accepter d’autres sources et représentations sans allonger la liste de composants BPM.

`renderFeatureDetails(selection)` reçoit `{layerId, featureId, feature}`. La sélection est possible sur la carte et via une recherche/liste accessible au clavier. Elle ne considère que les objets actuellement visibles et interactifs. `selected` et `onFeatureSelect` permettent de la contrôler. Le déplacement tactile démarre sur une action explicite dans la barre de carte ; `defaultInteractive` permet de choisir un démarrage actif.

## Géométrie céleste

`CelestialObject` : `{ id, label, x, y, z?, radius?, color?, kind?, rings?, description? }`. Les coordonnées utilisent une même unité cartésienne libre ; `radius` est la taille du symbole en pixels SVG, indépendamment des distances. La caméra accepte `{ azimuth?, elevation?, zoom? }` en degrés (zoom 0,25–8). `extent` définit l'échelle de cadrage. `showControls` et `showLabels` sont optionnels.

`CelestialPath` : `{ id, points: [{x,y,z?}, ...], color?, dashed? }`.

`CelestialParticle` : `{ x, y, z?, radius?, color?, opacity? }`. Le rendu limite les particules à 4 000 et indique les exclusions. Les points sélectionnables doivent aller dans `objects`, les étoiles décoratives dans `particles`.

`OrbitalBody` : `{ id, label, parentId?, position?, orbit?, radius?, color?, kind?, rings?, description? }`. Sans orbite, `position` est relative au parent (origine par défaut). Avec une orbite, `position` n'est pas utilisée. Parents manquants, cycles, doublons et éléments invalides sont comptés ; leurs descendants ne sont pas placés à tort à l'origine. La profondeur maximale est 64.

`OrbitalElements` : `{ semiMajorAxis, period, eccentricity?, phase?, inclination?, ascendingNode?, periapsis? }`. L'excentricité est dans `[0,1[`, les axes et périodes sont strictement positifs. Les angles sont en degrés. `phase` est l'anomalie moyenne à `time=0`. `period`, `time` et `speed` emploient la même unité de modèle. Résolution de Kepler par dichotomie bornée ; aucune éphéméride ni époque n'est inférée.

```tsx
const bodies: OrbitalBody[] = [
  { id: 's', label: 'Aster', kind: 'star', color: '#ffc071', radius: 18 },
  { id: 'p', label: 'Nacre', parentId: 's', color: '#a7bbff', rings: true,
    orbit: { semiMajorAxis: 65, eccentricity: .2, period: 30 } },
  { id: 'm', label: 'Éclat', parentId: 'p', kind: 'moon', radius: 4,
    orbit: { semiMajorAxis: 16, inclination: 30, period: 4 } },
];

bpm.orbitalSystem({ bodies, speed: 3, scene: {
  extent: 100,
  renderOverlay: ({ project }) => {
    const p = project({ x: 0, y: -85 });
    return <text x={p.x} y={p.y} fill="white">Mon système imaginaire</text>;
  },
  renderDetails: object => <strong>{object.label}</strong>,
} });

// Le préréglage solaire est un point de départ modifiable.
const solar = createSolarSystemBodies('schematic', 'all');
bpm.solarSystem({ bodies: [...solar, { id: 'probe', label: 'Sonde fictive',
  position: { x: 70, y: 40 }, radius: 3, color: '#fff' }] });

bpm.galaxyView({ morphology: 'spiral', arms: 3, seed: 2026,
  starCount: 2400, twist: 4.5, palette: ['#81abdf', '#ead1a6'],
  landmarks: [{ id: 'station', label: 'Station fictive', x: 45, y: -25, radius: 4 }],
  scene: { camera: { elevation: 45, azimuth: 20 }, height: 500 } });
```

Les demi-grands axes, excentricités et inclinaisons du préréglage solaire sont arrondis à partir de la [table JPL J2000](https://ssd.jpl.nasa.gov/planets/approx_pos.html). Les phases sont artistiques et les périodes suivent la relation képlérienne approximative. Les tailles sont symboliques dans les deux modes de distance. Ce préréglage ne représente pas le ciel à une date donnée. Les galaxies sont des distributions illustratives ; les repères mesurés doivent être fournis avec leurs propres sources.

`moonPhase.phase` est une fraction **du cycle**, et non le pourcentage éclairé : 0/1 nouvelle lune, 0,25 premier quartier, 0,5 pleine lune, 0,75 dernier quartier. La fraction éclairée est `(1-cos(2π phase))/2`. La [présentation NASA des phases](https://science.nasa.gov/moon/moon-phases/) explique cette distinction. Sans phase, le composant affiche « Phase non renseignée ».

## Aviation

`GeoPosition` : `{ lat, lon }` en degrés, latitude dans `[-90,90]`, longitude dans `[-180,180]` (est positif).

`FlightPosition` : `{ id, label, lat, lon, heading?, kind?, color?, trail?, description? }`. `heading` est un cap horaire depuis le nord. `AirportPosition` : `{ id, code, label?, lat, lon }`. `FlightRoute` : `{ id, label?, from, to, points?, color? }`. Sans `points`, le composant calcule une route orthodromique indicative. Un couple exactement antipodal n'a pas d'arc court unique : il est signalé sans tracer de route arbitraire. Les traces et frontières se coupent au méridien 180° et aux points invalides. `boundaries` accepte des lignes de coordonnées pour un fond fourni par l'appelant ; par défaut, la carte affiche un graticule, sans fond de continents téléchargé.

```tsx
bpm.flightMap({
  flights: [{ id: 'demo', label: 'DEMO 104', lat: 46, lon: -24, heading: 265 }],
  routes: [{ id: 'atlantic', from: { lat: 49.01, lon: 2.55 },
    to: { lat: 40.64, lon: -73.78 } }],
  onFlightSelect: flight => setSelectedFlight(flight),
  caption: 'Vol de démonstration',
});
bpm.flightInstruments({ pitch: 8, roll: 15, heading: 82,
  altitude: 32000, airspeed: 280, verticalSpeed: 1200,
  altitudeUnit: 'ft', speedUnit: 'kt', verticalSpeedUnit: 'ft/min' });
```

Les unités sont des libellés, jamais des conversions implicites. Une télémétrie absente affiche `—` ; aucune valeur de vol n'est inventée. Les instruments sont des composants de visualisation, sans fonction de navigation opérationnelle. `FlightProfilePoint` : `{ id, x, altitude, label? }`, en ordre croissant de `x`. Les trous invalides interrompent la courbe.

`AirportFlight` : `{ id, flightNumber, destination, scheduledTime, expectedTime?, gate?, status?, statusColor?, airline?, direction? }`. Les horaires sont des textes de l'appelant ; le tableau conserve l'ordre fourni et le fuseau doit être indiqué via `timezoneLabel`. Les statuts restent ouverts et remplaçables par `renderStatus`.

`CabinRow` : `{ id, label, seats, exit? }`. Chaque entrée de `seats` est `null` (couloir) ou `{ id, label, status?, cabin?, description? }`. États : `available` (défaut), `occupied`, `blocked`. La disponibilité ne doit pas être déduite de l'apparence. Les sièges indisponibles ne se sélectionnent pas ; `onSelectionChange(ids, seat)` émet une intention, sans réservation.

## Intégration au catalogue et au Maker

Les quinze clés sont exportées dans `bpm`, documentées par JSDoc, proposées dans la couche sémantique, puis reprises dans `public/llms.txt`, le catalogue MCP et les exemples du showcase. Le guide ne présume pas qu'une version npm a déjà été publiée ni que le Maker a déjà autorisé les nouvelles clés.

Après intégration et publication du core, le consommateur Maker doit utiliser la version contenant ces exports et inclure les nouvelles clés dans ses listes de composants autorisés. Cette PR Modular ne modifie pas le dépôt Maker. Le choix du composant, des paramètres, des données et des renderers est laissé au LLM ; la projection, la géométrie et la gestion des interactions restent déterministes.
