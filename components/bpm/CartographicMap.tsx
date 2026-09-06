"use client";
import React from "react";
import { MapView, type MapRenderContext } from "./MapView";
import { MapLayerControl } from "./MapLayerControl";
import { MapLegend } from "./MapLegend";
import { SceneFrame, sceneControl } from "./scene-ui";
import {
  CARTOGRAPHIC_THEMES, MAP_SYMBOL_PATHS, createMapRaster, mapFeatureLabel, mapLayerIssue, matchesMapFilters,
  normalizeMapFeatures, resolveMapLayers, resolveMapStyle, safeMapUrl, validMapBounds,
  type CartographicLayer, type CartographicTheme, type MapBounds, type MapFeature,
  type MapFeatureSelection, type MapFeatureStyle, type MapLayerGroup, type MapLayerState,
  type MapProjection, type MapVectorLayer, type ResolvedMapLayer,
} from "./cartography";

export interface CartographicMapProps {
  layers?: CartographicLayer[];
  groups?: MapLayerGroup[];
  /** [latitude, longitude], or [y, x] in a simple local coordinate system. */
  center?: [number, number];
  zoom?: number;
  bounds?: MapBounds;
  projection?: MapProjection;
  /** Advanced CRS provided by the application. Remount when changing it; source grids must match it. */
  crs?: import("leaflet").CRS;
  height?: number | string;
  title?: string;
  description?: React.ReactNode;
  theme?: keyof typeof CARTOGRAPHIC_THEMES | CartographicTheme;
  state?: MapLayerState;
  onStateChange?: (state: MapLayerState) => void;
  /** Application-defined numeric time used to filter layer validity. */
  time?: number;
  selected?: { layerId: string; featureId: string } | null;
  onFeatureSelect?: (selection: MapFeatureSelection | null) => void;
  onViewChange?: (view: { center: [number, number]; zoom: number; bounds: MapBounds }) => void;
  onMapClick?: (position: [number, number]) => void;
  showLayerControl?: boolean;
  showLegend?: boolean;
  showScale?: boolean;
  /** False initially preserves page scrolling; the map toolbar explicitly enables navigation. */
  defaultInteractive?: boolean;
  /** Runs inside the Leaflet context, in the layer's pane. Custom adapters retain order, blend and opacity. */
  renderLayer?: (layer: CartographicLayer, context: MapRenderContext & { pane: string; projection: MapProjection }) => React.ReactNode;
  renderFeatureDetails?: (selection: MapFeatureSelection) => React.ReactNode;
  /** Free HTML overlay anchored to the map viewport. */
  renderOverlay?: () => React.ReactNode;
  className?: string;
}
interface PreparedLayer extends ResolvedMapLayer {
  features: { id: string; feature: MapFeature }[];
  issue?: string;
  invalid: number;
}
type SourceStatus = (id: string, url: string, failed: boolean) => void;
function ExternalLayer({ layer, context, onStatus }: { layer: Extract<CartographicLayer, { kind: "tile" | "wms" | "image" }>; context: MapRenderContext; onStatus: SourceStatus }) {
  const { rl } = context;
  const events = React.useMemo(() => ({
    tileerror: () => onStatus(layer.id, layer.url, true), error: () => onStatus(layer.id, layer.url, true),
    loading: () => onStatus(layer.id, layer.url, false), ...(layer.kind === "image" ? { load: () => onStatus(layer.id, layer.url, false) } : {}),
  }), [layer.id, layer.url, layer.kind, onStatus]);
  if (layer.kind === "image") return <rl.ImageOverlay url={layer.url} bounds={layer.bounds} interactive={false} eventHandlers={events} />;
  if (layer.kind === "tile") return <rl.TileLayer key={JSON.stringify([layer.url, layer.tms, layer.subdomains, layer.tileSize, layer.maxNativeZoom, layer.minZoom, layer.maxZoom, layer.bounds])}
    url={layer.url} tms={layer.tms} subdomains={layer.subdomains ?? "abc"} tileSize={layer.tileSize ?? 256} eventHandlers={events}
    maxNativeZoom={layer.maxNativeZoom} minZoom={layer.minZoom ?? 0} maxZoom={layer.maxZoom ?? 22} bounds={layer.bounds} />;
  // WMS vendor parameters are query data, separated from React props.
  const reserved = new Set(["url", "pane", "crs", "srs", "bbox", "width", "height", "request", "service", "layers", "format", "transparent", "version", "tileSize", "minZoom", "maxZoom", "opacity", "attribution", "detectRetina", "zoomOffset", "tms", "noWrap", "bounds", "subdomains"]);
  const params = Object.fromEntries(Object.entries(layer.parameters ?? {}).filter(([key, value]) => !reserved.has(key) && /^[a-zA-Z_][a-zA-Z\d_]*$/.test(key) && ["string", "number", "boolean"].includes(typeof value)));
  const query = { ...params, layers: layer.layers, format: layer.format ?? "image/png", version: layer.version ?? "1.3.0", transparent: layer.transparent !== false };
  // Leaflet setParams merges old keys: remount so removing a time/filter really removes it from requests.
  return <rl.WMSTileLayer key={JSON.stringify([layer.url, query])} url={layer.url} layers={layer.layers} eventHandlers={events} params={query} />;
}
const paint = (color: unknown, fallback: string) => typeof color === "string" && /^(#[\da-f]{3,8}|[a-z]+|(?:rgb|hsl)a?\([\d.,%\s-]+\))$/i.test(color) ? color : fallback;
function symbolMarkup(style: MapFeatureStyle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-13 -13 26 26" width="100%" height="100%"><path d="${MAP_SYMBOL_PATHS[style.symbol ?? "circle"] ?? MAP_SYMBOL_PATHS.circle}" transform="rotate(${style.heading ?? 0})" fill="${paint(style.fillColor ?? style.color, "#527d96")}" fill-opacity="${style.fillOpacity}" stroke="${paint(style.color, "#24465a")}" stroke-width="${style.weight}" opacity="${style.opacity}"/></svg>`;
}
function VectorLayer({ entry, context, pane, theme, selected, onSelect }: {
  entry: PreparedLayer; context: MapRenderContext; pane: string; theme: CartographicTheme;
  selected?: CartographicMapProps["selected"]; onSelect: (selection: MapFeatureSelection) => void;
}) {
  const { rl, L } = context;
  const map = rl.useMap(), layer = entry.layer as MapVectorLayer;
  React.useEffect(() => {
    const ids = new Map(entry.features.map(item => [item.feature, item.id]));
    const selectedStyle = (feature: MapFeature) => {
      const style = resolveMapStyle(layer, feature, theme);
      return selected?.layerId === layer.id && selected.featureId === ids.get(feature) ? { ...style, weight: Math.min(30, (style.weight ?? 1) + 2) } : style;
    };
    const group = L.geoJSON({ type: "FeatureCollection", features: entry.features.map(item => item.feature) } as GeoJSON.FeatureCollection, {
      pane, interactive: layer.interactive !== false, bubblingMouseEvents: false,
      style: feature => selectedStyle(feature as MapFeature),
      pointToLayer: (feature, position) => {
        const style = selectedStyle(feature as MapFeature);
        if (!style.symbol || style.symbol === "circle") return L.circleMarker(position, { ...style, pane, interactive: layer.interactive !== false, bubblingMouseEvents: false });
        const size = Math.max(20, (style.radius ?? 6) * 2);
        return L.marker(position, { pane, interactive: layer.interactive !== false, keyboard: layer.interactive !== false, bubblingMouseEvents: false,
          icon: L.divIcon({ className: "bpm-cartographic-symbol", html: symbolMarkup(style), iconSize: [size, size], iconAnchor: [size / 2, size / 2] }),
          title: mapFeatureLabel(layer, feature as MapFeature, ids.get(feature as MapFeature) ?? "") });
      },
      onEachFeature: (feature, item) => {
        const typed = feature as MapFeature, id = ids.get(typed) ?? String(feature.id ?? "");
        if (layer.interactive !== false) item.on("click", () => onSelect({ layerId: layer.id, featureId: id, feature: typed }));
        if (layer.labelField && layer.labels !== "none") {
          const label = document.createElement("span"); label.textContent = mapFeatureLabel(layer, typed, id);
          item.bindTooltip(label, { permanent: layer.labels === "always", direction: "auto", pane });
        }
      },
    }).addTo(map);
    return () => { group.remove(); };
  }, [L, map, entry.features, layer, pane, theme, selected, onSelect]);
  return null;
}
function RasterLayer({ layer, context, projection }: { layer: Extract<CartographicLayer, { kind: "raster" }>; context: MapRenderContext; projection: MapProjection }) {
  const raster = React.useMemo(() => createMapRaster(layer, projection), [layer, projection]);
  return raster.url ? <context.rl.ImageOverlay url={raster.url} bounds={layer.bounds} interactive={false} /> : null;
}
/** React Leaflet's Pane style is initial-only; synchronize the live drawing stack explicitly. */
function PanePresentation({ context, pane, index, opacity, blendMode, interactive }: {
  context: MapRenderContext; pane: string; index: number; opacity: number;
  blendMode: CartographicLayer["blendMode"]; interactive?: boolean;
}) {
  const map = context.rl.useMap();
  React.useEffect(() => {
    const element = map.getPane(pane); if (!element) return;
    element.style.zIndex = String(index); element.style.opacity = String(opacity);
    element.style.mixBlendMode = blendMode ?? "normal"; element.style.pointerEvents = interactive === false ? "none" : "";
  }, [map, pane, index, opacity, blendMode, interactive]);
  return null;
}
function MapBehavior({ context, center, zoom, bounds, interactive, theme, showScale, projection, onViewChange }: {
  context: MapRenderContext; center: [number, number]; zoom: number; bounds?: MapBounds; interactive: boolean;
  theme: CartographicTheme; showScale: boolean; projection: MapProjection; onViewChange: NonNullable<CartographicMapProps["onViewChange"]>;
}) {
  const { rl } = context, map = rl.useMap();
  const report = React.useCallback(() => {
    const c = map.getCenter(), b = map.getBounds();
    onViewChange({ center: [c.lat, c.lng], zoom: map.getZoom(), bounds: [[b.getSouth(), b.getWest()], [b.getNorth(), b.getEast()]] });
  }, [map, onViewChange]);
  rl.useMapEvents({ moveend: report, zoomend: report });
  const south = bounds?.[0][0], west = bounds?.[0][1], north = bounds?.[1][0], east = bounds?.[1][1];
  React.useEffect(() => {
    if (south !== undefined && west !== undefined && north !== undefined && east !== undefined) map.fitBounds([[south, west], [north, east]], { animate: false, padding: [20, 20], maxZoom: 20 });
    else map.setView(center, zoom, { animate: false });
    report();
  // Tuple values intentionally prevent re-centering on an unrelated parent render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center[0], center[1], zoom, south, west, north, east]);
  React.useEffect(() => {
    const handlers = [map.dragging, map.touchZoom, map.scrollWheelZoom, map.doubleClickZoom, map.boxZoom, map.keyboard];
    handlers.forEach(handler => interactive ? handler.enable() : handler.disable());
    const container = map.getContainer(), previous = container.style.touchAction, background = container.style.background;
    container.style.touchAction = interactive ? "none" : "pan-y"; container.style.background = theme.background;
    return () => { container.style.touchAction = previous; container.style.background = background; };
  }, [map, interactive, theme.background]);
  React.useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false })); observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return showScale && projection !== "simple" ? <rl.ScaleControl imperial={false} /> : null;
}
function LayerStack({ entries, context, theme, projection, selected, onSelect, renderLayer, onSourceStatus }: {
  entries: PreparedLayer[]; context: MapRenderContext; theme: CartographicTheme; projection: MapProjection;
  selected?: CartographicMapProps["selected"]; onSelect: (selection: MapFeatureSelection) => void; renderLayer?: CartographicMapProps["renderLayer"];
  onSourceStatus: SourceStatus;
}) {
  const prefix = React.useId().replace(/[^a-zA-Z0-9_-]/g, ""), { rl } = context;
  return <rl.Pane name={`bpm-${prefix}`} style={{ zIndex: 350, isolation: "isolate" }}>
    {entries.map((entry, index) => {
      if (!entry.visible || entry.issue || entry.opacity === 0) return null;
      const layer = entry.layer, pane = `bpm-${prefix}-${encodeURIComponent(layer.id)}`;
      let node: React.ReactNode;
      if (renderLayer) node = renderLayer(layer, { ...context, pane, projection });
      if (node === undefined) switch (layer.kind) {
        case "geojson": node = <VectorLayer entry={entry} context={context} pane={pane} theme={theme} selected={selected} onSelect={onSelect} />; break;
        case "tile": case "wms": case "image": node = <ExternalLayer layer={layer} context={context} onStatus={onSourceStatus} />; break;
        case "raster": node = <RasterLayer layer={layer} context={context} projection={projection} />; break;
        case "custom": node = null;
      }
      return <rl.Pane key={layer.id} name={pane}>
        <PanePresentation context={context} pane={pane} index={index} opacity={entry.opacity} blendMode={layer.blendMode} interactive={layer.interactive} />
        {node}
      </rl.Pane>;
    })}
  </rl.Pane>;
}
/**
 * @component bpm.cartographicMap
 * @description Carte composable à pile de calques GeoJSON, XYZ/TMS, WMS, images et grilles scalaires. Groupes imbriqués, parcelles et géométries à trous, palettes, filtres, dates, zoom, sélection et adaptateurs libres. Aucun fond ou jeu de données implicite.
 * @param {object} props - layers se dessine du bas vers le haut. GeoJSON utilise [longitude, latitude] ; center et bounds utilisent [latitude, longitude].
 * @example bpm.cartographicMap({ title: "Cadastre et hydrographie", center: [48.85, 2.35], zoom: 13, layers: [{ id: "parcels", label: "Parcelles", kind: "geojson", data: { type: "FeatureCollection", features: [{ type: "Feature", id: "A01", properties: { name: "Parcelle A01" }, geometry: { type: "Polygon", coordinates: [[[2.34,48.85],[2.35,48.85],[2.35,48.86],[2.34,48.86],[2.34,48.85]]] } }] }, labelField: "name" }] })
 * @associated bpm.mapLayerControl, bpm.mapLegend, bpm.mapView, bpm.flightMap, bpm.celestialScene
 */
