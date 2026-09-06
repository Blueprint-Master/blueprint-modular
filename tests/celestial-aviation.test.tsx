import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { orbitalPosition, greatCircle, geoPath, projectSpatial } from "../components/bpm/spatial";
import { resolveOrbitalSystem, OrbitalSystem } from "../components/bpm/OrbitalSystem";
import { createSolarSystemBodies, SolarSystem } from "../components/bpm/SolarSystem";
import { createGalaxyParticles, GalaxyView } from "../components/bpm/GalaxyView";
import { CelestialScene } from "../components/bpm/CelestialScene";
import { MoonPhase } from "../components/bpm/MoonPhase";
import { FlightMap } from "../components/bpm/FlightMap";
import { FlightInstruments } from "../components/bpm/FlightInstruments";
import { FlightProfile } from "../components/bpm/FlightProfile";
import { AirportBoard } from "../components/bpm/AirportBoard";
import { SeatMap } from "../components/bpm/SeatMap";
import registry from "../lib/generated/mcp-registry.json";
import { parsePropSpecs } from "../lib/playgroundProps";

describe("Orbital geometry and hierarchy", () => {
  it("anchors an ellipse at its focus, returns to its start and handles extreme eccentricity", () => {
    const orbit = { semiMajorAxis: 100, eccentricity: 0.5, period: 40 };
    expect(orbitalPosition(orbit, 0)?.x).toBeCloseTo(50, 8);
    expect(orbitalPosition(orbit, 20)?.x).toBeCloseTo(-150, 8);
    expect(orbitalPosition(orbit, 40)?.x).toBeCloseTo(50, 8);
    const edge = orbitalPosition({ ...orbit, eccentricity: 0.9999 }, 0)!;
    expect(edge.x).toBeCloseTo(0.01, 8);
    expect(edge.y).toBeCloseTo(0, 8);
    expect(orbitalPosition({ ...orbit, eccentricity: 1 })).toBeNull();
    expect(orbitalPosition({ ...orbit, period: 0 })).toBeNull();
  });
  it("uses parent positions even when children precede parents", () => {
    const result = resolveOrbitalSystem([
      { id: "moon", label: "M", parentId: "planet", orbit: { semiMajorAxis: 5, period: 4 } },
      { id: "planet", label: "P", parentId: "star", orbit: { semiMajorAxis: 30, period: 10 } },
      { id: "star", label: "S", position: { x: 10, y: 2 } },
    ], 0);
    expect(result.objects.find(o => o.id === "moon")?.x).toBeCloseTo(45, 8);
    expect(result.objects.find(o => o.id === "moon")?.y).toBeCloseTo(2, 8);
    expect(result.paths).toHaveLength(2);
    expect(result.rejected).toBe(0);
  });
  it("rejects cycles, orphans, duplicate identities, and affected descendants", () => {
    const result = resolveOrbitalSystem([
      { id: "a", label: "A", parentId: "b" }, { id: "b", label: "B", parentId: "a" },
      { id: "orphan", label: "O", parentId: "missing" },
      { id: "dup", label: "D" }, { id: "dup", label: "D2" }, { id: "child", label: "C", parentId: "dup" },
      { id: "ok", label: "Good" },
    ], 0);
    expect(result.objects.map(o => o.id)).toEqual(["ok"]);
    expect(result.rejected).toBe(6);
  });
  it("allows complete preset replacement without injecting the Sun", () => {
    expect(createSolarSystemBodies()).toHaveLength(9);
    expect(createSolarSystemBodies("relative", "inner")).toHaveLength(5);
    const html = renderToStaticMarkup(<SolarSystem bodies={[{ id: "custom", label: "Ma création" }]} />);
    expect(html).toContain('data-celestial-object="custom"');
    expect(html).not.toContain('data-celestial-object="sun"');
    expect(renderToStaticMarkup(<SolarSystem bodies={[]} />)).toContain("Aucun objet à afficher");
  });
  it("keeps nested body viewports explicitly square so SVG auto-height cannot shift bodies off their orbits", () => {
    const html = renderToStaticMarkup(<SolarSystem />);
    const nested = [...html.matchAll(/<svg role="img"[^>]+>/g)].map(match => match[0]);
    expect(nested).toHaveLength(9);
    for (const glyph of nested) {
      expect(glyph.match(/width="([^"]+)"/)?.[1]).toBe(glyph.match(/height="([^"]+)"/)?.[1]);
      expect(glyph).not.toContain("height:auto");
    }
  });
  it("keeps seeded galaxy generation reproducible and bounded", () => {
    expect(createGalaxyParticles({ seed: 8, starCount: 30 })).toEqual(createGalaxyParticles({ seed: 8, starCount: 30 }));
    expect(createGalaxyParticles({ seed: 9, starCount: 30 })).not.toEqual(createGalaxyParticles({ seed: 8, starCount: 30 }));
    expect(createGalaxyParticles({ starCount: 9000 })).toHaveLength(4000);
    expect(createGalaxyParticles({ starCount: 0 })).toHaveLength(0);
    expect(projectSpatial({ x: 0, y: 0 })).toEqual({ x: 450, y: 260, depth: 0 });
  });
});

