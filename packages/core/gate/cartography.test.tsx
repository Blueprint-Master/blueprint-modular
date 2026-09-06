import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CartographicMap } from "../../../components/bpm/CartographicMap";
import { MapLayerControl } from "../../../components/bpm/MapLayerControl";
import { MapLegend } from "../../../components/bpm/MapLegend";
import type { CartographicLayer, MapLayerState, MapVectorLayer } from "../../../components/bpm/cartography";
import type { MapRenderContext } from "../../../components/bpm/MapView";

const parcel: MapVectorLayer = { id: "parcels", label: "Parcelles", kind: "geojson", labelField: "name", data: { type: "FeatureCollection", features: [
  { type: "Feature", id: "A", properties: { name: "Parcelle A", crop: "Blé" }, geometry: { type: "Polygon", coordinates: [
    [[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]], [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
  ] } },
] } };
const aircraft: MapVectorLayer = { id: "air", label: "Avions", kind: "geojson", labelField: "name", headingField: "heading", style: { symbol: "aircraft", fillOpacity: 1 }, data: { type: "Feature", id: "flight", properties: { name: "DEMO 42", heading: 90 }, geometry: { type: "Point", coordinates: [3, 3] } } };
const groups = [{ id: "land", label: "Territoire" }, { id: "cadastre", label: "Cadastre", parentId: "land" }];
function Probe({ context, onMap }: { context: MapRenderContext; onMap: (map: import("leaflet").Map) => void }) {
  const map = context.rl.useMap(); React.useEffect(() => onMap(map), [map, onMap]); return null;
}

beforeAll(async () => {
  // jsdom has no SVG feature-detection API or layout. Leaflet itself remains real.
  const L = await import("leaflet"); L.Browser.svg = true;
});
afterEach(cleanup);

describe("Cartography controls", () => {
  it("shares visibility and opacity with a legend and reorders the drawing stack by keyboard-accessible buttons", () => {
    const layers = [parcel, aircraft];
    function Shared() {
      const [state, setState] = React.useState<MapLayerState>({});
      return <><MapLayerControl layers={layers} state={state} onChange={setState} /><MapLegend title="Clé" layers={layers} state={state} /></>;
    }
    render(<Shared />);
    fireEvent.click(screen.getByRole("button", { name: "Monter Parcelles" }));
    expect(screen.getAllByRole("listitem").map(item => item.getAttribute("data-map-layer-id"))).toEqual(["parcels", "air"]);
    fireEvent.change(screen.getByRole("slider", { name: "Opacité de Avions" }), { target: { value: "0" } });
    expect(screen.getByRole("region", { name: "Clé" }).textContent).not.toContain("Avions");
    fireEvent.click(screen.getByRole("checkbox", { name: "Parcelles" }));
    expect(screen.getByRole("region", { name: "Clé" }).textContent).toContain("Aucun calque visible");
  });
  it("hides descendants as a group while retaining individual preferences", () => {
    render(<MapLayerControl layers={[{ ...parcel, groupId: "cadastre" }]} groups={groups} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Territoire", exact: true }));
    expect(screen.getByRole("checkbox", { name: "Parcelles" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Parcelles" })).toBeChecked();
    fireEvent.click(screen.getByRole("checkbox", { name: "Territoire", exact: true }));
    expect(screen.getByRole("checkbox", { name: "Parcelles" })).toBeEnabled();
  });
  it("emits controlled changes without taking ownership", () => {
    const onChange = vi.fn();
    render(<MapLayerControl layers={[parcel]} state={{}} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Parcelles" }));
    expect(onChange).toHaveBeenCalledWith({ visible: { parcels: false } });
    expect(screen.getByRole("checkbox", { name: "Parcelles" })).toBeChecked();
  });
});
describe("Leaflet integration with the real rendering engine", () => {
  it("passes WMS vendor parameters as query data, updates them and reports image source failures", async () => {
    const L = await import("leaflet");
    let map: import("leaflet").Map | undefined;
    const onMap = (value: import("leaflet").Map) => { map = value; };
    const layers: CartographicLayer[] = [
      { id: "wms", label: "Cadastre WMS", kind: "wms", url: "https://example.test/wms", layers: "parcels", parameters: { time: "1980", cql_filter: "crop='wheat'", ref: "query-value", pane: "ignored" }, source: { attribution: "Fournisseur de test" } },
      { id: "image", label: "Archive", kind: "image", url: "/archive.png", bounds: [[0, 0], [4, 4]], source: { attribution: "Archive de test", date: "1980" } },
      { id: "probe", label: "Probe", kind: "custom" },
    ];
    const renderLayer = (layer: CartographicLayer, context: MapRenderContext) => layer.kind === "custom" ? <Probe context={context} onMap={onMap} /> : undefined;
    const { container, rerender } = render(<CartographicMap projection="geographic" center={[2, 2]} zoom={5} layers={layers} renderLayer={renderLayer} />);
    await waitFor(() => expect(map).toBeDefined());
    const wmsLayers: import("leaflet").TileLayer.WMS[] = [];
    map!.eachLayer(layer => { if (layer instanceof L.TileLayer.WMS) wmsLayers.push(layer); });
    expect(wmsLayers).toHaveLength(1);
    expect(wmsLayers[0].wmsParams).toMatchObject({ layers: "parcels", time: "1980", cql_filter: "crop='wheat'", version: "1.3.0", transparent: true });
    expect(wmsLayers[0].options.pane).not.toBe("ignored");
    const updated = layers.map(layer => layer.kind === "wms" ? { ...layer, parameters: { time: "2026" } } : layer);
    rerender(<CartographicMap projection="geographic" center={[2, 2]} zoom={5} layers={updated} renderLayer={renderLayer} />);
    await waitFor(() => {
      const current: import("leaflet").TileLayer.WMS[] = [];
      map!.eachLayer(layer => { if (layer instanceof L.TileLayer.WMS) current.push(layer); });
      expect(current).toHaveLength(1); expect(current[0].wmsParams).toMatchObject({ time: "2026" });
      expect(current[0].wmsParams).not.toHaveProperty("cql_filter");
    });
    fireEvent.error(container.querySelector('img.leaflet-image-layer')!);
    expect(screen.getByRole("status").textContent).toContain("Archive : image ou tuile indisponible");
    expect(screen.getByLabelText("Sources cartographiques").textContent).toContain("1980");
  });
  it("mounts ordered panes, preserves polygon holes, updates opacity and cleans removed layers", async () => {
    const layers: CartographicLayer[] = [parcel, aircraft];
    const { container, rerender, unmount } = render(<CartographicMap projection="simple" center={[2, 2]} zoom={5} layers={layers} />);
    await waitFor(() => expect(container.querySelector(".bpm-cartographic-symbol svg")).not.toBeNull());
    const path = container.querySelector<SVGPathElement>("path.leaflet-interactive")!;
    expect(path.getAttribute("d")?.match(/M/g)).toHaveLength(2); // outer ring + inner courtyard, not filled as a second polygon
    const pane = path.closest<HTMLElement>(".leaflet-pane")!;
    const airPane = container.querySelector(".bpm-cartographic-symbol")!.closest<HTMLElement>(".leaflet-pane")!;
    expect(Number(pane.style.zIndex)).toBeLessThan(Number(airPane.style.zIndex));
    expect(container.querySelector('.bpm-cartographic-symbol path')?.getAttribute("transform")).toBe("rotate(90)");
    rerender(<CartographicMap projection="simple" center={[2, 2]} zoom={5} layers={layers} state={{ order: ["air", "parcels"], opacity: { parcels: 0.3 } }} />);
    await waitFor(() => {
      const next = container.querySelector("path.leaflet-interactive")!.closest<HTMLElement>(".leaflet-pane")!;
      expect(next.style.opacity).toBe("0.3"); expect(Number(next.style.zIndex)).toBe(1);
    });
    rerender(<CartographicMap projection="simple" center={[2, 2]} zoom={5} layers={[parcel]} />);
    await waitFor(() => expect(container.querySelector(".bpm-cartographic-symbol")).toBeNull());
    unmount(); expect(container.querySelector(".leaflet-container")).toBeNull();
  });
  it("supports both map clicks and searchable keyboard selection with original feature properties", async () => {
    const onFeatureSelect = vi.fn();
    const { container } = render(<CartographicMap projection="simple" center={[2, 2]} zoom={5} layers={[parcel, aircraft]} onFeatureSelect={onFeatureSelect} />);
    await waitFor(() => expect(container.querySelector("path.leaflet-interactive")).not.toBeNull());
    fireEvent.click(container.querySelector("path.leaflet-interactive")!);
    expect(onFeatureSelect).toHaveBeenLastCalledWith(expect.objectContaining({ layerId: "parcels", featureId: "A", feature: expect.objectContaining({ properties: { name: "Parcelle A", crop: "Blé" } }) }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "DEMO" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Explorer les objets visibles" }), { target: { value: '["air","flight"]' } });
    expect(onFeatureSelect).toHaveBeenLastCalledWith(expect.objectContaining({ layerId: "air", featureId: "flight" }));
    expect(screen.getByRole("status").textContent).toContain("DEMO 42");
  });
  it("preserves touch page scrolling until navigation is explicitly enabled and hosts custom layers in their panes", async () => {
    const custom: CartographicLayer = { id: "adapter", label: "Adaptateur", kind: "custom", opacity: 0.5, blendMode: "multiply", data: { x: 1 } };
    const renderLayer = vi.fn((layer, { rl }: Parameters<NonNullable<React.ComponentProps<typeof CartographicMap>["renderLayer"]>>[1]) =>
      layer.kind === "custom" ? <rl.CircleMarker center={[1, 1]} radius={8} /> : undefined);
    const { container } = render(<CartographicMap projection="simple" center={[2, 2]} zoom={5} layers={[custom]} renderLayer={renderLayer} />);
    await waitFor(() => expect(container.querySelector("path.leaflet-interactive")).not.toBeNull());
    const map = container.querySelector<HTMLElement>(".leaflet-container")!;
    expect(map.style.touchAction).toBe("pan-y");
    const pane = container.querySelector("path.leaflet-interactive")!.closest<HTMLElement>(".leaflet-pane")!;
    expect(pane.style.opacity).toBe("0.5"); expect(pane.style.mixBlendMode).toBe("multiply");
    fireEvent.click(screen.getByRole("button", { name: "Déplacer la carte" })); expect(map.style.touchAction).toBe("none");
    fireEvent.click(screen.getByRole("button", { name: "Navigation activée" })); expect(map.style.touchAction).toBe("pan-y");
  });
});
