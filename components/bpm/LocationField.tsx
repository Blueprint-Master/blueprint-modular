"use client";

import React, { useCallback, useMemo, useState } from "react";
import { MapView } from "./MapView";
import type { MapMarker, MapPolygonSpec } from "./MapViewLeaflet";
import {
  geocodeAddress,
  polygonAreaHectares,
  polygonCentroid,
  type LatLng,
} from "./geo";

/**
 * Valeur d'un champ de localisation : un LIEU, pas deux nombres. Sérialisable
 * tel quel (JSON) pour une entité spatiale. `polygon` porte le contour tracé ;
 * `lat`/`lng` = point représentatif (centroïde du contour, sinon adresse
 * géocodée) ; `surfaceHa` est dérivée du contour.
 */
export interface LocationValue {
  address?: string;
  lat?: number;
  lng?: number;
  polygon?: LatLng[];
  surfaceHa?: number;
}

/**
 * @component bpm.locationField
 * @description Champ de saisie d'un LIEU : recherche par adresse (géocodage
 * Nominatim), tracé du contour sur la carte au clic, surface (ha) calculée
 * automatiquement. Remplace toute saisie de latitude/longitude à la main.
 * @example
 * bpm.locationField({ value, onChange: setValue })
 *
 * @param {object} props
 * @param {LocationValue} [props.value] - Valeur contrôlée {address, lat, lng, polygon, surfaceHa}. Optionnel.
 * @param {function} [props.onChange] - Callback à chaque modification. Optionnel.
 * @param {[number, number]} [props.defaultCenter=[46.6,2.4]] - Centre initial si vide. Optionnel.
 * @param {number|string} [props.height=360] - Hauteur de la carte. Optionnel.
 * @param {string} [props.countryCodes="fr"] - Restriction pays du géocodage. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.mapView, bpm.geofence
 * @parent bpm.form, bpm.card, bpm.modal, bpm.container
 */
export interface LocationFieldProps {
  value?: LocationValue;
  onChange?: (next: LocationValue) => void;
  defaultCenter?: [number, number];
  height?: number | string;
  countryCodes?: string;
  className?: string;
}

const INPUT_STYLE: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "8px 10px",
  borderRadius: "var(--bpm-radius-sm)",
  border: "1px solid var(--bpm-border)",
  background: "var(--bpm-surface)",
  color: "var(--bpm-text-primary)",
  fontSize: "var(--bpm-font-size-base)",
};

const BTN_STYLE: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "var(--bpm-radius-sm)",
  border: "1px solid var(--bpm-border)",
  background: "var(--bpm-surface)",
  color: "var(--bpm-text-primary)",
  fontSize: "var(--bpm-font-size-base)",
  cursor: "pointer",
};

export function LocationField({
  value,
  onChange,
  defaultCenter = [46.6, 2.4],
  height = 360,
  countryCodes = "fr",
  className = "",
}: LocationFieldProps) {
  const controlled = onChange != null;
  const [local, setLocal] = useState<LocationValue>(value ?? {});
  const current = controlled ? value ?? {} : local;

  const [address, setAddress] = useState<string>(current.address ?? "");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const points: LatLng[] = current.polygon ?? [];

  const emit = useCallback(
    (next: LocationValue) => {
      if (controlled) onChange!(next);
      else setLocal(next);
    },
    [controlled, onChange]
  );

  /** Recompose la valeur canonique depuis un contour + une adresse. */
  const composeValue = useCallback(
    (nextPoints: LatLng[], addr: string, fallback?: { lat: number; lng: number }): LocationValue => {
      const centroid = polygonCentroid(nextPoints);
      const lat = centroid ? centroid[0] : fallback?.lat;
      const lng = centroid ? centroid[1] : fallback?.lng;
      const surfaceHa = nextPoints.length >= 3
        ? Math.round(polygonAreaHectares(nextPoints) * 100) / 100
        : undefined;
      return {
        address: addr || undefined,
        lat,
        lng,
        polygon: nextPoints.length > 0 ? nextPoints : undefined,
        surfaceHa,
      };
    },
    []
  );

  const handleGeocode = useCallback(async () => {
    const q = address.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    const res = await geocodeAddress(q, { countryCodes, limit: 1 });
    setSearching(false);
    if (!res) {
      setSearchError("Adresse introuvable — placez le point sur la carte.");
      return;
    }
    // L'adresse recentre et pose le point de départ ; le contour existant est conservé.
    emit(composeValue(points, res.displayName, { lat: res.lat, lng: res.lng }));
    setAddress(res.displayName);
  }, [address, countryCodes, emit, composeValue, points]);

  const handleMapClick = useCallback(
    (latlng: LatLng) => {
      const next = [...points, latlng];
      emit(composeValue(next, address));
    },
    [points, address, emit, composeValue]
  );

  const undoLast = useCallback(() => {
    if (points.length === 0) return;
    emit(composeValue(points.slice(0, -1), address));
  }, [points, address, emit, composeValue]);

  const clearAll = useCallback(() => {
    emit({ address: address || undefined });
  }, [address, emit]);

  const center: [number, number] = useMemo(() => {
    const c = polygonCentroid(points);
    if (c) return c;
    if (typeof current.lat === "number" && typeof current.lng === "number") {
      return [current.lat, current.lng];
    }
    return defaultCenter;
  }, [points, current.lat, current.lng, defaultCenter]);

  const zoom = points.length > 0 || (current.lat != null && current.lng != null) ? 14 : 5;

  const markers: MapMarker[] = useMemo(
    () => points.map((p, i) => ({ position: p, label: `Point ${i + 1}`, number: i + 1 })),
    [points]
  );

  const polygons: MapPolygonSpec[] = useMemo(
    () =>
      points.length >= 3
        ? [{ id: "contour", positions: [...points, points[0]!], color: "var(--bpm-accent)", fillOpacity: 0.22 }]
        : [],
    [points]
  );

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "var(--bpm-space-3, 12px)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <input
          type="text"
          value={address}
          placeholder="Adresse ou référence…"
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleGeocode();
            }
          }}
          style={INPUT_STYLE}
          aria-label="Adresse à localiser"
        />
        <button type="button" onClick={() => void handleGeocode()} disabled={searching} style={BTN_STYLE}>
          {searching ? "Recherche…" : "Localiser"}
        </button>
      </div>

      {searchError && (
        <p role="status" style={{ margin: 0, fontSize: "0.82rem", color: "var(--bpm-text-muted)" }}>
          {searchError}
        </p>
      )}

      <MapView center={center} zoom={zoom} height={height} markers={markers} polygons={polygons} onMapClick={handleMapClick} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.82rem", color: "var(--bpm-text-secondary)" }}>
          {points.length === 0
            ? "Cliquez sur la carte pour tracer le contour."
            : points.length < 3
              ? `${points.length} point(s) — au moins 3 pour fermer le contour.`
              : `Contour de ${points.length} points · surface ${current.surfaceHa ?? 0} ha`}
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={undoLast} disabled={points.length === 0} style={BTN_STYLE}>
            Annuler le dernier point
          </button>
          <button type="button" onClick={clearAll} disabled={points.length === 0} style={BTN_STYLE}>
            Effacer
          </button>
        </span>
      </div>
    </div>
  );
}
