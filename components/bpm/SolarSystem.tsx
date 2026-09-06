"use client";
import React from "react";
import { OrbitalSystem } from "./OrbitalSystem";
import type { OrbitalBody, OrbitalSystemProps } from "./OrbitalSystem";

export interface SolarSystemProps {
  /** Replace the entire preset, including its star, for complete creative freedom. */
  bodies?: OrbitalBody[];
  /** Schematic spacing is readable on mobile; relative spacing uses AU ratios. */
  distanceScale?: "schematic" | "relative";
  region?: "all" | "inner";
  title?: string;
  time?: number;
  onTimeChange?: (time: number) => void;
  /** Playback, camera, renderer and overlay customization. */
  options?: Omit<OrbitalSystemProps, "bodies" | "title" | "time" | "onTimeChange">;
  className?: string;
}

/** Approximate a/e/i from JPL's J2000 table. The displayed phases are ARTISTIC.
 * Periods follow a^(3/2); radii are symbolic, so this is not a dated ephemeris.
 * https://ssd.jpl.nasa.gov/planets/approx_pos.html
 */
export function createSolarSystemBodies(distanceScale: "schematic" | "relative" = "schematic", region: "all" | "inner" = "all"): OrbitalBody[] {
  const planets: [string, string, number, number, number, string, number][] = [
    ["mercury", "Mercure", 0.3871, 0.2056, 7.005, "#adaca9", 4],
    ["venus", "Vénus", 0.7233, 0.0068, 3.395, "#efc58e", 7],
    ["earth", "Terre", 1, 0.0167, 0, "#64baff", 8],
    ["mars", "Mars", 1.5237, 0.0934, 1.85, "#e58064", 6],
    ["jupiter", "Jupiter", 5.2029, 0.0484, 1.304, "#e0ba98", 15],
    ["saturn", "Saturne", 9.5367, 0.0539, 2.486, "#dfc487", 12],
    ["uranus", "Uranus", 19.1892, 0.0473, 0.773, "#89d7df", 9],
    ["neptune", "Neptune", 30.0699, 0.0086, 1.77, "#7298ee", 9],
  ];
  return [{ id: "sun", label: "Soleil", kind: "star", color: "#ffbc66", radius: 17 },
    ...planets.slice(0, region === "inner" ? 4 : 8).map(([id, label, a, e, i, color, radius], index) => ({
      id, label, parentId: "sun", kind: "planet" as const, color, radius, rings: id === "saturn",
      description: `Demi-grand axe ≈ ${a} UA. Position illustrative, sans date astronomique.`,
      orbit: { semiMajorAxis: distanceScale === "relative" ? a : 22 + index * 12, eccentricity: e,
        period: 365.25 * Math.pow(a, 1.5), inclination: i, phase: 25 + index * 127 },
    }))];
}

/**
 * @component bpm.solarSystem
 * @description Système solaire prêt à composer avec Soleil et huit planètes, vue interne, distances schématiques ou relatives et remplacement complet des corps ; préréglage illustratif, sans positions astronomiques en temps réel.
 * @param {object} props - bodies remplace le préréglage ; options ouvre les paramètres orbitaux et tous les hooks de la scène.
 * @example bpm.solarSystem({ distanceScale: "schematic", options: { speed: 40, scene: { height: 520, camera: { elevation: 40, azimuth: -20 } } } })
 * @associated bpm.orbitalSystem, bpm.galaxyView, bpm.moonPhase
 */
export function SolarSystem({ bodies, distanceScale = "schematic", region = "all", title = "Système solaire",
  time, onTimeChange, options = {}, className }: SolarSystemProps) {
  const preset = React.useMemo(() => createSolarSystemBodies(distanceScale, region), [distanceScale, region]);
  const extent = distanceScale === "relative" ? (region === "inner" ? 1.9 : 34) : (region === "inner" ? 74 : 125);
  return <OrbitalSystem {...options} bodies={bodies ?? preset} title={title} time={time} onTimeChange={onTimeChange}
    className={className ?? options.className} scene={{ extent,
      caption: `${distanceScale === "relative" ? "Distances relatives en UA" : "Distances schématiques"} · tailles symboliques · positions illustratives`,
      ...options.scene }} />;
}
