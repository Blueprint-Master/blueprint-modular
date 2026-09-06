"use client";
import React from "react";
import { CelestialScene } from "./CelestialScene";
import type { CelestialObject, CelestialPath, CelestialSceneProps } from "./CelestialScene";
import { sceneControl, useSceneClock } from "./scene-ui";
import { finite, isPoint, numberOr, orbitalPosition, validOrbit } from "./spatial";
import type { OrbitalElements, SpatialPoint } from "./spatial";

export interface OrbitalBody extends Omit<CelestialObject, "x" | "y" | "z"> {
  /** Stable parent ID; moons may orbit planets, which may orbit stars. */
  parentId?: string;
  position?: SpatialPoint;
  orbit?: OrbitalElements;
}
export interface OrbitalSystemProps {
  bodies?: OrbitalBody[];
  /** Controlled model time. No wall clock or actual date is implied. */
  time?: number;
  defaultTime?: number;
  onTimeChange?: (time: number) => void;
  /** Model time units per real second when the user presses Play. */
  speed?: number;
  showOrbits?: boolean;
  showPlayback?: boolean;
  title?: string;
  /** All scene customization hooks, camera, selection, particles and overlays. */
  scene?: Omit<CelestialSceneProps, "objects" | "paths" | "title">;
  className?: string;
}

/** Resolve the entire parent graph before rendering. Orphans and cycles are reported. */
export function resolveOrbitalSystem(bodies: OrbitalBody[], time: number): {
  objects: CelestialObject[]; paths: CelestialPath[]; rejected: number;
} {
  const input = Array.isArray(bodies) ? bodies : [];
  const byId = new Map<string, OrbitalBody>();
  const duplicated = new Set<string>();
  for (const body of input) {
    if (!body || typeof body.id !== "string" || !body.id || typeof body.label !== "string") continue;
    if (byId.has(body.id)) duplicated.add(body.id);
    byId.set(body.id, body);
  }
  const resolved = new Map<string, SpatialPoint | null>();
  const visiting = new Set<string>();
  const locate = (id: string, depth = 0): SpatialPoint | null => {
    if (resolved.has(id)) return resolved.get(id) ?? null;
    const body = byId.get(id);
    if (!body || duplicated.has(id) || visiting.has(id) || depth > 64) return null;
    visiting.add(id);
    const parent = body.parentId ? locate(body.parentId, depth + 1) : { x: 0, y: 0, z: 0 };
    const local = body.orbit ? orbitalPosition(body.orbit, time) : (body.position ?? { x: 0, y: 0, z: 0 });
    const position = parent && isPoint(local) ? { x: parent.x + local.x, y: parent.y + local.y, z: (parent.z ?? 0) + (local.z ?? 0) } : null;
    const valid = position && isPoint(position) ? position : null;
    visiting.delete(id); resolved.set(id, valid); return valid;
  };
  const objects: CelestialObject[] = [], paths: CelestialPath[] = [];
  for (const body of byId.values()) {
    const position = locate(body.id);
    if (!position) continue;
    objects.push({ ...body, ...position });
    if (validOrbit(body.orbit)) {
      const orbit = body.orbit;
      const parent = body.parentId ? locate(body.parentId) : { x: 0, y: 0, z: 0 };
      if (!parent) continue;
      const points = Array.from({ length: 129 }, (_, n) => {
        const p = orbitalPosition(orbit, orbit.period * n / 128)!;
        return { x: p.x + parent.x, y: p.y + parent.y, z: (p.z ?? 0) + (parent.z ?? 0) };
      });
      paths.push({ id: `orbit-${body.id}`, points, color: body.color });
    }
  }
  return { objects, paths, rejected: input.length - objects.length };
}

/**
 * @component bpm.orbitalSystem
 * @description Système orbital configurable avec hiérarchie parent/enfant, orbites elliptiques de Kepler, satellites, contrôle temporel et personnalisation intégrale de la scène ; fonctionne aussi pour des systèmes fictifs.
 * @param {object} props - bodies définit les objets et leurs orbites ; time est un temps de modèle, pas une éphéméride.
 * @example bpm.orbitalSystem({ bodies: [{ id: "star", label: "Étoile", kind: "star", color: "#ffc778" }, { id: "planet", label: "Planète", parentId: "star", orbit: { semiMajorAxis: 70, period: 30, eccentricity: 0.2 } }] })
 * @associated bpm.celestialScene, bpm.solarSystem, bpm.celestialBody
 */
export function OrbitalSystem({ bodies = [], time, defaultTime = 0, onTimeChange, speed = 12,
  showOrbits = true, showPlayback = true, title = "Système orbital", scene = {}, className }: OrbitalSystemProps) {
  const initial = numberOr(defaultTime, 0);
  const clock = useSceneClock(initial, numberOr(speed, 12), onTimeChange);
  const current = finite(time) ? time : clock.time;
  const { objects, paths, rejected } = React.useMemo(() => resolveOrbitalSystem(bodies, current), [bodies, current]);
  const controlled = time !== undefined;
  return <CelestialScene {...scene} className={className ?? scene.className} title={title} objects={objects}
    paths={showOrbits ? paths : []}>
    {rejected > 0 && <div role="status">{rejected} corps non affiché(s) : orbite, coordonnées ou hiérarchie invalide (parent absent, doublon ou cycle).</div>}
    {showPlayback && <div role="group" aria-label="Temps du système" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      {!controlled && <button type="button" style={sceneControl} aria-pressed={clock.playing} onClick={() => clock.setPlaying(!clock.playing)}>{clock.playing ? "Pause" : "Animer"}</button>}
      <button type="button" style={sceneControl} disabled={controlled && !onTimeChange} onClick={() => {
        clock.setPlaying(false); clock.setTime(initial); onTimeChange?.(initial);
      }}>Réinitialiser</button>
      <label style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>Temps du modèle
        <input aria-label="Temps du modèle" type="number" step="any" value={Math.round(current * 100) / 100}
          disabled={controlled && !onTimeChange} style={{ ...sceneControl, width: 130 }} onChange={event => {
            const next = event.target.valueAsNumber;
            if (finite(next)) { clock.setPlaying(false); clock.setTime(next); onTimeChange?.(next); }
          }} />
      </label>
    </div>}
    {scene.children}
  </CelestialScene>;
}
