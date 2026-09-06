"use client";
import React from "react";
import { CartographicMap, MapLayerControl, MapLegend, CARTOGRAPHIC_THEMES } from "@/components/bpm";
import type { CartographicLayer, MapLayerGroup, MapLayerState, MapFeature, MapPosition } from "@/components/bpm";
import type { ShowcaseEntry } from "./registry";

const feature = (id: string, geometry: MapFeature["geometry"], properties: Record<string, unknown> = {}): MapFeature => ({ type: "Feature", id, geometry, properties });
const polygon = (id: string, points: MapPosition[], properties?: Record<string, unknown>) => feature(id, { type: "Polygon", coordinates: [[...points, points[0]]] }, properties);
const rectangle = (id: string, x: number, y: number, w: number, h: number, properties?: Record<string, unknown>) => polygon(id, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], properties);
const collection = (features: MapFeature[]) => ({ type: "FeatureCollection" as const, features });
const source = { attribution: "Atelier Modular · territoire et valeurs synthétiques" };

export const DEMO_MAP_GROUPS: MapLayerGroup[] = [
  { id: "physical", label: "Milieu physique" },
  { id: "land", label: "Occupation du territoire" },
  { id: "cadastre", label: "Cadastre et agriculture", parentId: "land" },
  { id: "urban", label: "Ville et réseaux", parentId: "land" },
  { id: "uses", label: "Mobilité et zones" },
  { id: "labels", label: "Repères et annotations" },
];
export const MAP_THEME_LABELS: Record<keyof typeof CARTOGRAPHIC_THEMES, string> = {
  modern: "Ville moderne", dark: "Atlas nocturne", terrain: "Relief", bathymetric: "Fonds marins", nautical: "Carte maritime",
  hydrographic: "Fleuves et bassins", historical: "Plan ancien", tactical: "Zones et positions", agricultural: "Parcelles agricoles", aerial: "Routes aériennes",
};
/** All views use the same layer grammar and a synthetic, local-coordinate territory. */
export function createDemoMapLayers(theme: keyof typeof CARTOGRAPHIC_THEMES = "modern"): CartographicLayer[] {
  const marine = theme === "bathymetric" || theme === "nautical";
  const rural = theme === "agricultural", terrain = theme === "terrain";
  const layers: CartographicLayer[] = [];
  if (theme === "historical") layers.push({ id: "archive", label: "Plan gravé illustratif", kind: "image", url: "/examples/cartographic-plan.svg", bounds: [[0, 0], [100, 100]],
    source: { attribution: "Modular · plan original d’une ville imaginaire", date: "Création contemporaine de style ancien" }, groupId: "physical" });
  layers.push({ id: "relief", label: marine ? "Profondeur" : rural ? "Indice de végétation" : "Altitude", kind: "raster", groupId: "physical",
    columns: 32, rows: 32, bounds: [[0, 0], [100, 100]], source, visible: terrain || marine || rural, opacity: rural ? 0.85 : 0.9,
    values: Array.from({ length: 1024 }, (_, i) => { const x = i % 32, y = Math.floor(i / 32), value = Math.sin(x / 8) * Math.cos(y / 12) + Math.cos((x + y) / 9);
      return marine ? -1200 + value * 500 : rural ? Math.max(0, Math.min(1, 0.5 + value / 4)) : 600 + value * 260; }),
    stops: marine ? [{ value: -2200, color: "#09223f" }, { value: -900, color: "#166c8c" }, { value: 0, color: "#8edac9" }] : rural ?
      [{ value: 0, color: "#e3d3a0" }, { value: 0.5, color: "#9ebd67" }, { value: 1, color: "#215f40" }] :
      [{ value: 0, color: "#51785b" }, { value: 500, color: "#bdc58e" }, { value: 1200, color: "#f3ebcf" }], unit: rural ? "indice" : "m",
    ...(terrain ? { hillshade: { cellSize: 30, exaggeration: 1.6, strength: 0.6 } } : {}) });
  layers.push({ id: "water", label: "Fleuve et littoral", kind: "geojson", groupId: "physical", source,
    data: collection([
      polygon("coast", [[0, 0], [100, 0], [100, 18], [80, 14], [64, 19], [50, 15], [32, 21], [15, 18], [0, 25]], { name: "Estuaire" }),
      polygon("river", [[32, 21], [39, 34], [37, 48], [47, 61], [52, 78], [48, 100], [53, 100], [57, 79], [52, 60], [43, 47], [44, 33], [39, 19]], { name: "Fleuve imaginaire" }),
    ]), labelField: "name", style: { color: marine ? "#8ac8d0" : "#4b94ac", fillColor: marine ? "#2a7490" : "#8dc8d5", fillOpacity: marine ? 0.2 : 0.85, weight: 1 } });
  layers.push({ id: "parcels", label: "Parcelles cadastrales", kind: "geojson", groupId: "cadastre", source, visible: !marine && theme !== "aerial",
    data: collection(Array.from({ length: 18 }, (_, i) => rectangle(`P-${i + 1}`, 59 + i % 3 * 11, 29 + Math.floor(i / 3) * 11, 10, 10,
      { name: `Parcelle P-${i + 1}`, culture: i % 3 === 0 ? "Blé" : i % 3 === 1 ? "Prairie" : "Verger", surface_ha: 1.2 + i / 10, ndvi: 0.3 + i % 6 / 10 }))),
    labelField: "name", style: { color: rural ? "#354b2b" : "#947e4c", fillColor: "#b8c17c", fillOpacity: rural ? 0.2 : 0.35, weight: 1 },
    rules: rural ? [
      { label: "Blé", when: [{ field: "culture", operator: "eq", value: "Blé" }], style: { fillColor: "#e5cb76", fillOpacity: 0.6 } },
      { label: "Verger", when: [{ field: "culture", operator: "eq", value: "Verger" }], style: { fillColor: "#4d7d50", fillOpacity: 0.6 } },
    ] : [] });
  layers.push({ id: "buildings", label: "Bâtiments et cours intérieures", kind: "geojson", groupId: "urban", source, visible: !marine && !rural && theme !== "aerial",
    data: collection([
      feature("courtyard", { type: "Polygon", coordinates: [[[9, 54], [29, 54], [29, 72], [9, 72], [9, 54]], [[14, 59], [14, 67], [24, 67], [24, 59], [14, 59]]] }, { name: "Îlot à cour ouverte", usage: "Public" }),
      ...Array.from({ length: 12 }, (_, i) => rectangle(`B-${i + 1}`, 8 + i % 4 * 7, 30 + Math.floor(i / 4) * 7, 5, 5, { name: `Bâtiment ${i + 1}`, hauteur_m: 6 + i })),
    ]), labelField: "name", style: { color: "#615747", fillColor: "#b6ac92", fillOpacity: 0.85 } });
  layers.push({ id: "utilities", label: "Réseau souterrain", kind: "geojson", groupId: "urban", visible: false, source,
    data: collection([feature("pipe", { type: "MultiLineString", coordinates: [[[4, 28], [36, 28], [36, 77]], [[5, 52], [38, 52], [55, 55], [95, 55]]] }, { name: "Conduite illustrative", niveau: -2 })]),
    labelField: "name", style: { color: "#996ba6", weight: 3, dashArray: "5 4" } });
  layers.push({ id: "routes", label: theme === "aerial" ? "Route aérienne" : marine ? "Route maritime" : "Routes et franchissements", kind: "geojson", groupId: "uses", source,
    data: collection([feature("route", { type: "LineString", coordinates: theme === "aerial" ? [[10, 20], [30, 70], [65, 80], [92, 28]] : marine ? [[4, 8], [28, 12], [53, 8], [88, 10]] : [[4, 25], [30, 25], [50, 52], [96, 52]] }, { name: "Itinéraire indicatif" })]),
    labelField: "name", style: { color: theme === "aerial" || marine ? "#eac57a" : "#966343", weight: 3, dashArray: theme === "aerial" || marine ? "6 5" : undefined } });
  layers.push({ id: "zones", label: theme === "tactical" ? "Secteurs et zones" : theme === "aerial" ? "Volume aérien projeté" : "Périmètre environnemental", kind: "geojson", groupId: "uses", source,
    visible: theme === "tactical" || theme === "aerial" || theme === "hydrographic", interactive: true,
    data: collection([polygon("sector", [[6, 76], [33, 71], [43, 85], [36, 96], [8, 94]], { name: "Secteur Alpha", plancher: 1000, plafond: 4000, unite: "m", validite: "Scénario fictif" })]),
    labelField: "name", style: { color: "#a36a5c", fillColor: "#be8d6e", fillOpacity: 0.18, dashArray: "5 3", weight: 2 } });
  layers.push({ id: "positions", label: marine ? "Bouées et ports" : theme === "aerial" ? "Avions et balises" : "Points d’intérêt", kind: "geojson", groupId: "labels", source,
    data: collection([feature("one", { type: "Point", coordinates: marine ? [25, 10] : [26, 25] }, { name: marine ? "Bouée A" : theme === "aerial" ? "DEMO 104" : "Port", cap: 30 }),
      feature("two", { type: "Point", coordinates: marine ? [65, 12] : [66, 81] }, { name: marine ? "Bouée B" : theme === "aerial" ? "DEMO 208" : "Station", cap: 145 })]),
    style: { symbol: theme === "aerial" ? "aircraft" : theme === "tactical" ? "triangle" : marine ? "diamond" : "circle", color: "#674f2c", fillColor: "#f0d28a", fillOpacity: 1, radius: 10 },
    headingField: "cap", labelField: "name", labels: "always" });
  return layers;
}

