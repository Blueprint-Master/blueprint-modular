/** Serializable cartography grammar. GeoJSON positions are [x, y] = [longitude, latitude]. */
export type MapPosition = [number, number] | [number, number, number];
export type MapGeometry =
  | { type: "Point"; coordinates: MapPosition }
  | { type: "MultiPoint" | "LineString"; coordinates: MapPosition[] }
  | { type: "MultiLineString" | "Polygon"; coordinates: MapPosition[][] }
  | { type: "MultiPolygon"; coordinates: MapPosition[][][] }
  | { type: "GeometryCollection"; geometries: MapGeometry[] };
export interface MapFeature {
  type: "Feature";
  id?: string | number;
  properties: Record<string, unknown> | null;
  geometry: MapGeometry | null;
}
export type MapFeatureData = MapGeometry | MapFeature | { type: "FeatureCollection"; features: MapFeature[] };
/** [southWest, northEast], each [y, x]; a single extent must not cross the antimeridian. */
export type MapBounds = [[number, number], [number, number]];
export type MapProjection = "mercator" | "geographic" | "simple";
export interface MapSource {
  /** Plain text, always displayed for visible layers. No HTML. */
  attribution: string;
  url?: string;
  license?: string;
  /** Data observation/edition date, supplied by the application. */
  date?: string;
}
export interface MapColorStop { value: number; color: string }
export interface MapFilter {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "exists";
  value?: string | number | boolean | null | (string | number | boolean | null)[];
}
export interface MapFeatureStyle {
  color?: string;
  weight?: number;
  opacity?: number;
  fillColor?: string;
  fillOpacity?: number;
  dashArray?: string;
  radius?: number;
  symbol?: "circle" | "square" | "triangle" | "diamond" | "aircraft" | "cross";
  /** Clockwise degrees from north, for oriented symbols. */
  heading?: number;
}
/** Shared geometry for map markers and legend symbols. */
export const MAP_SYMBOL_PATHS = {
  square: "M-7 -7H7V7H-7Z", triangle: "M0 -9L8 7H-8Z", diamond: "M0 -10L7 0L0 10L-7 0Z",
  cross: "M-3 -9H3V-3H9V3H3V9H-3V3H-9V-3H-3Z",
  aircraft: "M0 -11L2 -8L3 -2L10 4V6L3 3L2 8L5 10V11L0 9L-5 11V10L-2 8L-3 3L-10 6V4L-3 -2L-2 -8Z",
  circle: "M0 -7A7 7 0 1 1 0 7A7 7 0 1 1 0 -7Z",
};
export interface MapStyleRule {
  label?: string;
  /** All conditions must match. Later matching rules override earlier ones. */
  when: MapFilter[];
  style: MapFeatureStyle;
}
export interface MapLayerGroup {
  id: string;
  label: string;
  parentId?: string;
  visible?: boolean;
  /** Turning on one direct child layer turns off its siblings (e.g. basemaps). */
  exclusive?: boolean;
}
export interface MapLayerBase {
  id: string;
  label: string;
  groupId?: string;
  description?: string;
  visible?: boolean;
  opacity?: number;
  blendMode?: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "difference";
  source?: MapSource;
  minZoom?: number;
  maxZoom?: number;
  /** Numeric application-defined time, inclusive bounds. No implicit current time. */
  fromTime?: number;
  toTime?: number;
  interactive?: boolean;
}
export interface MapVectorLayer extends MapLayerBase {
  kind: "geojson";
  data: MapFeatureData;
  style?: MapFeatureStyle;
  rules?: MapStyleRule[];
  filter?: MapFilter[];
  colorBy?: { field: string; stops: MapColorStop[]; target?: "fill" | "stroke"; missingColor?: string; unit?: string };
  sizeBy?: { field: string; min: number; max: number; minRadius?: number; maxRadius?: number };
  labelField?: string;
  headingField?: string;
  /** Pane ordering includes labels. Put labels in a separate layer to keep them on top. */
  labels?: "hover" | "always" | "none";
}
export interface MapTileLayer extends MapLayerBase {
  kind: "tile";
  url: string;
  /** The provider grid must match the map CRS. XYZ by default; TMS flips y. */
  tms?: boolean;
  subdomains?: string;
  maxNativeZoom?: number;
  tileSize?: number;
  bounds?: MapBounds;
}
export interface MapWmsLayer extends MapLayerBase {
  kind: "wms";
  url: string;
  layers: string;
  format?: string;
  version?: string;
  transparent?: boolean;
  /** Additional service parameters, e.g. styles, time, elevation or cql_filter. */
  parameters?: Record<string, string | number | boolean>;
}
export interface MapImageLayer extends MapLayerBase {
  kind: "image";
  url: string;
  bounds: MapBounds;
}
export interface MapRasterLayer extends MapLayerBase {
  kind: "raster";
  bounds: MapBounds;
  columns: number;
  rows: number;
  /** Row-major scalar grid, north/top first. null/NaN/noData cells are transparent. Maximum 16384 cells. */
  values: (number | null)[];
  noData?: number;
  stops: MapColorStop[];
  unit?: string;
  /** Requires height and cellSize in the same units. Central-difference terrain shading. */
  hillshade?: { cellSize: number; azimuth?: number; elevation?: number; exaggeration?: number; strength?: number };
}
export interface MapCustomLayer extends MapLayerBase {
  kind: "custom";
  /** Application-specific payload consumed by renderLayer; never evaluated as code. */
  data?: unknown;
}
export type CartographicLayer = MapVectorLayer | MapTileLayer | MapWmsLayer | MapImageLayer | MapRasterLayer | MapCustomLayer;
export interface MapLayerState {
  /** Bottom to top. Unlisted/new IDs retain declaration order above the listed layers. */
  order?: string[];
  visible?: Record<string, boolean>;
  opacity?: Record<string, number>;
  groups?: Record<string, boolean>;
}
export interface MapFeatureSelection { layerId: string; featureId: string; feature: MapFeature }
export interface CartographicTheme {
  background: string;
  vector: MapFeatureStyle;
}
/** Presentation recipes only: a palette does not supply imagery, historical data or operational symbology. */
export const CARTOGRAPHIC_THEMES = {
  modern: { background: "#e9eef0", vector: { color: "#526d7b", fillColor: "#c5d8c5", fillOpacity: 0.55, weight: 1.5 } },
  dark: { background: "#111f2a", vector: { color: "#8db3c9", fillColor: "#274355", fillOpacity: 0.65, weight: 1.5 } },
  terrain: { background: "#e5e6d3", vector: { color: "#6e724e", fillColor: "#a4ba83", fillOpacity: 0.4, weight: 1.5 } },
  bathymetric: { background: "#061c36", vector: { color: "#76c9d0", fillColor: "#146381", fillOpacity: 0.4, weight: 1 } },
  nautical: { background: "#d7edf2", vector: { color: "#366d8b", fillColor: "#f0e7bd", fillOpacity: 0.75, weight: 1.5 } },
  hydrographic: { background: "#eef1e9", vector: { color: "#157aa1", fillColor: "#95d1e0", fillOpacity: 0.5, weight: 3 } },
  historical: { background: "#efe3c5", vector: { color: "#705e3c", fillColor: "#cabb8f", fillOpacity: 0.45, weight: 1.5, dashArray: "4 2" } },
  tactical: { background: "#e2e3d7", vector: { color: "#475847", fillColor: "#a0b190", fillOpacity: 0.3, weight: 2 } },
  agricultural: { background: "#f0eddc", vector: { color: "#617d3b", fillColor: "#a9bf70", fillOpacity: 0.6, weight: 1.5 } },
  aerial: { background: "#172624", vector: { color: "#f6da76", fillColor: "#b8da9a", fillOpacity: 0.15, weight: 2 } },
} satisfies Record<string, CartographicTheme>;

