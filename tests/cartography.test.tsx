import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CartographicMap } from "../components/bpm/CartographicMap";
import { MapLegend } from "../components/bpm/MapLegend";
import { MapLayerControl } from "../components/bpm/MapLayerControl";
import { CARTOGRAPHIC_THEMES, createMapRaster, mapColorAt, mapLayerIssue, matchesMapFilters, normalizeMapFeatures,
  resolveMapLayers, resolveMapStyle, safeMapUrl, setMapLayerVisibility, validMapBounds,
  type CartographicLayer, type MapFeature, type MapRasterLayer, type MapVectorLayer } from "../components/bpm/cartography";
import { createDemoMapLayers, DEMO_MAP_GROUPS } from "../components/showcase/cartography-scenes";
import registry from "../lib/generated/mcp-registry.json";

const parcel: MapFeature = { type: "Feature", id: "A", properties: { crop: "wheat", ndvi: 0.5, name: "Parcelle A" }, geometry: { type: "Polygon", coordinates: [
  [[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]], [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
] } };
const vector: MapVectorLayer = { id: "parcels", label: "Parcelles", kind: "geojson", data: parcel, labelField: "name" };
const raster: MapRasterLayer = { id: "depth", label: "Profondeur", kind: "raster", bounds: [[0, 0], [60, 40]], columns: 2, rows: 2,
  values: [-100, null, 0, -50], stops: [{ value: -100, color: "#000000" }, { value: 0, color: "#ffffff" }], unit: "m" };

describe("Cartographic grammar", () => {
  it("preserves GeoJSON holes, multi-geometries, coordinate order and source identity", () => {
    const result = normalizeMapFeatures({ type: "FeatureCollection", features: [parcel, { ...parcel, id: "multi", geometry: {
      type: "GeometryCollection", geometries: [{ type: "MultiPoint", coordinates: [[2, 48], [3, 49]] }, { type: "MultiLineString", coordinates: [[[2, 48], [3, 49]]] }],
    } }] });
    expect(result.invalid).toBe(0); expect(result.features).toHaveLength(2);
    expect(result.features[0].feature).toBe(parcel);
    expect(result.features[0].feature.geometry).toEqual(parcel.geometry);
  });
  it("rejects malformed or unclosed geometry and duplicate IDs without repairing data", () => {
    const data = { type: "FeatureCollection", features: [parcel, parcel, null, { ...parcel, id: "open", geometry: { type: "Polygon", coordinates: [[[0, 0], [3, 0], [3, 3], [0, 3]]] } }] };
    expect(normalizeMapFeatures(data).invalid).toBe(3);
    expect(normalizeMapFeatures({ type: "Point", coordinates: [200, 300] }).invalid).toBe(1);
    expect(normalizeMapFeatures({ type: "Point", coordinates: [200, 300] }, "simple").invalid).toBe(0);
    expect(validMapBounds([[60, 10], [40, 20]])).toBe(false);
    expect(validMapBounds([[-90, -180], [90, 180]], "mercator")).toBe(false);
    expect(validMapBounds([[-90, -180], [90, 180]], "geographic")).toBe(true);
  });
  it("applies typed filters, ordered rules, continuous colors and symbol sizes without coercion", () => {
    const layer: MapVectorLayer = { ...vector, rules: [
      { when: [{ field: "crop", operator: "eq", value: "wheat" }], style: { weight: 2, color: "#123456" } },
      { when: [{ field: "ndvi", operator: "gte", value: 0.5 }], style: { weight: 4 } },
    ], colorBy: { field: "ndvi", stops: [{ value: 0, color: "#000" }, { value: 1, color: "#fff" }] }, sizeBy: { field: "ndvi", min: 0, max: 1, minRadius: 2, maxRadius: 10 } };
    expect(resolveMapStyle(layer, parcel)).toMatchObject({ weight: 4, color: "#123456", fillColor: "#808080", radius: 6 });
    expect(matchesMapFilters({ x: "2" }, [{ field: "x", operator: "gte", value: 1 }])).toBe(false);
    expect(matchesMapFilters({ x: "2" }, [{ field: "x", operator: "in", value: [1, "2"] }])).toBe(true);
    expect(matchesMapFilters({}, [{ field: "constructor", operator: "exists" }])).toBe(false);
    expect(mapColorAt([{ value: 10, color: "#fff" }, { value: 0, color: "#000" }], 2)).toBe("#333333");
  });
  it("resolves nested groups, global order, opacity, zoom and time together", () => {
    const layers: CartographicLayer[] = [{ ...vector, id: "a", groupId: "child" }, { ...vector, id: "b", opacity: 5, minZoom: 10, fromTime: 1950, toTime: 2000 }, { ...vector, id: "c" }];
    const groups = [{ id: "root", label: "Territoire" }, { id: "child", label: "Cadastre", parentId: "root" }];
    const result = resolveMapLayers(layers, groups, { order: ["c", "a"], groups: { root: false }, opacity: { c: -2 } }, 12, 1980);
    expect(result.layers.map(entry => entry.layer.id)).toEqual(["c", "a", "b"]);
    expect(result.layers.map(entry => entry.visible)).toEqual([true, false, true]);
    expect(result.layers.map(entry => entry.opacity)).toEqual([0, 1, 1]);
    expect(resolveMapLayers(layers, groups, {}, 8, 1980).layers[1].reason).toBe("Hors plage de zoom");
    expect(resolveMapLayers(layers, groups, {}, 12, 2026).layers[1].reason).toBe("Hors période");
    expect(resolveMapLayers(layers, groups, {}, 12).layers[1].visible).toBe(true);
  });
  it("reports cycles and absent groups, isolates valid siblings and chooses one exclusive background", () => {
    const layers: CartographicLayer[] = [{ ...vector, id: "cycle", groupId: "a" }, { ...vector, id: "orphan", groupId: "missing" },
      { ...vector, id: "one", groupId: "base" }, { ...vector, id: "two", groupId: "base" }];
    const groups = [{ id: "a", label: "A", parentId: "b" }, { id: "b", label: "B", parentId: "a" }, { id: "base", label: "Fonds", exclusive: true }];
    const result = resolveMapLayers(layers, groups);
    expect(result.diagnostics).toHaveLength(2); expect(result.layers.map(entry => entry.visible)).toEqual([false, false, false, true]);
    const state = setMapLayerVisibility(layers, groups, {}, "one", true);
    expect(resolveMapLayers(layers, groups, state).layers.map(entry => entry.visible)).toEqual([false, false, true, false]);
  });
});
describe("Scalar raster and source contracts", () => {
  it("renders a deterministic image, transparent missing cells and colors matching the legend", () => {
    expect(createMapRaster(raster)).toEqual(createMapRaster(raster));
    const svg = decodeURIComponent(createMapRaster(raster).url!.split(",")[1]);
    expect(svg.match(/<path/g)).toHaveLength(3); expect(svg).toContain('fill="#808080"'); expect(svg).not.toMatch(/NaN|Infinity/);
    const legend = renderToStaticMarkup(<MapLegend layers={[raster]} />);
    expect(legend).toContain("Profondeur"); expect(legend).toContain("-100"); expect(legend).toContain("(m)");
  });
  it("warps scalar latitude rows for Mercator while preserving local/geographic grids", () => {
    const mercator = decodeURIComponent(createMapRaster(raster, "mercator").url!);
    const geographic = decodeURIComponent(createMapRaster(raster, "geographic").url!);
    expect(geographic).toContain("v1.00000"); expect(mercator).not.toContain("v1.00000");
    expect(createMapRaster({ ...raster, values: [null, NaN, -999, null], noData: -999 }).url).not.toContain("path");
  });
  it("rejects incompatible grids and unsafe palette markup; hillshade needs explicit units", () => {
    expect(createMapRaster({ ...raster, values: [] }).error).toBeTruthy();
    expect(createMapRaster({ ...raster, rows: 100000 }).error).toBeTruthy();
    expect(createMapRaster({ ...raster, stops: [{ value: 0, color: '"><script>' }] }).error).toBeTruthy();
    expect(createMapRaster({ ...raster, hillshade: { cellSize: 0 } }).error).toBeTruthy();
    const flat = { ...raster, values: [0, 0, 0, 0], hillshade: { cellSize: 10, elevation: 90 } };
    expect(decodeURIComponent(createMapRaster(flat).url!)).toContain('fill="#ffffff"');
  });
  it("requires attribution for imagery, refuses executable sources, and does not fabricate a basemap", () => {
    expect(mapLayerIssue({ id: "tile", label: "Tuiles", kind: "tile", url: "https://example.test/{z}/{x}/{y}.png" })).toContain("attribution");
    expect(safeMapUrl("javascript:alert(1)")).toBe(false); expect(safeMapUrl("//unknown.test/image.png")).toBe(false);
    expect(safeMapUrl("/examples/cartographic-plan.svg", true)).toBe(true);
    const html = renderToStaticMarkup(<CartographicMap />);
    expect(html).toContain("Aucun calque fourni"); expect(html).not.toContain("openstreetmap.org");
  });
});
describe("Generated-code and composition boundaries", () => {
  it("keeps malformed collection inputs SSR safe", () => {
    for (const value of [undefined, null, "bad", 42, [null]]) for (const element of [
      <CartographicMap layers={value as never} />, <MapLayerControl layers={value as never} />, <MapLegend layers={value as never} />,
    ]) expect(() => renderToStaticMarkup(element)).not.toThrow();
    expect(renderToStaticMarkup(<CartographicMap layers={[{ ...vector, data: { type: 42 } as never }]} />)).toContain("sans géométrie valide");
  });
  it("supports all ten domain compositions with the same six layer kinds and reports no fabricated data", () => {
    for (const theme of Object.keys(CARTOGRAPHIC_THEMES) as (keyof typeof CARTOGRAPHIC_THEMES)[]) {
      const layers = createDemoMapLayers(theme), result = resolveMapLayers(layers, DEMO_MAP_GROUPS);
      expect(result.diagnostics, theme).toEqual([]);
      for (const layer of layers) { expect(mapLayerIssue(layer, "simple"), `${theme}/${layer.id}`).toBeUndefined();
        if (layer.kind === "geojson") expect(normalizeMapFeatures(layer.data, "simple").invalid).toBe(0); }
    }
  });
  it("exposes every primitive to the component catalogue and preserves free overlays in SSR", () => {
    for (const key of ["cartographicMap", "mapLayerControl", "mapLegend"]) {
      const entry = registry.components.find(c => c.name === `bpm.${key}`);
      expect(entry?.example).toContain(`bpm.${key}`); expect(entry?.semantics?.status).toBe("proposed");
    }
    const html = renderToStaticMarkup(<CartographicMap layers={[vector]} selected={{ layerId: "parcels", featureId: "A" }}
      renderOverlay={() => <span>Repère libre</span>} renderFeatureDetails={({ feature }) => <p>{String(feature.properties?.name)}</p>} />);
    expect(html).toContain("Repère libre"); expect(html).toContain("Parcelle A");
  });
});
