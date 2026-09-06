"use client";

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapViewLeafletInner } from "./MapViewLeaflet";
import type { MapMarker, MapPolygonSpec, MapOverlaySpec, MapOverlayKind } from "./MapViewLeaflet";

export type { MapMarker, MapPolygonSpec, MapOverlaySpec, MapOverlayKind };

/** Dynamically loaded modules, supplied inside the Leaflet map context. */
export interface MapRenderContext {
  rl: typeof import("react-leaflet");
  L: typeof import("leaflet");
}

const OSM_TILE =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

/**
 * @component bpm.mapView
 * @description Carte Leaflet interactive avec marqueurs, polylignes, polygones et gestion des clics.
 * @example
 * bpm.mapView({ center: [48.8566, 2.3522], zoom: 13, markers: [{ position: [48.8566, 2.3522], label: "Paris" }] })
 *
 * @param {object} props
 * @param {[number, number]} props.center - Coordonnées [lat, lng] du centre. Obligatoire.
 * @param {number} [props.zoom=13] - Niveau de zoom initial. Optionnel.
 * @param {number|string} [props.height=320] - Hauteur de la carte. Optionnel.
 * @param {MapMarker[]} [props.markers=[]] - Liste des marqueurs. Optionnel.
 * @param {function} [props.onMarkerClick] - Callback au clic sur un marqueur. Optionnel.
 * @param {string} [props.tileUrl] - URL du serveur de tuiles. Optionnel.
 * @param {string} [props.tileAttribution] - Attribution du fournisseur de tuiles. Optionnel.
 * @param {[number, number][][]} [props.polylines] - Lignes à tracer. Optionnel.
 * @param {string} [props.polylineColor] - Couleur des polylignes. Optionnel.
 * @param {MapPolygonSpec[]} [props.polygons] - Polygones à afficher. Optionnel.
 * @param {MapOverlaySpec[]} [props.overlays] - Calques superposables (données app + WMS/tuiles externes), activables via un contrôle de couches, en transparence. Optionnel.
 * @param {function} [props.onMapClick] - Callback au clic sur la carte. Optionnel.
 * @param {boolean} [props.baseLayer=true] - Afficher le fond de tuiles par défaut.
 * @param {string} [props.projection] - mercator, geographic ou simple (coordonnées locales).
 * @param {function} [props.renderLayers] - Extension React dans le contexte Leaflet, recevant les modules rl et L.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.map, bpm.routePlanner, bpm.gps
 */
export interface MapViewProps {
  center: [number, number];
  zoom?: number;
  height?: number | string;
  markers?: MapMarker[];
  onMarkerClick?: (index: number, marker: MapMarker) => void;
  tileUrl?: string;
  tileAttribution?: string;
  polylines?: [number, number][][];
  polylineColor?: string;
  polygons?: MapPolygonSpec[];
  /** Calques superposables (données app + WMS/tuiles externes), en transparence. */
  overlays?: MapOverlaySpec[];
  onMapClick?: (latlng: [number, number]) => void;
  baseLayer?: boolean;
  projection?: "mercator" | "geographic" | "simple";
  /** Custom application-provided CRS; remount the map when changing it. */
  crs?: import("leaflet").CRS;
  renderLayers?: (context: MapRenderContext) => React.ReactNode;
  className?: string;
}

type LeafletMods = {
  rl: typeof import("react-leaflet");
  L: typeof import("leaflet");
};

function fixLeafletDefaultIcons(L: typeof import("leaflet")) {
  type IconProto = { _getIconUrl?: string };
  const proto = L.Icon.Default.prototype as unknown as IconProto;
  delete proto._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export function MapView({
  center,
  zoom = 13,
  height = 320,
  markers = [],
  onMarkerClick,
  tileUrl = OSM_TILE,
  tileAttribution,
  polylines,
  polylineColor,
  polygons,
  overlays,
  onMapClick,
  baseLayer,
  projection,
  crs,
  renderLayers,
  className = "",
}: MapViewProps) {
  const [mods, setMods] = useState<LeafletMods | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [L, rl] = await Promise.all([
          import("leaflet"),
          import("react-leaflet"),
        ]);
        if (cancelled) return;
        fixLeafletDefaultIcons(L.default);
        setMods({ rl, L: L.default });
        setLoadError(null);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Map load failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <div
        className={className}
        style={{
          height: typeof height === "number" ? height : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bpm-bg-secondary)",
          color: "var(--bpm-text-secondary)",
          fontSize: "var(--bpm-font-size-base)",
          borderRadius: "var(--bpm-radius)",
        }}
      >
        {loadError}
      </div>
    );
  }

  if (!mods) {
    return (
      <div
        className={className}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bpm-bg-secondary)",
          color: "var(--bpm-text-muted)",
          fontSize: "var(--bpm-font-size-base)",
          borderRadius: "var(--bpm-radius)",
        }}
      >
        …
      </div>
    );
  }

  return (
    <MapViewLeafletInner
      rl={mods.rl}
      L={mods.L}
      center={center}
      zoom={zoom}
      height={height}
      markers={markers}
      onMarkerClick={onMarkerClick}
      tileUrl={tileUrl}
      tileAttribution={tileAttribution}
      polylines={polylines}
      polylineColor={polylineColor}
      polygons={polygons}
      overlays={overlays}
      onMapClick={onMapClick}
      baseLayer={baseLayer}
      projection={projection}
      crs={crs}
      renderLayers={renderLayers}
      className={className}
    />
  );
}
