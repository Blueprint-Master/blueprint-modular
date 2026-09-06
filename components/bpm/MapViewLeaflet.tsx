"use client";

import React, { useMemo } from "react";
import type { MapRenderContext } from "./MapView";

/**
 * @component bpm.mapViewLeaflet
 * @description Composant interne Leaflet utilisé par MapView après chargement dynamique des dépendances.
 * @example
 * // Usage interne uniquement - utiliser bpm.mapView à la place
 *
 * @param {object} props
 * @param {typeof import("react-leaflet")} props.rl - Module react-leaflet. Obligatoire.
 * @param {typeof import("leaflet")} props.L - Module leaflet. Obligatoire.
 * @param {[number, number]} props.center - Centre de la carte. Obligatoire.
 * @param {number} props.zoom - Niveau de zoom. Obligatoire.
 * @param {number|string} props.height - Hauteur. Obligatoire.
 * @param {MapMarker[]} props.markers - Marqueurs. Obligatoire.
 * @param {function} [props.onMarkerClick] - Callback clic marqueur. Optionnel.
 * @param {string} props.tileUrl - URL des tuiles. Obligatoire.
 * @param {string} [props.tileAttribution] - Attribution. Optionnel.
 * @param {[number, number][][]} [props.polylines] - Polylignes. Optionnel.
 * @param {string} [props.polylineColor] - Couleur polylignes. Optionnel.
 * @param {MapPolygonSpec[]} [props.polygons] - Polygones. Optionnel.
 * @param {function} [props.onMapClick] - Callback clic carte. Optionnel.
 * @param {string} [props.className=""] - Classes CSS. Optionnel.
 *
 * @parent bpm.mapView
 */
export interface MapMarker {
  position: [number, number];
  label?: string;
  /** Affiché dans un divIcon si défini */
  number?: number;
}

export interface MapPolygonSpec {
  id: string;
  positions: [number, number][];
  color?: string;
  fillOpacity?: number;
}

/** Type de calque superposable (façon Géoportail). */
export type MapOverlayKind = "wms" | "tile" | "markers" | "polygons";

/**
 * Calque superposable, activable/désactivable via le contrôle de couches, en
 * transparence au-dessus du fond de carte. Deux familles :
 *  - DONNÉES de l'app (`markers` / `polygons`) — une 2ᵉ source géolocalisée ;
 *  - EXTERNE (`wms` / `tile`) — couche thématique (cadastre, parcelles…) servie
 *    par un serveur WMS ou une grille de tuiles tierce.
 * `defaultOn` (défaut `true`) = coché au montage ; `opacity` (0..1) s'applique
 * aux calques tuiles/WMS et à l'opacité de remplissage des polygones.
 */
export interface MapOverlaySpec {
  id: string;
  /** Libellé affiché dans la case à cocher du contrôle de couches. */
  label: string;
  kind: MapOverlayKind;
  /** Coché au montage. Défaut : true. */
  defaultOn?: boolean;
  /** Opacité 0..1 (tuiles/WMS, et remplissage des polygones). */
  opacity?: number;
  /** URL des tuiles (kind `tile`) ou du service WMS (kind `wms`). */
  url?: string;
  attribution?: string;
  /** WMS : couche(s) demandée(s) au serveur. */
  layers?: string;
  /** WMS : format d'image. Défaut : "image/png". */
  format?: string;
  /** WMS : fond transparent. Défaut : true. */
  transparent?: boolean;
  /** WMS : version du protocole (ex. "1.3.0"). */
  version?: string;
  /** Couleur des marqueurs / contours (kind `markers` / `polygons`). */
  color?: string;
  markers?: MapMarker[];
  polygons?: MapPolygonSpec[];
}

/** Borne une opacité dans [0, 1] ; repli à `fallback` si non finie. */
function clampOpacity(v: number | undefined, fallback: number): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  return Math.min(1, Math.max(0, v));
}

export interface MapViewLeafletInnerProps {
  rl: typeof import("react-leaflet");
  L: typeof import("leaflet");
  center: [number, number];
  zoom: number;
  height: number | string;
  markers: MapMarker[];
  onMarkerClick?: (index: number, marker: MapMarker) => void;
  tileUrl: string;
  tileAttribution?: string;
  polylines?: [number, number][][];
  polylineColor?: string;
  polygons?: MapPolygonSpec[];
  /** Calques superposables (données app + WMS/tuiles externes). */
  overlays?: MapOverlaySpec[];
  onMapClick?: (latlng: [number, number]) => void;
  baseLayer?: boolean;
  projection?: "mercator" | "geographic" | "simple";
  crs?: import("leaflet").CRS;
  renderLayers?: (context: MapRenderContext) => React.ReactNode;
  className?: string;
}

