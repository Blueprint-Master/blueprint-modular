/**
 * Primitives géographiques PURES partagées par les composants spatiaux
 * (bpm.locationField, bpm.mapView, bpm.geofence). Aucune dépendance React ni
 * Leaflet : calculs déterministes (aire, centroïde) + construction d'URL de
 * géocodage (le fetch réseau est isolé dans `geocodeAddress`).
 *
 * Convention de coordonnées : [latitude, longitude] en degrés décimaux —
 * l'ordre Leaflet, cohérent avec MapMarker / MapPolygonSpec du core.
 */

export type LatLng = [number, number];

/** Rayon terrestre moyen (WGS84 semi-grand axe), en mètres. */
const EARTH_RADIUS_M = 6378137;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Aire d'un polygone géographique (m²) par la formule sphérique de l'excédent —
 * exacte pour les petites emprises (parcelles, périmètres) sans projection.
 * Le polygone est implicitement refermé (dernier point relié au premier) ;
 * l'orientation (horaire/anti-horaire) n'importe pas (valeur absolue).
 * Renvoie 0 pour moins de 3 sommets.
 */
export function polygonAreaM2(positions: LatLng[]): number {
  const n = positions.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = positions[i]!;
    const [lat2, lng2] = positions[(i + 1) % n]!;
    sum += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  return Math.abs((sum * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

/** Aire d'un polygone géographique en hectares (1 ha = 10 000 m²). */
export function polygonAreaHectares(positions: LatLng[]): number {
  return polygonAreaM2(positions) / 10000;
}

/**
 * Centroïde géométrique (moyenne des sommets) — suffisant pour centrer la carte
 * et poser un marqueur représentatif sur une parcelle. Renvoie null si vide.
 */
export function polygonCentroid(positions: LatLng[]): LatLng | null {
  if (positions.length === 0) return null;
  let latSum = 0;
  let lngSum = 0;
  for (const [lat, lng] of positions) {
    latSum += lat;
    lngSum += lng;
  }
  return [latSum / positions.length, lngSum / positions.length];
}

export interface GeocodeOptions {
  /** Nombre max de résultats (défaut 1 — on prend le meilleur). */
  limit?: number;
  /** Restriction pays ISO-3166 (ex. "fr") pour désambiguïser. */
  countryCodes?: string;
}

/**
 * Construit l'URL de recherche Nominatim (OpenStreetMap). PURE et testable —
 * le hôte `nominatim.openstreetmap.org` doit être autorisé dans la `connect-src`
 * de la CSP des apps générées (cf. deployer).
 */
export function nominatimSearchUrl(query: string, opts: GeocodeOptions = {}): string {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: String(opts.limit ?? 1),
    addressdetails: "0",
  });
  if (opts.countryCodes) params.set("countrycodes", opts.countryCodes);
  return `https://nominatim.openstreetmap.org/search?${params.toString()}`;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  /** Libellé normalisé renvoyé par Nominatim (adresse résolue). */
  displayName: string;
}

/**
 * Géocode une adresse / référence via Nominatim → coordonnées. Renvoie null si
 * la requête est vide, l'appel échoue, ou aucun résultat exploitable (jamais de
 * throw : l'UI reste honnête sur l'échec sans casser le formulaire).
 */
export async function geocodeAddress(
  query: string,
  opts: GeocodeOptions = {}
): Promise<GeocodeResult | null> {
  const q = (query ?? "").trim();
  if (!q) return null;
  try {
    const res = await fetch(nominatimSearchUrl(q, opts), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const rows: unknown = await res.json();
    const first = Array.isArray(rows) ? (rows[0] as Record<string, unknown> | undefined) : undefined;
    if (!first) return null;
    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng, displayName: String(first.display_name ?? q) };
  } catch {
    return null;
  }
}