function AtlasDemo() {
  const [theme, setTheme] = React.useState<keyof typeof CARTOGRAPHIC_THEMES>("modern");
  const layers = React.useMemo(() => createDemoMapLayers(theme), [theme]);
  return <div style={{ display: "grid", gap: 16 }}>
    <label style={{ display: "grid", gap: 8 }}>Explorer une composition
      <select value={theme} onChange={event => setTheme(event.target.value as typeof theme)} style={{ minHeight: 44, padding: 10, color: "var(--bpm-text-primary)", background: "var(--bpm-surface)", border: "1px solid var(--bpm-border)", borderRadius: 8 }}>
        {Object.entries(MAP_THEME_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
    <CartographicMap key={theme} title={MAP_THEME_LABELS[theme]} description="Territoire imaginaire · données synthétiques · chaque calque reste modifiable"
      projection="simple" center={[50, 50]} zoom={2} bounds={[[0, 0], [100, 100]]} layers={layers} groups={DEMO_MAP_GROUPS} theme={theme} height={520} />
  </div>;
}
function SharedControlsDemo() {
  const layers = React.useMemo(() => createDemoMapLayers("agricultural").filter(layer => ["parcels", "relief", "routes"].includes(layer.id)), []);
  const [state, setState] = React.useState<MapLayerState>({});
  return <div style={{ display: "grid", gap: 20 }}>
    <MapLayerControl layers={layers} groups={DEMO_MAP_GROUPS} state={state} onChange={setState} />
    <MapLegend layers={layers} groups={DEMO_MAP_GROUPS} state={state} theme="agricultural" />
  </div>;
}
export const CARTOGRAPHY_SHOWCASE: ShowcaseEntry[] = [
  { key: "cartographicMap", class: "INTERACTIF", examples: [{ name: "Un atlas, dix compositions", note: "Milieu physique, cadastre, bâtiments, réseaux, mobilités et annotations : la même grammaire de calques.", render: () => <AtlasDemo /> }] },
  { key: "mapLayerControl", class: "INTERACTIF", examples: [{ name: "Une pile et sa légende synchronisées", render: () => <SharedControlsDemo /> }] },
  { key: "mapLegend", class: "DATA", examples: [{ name: "Seuils et classes agricoles", render: () => <MapLegend layers={createDemoMapLayers("agricultural")} groups={DEMO_MAP_GROUPS} theme="agricultural" /> }] },
];