function LeafletMapClick({
  useMapEvents,
  onMapClick,
}: {
  useMapEvents: typeof import("react-leaflet").useMapEvents;
  onMapClick: (latlng: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * Carte Leaflet : à utiliser uniquement après import dynamique de `react-leaflet` et `leaflet`.
 */
export function MapViewLeafletInner({
  rl,
  L,
  center,
  zoom,
  height,
  markers,
  onMarkerClick,
  tileUrl,
  tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  polylines,
  polylineColor,
  polygons,
  overlays,
  onMapClick,
  baseLayer = true,
  projection,
  crs,
  renderLayers,
  className = "",
}: MapViewLeafletInnerProps) {
  const { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon } = rl;
  const { LayersControl, WMSTileLayer, LayerGroup } = rl;
  const h = typeof height === "number" ? `${height}px` : height;

  const numberedIcon = useMemo(() => {
    return (n: number) =>
      L.divIcon({
        className: "bpm-map-marker-num",
        html: `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--bpm-accent);color:var(--bpm-accent-contrast);font-size:12px;font-weight:600;border:2px solid var(--bpm-border-strong)">${n}</span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
  }, [L]);

  /* Pastille colorée (HTML pur, aucun hôte externe → compatible CSP stricte)
     pour distinguer les marqueurs d'un calque de données de ceux du fond. */
  const dotIcon = useMemo(() => {
    return (color: string) =>
      L.divIcon({
        className: "bpm-map-overlay-dot",
        html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid var(--bpm-surface, #fff);box-shadow:0 0 0 1px rgba(0,0,0,0.25)"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
  }, [L]);

  /* UN calque = UN layer Leaflet. Les collections (marqueurs/polygones) sont
     enveloppées dans un LayerGroup pour rester un enfant unique de l'Overlay. */
  const renderOverlayLayer = (ov: MapOverlaySpec): React.ReactNode => {
    if (ov.kind === "wms" && ov.url) {
      return (
        <WMSTileLayer
          url={ov.url}
          layers={ov.layers ?? ""}
          format={ov.format ?? "image/png"}
          transparent={ov.transparent !== false}
          {...(ov.version ? { version: ov.version } : {})}
          opacity={clampOpacity(ov.opacity, 0.7)}
          {...(ov.attribution ? { attribution: ov.attribution } : {})}
        />
      );
    }
    if (ov.kind === "tile" && ov.url) {
      return (
        <TileLayer
          url={ov.url}
          opacity={clampOpacity(ov.opacity, 0.7)}
          {...(ov.attribution ? { attribution: ov.attribution } : {})}
        />
      );
    }
    if (ov.kind === "polygons") {
      const color = ov.color ?? "var(--bpm-accent)";
      return (
        <LayerGroup>
          {(ov.polygons ?? []).map((z) => (
            <Polygon
              key={z.id}
              positions={z.positions}
              pathOptions={{
                color: z.color ?? color,
                fillColor: z.color ?? color,
                fillOpacity: clampOpacity(z.fillOpacity ?? ov.opacity, 0.25),
              }}
            />
          ))}
        </LayerGroup>
      );
    }
    if (ov.kind === "markers") {
      const icon = dotIcon(ov.color ?? "var(--bpm-accent)");
      return (
        <LayerGroup>
          {(ov.markers ?? []).map((m, i) => (
            <Marker key={i} position={L.latLng(m.position[0], m.position[1])} icon={icon}>
              {m.label ? <Popup>{m.label}</Popup> : null}
            </Marker>
          ))}
        </LayerGroup>
      );
    }
    return null;
  };

  const safeOverlays = (overlays ?? []).filter(
    (ov): ov is MapOverlaySpec => !!ov && typeof ov.id === "string" && typeof ov.label === "string"
  );

  return (
    <MapContainer
      key={projection}
      {...(crs ? { crs } : projection ? { crs: projection === "simple" ? L.CRS.Simple : projection === "geographic" ? L.CRS.EPSG4326 : L.CRS.EPSG3857 } : {})}
      center={center}
      zoom={zoom}
      style={{ height: h, width: "100%", background: "var(--bpm-bg-secondary)" }}
      className={"bpm-mapview-leaflet rounded-lg " + className}
    >
      {baseLayer && <TileLayer attribution={tileAttribution} url={tileUrl} />}
      {renderLayers?.({ rl, L })}
      {safeOverlays.length > 0 ? (
        <LayersControl position="topright" collapsed={false}>
          {safeOverlays.map((ov) => (
            <LayersControl.Overlay key={ov.id} name={ov.label} checked={ov.defaultOn !== false}>
              {renderOverlayLayer(ov)}
            </LayersControl.Overlay>
          ))}
        </LayersControl>
      ) : null}
      {onMapClick ? (
        <LeafletMapClick useMapEvents={rl.useMapEvents} onMapClick={onMapClick} />
      ) : null}
      {polygons?.map((z) => (
        <Polygon
          key={z.id}
          positions={z.positions}
          pathOptions={{
            color: z.color ?? "var(--bpm-accent)",
            fillColor: z.color ?? "var(--bpm-accent)",
            fillOpacity: z.fillOpacity ?? 0.2,
          }}
        />
      ))}
      {polylines?.map((pts, i) => (
        <Polyline
          key={i}
          positions={pts}
          pathOptions={{ color: polylineColor ?? "var(--bpm-accent)", weight: 3 }}
        />
      ))}
      {markers.map((m, i) => {
        const pos = L.latLng(m.position[0], m.position[1]);
        const icon =
          m.number != null
            ? numberedIcon(m.number)
            : undefined;
        return (
          <Marker
            key={i}
            position={pos}
            eventHandlers={{
              click: () => onMarkerClick?.(i, m),
            }}
            {...(icon ? { icon } : {})}
          >
            {m.label ? <Popup>{m.label}</Popup> : null}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
