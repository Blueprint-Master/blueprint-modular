"use client";
import React from "react";
import { CelestialBody } from "./CelestialBody";
import type { CelestialBodyProps } from "./CelestialBody";
import { SceneFrame, sceneControl } from "./scene-ui";
import { clamp, isPoint, numberOr, projectSpatial, seededRandom } from "./spatial";
import type { SpatialPoint, ProjectedPoint, SceneCamera } from "./spatial";

export interface CelestialObject extends SpatialPoint {
  id: string;
  label: string;
  /** Glyph radius in SVG pixels, independent of physical distances. */
  radius?: number;
  color?: string;
  kind?: CelestialBodyProps["kind"];
  rings?: boolean;
  description?: string;
}
export interface CelestialPath {
  id: string;
  points: SpatialPoint[];
  color?: string;
  dashed?: boolean;
}
export interface CelestialParticle extends SpatialPoint { radius?: number; color?: string; opacity?: number }
export interface CelestialRenderContext {
  project: (point: SpatialPoint) => ProjectedPoint;
  camera: SceneCamera;
  selectedId: string | null;
}
export interface CelestialSceneProps {
  /** Objects use one shared arbitrary Cartesian unit; labels/sizes are independently configurable. */
  objects?: CelestialObject[];
  paths?: CelestialPath[];
  /** Decorative particles, never represented as measured catalog stars. */
  particles?: CelestialParticle[];
  title?: string;
  caption?: string;
  height?: number | string;
  extent?: number;
  camera?: SceneCamera;
  onCameraChange?: (camera: SceneCamera) => void;
  selectedId?: string | null;
  onSelect?: (object: CelestialObject) => void;
  showLabels?: boolean;
  showControls?: boolean;
  background?: string;
  seed?: number;
  /** SVG glyph replacement, centered at 0,0. */
  renderObject?: (object: CelestialObject, selected: boolean) => React.ReactNode;
  /** Free SVG layer: reuse context.project for annotations, nebulae or custom geometry. */
  renderOverlay?: (context: CelestialRenderContext) => React.ReactNode;
  renderDetails?: (object: CelestialObject) => React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * @component bpm.celestialScene
 * @description Scène céleste composable en projection 3D orthographique : objets, trajectoires, particules, caméra, sélection et couches SVG libres pour nébuleuses, amas, constellations ou univers imaginaires.
 * @param {object} props - Données cartésiennes, caméra et renderObject/renderOverlay/renderDetails pour étendre le rendu.
 * @example bpm.celestialScene({ title: "Système binaire", objects: [{ id: "a", label: "Étoile A", x: -35, y: 0, kind: "star", color: "#ffc778" }, { id: "b", label: "Étoile B", x: 35, y: 0, kind: "star", color: "#85caff" }] })
 * @associated bpm.celestialBody, bpm.orbitalSystem, bpm.galaxyView, bpm.skyMap
 */
export function CelestialScene({ objects = [], paths = [], particles = [], title = "Scène céleste",
  caption = "Vue schématique · tailles des symboles indépendantes des distances", height = 460, extent = 100,
  camera, onCameraChange, selectedId, onSelect, showLabels = true, showControls = true,
  background = "#060c1c", seed = 7, renderObject, renderOverlay, renderDetails, children, className }: CelestialSceneProps) {
  const [localCamera, setCamera] = React.useState<SceneCamera>({ azimuth: 0, elevation: 30, zoom: 1 });
  const [localId, setId] = React.useState<string | null>(null);
  const selectId = React.useId();
  const activeCamera = camera ?? localCamera;
  const project = (point: SpatialPoint) => projectSpatial(point, activeCamera, extent);
  const input = Array.isArray(objects) ? objects : [];
  const ids = new Set<string>();
  const valid = input.filter(object => {
    if (!isPoint(object) || typeof object.id !== "string" || !object.id || typeof object.label !== "string" || ids.has(object.id)) return false;
    ids.add(object.id); return true;
  });
  const selected = valid.find(o => o.id === (selectedId === undefined ? localId : selectedId));
  const stars = React.useMemo(() => {
    const random = seededRandom(seed);
    return Array.from({ length: 100 }, () => ({ x: random() * 900, y: random() * 520, r: 0.3 + random() * 1.2, opacity: 0.15 + random() * 0.5 }));
  }, [seed]);
  const choose = (object: CelestialObject) => { setId(object.id); onSelect?.(object); };
  const change = (next: SceneCamera) => { setCamera(next); onCameraChange?.(next); };
  const control = (label: string, action: () => void, text: string) =>
    <button type="button" aria-label={label} onClick={action} style={sceneControl}>{text}</button>;
  const particleList = Array.isArray(particles) ? particles : [];
  const validParticles = particleList.filter((p): p is CelestialParticle => isPoint(p)).slice(0, 4000);
  const pathList = Array.isArray(paths) ? paths : [];
  const validPaths = pathList.filter(p => p && typeof p.id === "string" && Array.isArray(p.points) && p.points.length > 1 && p.points.every(isPoint));
  return <SceneFrame title={title} subtitle={caption} className={className} controls={showControls &&
    <div role="group" aria-label="Caméra céleste" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {control("Tourner à gauche", () => change({ ...activeCamera, azimuth: numberOr(activeCamera.azimuth, 0) - 15 }), "↶")}
      {control("Tourner à droite", () => change({ ...activeCamera, azimuth: numberOr(activeCamera.azimuth, 0) + 15 }), "↷")}
      {control("Vue de dessus", () => change({ ...activeCamera, elevation: 0 }), "Dessus")}
      {control("Vue inclinée", () => change({ ...activeCamera, elevation: 55 }), "Incliner")}
      {control("Dézoomer", () => change({ ...activeCamera, zoom: clamp(numberOr(activeCamera.zoom, 1) / 1.3, 0.25, 8) }), "−")}
      {control("Zoomer", () => change({ ...activeCamera, zoom: clamp(numberOr(activeCamera.zoom, 1) * 1.3, 0.25, 8) }), "+")}
    </div>}
    footer={<>
      {valid.length > 0 && <label htmlFor={selectId} style={{ display: "grid", gap: 6 }}>Explorer un objet
        <select id={selectId} value={selected?.id ?? ""} style={{ ...sceneControl, width: "100%" }} onChange={e => {
          const object = valid.find(o => o.id === e.target.value); if (object) choose(object);
        }}><option value="">Choisir un objet</option>{valid.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
      </label>}
      {selected && <div role="status">{renderDetails ? renderDetails(selected) : <><strong>{selected.label}</strong>{selected.description && <p>{selected.description}</p>}</>}</div>}
      {input.length > valid.length && <div role="status">{input.length - valid.length} objet(s) non affiché(s) : coordonnées ou identifiants invalides.</div>}
      {pathList.length > validPaths.length && <div role="status">{pathList.length - validPaths.length} trajectoire(s) invalide(s).</div>}
      {particleList.length > validParticles.length && <div role="status">{particleList.length - validParticles.length} particule(s) non affichée(s) : données invalides ou limite de 4 000.</div>}
      {valid.length === 0 && validParticles.length === 0 && <p>Aucun objet à afficher.</p>}{children}
    </>}>
    <svg viewBox="0 0 900 520" role="group" aria-label={title} style={{ display: "block", width: "100%", height,
      minHeight: 230, maxHeight: "75svh", background, touchAction: "pan-y" }}>
      <title>{title}</title>
      <g fill="#d5e5ff" aria-hidden="true">{stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.opacity} />)}</g>
      <g aria-hidden="true">{validParticles.map((p, i) => { const q = project(p); return <circle key={i} cx={q.x} cy={q.y}
        r={clamp(numberOr(p.radius, 1), 0.2, 20)} fill={p.color ?? "#bdd7ff"} opacity={clamp(numberOr(p.opacity, 0.7), 0, 1)} />; })}</g>
      <g fill="none" strokeWidth="1">{validPaths.map(path => <path key={path.id} data-celestial-path={path.id}
        d={path.points.map((p, i) => { const q = project(p); return `${i ? "L" : "M"}${q.x},${q.y}`; }).join(" ")}
        stroke={path.color ?? "#657ea9"} strokeOpacity="0.5" strokeDasharray={path.dashed ? "5 6" : undefined} />)}</g>
      {valid.map(object => ({ object, point: project(object) })).sort((a, b) => a.point.depth - b.point.depth).map(({ object, point }) => {
        const radius = clamp(numberOr(object.radius, 10), 2, 80), active = object.id === selected?.id;
        return <g key={object.id} transform={`translate(${point.x} ${point.y})`} data-celestial-object={object.id}
          role="button" tabIndex={0} aria-label={object.label} aria-pressed={active} onClick={() => choose(object)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(object); } }} style={{ cursor: "pointer" }}>
          <title>{object.label}</title><circle r={Math.max(22, radius)} fill="transparent" />
          {active && <circle r={radius + 8} fill="none" stroke={object.color ?? "#90c7ff"} strokeDasharray="3 4" />}
          {renderObject ? renderObject(object, active) : <g transform={`translate(${-radius * 1.7} ${-radius * 1.7})`}>
            <CelestialBody label={object.label} size={radius * 3.4} kind={object.kind} color={object.color} rings={object.rings} />
          </g>}
          {(showLabels || active) && <text y={radius + 23} textAnchor="middle" fill="#e5edff" fontSize="13" paintOrder="stroke" stroke={background} strokeWidth="3">{object.label}</text>}
        </g>;
      })}
      {renderOverlay?.({ project, camera: activeCamera, selectedId: selected?.id ?? null })}
    </svg>
  </SceneFrame>;
}
