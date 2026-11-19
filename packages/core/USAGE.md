# @blueprint-modular/core — Guide d'intégration

## Atlas, scènes célestes et aviation

La cartographie se compose avec trois primitives : `bpm.cartographicMap`, `bpm.mapLayerControl`, `bpm.mapLegend`. Une pile de calques GeoJSON, tuiles XYZ/TMS, WMS, images géoréférencées, grilles scalaires et adaptateurs libres couvre parcelles, cadastre, reliefs, fonds marins, fleuves, villes, cartes anciennes, agriculture et aviation. Les groupes sont imbriquables ; l’ordre, la visibilité, l’opacité, les règles, les périodes et les plages de zoom sont pilotables par un état JSON partagé.

Les scènes célestes utilisent `bpm.celestialScene`, `bpm.celestialBody`, `bpm.orbitalSystem`, `bpm.solarSystem`, `bpm.galaxyView`, `bpm.moonPhase`. Les vues aviation utilisent `bpm.aircraftMarker`, `bpm.flightMap`, `bpm.flightInstruments`, `bpm.flightProfile`, `bpm.airportBoard`, `bpm.seatMap`. Les préréglages sont remplaçables et les renderers React permettent une composition libre.

Voir [BPM_API.md](https://github.com/Blueprint-Master/blueprint-modular/blob/master/BPM_API.md) pour les contrats de données, coordonnées, exemples, sources et limites. Les types et fonctions pures (`CartographicLayer`, `MapLayerState`, `createMapRaster`, `resolveMapLayers`, `OrbitalBody`, `createSolarSystemBodies`, etc.) sont exportés par le paquet. Aucune nouvelle dépendance : les cartes interactives utilisent les pairs `leaflet` et `react-leaflet` déjà prévus ; les scènes SVG ne sollicitent aucun service cartographique.

## Installation
```bash
npm install @blueprint-modular/core tailwindcss
```

## CSS obligatoire
Dans `globals.css` :
```css
@import '@blueprint-modular/core/dist/style.css';
```

## Tailwind obligatoire
Dans `tailwind.config.js` — ajouter dans `content` :
```js
'./node_modules/@blueprint-modular/core/dist/**/*.{js,mjs}'
```

## Variables CSS (optionnel — personnalisation)
```css
:root {
  --bpm-accent: #2563eb;
  --bpm-background: #ffffff;
  --bpm-surface: #f8fafc;
  --bpm-border: #e2e8f0;
  --bpm-text-primary: #0f172a;
  --bpm-text-secondary: #64748b;
}
```

## Next.js — éviter l'erreur SSR
Si erreur "document is not defined" :
```js
import dynamic from 'next/dynamic'
const MyComponent = dynamic(() => import('./MyComponent'), { ssr: false })
```

## API des composants principaux

### Page
```ts
bpm.page({ children: ReactNode })
```

### Tabs
```ts
bpm.tabs({ tabs: [{ label: string, content: ReactNode }], defaultTab?: number })
```

### Table
```ts
bpm.table({
  columns: [{ key: string, label: string, type?: string, sortable?: boolean }],
  data: Record<string, unknown>[],
  searchable?: boolean,
  pagination?: boolean,
  onRowClick?: (row) => void
})
```

### Metric
```ts
bpm.metric({ label: string, value: string|number, delta?: number, unit?: string })
```

### Spinner
```ts
bpm.spinner({ text?: string, size?: "small"|"medium"|"large" })
```
Toujours appeler avec un objet (au minimum `bpm.spinner({})`).

### Modal
```ts
bpm.modal({ title: string, isOpen: boolean, onClose: () => void, children: ReactNode })
```

### PlotlyChart
```ts
bpm.plotlyChart({ data: Plotly.Data[], layout?: Partial<Plotly.Layout> })
```

## Artefacts et fichiers HTML autonomes

Pour une synthèse statique, la commande du paquet construit un document HTML à partir de blocs JSON validés. Elle rend les composants React en HTML et SVG lors de la création. Le fichier livré s’ouvre sans JavaScript, serveur ou CDN.

```sh
bpm-artifact --example > spec.json
bpm-artifact --schema
bpm-artifact spec.json > dashboard.html
```

Le site distribue aussi la commande autonome dans `/artifacts/bpm-artifact.cjs` pour une exécution avec Node 18+ sans installation npm. Les instructions pour un projet Claude ou ChatGPT se trouvent dans `/artifacts/instructions.md`. Le profil couvre les indicateurs, badges, paragraphes, tendances et comparaisons. Le champ `context` active le jugement de la métrique ou de la série à partir d’une référence et du sens d’amélioration fournis.

Pour un HTML React sur mesure, importer `{ bpm }` depuis `@blueprint-modular/core/artifact`. Cette entrée expose metric, metricRow, badge, barChart et lineChart avec React. Le badge reçoit son libellé dans `children`. Pour une interaction Plotly, importer `{ plotlyChart }` depuis `@blueprint-modular/core/artifact/plotly`, installer les pairs `react-plotly.js` et `plotly.js` puis embarquer le code dans le fichier. Certaines traces géographiques ou images distantes ont leurs propres besoins réseau. Les liens utilisent des ancres par défaut. Un hôte React peut fournir son routeur via `NavigationLinkProvider`. L’entrée `/maps` expose gps et mapView, avec les pairs Leaflet.

Une question de suivi peut relire le contexte de la page avec `bpm-artifact --inspect dashboard.html`. Le résultat contient la spécification et les observations recalculées à partir des données et des références fournies.

Le build fournit également `dist/standalone/bpm.min.js` (IIFE, React inclus, styles injectés et limités à la vue). `BlueprintModular.mount(element, spec)` monte la même vue que la commande. `view.update(spec)` et `view.refresh(load)` acceptent respectivement une valeur locale et un chargeur asynchrone. Le chargeur peut appeler une API, vérifier le statut HTTP et adapter le résultat avec `applyResponseMapping` de `/connectors`. `view.unmount()` libère la racine. La documentation et un exemple se trouvent dans `/artifacts/instructions.md`.

Les exports nommés `Metric`, `Badge`, `LineChart`, `BarChart` et `MetricRow` de `/artifact` permettent au bundler de ne retenir que les composants utilisés.
