/**
 * bpm.mapView — calques superposables (façon Géoportail).
 *
 * `MapViewLeafletInner` reçoit `react-leaflet` (`rl`) et `leaflet` (`L`) par
 * injection ; on les remplace ici par des stubs qui reflètent leurs props dans
 * le DOM. On vérifie qu'un calque produit UN `LayersControl.Overlay` par entrée,
 * avec le bon layer (WMS / tuiles / marqueurs / polygones), l'état coché issu de
 * `defaultOn`, et une opacité toujours bornée à [0, 1]. Sans calque, aucun
 * contrôle de couches n'est rendu (sortie inchangée).
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import {
  MapViewLeafletInner,
  type MapOverlaySpec,
  type MapViewLeafletInnerProps,
} from "../../../components/bpm/MapViewLeaflet";

/* --- Stubs react-leaflet : chaque composant reflète ses props dans le DOM. --- */
function MapContainer({ children }: { children?: React.ReactNode }) {
  return <div data-mapcontainer>{children}</div>;
}
function TileLayer(props: { url: string; opacity?: number; attribution?: string }) {
  return <div data-tilelayer data-url={props.url} data-opacity={String(props.opacity ?? "")} />;
}
function WMSTileLayer(props: {
  url: string;
  layers?: string;
  format?: string;
  transparent?: boolean;
  opacity?: number;
}) {
  return (
    <div
      data-wms
      data-url={props.url}
      data-layers={props.layers ?? ""}
      data-format={props.format ?? ""}
      data-transparent={String(props.transparent)}
      data-opacity={String(props.opacity ?? "")}
    />
  );
}
function Marker({ children }: { children?: React.ReactNode }) {
  return <div data-marker>{children}</div>;
}
function Popup({ children }: { children?: React.ReactNode }) {
  return <div data-popup>{children}</div>;
}
function Polyline() {
  return <div data-polyline />;
}
function Polygon(props: { pathOptions?: { fillOpacity?: number; color?: string } }) {
  return (
    <div
      data-polygon
      data-fillopacity={String(props.pathOptions?.fillOpacity ?? "")}
      data-color={props.pathOptions?.color ?? ""}
    />
  );
}
function LayerGroup({ children }: { children?: React.ReactNode }) {
  return <div data-layergroup>{children}</div>;
}
function Overlay(props: { name: string; checked?: boolean; children?: React.ReactNode }) {
  return (
    <div data-overlay data-name={props.name} data-checked={String(props.checked)}>
      {props.children}
    </div>
  );
}
function LayersControl({ children }: { children?: React.ReactNode }) {
  return <div data-layerscontrol>{children}</div>;
}
LayersControl.Overlay = Overlay;
LayersControl.BaseLayer = Overlay;

const rlStub = {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  LayerGroup,
  LayersControl,
  useMapEvents: () => null,
} as unknown as MapViewLeafletInnerProps["rl"];

const LStub = {
  divIcon: (opts: unknown) => ({ __icon: opts }),
  latLng: (a: number, b: number) => [a, b],
} as unknown as MapViewLeafletInnerProps["L"];

function renderMap(overlays?: MapOverlaySpec[]) {
  return render(
    <MapViewLeafletInner
      rl={rlStub}
      L={LStub}
      center={[48.85, 2.35]}
      zoom={12}
      height={400}
      markers={[{ position: [48.85, 2.35], label: "Base" }]}
      tileUrl="https://tiles/{z}/{x}/{y}.png"
      overlays={overlays}
    />
  );
}

describe("bpm.mapView — calques (overlays)", () => {
  it("sans overlays → aucun contrôle de couches (sortie inchangée)", () => {
    const { container } = renderMap();
    expect(container.querySelector("[data-layerscontrol]")).toBeNull();
  });

  it("un overlay WMS → Overlay coché + WMSTileLayer (url/layers/opacité)", () => {
    const { container } = renderMap([
      {
        id: "cadastre",
        label: "Cadastre",
        kind: "wms",
        url: "https://wms.ign/geoportail",
        layers: "CADASTRALPARCELS",
        opacity: 0.6,
      },
    ]);
    const overlay = container.querySelector('[data-overlay][data-name="Cadastre"]');
    expect(overlay).not.toBeNull();
    expect(overlay!.getAttribute("data-checked")).toBe("true"); // defaultOn implicite
    const wms = overlay!.querySelector("[data-wms]");
    expect(wms).not.toBeNull();
    expect(wms!.getAttribute("data-url")).toBe("https://wms.ign/geoportail");
    expect(wms!.getAttribute("data-layers")).toBe("CADASTRALPARCELS");
    expect(wms!.getAttribute("data-transparent")).toBe("true"); // défaut
    expect(wms!.getAttribute("data-opacity")).toBe("0.6");
  });

  it("opacité hors bornes → clampée dans [0, 1]", () => {
    const { container } = renderMap([
      { id: "a", label: "Trop", kind: "wms", url: "u", opacity: 5 },
      { id: "b", label: "Négatif", kind: "tile", url: "u", opacity: -3 },
    ]);
    expect(
      container.querySelector('[data-name="Trop"] [data-wms]')!.getAttribute("data-opacity")
    ).toBe("1");
    expect(
      container.querySelector('[data-name="Négatif"] [data-tilelayer]')!.getAttribute("data-opacity")
    ).toBe("0");
  });

  it("overlay de données (markers) → LayerGroup + un Marker par point", () => {
    const { container } = renderMap([
      {
        id: "incidents",
        label: "Incidents",
        kind: "markers",
        color: "#e11",
        defaultOn: false,
        markers: [
          { position: [48.1, 2.1], label: "A" },
          { position: [48.2, 2.2], label: "B" },
        ],
      },
    ]);
    const overlay = container.querySelector('[data-overlay][data-name="Incidents"]');
    expect(overlay!.getAttribute("data-checked")).toBe("false"); // defaultOn:false → décoché
    const group = overlay!.querySelector("[data-layergroup]");
    expect(group).not.toBeNull();
    expect(group!.querySelectorAll("[data-marker]").length).toBe(2);
  });

  it("overlay de données (polygons) → LayerGroup + Polygon avec opacité de remplissage", () => {
    const { container } = renderMap([
      {
        id: "zones",
        label: "Zones",
        kind: "polygons",
        opacity: 0.4,
        polygons: [{ id: "z1", positions: [[48, 2], [48, 3], [49, 3]] }],
      },
    ]);
    const poly = container.querySelector('[data-name="Zones"] [data-polygon]');
    expect(poly).not.toBeNull();
    expect(poly!.getAttribute("data-fillopacity")).toBe("0.4");
  });

  it("plusieurs overlays → un Overlay par entrée, dans l'ordre", () => {
    const { container } = renderMap([
      { id: "1", label: "Un", kind: "wms", url: "u" },
      { id: "2", label: "Deux", kind: "markers", markers: [] },
    ]);
    const names = Array.from(container.querySelectorAll("[data-overlay]")).map((e) =>
      e.getAttribute("data-name")
    );
    expect(names).toEqual(["Un", "Deux"]);
  });
});
