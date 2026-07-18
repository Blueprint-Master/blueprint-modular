/**
 * Primitives géographiques pures (components/bpm/geo.ts) — socle des composants
 * spatiaux (locationField, mapView, geofence). Aire sphérique, centroïde,
 * construction d'URL Nominatim : déterministes et falsifiables.
 */
import { describe, it, expect } from "vitest";
import {
  polygonAreaHectares,
  polygonAreaM2,
  polygonCentroid,
  nominatimSearchUrl,
  type LatLng,
} from "../../../components/bpm/geo";

describe("polygonAreaM2 / polygonAreaHectares", () => {
  it("moins de 3 sommets → 0", () => {
    expect(polygonAreaM2([])).toBe(0);
    expect(polygonAreaM2([[45, 4]])).toBe(0);
    expect(polygonAreaM2([[45, 4], [45.01, 4]])).toBe(0);
  });

  it("petit rectangle près de Lyon (~0,01°×0,01°) ≈ 87 ha (±5 %)", () => {
    // À 45,76° N : 0,01° lat ≈ 1113 m ; 0,01° lng ≈ 776 m → ~0,86 km² ≈ 87 ha.
    const square: LatLng[] = [
      [45.76, 4.83],
      [45.77, 4.83],
      [45.77, 4.84],
      [45.76, 4.84],
    ];
    const ha = polygonAreaHectares(square);
    expect(ha).toBeGreaterThan(82);
    expect(ha).toBeLessThan(92);
  });

  it("orientation inverse → même aire (valeur absolue)", () => {
    const cw: LatLng[] = [[45.76, 4.83], [45.77, 4.83], [45.77, 4.84], [45.76, 4.84]];
    const ccw: LatLng[] = [...cw].reverse();
    expect(polygonAreaHectares(ccw)).toBeCloseTo(polygonAreaHectares(cw), 6);
  });
});

describe("polygonCentroid", () => {
  it("vide → null", () => {
    expect(polygonCentroid([])).toBeNull();
  });
  it("centre = moyenne des sommets", () => {
    const c = polygonCentroid([[45.76, 4.83], [45.78, 4.83], [45.78, 4.85], [45.76, 4.85]]);
    expect(c![0]).toBeCloseTo(45.77, 6);
    expect(c![1]).toBeCloseTo(4.84, 6);
  });
});

describe("nominatimSearchUrl", () => {
  it("hôte autorisé + requête encodée + format jsonv2", () => {
    const url = nominatimSearchUrl("12 rue de la République, Lyon", { limit: 1, countryCodes: "fr" });
    expect(url.startsWith("https://nominatim.openstreetmap.org/search?")).toBe(true);
    expect(url).toContain("q=12+rue+de+la+R%C3%A9publique%2C+Lyon");
    expect(url).toContain("format=jsonv2");
    expect(url).toContain("limit=1");
    expect(url).toContain("countrycodes=fr");
  });
});
