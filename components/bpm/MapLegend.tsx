"use client";
import React from "react";
import { CARTOGRAPHIC_THEMES, MAP_SYMBOL_PATHS, normalizeMapStops, resolveMapLayers, type CartographicLayer, type CartographicTheme, type MapColorStop, type MapFeatureStyle, type MapLayerGroup, type MapLayerState, type MapFeatureData } from "./cartography";

export interface MapLegendItem { id: string; label: string; color: string; shape?: "area" | "line" | "point" }
export interface MapLegendProps {
  layers?: CartographicLayer[];
  groups?: MapLayerGroup[];
  state?: MapLayerState;
  zoom?: number;
  time?: number;
  theme?: keyof typeof CARTOGRAPHIC_THEMES | CartographicTheme;
  items?: MapLegendItem[];
  title?: string;
  className?: string;
}
function geometryShape(data: MapFeatureData, depth = 0): "point" | "line" | "area" {
  if (!data || typeof data.type !== "string" || depth > 16) return "area";
  if (data.type === "FeatureCollection") return geometryShape(data.features?.[0], depth + 1);
  if (data.type === "Feature") return data.geometry ? geometryShape(data.geometry, depth + 1) : "area";
  if (data.type === "GeometryCollection") return geometryShape(data.geometries?.[0], depth + 1);
  return data.type?.includes("Point") ? "point" : data.type?.includes("Line") ? "line" : "area";
}
function Swatch({ style, label, shape = "area" }: { style: MapFeatureStyle; label: string; shape?: "point" | "line" | "area" }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <svg aria-hidden="true" width="28" height="24" viewBox="-14 -12 28 24">
      <path d={shape === "point" ? MAP_SYMBOL_PATHS[style.symbol ?? "circle"] ?? MAP_SYMBOL_PATHS.circle : shape === "line" ? "M-12 0H12" : "M-12 -7H12V7H-12Z"}
        fill={shape === "line" ? "none" : style.fillColor ?? style.color ?? "#718096"} fillOpacity={style.fillOpacity ?? 0.6}
        stroke={style.color ?? "#526d7b"} strokeWidth={Math.min(4, style.weight ?? 1.5)} strokeDasharray={style.dashArray} />
    </svg>{label}
  </span>;
}
function Ramp({ stops, unit = "", label }: { stops: MapColorStop[]; unit?: string; label: string }) {
  const sorted = normalizeMapStops(stops); if (!sorted.length) return null;
  const first = sorted[0].value, last = sorted[sorted.length - 1].value;
  const colors = sorted.map(stop => `${stop.color} ${last === first ? 0 : (stop.value - first) / (last - first) * 100}%`).join(", ");
  return <div style={{ display: "grid", gap: 5, maxWidth: 300 }}>
    <span>{label}{unit && ` (${unit})`}</span>
    <div role="img" aria-label={sorted.map(stop => `${stop.value} ${unit} : ${stop.color}`).join(" ; ")}
      style={{ height: 12, borderRadius: 4, background: `linear-gradient(to right, ${colors})` }} />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span>{first}</span><span>{last}</span></div>
  </div>;
}
/**
 * @component bpm.mapLegend
 * @description Légende issue des mêmes règles et palettes que les calques visibles ; seuils numériques, unités et symboles libres additionnels.
 * @param {object} props - layers, groups, state, zoom et time partagés avec la carte ; items ajoute une légende libre.
 * @example bpm.mapLegend({ items: [{ id: "river", label: "Fleuve", color: "#167fa6", shape: "line" }, { id: "parcel", label: "Parcelle", color: "#8ea45e" }] })
 * @associated bpm.cartographicMap, bpm.mapLayerControl
 */
export function MapLegend({ layers = [], groups = [], state = {}, zoom, time, theme = "modern", items = [], title = "Légende", className }: MapLegendProps) {
  const palette = typeof theme === "string" ? CARTOGRAPHIC_THEMES[theme] ?? CARTOGRAPHIC_THEMES.modern : theme ?? CARTOGRAPHIC_THEMES.modern;
  const visible = resolveMapLayers(layers, groups, state, zoom, time).layers.filter(entry => entry.visible && entry.opacity > 0);
  return <section aria-label={title} className={className} style={{ minWidth: 0, display: "grid", gap: 12, fontSize: 13, color: "var(--bpm-text-primary, #1e293b)" }}>
    <strong>{title}</strong>
    {visible.map(({ layer }) => <div key={layer.id} style={{ display: "grid", gap: 6 }}>
      {layer.kind === "raster" ? <Ramp stops={layer.stops} unit={layer.unit} label={layer.label} /> : layer.kind === "geojson" ? <>
        <Swatch shape={geometryShape(layer.data)} style={{ ...palette.vector, ...layer.style }} label={layer.label} />
        {(Array.isArray(layer.rules) ? layer.rules : []).filter(rule => !!rule?.label).map((rule, index) => <Swatch key={index} shape={geometryShape(layer.data)} style={{ ...palette.vector, ...layer.style, ...rule.style }} label={rule.label!} />)}
        {layer.colorBy && <Ramp stops={layer.colorBy.stops} unit={layer.colorBy.unit} label={layer.colorBy.field} />}
        {layer.sizeBy && <span>{layer.sizeBy.field} : {layer.sizeBy.min} – {layer.sizeBy.max} (taille des symboles)</span>}
      </> : <span>{layer.label}</span>}
    </div>)}
    {(Array.isArray(items) ? items : []).filter(item => item && typeof item.label === "string").map(item => <span key={item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span aria-hidden="true" style={{ display: "inline-block", width: item.shape === "point" ? 12 : 26, height: item.shape === "line" ? 3 : 12, borderRadius: item.shape === "point" ? "50%" : 2, background: item.color }} />{item.label}
    </span>)}
    {!visible.length && (!Array.isArray(items) || !items.length) && <span>Aucun calque visible.</span>}
  </section>;
}