export function CartographicMap({ layers = [], groups = [], center = [20, 0], zoom = 2, bounds, projection = "mercator", crs,
  height = 480, title = "Atlas", description, theme = "modern", state, onStateChange, time, selected, onFeatureSelect, onViewChange, onMapClick,
  showLayerControl = true, showLegend = true, showScale = true, defaultInteractive = false, renderLayer, renderFeatureDetails, renderOverlay, className }: CartographicMapProps) {
  const [localState, setLocalState] = React.useState<MapLayerState>({}), [localSelected, setLocalSelected] = React.useState<MapFeatureSelection | null>(null);
  const [interactive, setInteractive] = React.useState(defaultInteractive), [viewZoom, setViewZoom] = React.useState(zoom);
  const [query, setQuery] = React.useState("");
  const [sourceFailures, setSourceFailures] = React.useState<Record<string, { url: string; failed: boolean }>>({});
  const onSourceStatus = React.useCallback<SourceStatus>((id, url, failed) => setSourceFailures(previous =>
    previous[id]?.url === url && previous[id]?.failed === failed ? previous : { ...previous, [id]: { url, failed } }), []);
  const selectId = React.useId(), searchId = React.useId();
  const currentState = state ?? localState, selectedKey = selected === undefined ? localSelected : selected;
  const palette = typeof theme === "string" ? CARTOGRAPHIC_THEMES[theme] ?? CARTOGRAPHIC_THEMES.modern : theme ?? CARTOGRAPHIC_THEMES.modern;
  const resolved = React.useMemo(() => resolveMapLayers(layers, groups, currentState, viewZoom, time), [layers, groups, currentState, viewZoom, time]);
  const entries = React.useMemo<PreparedLayer[]>(() => resolved.layers.map(entry => {
    const layer = entry.layer, normalized = layer.kind === "geojson" ? normalizeMapFeatures(layer.data, projection) : { features: [], invalid: 0 };
    return { ...entry, issue: mapLayerIssue(layer, projection) ?? (layer.kind === "custom" && !renderLayer ? "Un adaptateur renderLayer est requis." : undefined),
      invalid: normalized.invalid, features: normalized.features.filter(item => layer.kind !== "geojson" || matchesMapFilters(item.feature.properties, layer.filter)) };
  }), [resolved, projection, renderLayer]);
  const available = React.useMemo(() => entries.flatMap(entry => entry.visible && !entry.issue && entry.opacity > 0 && entry.layer.interactive !== false ? entry.features.map(item => ({ layerId: entry.layer.id, featureId: item.id, feature: item.feature,
    label: `${entry.layer.label} · ${mapFeatureLabel(entry.layer as MapVectorLayer, item.feature, item.id)}` })) : []), [entries]);
  const selection = available.find(item => item.layerId === selectedKey?.layerId && item.featureId === selectedKey.featureId);
  const choose = React.useCallback((value: MapFeatureSelection | null) => { if (selected === undefined) setLocalSelected(value); onFeatureSelect?.(value); }, [selected, onFeatureSelect]);
  const reportView = React.useCallback<NonNullable<CartographicMapProps["onViewChange"]>>(view => { setViewZoom(view.zoom); onViewChange?.(view); }, [onViewChange]);
  const updateState = (next: MapLayerState) => { if (state === undefined) setLocalState(next); onStateChange?.(next); };
  const safeCenter: [number, number] = Array.isArray(center) && center.length === 2 && center.every(v => typeof v === "number" && Number.isFinite(v)) ? center : [20, 0];
  const safeZoom = Number.isFinite(zoom) ? zoom : 2, safeBounds = validMapBounds(bounds, projection) ? bounds : undefined;
  const sources = entries.filter(entry => entry.visible && !entry.issue && entry.opacity > 0 && entry.layer.source).map(entry => ({ id: entry.layer.id, source: entry.layer.source! }));
  const issues = [...resolved.diagnostics, ...entries.flatMap(entry => [entry.issue ? `${entry.layer.label} : ${entry.issue}` : "", entry.invalid ? `${entry.layer.label} : ${entry.invalid} objet(s) sans géométrie valide ou avec identifiant dupliqué.` : "",
    entry.visible && "url" in entry.layer && sourceFailures[entry.layer.id]?.url === entry.layer.url && sourceFailures[entry.layer.id]?.failed ? `${entry.layer.label} : image ou tuile indisponible auprès de la source.` : ""]).filter(Boolean), ...(bounds && !safeBounds ? ["Emprise de cadrage invalide ; utilisation du centre."] : [])];
  const filtered = available.filter(item => item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const legendLayers = entries.filter(entry => !entry.issue).map(entry => entry.layer);
  return <SceneFrame title={title} subtitle={description} className={className} controls={<button type="button" style={sceneControl} aria-pressed={interactive} onClick={() => setInteractive(value => !value)}>
    {interactive ? "Navigation activée" : "Déplacer la carte"}</button>} footer={<>
    {showLayerControl || showLegend ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 24 }}>
      {showLayerControl && <MapLayerControl layers={layers} groups={groups} state={currentState} onChange={updateState} zoom={viewZoom} time={time} />}
      {showLegend && <MapLegend layers={legendLayers} groups={groups} state={currentState} zoom={viewZoom} time={time} theme={palette} />}
    </div> : null}
    {available.length > 0 && <div style={{ display: "grid", gap: 8 }}>
      <label htmlFor={searchId}>Rechercher un objet ({available.length})</label><input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} style={sceneControl} />
      <label htmlFor={selectId}>Explorer les objets visibles</label><select id={selectId} style={sceneControl}
        value={selection && filtered.includes(selection) ? JSON.stringify([selection.layerId, selection.featureId]) : ""}
        onChange={event => choose(available.find(item => JSON.stringify([item.layerId, item.featureId]) === event.target.value) ?? null)}>
        <option value="">{filtered.length ? "Choisir un objet" : "Aucun résultat"}</option>{filtered.map(item => <option key={JSON.stringify([item.layerId, item.featureId])} value={JSON.stringify([item.layerId, item.featureId])}>{item.label}</option>)}
      </select>
    </div>}
    {selection && <div role="status">{renderFeatureDetails ? renderFeatureDetails(selection) : <>
      <strong>{selection.label}</strong><dl style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 8 }}>
        {Object.entries(selection.feature.properties ?? {}).filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value)).map(([key, value]) => <React.Fragment key={key}><dt>{key}</dt><dd style={{ margin: 0 }}>{value === null ? "—" : String(value)}</dd></React.Fragment>)}
      </dl></>}</div>}
    {!entries.length && <div>Aucun calque fourni. Ajoutez des données ou une source cartographique.</div>}
    {sources.length > 0 && <div aria-label="Sources cartographiques" style={{ fontSize: 11, display: "grid", gap: 4 }}>{sources.map(({ id, source }) => <span key={id}>
      {safeMapUrl(source.url) ? <a href={source.url} target="_blank" rel="noreferrer">{source.attribution}</a> : source.attribution}{source.date && ` · ${source.date}`}{source.license && ` · ${source.license}`}
    </span>)}</div>}
    {issues.length > 0 && <div role="status">{issues.map((issue, index) => <div key={index}>{issue}</div>)}</div>}
  </>}>
    <div style={{ position: "relative", isolation: "isolate" }}>
      <MapView center={safeCenter} zoom={safeZoom} height={height} baseLayer={false} projection={projection} crs={crs} onMapClick={onMapClick}
        renderLayers={context => <>
          <MapBehavior context={context} center={safeCenter} zoom={safeZoom} bounds={safeBounds} interactive={interactive} theme={palette} showScale={showScale && !crs} projection={projection} onViewChange={reportView} />
          <LayerStack context={context} entries={entries} theme={palette} projection={projection} selected={selection} onSelect={choose} renderLayer={renderLayer} onSourceStatus={onSourceStatus} />
        </>} />
      {renderOverlay && <div style={{ position: "absolute", inset: 0, zIndex: 1000, pointerEvents: "none" }}>{renderOverlay()}</div>}
    </div>
  </SceneFrame>;
}
