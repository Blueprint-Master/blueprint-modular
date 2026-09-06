"use client";
import React from "react";
import { CelestialScene } from "./CelestialScene";
import type { CelestialObject, CelestialParticle, CelestialSceneProps } from "./CelestialScene";
import { clamp, numberOr, seededRandom } from "./spatial";

export interface GalaxyViewProps {
  morphology?: "spiral" | "barred" | "elliptical" | "irregular";
  arms?: number;
  /** Capped at 4,000 particles for mobile SVG rendering. */
  starCount?: number;
  radius?: number;
  twist?: number;
  thickness?: number;
  seed?: number;
  palette?: string[];
  /** Actual or fictional objects supplied by the caller, in scene units. */
  landmarks?: CelestialObject[];
  title?: string;
  scene?: Omit<CelestialSceneProps, "objects" | "particles" | "title" | "seed">;
  className?: string;
}

export function createGalaxyParticles({ morphology = "barred", arms = 4, starCount = 1800, radius = 100,
  twist = 3.8, thickness = 6, seed = 42, palette = ["#91bcff", "#dbe6ff", "#e9c497"] }: GalaxyViewProps = {}): CelestialParticle[] {
  const random = seededRandom(seed);
  const count = Math.round(clamp(numberOr(starCount, 1800), 0, 4000));
  const armCount = Math.round(clamp(numberOr(arms, 4), 1, 12));
  const size = clamp(numberOr(radius, 100), 1, 10000);
  const spread = clamp(numberOr(thickness, 6), 0, size);
  const colors = Array.isArray(palette) && palette.length ? palette : ["#bcd5ff"];
  return Array.from({ length: count }, (_, n) => {
    const r = Math.pow(random(), 0.7) * size;
    const core = n % 5 === 0;
    const angle = morphology === "elliptical" || morphology === "irregular" || core ? random() * Math.PI * 2 :
      (n % armCount) / armCount * Math.PI * 2 + Math.pow(r / size, 0.6) * numberOr(twist, 3.8) + (random() - 0.5) * 0.32;
    let x = Math.cos(angle) * r, y = Math.sin(angle) * r;
    if (core) { x *= 0.24; y *= morphology === "barred" ? 0.07 : 0.24; }
    if (morphology === "elliptical") y *= 0.64;
    if (morphology === "barred" && !core) x += (x >= 0 ? 1 : -1) * size * 0.12 * (1 - r / size);
    if (morphology === "irregular") { x += Math.sin(y / size * 7) * size * 0.2; y *= 0.7 + random() * 0.7; }
    return { x, y, z: (random() - 0.5) * spread * (1 - r / size), radius: 0.3 + random() * (core ? 1.8 : 1.1),
      color: colors[core ? colors.length - 1 : Math.floor(random() * colors.length)], opacity: 0.3 + random() * 0.7 };
  });
}

/**
 * @component bpm.galaxyView
 * @description Galaxie procédurale déterministe : Voie lactée stylisée, spirale, spirale barrée, elliptique ou irrégulière ; bras, densité, palette, repères et couches libres personnalisables. Distribution illustrative, sans catalogue stellaire mesuré.
 * @param {object} props - Paramètres de morphologie et seed stable ; landmarks et scene ouvrent la composition.
 * @example bpm.galaxyView({ title: "Voie lactée · vue artistique", morphology: "barred", arms: 4, seed: 42, landmarks: [{ id: "sun", label: "Repère solaire illustratif", x: 55, y: -20, radius: 4, color: "#ffd58b" }] })
 * @associated bpm.celestialScene, bpm.solarSystem, bpm.skyMap
 */
export function GalaxyView({ morphology = "barred", arms, starCount, radius = 100, twist, thickness,
  seed = 42, palette, landmarks = [], title = "Galaxie", scene = {}, className }: GalaxyViewProps) {
  const particles = React.useMemo(() => createGalaxyParticles({ morphology, arms, starCount, radius, twist, thickness, seed, palette }),
    [morphology, arms, starCount, radius, twist, thickness, seed, palette]);
  return <CelestialScene extent={numberOr(radius, 100) * 1.2} caption="Distribution stellaire illustrative · génération déterministe"
    {...scene} title={title} objects={landmarks} particles={particles} seed={seed} className={className ?? scene.className} />;
}
