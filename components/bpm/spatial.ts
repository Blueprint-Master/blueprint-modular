/** Pure, deterministic geometry shared by the celestial and aviation components. */
export interface SpatialPoint { x: number; y: number; z?: number }
export interface ProjectedPoint { x: number; y: number; depth: number }
export interface SceneCamera { azimuth?: number; elevation?: number; zoom?: number }

export const radians = (degrees: number) => degrees * Math.PI / 180;
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
export const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
export const numberOr = (n: unknown, fallback: number) => finite(n) ? n : fallback;
export const wrapDegrees = (n: number) => ((n % 360) + 360) % 360;
export const isPoint = (p: unknown): p is SpatialPoint => !!p && typeof p === "object" &&
  finite((p as SpatialPoint).x) && finite((p as SpatialPoint).y) &&
  ((p as SpatialPoint).z === undefined || finite((p as SpatialPoint).z));

/** Seeded generator: identical seed => identical geometry on server and client. */
export function seededRandom(seed = 1): () => number {
  let state = numberOr(seed, 1) >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Orthographic view of a right-handed scene, with +Y up and +Z toward the viewer. */
export function projectSpatial(point: SpatialPoint, camera: SceneCamera = {}, extent = 100): ProjectedPoint {
  const a = radians(numberOr(camera.azimuth, 0));
  const e = radians(numberOr(camera.elevation, 0));
  const x = point.x * Math.cos(a) - point.y * Math.sin(a);
  const y = point.x * Math.sin(a) + point.y * Math.cos(a);
  const z = point.z ?? 0;
  const scale = 215 / Math.max(0.001, numberOr(extent, 100)) * clamp(numberOr(camera.zoom, 1), 0.25, 8);
  return { x: 450 + x * scale, y: 260 - (y * Math.cos(e) - z * Math.sin(e)) * scale,
    depth: y * Math.sin(e) + z * Math.cos(e) };
}

export interface OrbitalElements {
  /** Semi-major axis, in the same scene units as every position. */
  semiMajorAxis: number;
  /** Elliptical orbits only: 0 <= e < 1. */
  eccentricity?: number;
  /** Period in the same units as OrbitalSystem.time. */
  period: number;
  /** Mean anomaly at time zero, degrees. */
  phase?: number;
  inclination?: number;
  ascendingNode?: number;
  periapsis?: number;
}

export function validOrbit(o: unknown): o is OrbitalElements {
  if (!o || typeof o !== "object") return false;
  const orbit = o as OrbitalElements;
  return finite(orbit.semiMajorAxis) && orbit.semiMajorAxis > 0 && finite(orbit.period) && orbit.period > 0 &&
    [orbit.phase, orbit.inclination, orbit.ascendingNode, orbit.periapsis].every(v => v === undefined || finite(v)) &&
    (orbit.eccentricity === undefined || (finite(orbit.eccentricity) && orbit.eccentricity >= 0 && orbit.eccentricity < 1));
}

/** Kepler ellipse, focus at the origin. Bisection is bounded and stable even near e=1.
 * Geometry: https://ssd.jpl.nasa.gov/planets/approx_pos.html (orbital-plane rotation).
 * No epoch or ephemeris is inferred from the caller's time value.
 */
export function orbitalPosition(orbit: OrbitalElements, time = 0): SpatialPoint | null {
  if (!validOrbit(orbit) || !finite(time)) return null;
  const e = orbit.eccentricity ?? 0;
  const mean = radians(wrapDegrees((orbit.phase ?? 0) + 360 * ((time % orbit.period) / orbit.period)));
  let lo = 0, hi = 2 * Math.PI;
  for (let n = 0; n < 48; n++) {
    const mid = (lo + hi) / 2;
    if (mid - e * Math.sin(mid) < mean) lo = mid; else hi = mid;
  }
  const E = (lo + hi) / 2;
  const x = orbit.semiMajorAxis * (Math.cos(E) - e);
  const y = orbit.semiMajorAxis * Math.sqrt(1 - e * e) * Math.sin(E);
  const w = radians(orbit.periapsis ?? 0), i = radians(orbit.inclination ?? 0), o = radians(orbit.ascendingNode ?? 0);
  const u = x * Math.cos(w) - y * Math.sin(w), v = x * Math.sin(w) + y * Math.cos(w);
  return { x: u * Math.cos(o) - v * Math.cos(i) * Math.sin(o),
    y: u * Math.sin(o) + v * Math.cos(i) * Math.cos(o), z: v * Math.sin(i) };
}

export interface GeoPosition { lat: number; lon: number }
export function validGeo(p: unknown): p is GeoPosition {
  if (!p || typeof p !== "object") return false;
  const q = p as GeoPosition;
  return finite(q.lat) && Math.abs(q.lat) <= 90 && finite(q.lon) && Math.abs(q.lon) <= 180;
}

/** Shortest great-circle arc. Exactly antipodal endpoints have no unique arc: abstain. */
export function greatCircle(from: GeoPosition, to: GeoPosition, steps = 64): GeoPosition[] {
  if (!validGeo(from) || !validGeo(to)) return [];
  const vector = (p: GeoPosition) => [Math.cos(radians(p.lat)) * Math.cos(radians(p.lon)),
    Math.cos(radians(p.lat)) * Math.sin(radians(p.lon)), Math.sin(radians(p.lat))];
  const a = vector(from), b = vector(to);
  const omega = Math.acos(clamp(a.reduce((sum, v, i) => sum + v * b[i], 0), -1, 1));
  if (omega < 1e-7) return [from, to];
  if (Math.PI - omega < 1e-7) return [];
  const count = Math.round(clamp(numberOr(steps, 64), 2, 256));
  return Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count, f = Math.sin((1 - t) * omega) / Math.sin(omega), g = Math.sin(t * omega) / Math.sin(omega);
    const v = a.map((n, j) => n * f + b[j] * g);
    return { lat: Math.atan2(v[2], Math.hypot(v[0], v[1])) * 180 / Math.PI, lon: Math.atan2(v[1], v[0]) * 180 / Math.PI };
  });
}

/** Equirectangular world coordinates. Longitudes are always degrees east. */
export function projectGeo(p: GeoPosition): { x: number; y: number } {
  return { x: (p.lon + 180) * 2.5, y: (90 - p.lat) * 2.5 };
}

/** Splits at the dateline AND invalid samples; never draws a false cross-world segment. */
export function geoPath(points: GeoPosition[]): string {
  let previous: GeoPosition | undefined;
  return points.map(point => {
    if (!validGeo(point)) { previous = undefined; return ""; }
    const p = projectGeo(point), start = !previous || Math.abs(point.lon - previous.lon) > 180;
    previous = point;
    return `${start ? "M" : "L"}${p.x.toFixed(3)},${p.y.toFixed(3)}`;
  }).join(" ");
}