describe("Geographic route integrity", () => {
  it("follows the short arc across the dateline without drawing across the whole world", () => {
    const points = greatCircle({ lat: 10, lon: 170 }, { lat: 10, lon: -170 });
    expect(points).toHaveLength(65);
    expect(Math.abs(points[32].lon)).toBeCloseTo(180, 5);
    const path = geoPath(points);
    expect(path.match(/M/g)).toHaveLength(2);
    expect(path).not.toMatch(/NaN|Infinity/);
  });
  it("does not invent an antipodal route and preserves sample gaps", () => {
    expect(greatCircle({ lat: 0, lon: 0 }, { lat: 0, lon: 180 })).toEqual([]);
    expect(greatCircle({ lat: 0, lon: 0 }, { lat: 0, lon: 0 })).toHaveLength(2);
    expect(geoPath([{ lat: 0, lon: 0 }, { lat: NaN, lon: 2 }, { lat: 0, lon: 10 }]).match(/M/g)).toHaveLength(2);
    const html = renderToStaticMarkup(<FlightMap routes={[{ id: "bad", from: { lat: 0, lon: 0 }, to: { lat: 0, lon: 180 } }]} />);
    expect(html).toContain("arc antipodal indéterminé");
    expect(html).not.toContain('data-flight-route="bad"');
  });
});

describe("Truthful missing data, SSR and extension points", () => {
  it("keeps complex scene data out of scalar playground controls while exposing genuine enums", () => {
    expect(parsePropSpecs("bpm.orbitalSystem").find(p => p.name === "scene")?.editable).toBe(false);
    expect(parsePropSpecs("bpm.galaxyView").find(p => p.name === "palette")?.editable).toBe(false);
    expect(parsePropSpecs("bpm.seatMap").find(p => p.name === "selectedSeatIds")?.editable).toBe(false);
    expect(parsePropSpecs("bpm.galaxyView").find(p => p.name === "morphology")?.options).toEqual(["spiral", "barred", "elliptical", "irregular"]);
  });
  it("reports invalid objects without throwing or leaking non-finite SVG coordinates", () => {
    const html = renderToStaticMarkup(<CelestialScene objects={[null, { id: "bad", x: NaN, y: 0 },
      { id: "ok", label: "Objet", x: 1, y: 2 }] as never} renderOverlay={({ project }) =>
      <text x={project({ x: 1, y: 2 }).x} y="20">Couche libre</text>} />);
    expect(html).toContain("2 objet(s) non affiché(s)");
    expect(html).toContain("Couche libre");
    expect(html).not.toContain('cx="NaN"');
  });
  it("accepts missing or malformed collections at the generated-code boundary", () => {
    for (const value of [undefined, null, "bad", 42, [null]]) {
      for (const element of [<CelestialScene objects={value as never} />, <OrbitalSystem bodies={value as never} />,
        <GalaxyView landmarks={value as never} starCount={0} />, <FlightMap flights={value as never} />,
        <FlightProfile points={value as never} />, <AirportBoard flights={value as never} />, <SeatMap rows={value as never} />]) {
        expect(() => renderToStaticMarkup(element)).not.toThrow();
      }
    }
  });
  it("distinguishes cycle fraction from illumination and leaves missing telemetry unknown", () => {
    expect(renderToStaticMarkup(<MoonPhase phase={0} />)).toContain("0 % éclairée");
    expect(renderToStaticMarkup(<MoonPhase phase={0.25} />)).toContain("50 % éclairée");
    expect(renderToStaticMarkup(<MoonPhase phase={0.5} />)).toContain("100 % éclairée");
    expect(renderToStaticMarkup(<MoonPhase />)).toContain("Phase non renseignée");
    expect(renderToStaticMarkup(<FlightInstruments />)).toContain("Attitude indisponible");
    expect(renderToStaticMarkup(<FlightInstruments />)).not.toContain("32000");
  });
  it("does not bridge an invalid altitude sample", () => {
    const html = renderToStaticMarkup(<FlightProfile points={[{ id: "a", x: 0, altitude: 0 },
      { id: "gap", x: 1, altitude: NaN }, { id: "b", x: 2, altitude: 100 }]} />);
    const path = html.match(/data-flight-profile="true" d="([^"]+)"/)?.[1];
    expect(path?.match(/M/g)).toHaveLength(2);
    expect(html).toContain("1 échantillon(s)");
  });
  it("publishes every new component to MCP with props, examples and honest semantics", () => {
    const keys = ["celestialBody", "celestialScene", "orbitalSystem", "solarSystem", "galaxyView", "moonPhase",
      "aircraftMarker", "flightMap", "flightInstruments", "flightProfile", "airportBoard", "seatMap"];
    for (const key of keys) {
      const entry = registry.components.find(c => c.name === `bpm.${key}`);
      expect(entry, key).toBeDefined();
      expect(entry?.props, key).toBeTruthy();
      expect(entry?.example, key).toContain(`bpm.${key}`);
      expect(entry?.semantics?.status, key).toBe("proposed");
    }
  });
});
