"use client";
import React from "react";
import { SceneFrame, sceneControl } from "./scene-ui";
import { finite, clamp } from "./spatial";

export interface FlightProfilePoint {
  id: string;
  /** Time, distance or another numeric abscissa in xUnit. */
  x: number;
  altitude: number;
  label?: string;
}
export interface FlightProfileProps {
  points?: FlightProfilePoint[];
  title?: string;
  xLabel?: string;
  xUnit?: string;
  altitudeUnit?: string;
  color?: string;
  selectedId?: string | null;
  onPointSelect?: (point: FlightProfilePoint) => void;
  /** Optional horizontal reference in altitudeUnit. */
  referenceAltitude?: number;
  className?: string;
}

/**
 * @component bpm.flightProfile
 * @description Profil de vol altitude/temps ou altitude/distance, points sélectionnables et altitude de référence. Conserve les ruptures de télémétrie au lieu de les interpoler.
 * @param {object} props - points en ordre croissant de x ; xUnit et altitudeUnit définissent les unités affichées.
 * @example bpm.flightProfile({ xUnit: "min", points: [{ id: "takeoff", label: "Décollage", x: 0, altitude: 0 }, { id: "cruise", label: "Croisière", x: 25, altitude: 32000 }, { id: "landing", label: "Atterrissage", x: 90, altitude: 0 }] })
 * @associated bpm.flightMap, bpm.flightInstruments, bpm.timeline
 */
export function FlightProfile({ points = [], title = "Profil de vol", xLabel = "Temps", xUnit = "min", altitudeUnit = "ft",
  color = "#77cfe6", selectedId, onPointSelect, referenceAltitude, className }: FlightProfileProps) {
  const selectId = React.useId();
  const [localId, setId] = React.useState<string | null>(null);
  const input = Array.isArray(points) ? points : [];
  const ids = new Set<string>();
  const valid: { point: FlightProfilePoint; index: number }[] = [];
  for (const [index, p] of input.entries()) {
    const last = valid[valid.length - 1]?.point.x ?? -Infinity;
    if (!p || typeof p.id !== "string" || !p.id || ids.has(p.id) || !finite(p.x) || !finite(p.altitude) || p.x < last) continue;
    ids.add(p.id); valid.push({ point: p, index });
  }
  const xs = valid.map(({ point }) => point.x), ys = valid.map(({ point }) => point.altitude);
  const xmin = xs.length ? Math.min(...xs) : 0, xmax = xs.length ? Math.max(...xs) : 1;
  if (finite(referenceAltitude)) ys.push(referenceAltitude);
  const ymin = ys.length ? Math.min(0, ...ys) : 0, ymax = ys.length ? Math.max(1, ...ys) : 1;
  const project = (p: FlightProfilePoint) => ({ x: 78 + (p.x - xmin) / (xmax > xmin ? xmax - xmin : 1) * 650,
    y: 245 - (p.altitude - ymin) / Math.max(1, ymax - ymin) * 205 });
  const path = valid.map(({ point, index }, i) => { const p = project(point);
    return `${i === 0 || valid[i - 1].index !== index - 1 ? "M" : "L"}${p.x},${p.y}`;
  }).join(" ");
  const selected = valid.find(({ point }) => point.id === (selectedId === undefined ? localId : selectedId))?.point;
  const choose = (p: FlightProfilePoint) => { setId(p.id); onPointSelect?.(p); };
  return <SceneFrame title={title} subtitle={`Altitude (${altitudeUnit}) · ${xLabel.toLowerCase()} (${xUnit})`} className={className} footer={<>
    {valid.length > 0 && <label htmlFor={selectId} style={{ display: "grid", gap: 6 }}>Explorer le profil
      <select id={selectId} value={selected?.id ?? ""} style={sceneControl} onChange={event => {
        const item = valid.find(({ point }) => point.id === event.target.value); if (item) choose(item.point);
      }}><option value="">Choisir un point</option>{valid.map(({ point }) => <option key={point.id} value={point.id}>{point.label ?? point.id}</option>)}</select>
    </label>}
    {selected && <div role="status">{selected.label ?? selected.id} · {selected.x} {xUnit} · {selected.altitude} {altitudeUnit}</div>}
    {valid.length === 0 && <div>Aucun profil de vol disponible.</div>}
    {input.length > valid.length && <div role="status">{input.length - valid.length} échantillon(s) invalide(s), dupliqué(s) ou hors ordre ; courbe interrompue.</div>}
  </>}>
    <svg role="group" aria-label={title} viewBox="0 0 780 300" style={{ display: "block", width: "100%", minHeight: 200 }}>
      {[0, 1, 2, 3, 4].map(i => { const y = 245 - i * 205 / 4; return <g key={i}>
        <path d={`M78 ${y} H728`} stroke="var(--bpm-border, #334155)" strokeDasharray="3 5" />
        <text x="65" y={y + 4} textAnchor="end" fill="var(--bpm-text-secondary, #94a3b8)" fontSize="12">{Math.round(ymin + i * (ymax - ymin) / 4)}</text>
      </g>; })}
      <text x="78" y="274" fill="var(--bpm-text-secondary, #94a3b8)" fontSize="12">{xmin} {xUnit}</text>
      <text x="728" y="274" textAnchor="end" fill="var(--bpm-text-secondary, #94a3b8)" fontSize="12">{xmax} {xUnit}</text>
      {finite(referenceAltitude) && <path d={`M78 ${clamp(project({ id: "ref", x: xmin, altitude: referenceAltitude }).y, 40, 245)} H728`}
        stroke="#e7b775" strokeWidth="1.5" strokeDasharray="6 5"><title>Référence : {referenceAltitude} {altitudeUnit}</title></path>}
      <path data-flight-profile="true" d={path} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
      {valid.map(({ point }) => { const p = project(point); return <g key={point.id} transform={`translate(${p.x} ${p.y})`} role="button" tabIndex={0}
        aria-label={`${point.label ?? point.id}, ${point.altitude} ${altitudeUnit}`} aria-pressed={selected?.id === point.id}
        onClick={() => choose(point)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(point); } }} style={{ cursor: "pointer" }}>
        <circle r="18" fill="transparent" /><circle r={selected?.id === point.id ? 7 : 4} fill={color} stroke="var(--bpm-surface, #0f172a)" strokeWidth="2" />
      </g>; })}
    </svg>
  </SceneFrame>;
}