const number = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export const mapOpacity = (v: unknown, fallback = 1) => number(v) ? Math.max(0, Math.min(1, v)) : fallback;
const own = (obj: unknown, key: string): unknown => record(obj) && Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
export function validMapBounds(bounds: unknown, projection: MapProjection = "mercator"): bounds is MapBounds {
  if (!Array.isArray(bounds) || bounds.length !== 2 || !bounds.every(p => Array.isArray(p) && p.length === 2 && p.every(number))) return false;
  const [[south, west], [north, east]] = bounds;
  const limit = projection === "mercator" ? 85.0511287798 : 90;
  return south < north && west < east && (projection === "simple" || (south >= -limit && north <= limit && west >= -180 && east <= 180));
}
function validPosition(value: unknown, projection: MapProjection): value is MapPosition {
  return Array.isArray(value) && value.length >= 2 && value.length <= 3 && value.every(number) &&
    (projection === "simple" || (Math.abs(value[0]) <= 180 && Math.abs(value[1]) <= 90));
}
function validGeometry(value: unknown, projection: MapProjection, depth = 0): value is MapGeometry {
  if (!record(value) || depth > 16) return false;
  const position = (p: unknown) => validPosition(p, projection);
  const line = (p: unknown) => Array.isArray(p) && p.length >= 2 && p.every(position);
  const ring = (p: unknown) => line(p) && Array.isArray(p) && p.length >= 4 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1];
  const polygon = (p: unknown) => Array.isArray(p) && p.length > 0 && p.every(ring);
  switch (value.type) {
    case "Point": return position(value.coordinates);
    case "MultiPoint": return Array.isArray(value.coordinates) && value.coordinates.length > 0 && value.coordinates.every(position);
    case "LineString": return line(value.coordinates);
    case "MultiLineString": return Array.isArray(value.coordinates) && value.coordinates.length > 0 && value.coordinates.every(line);
    case "Polygon": return polygon(value.coordinates);
    case "MultiPolygon": return Array.isArray(value.coordinates) && value.coordinates.length > 0 && value.coordinates.every(polygon);
    case "GeometryCollection": return Array.isArray(value.geometries) && value.geometries.length > 0 && value.geometries.every(g => validGeometry(g, projection, depth + 1));
    default: return false;
  }
}
/** Invalid geometries and duplicate IDs are reported; no coordinate swapping or invented repairs. */
export function normalizeMapFeatures(data: unknown, projection: MapProjection = "mercator") {
  const input: unknown[] = record(data) && data.type === "FeatureCollection" ? (Array.isArray(data.features) ? data.features : [null]) : [data];
  const features: { id: string; feature: MapFeature }[] = [], ids = new Set<string>();
  let invalid = 0;
  for (const [index, item] of input.entries()) {
    const feature = record(item) && item.type === "Feature" ? item : { type: "Feature", properties: {}, geometry: item };
    const id = typeof feature.id === "string" || number(feature.id) ? String(feature.id) : `@${index}`;
    if (!validGeometry(feature.geometry, projection) || (feature.properties !== null && !record(feature.properties)) || ids.has(id)) { invalid++; continue; }
    ids.add(id); features.push({ id, feature: feature as unknown as MapFeature });
  }
  return { features, invalid };
}
export function matchesMapFilters(properties: MapFeature["properties"], filters: MapFilter[] = []): boolean {
  if (!Array.isArray(filters)) return false;
  return filters.every(filter => {
    if (!filter || typeof filter.field !== "string") return false;
    const v = own(properties, filter.field), target = filter.value;
    switch (filter.operator) {
      case "exists": return target === false ? v === undefined || v === null : v !== undefined && v !== null;
      case "eq": return v === target;
      case "neq": return v !== undefined && v !== target;
      case "in": return Array.isArray(target) && target.some(item => item === v);
      case "gt": return number(v) && number(target) && v > target;
      case "gte": return number(v) && number(target) && v >= target;
      case "lt": return number(v) && number(target) && v < target;
      case "lte": return number(v) && number(target) && v <= target;
      default: return false;
    }
  });
}
function hex(color: string) {
  if (typeof color !== "string" || !/^#([a-f\d]{3}|[a-f\d]{6})$/i.test(color)) return null;
  const value = color.length === 4 ? color.slice(1).split("").map(c => c + c).join("") : color.slice(1);
  return [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16));
}
export function normalizeMapStops(stops: MapColorStop[]): MapColorStop[] {
  if (!Array.isArray(stops)) return [];
  const unique = new Map<number, MapColorStop>();
  for (const stop of stops) if (stop && number(stop.value) && hex(stop.color)) unique.set(stop.value, stop);
  return Array.from(unique.values()).sort((a, b) => a.value - b.value);
}
function interpolate(stops: MapColorStop[], value: number): string | undefined {
  if (!stops.length || !number(value)) return undefined;
  if (value <= stops[0].value) return stops[0].color;
  for (let i = 1; i < stops.length; i++) {
    if (value > stops[i].value) continue;
    const a = stops[i - 1], b = stops[i], t = (value - a.value) / (b.value - a.value);
    const x = hex(a.color)!, y = hex(b.color)!;
    return "#" + x.map((channel, index) => Math.round(channel + (y[index] - channel) * t).toString(16).padStart(2, "0")).join("");
  }
  return stops[stops.length - 1].color;
}
export function mapColorAt(stops: MapColorStop[], value: number): string | undefined { return interpolate(normalizeMapStops(stops), value); }
export function resolveMapStyle(layer: MapVectorLayer, feature: MapFeature, theme: CartographicTheme = CARTOGRAPHIC_THEMES.modern): MapFeatureStyle {
  const style: MapFeatureStyle = { radius: 6, opacity: 1, ...theme.vector, ...layer.style };
  for (const rule of Array.isArray(layer.rules) ? layer.rules : []) if (rule && matchesMapFilters(feature.properties, rule.when)) Object.assign(style, rule.style);
  if (layer.colorBy) {
    const value = own(feature.properties, layer.colorBy.field);
    const color = number(value) ? mapColorAt(layer.colorBy.stops, value) : layer.colorBy.missingColor;
    if (color) style[layer.colorBy.target === "stroke" ? "color" : "fillColor"] = color;
  }
  if (layer.sizeBy) {
    const { field, min, max, minRadius = 3, maxRadius = 18 } = layer.sizeBy, value = own(feature.properties, field);
    if (number(value) && number(min) && number(max) && max > min) style.radius = minRadius + mapOpacity((value - min) / (max - min)) * (maxRadius - minRadius);
  }
  const heading = layer.headingField ? own(feature.properties, layer.headingField) : style.heading;
  if (number(heading)) style.heading = ((heading % 360) + 360) % 360;
  style.radius = Math.max(1, Math.min(100, number(style.radius) ? style.radius : 6));
  style.weight = Math.max(0, Math.min(30, number(style.weight) ? style.weight : 1.5));
  style.opacity = mapOpacity(style.opacity); style.fillOpacity = mapOpacity(style.fillOpacity, 0.5);
  return style;
}
export function mapFeatureLabel(layer: MapVectorLayer, feature: MapFeature, id: string): string {
  const label = layer.labelField ? own(feature.properties, layer.labelField) : undefined;
  return typeof label === "string" || number(label) ? String(label) : id;
}
export interface ResolvedMapLayer {
  layer: CartographicLayer;
  visible: boolean;
  opacity: number;
  reason?: string;
  ancestors: string[];
}
/** Resolves one flat drawing order plus an arbitrarily nested group hierarchy. Groups never reorder their layers. */
export function resolveMapLayers(layers: CartographicLayer[] = [], groups: MapLayerGroup[] = [], state: MapLayerState = {}, zoom?: number, time?: number) {
  const diagnostics: string[] = [], groupMap = new Map<string, MapLayerGroup>(), layerMap = new Map<string, CartographicLayer>();
  for (const group of Array.isArray(groups) ? groups : []) {
    if (!group || !group.id || !group.label || groupMap.has(group.id)) { diagnostics.push("Groupe invalide ou identifiant dupliqué."); continue; }
    groupMap.set(group.id, group);
  }
  for (const layer of Array.isArray(layers) ? layers : []) {
    if (!layer || typeof layer.id !== "string" || !layer.id || typeof layer.label !== "string" || layerMap.has(layer.id) || !["geojson", "tile", "wms", "image", "raster", "custom"].includes(layer.kind)) {
      diagnostics.push("Calque invalide ou identifiant dupliqué."); continue;
    }
    layerMap.set(layer.id, layer);
  }
  const ids = [...new Set([...(Array.isArray(state.order) ? state.order.filter(id => layerMap.has(id)) : []), ...layerMap.keys()])];
  const resolved: ResolvedMapLayer[] = ids.map(id => {
    const layer = layerMap.get(id)!, ancestors: string[] = [], visited = new Set<string>();
    let groupId = layer.groupId, enabled = (own(state.visible, id) ?? layer.visible) !== false, reason: string | undefined;
    while (groupId) {
      const group = groupMap.get(groupId);
      if (!group || visited.has(groupId)) { reason = "Groupe absent ou cyclique"; break; }
      visited.add(groupId); ancestors.push(groupId);
      if ((own(state.groups, groupId) ?? group.visible) === false) enabled = false;
      groupId = group.parentId;
    }
    if (reason) diagnostics.push(`${layer.label} : ${reason}.`);
    if (number(zoom) && ((number(layer.minZoom) && zoom < layer.minZoom) || (number(layer.maxZoom) && zoom > layer.maxZoom))) reason = "Hors plage de zoom";
    if (number(time) && ((number(layer.fromTime) && time < layer.fromTime) || (number(layer.toTime) && time > layer.toTime))) reason = "Hors période";
    return { layer, ancestors, visible: enabled && !reason, opacity: mapOpacity(own(state.opacity, id) ?? layer.opacity), reason };
  });
  // Exclusive groups are deterministic even if an initial configuration enables multiple alternatives.
  const activeExclusive = new Set<string>();
  for (const entry of [...resolved].reverse()) if (entry.visible && entry.layer.groupId && groupMap.get(entry.layer.groupId)?.exclusive) {
    if (activeExclusive.has(entry.layer.groupId)) entry.visible = false;
    else activeExclusive.add(entry.layer.groupId);
  }
  return { layers: resolved, groups: [...groupMap.values()], diagnostics };
}
export function setMapLayerVisibility(layers: CartographicLayer[], groups: MapLayerGroup[], state: MapLayerState, id: string, visible: boolean): MapLayerState {
  const next = { ...state, visible: { ...state.visible, [id]: visible } };
  const layer = layers.find(item => item.id === id), group = groups.find(item => item.id === layer?.groupId);
  if (visible && group?.exclusive) for (const sibling of layers) if (sibling.groupId === group.id && sibling.id !== id) next.visible[sibling.id] = false;
  return next;
}
function rasterIssue(layer: MapRasterLayer, projection: MapProjection) {
  if (!validMapBounds(layer.bounds, projection)) return "Emprise raster invalide pour la projection.";
  if (!Number.isInteger(layer.columns) || !Number.isInteger(layer.rows) || layer.columns < 1 || layer.rows < 1 || layer.columns * layer.rows > 16384) return "Grille attendue : 1 à 16384 cellules.";
  if (!Array.isArray(layer.values) || layer.values.length !== layer.columns * layer.rows) return "La taille de la grille ne correspond pas aux valeurs.";
  if (normalizeMapStops(layer.stops).length < 2) return "La palette attend au moins deux seuils distincts et des couleurs hexadécimales.";
  if (layer.hillshade && (!number(layer.hillshade.cellSize) || layer.hillshade.cellSize <= 0)) return "L’ombrage nécessite une taille de cellule positive dans l’unité des hauteurs.";
  return undefined;
}
/** Validate requests before starting a tile/image load. Relative URLs and https are accepted; executable URLs are not. */
export function safeMapUrl(url: unknown, image = false): url is string {
  return typeof url === "string" && (/^https?:\/\/[^\s<>]+$/i.test(url) || /^\/(?!\/)[^\s<>]*$/.test(url) || (image && /^data:image\/(png|jpeg|webp);base64,[a-z\d+/=]+$/i.test(url)));
}
export function mapLayerIssue(layer: CartographicLayer, projection: MapProjection = "mercator"): string | undefined {
  if (number(layer.minZoom) && number(layer.maxZoom) && layer.minZoom > layer.maxZoom) return "Plage de zoom inversée.";
  if (number(layer.fromTime) && number(layer.toTime) && layer.fromTime > layer.toTime) return "Période inversée.";
  if (layer.kind === "raster") return rasterIssue(layer, projection);
  if (layer.kind === "image" || layer.kind === "tile" || layer.kind === "wms") {
    if (!safeMapUrl(layer.url, layer.kind === "image")) return "URL de source invalide.";
    if (!layer.source || typeof layer.source.attribution !== "string" || !layer.source.attribution.trim()) return "Une attribution de source est requise.";
    if (layer.kind === "wms" && (typeof layer.layers !== "string" || !layer.layers.trim())) return "Le nom de couche WMS est requis.";
    if ((layer.kind === "image" || layer.kind === "tile") && (layer.kind === "image" || layer.bounds) && !validMapBounds(layer.bounds, projection)) return "Emprise invalide pour la projection.";
  }
  return undefined;
}
/** Scalar grid -> one deterministic SVG image. Rows are warped for Mercator so cells stay on their geographic bounds. */
export function createMapRaster(layer: MapRasterLayer, projection: MapProjection = "mercator"): { url?: string; error?: string } {
  const error = rasterIssue(layer, projection); if (error) return { error };
  const stops = normalizeMapStops(layer.stops), { columns, rows, values, bounds } = layer;
  const good = (v: unknown): v is number => number(v) && v !== layer.noData;
  const [[south], [north]] = bounds;
  const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
  const rowY = (row: number) => projection === "mercator" ? rows * (mercator(north) - mercator(north - row / rows * (north - south))) / (mercator(north) - mercator(south)) : row;
  const paths: string[] = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    const value = values[row * columns + col]; if (!good(value)) continue;
    let color = interpolate(stops, value)!;
    if (layer.hillshade) {
      const { cellSize, azimuth = 315, elevation = 45, exaggeration = 1, strength = 0.55 } = layer.hillshade;
      const at = (x: number, y: number) => { const v = values[Math.max(0, Math.min(rows - 1, y)) * columns + Math.max(0, Math.min(columns - 1, x))]; return good(v) ? v : value; };
      const dx = (at(col + 1, row) - at(col - 1, row)) / (2 * cellSize) * (number(exaggeration) ? exaggeration : 1);
      const dy = (at(col, row - 1) - at(col, row + 1)) / (2 * cellSize) * (number(exaggeration) ? exaggeration : 1);
      const az = (number(azimuth) ? azimuth : 315) * Math.PI / 180, el = Math.max(0, Math.min(90, number(elevation) ? elevation : 45)) * Math.PI / 180;
      const light = Math.max(0, (-dx * Math.sin(az) * Math.cos(el) - dy * Math.cos(az) * Math.cos(el) + Math.sin(el)) / Math.sqrt(1 + dx * dx + dy * dy));
      const factor = 1 - mapOpacity(strength) * (1 - light);
      color = "#" + hex(color)!.map(c => Math.round(c * factor).toString(16).padStart(2, "0")).join("");
    }
    const y = rowY(row), h = rowY(row + 1) - y;
    paths.push(`<path fill="${color}" d="M${col} ${y.toFixed(5)}h1v${h.toFixed(5)}h-1z"/>`);
  }
  return { url: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${columns} ${rows}" preserveAspectRatio="none" shape-rendering="crispEdges">${paths.join("")}</svg>`) };
}
