"use client";
import React from "react";
import { AircraftMarker } from "./AircraftMarker";
import type { AircraftMarkerProps } from "./AircraftMarker";
import { SceneFrame, sceneControl } from "./scene-ui";
import { geoPath, greatCircle, numberOr, projectGeo, validGeo, clamp } from "./spatial";
import type { GeoPosition } from "./spatial";

export interface FlightPosition extends GeoPosition {
  id: string;
  label: string;
  heading?: number;
  kind?: AircraftMarkerProps["kind"];
  color?: string;
  trail?: GeoPosition[];
  description?: string;
}
export interface AirportPosition extends GeoPosition { id: string; code: string; label?: string }
export interface FlightRoute {
  id: string;
  label?: string;
  from: GeoPosition;
  to: GeoPosition;
  /** Optional actual route. Without it, draws an indicative shortest great-circle arc. */
  points?: GeoPosition[];
  color?: string;
}
export interface FlightMapProps {
  flights?: FlightPosition[];
  airports?: AirportPosition[];
  routes?: FlightRoute[];
  /** Optional geographic boundaries, latitude/longitude in degrees. */
  boundaries?: GeoPosition[][];
  title?: string;
  caption?: string;
  height?: number | string;
  selectedFlightId?: string | null;
  onFlightSelect?: (flight: FlightPosition) => void;
  onAirportSelect?: (airport: AirportPosition) => void;
  renderAircraft?: (flight: FlightPosition) => React.ReactNode;
  renderOverlay?: (project: typeof projectGeo) => React.ReactNode;
  renderDetails?: (flight: FlightPosition) => React.ReactNode;
  className?: string;
}

/**
 * @component bpm.flightMap
 * @description Carte aérienne hors ligne en latitude/longitude : avions orientés, aéroports, routes orthodromiques, traces, sélection et calques libres. Affiche les données fournies, sans trafic temps réel implicite.
 * @param {object} props - flights, airports et routes utilisent lat/lon en degrés ; fonds géographiques et renderers optionnels.
 * @example bpm.flightMap({ flights: [{ id: "demo", label: "Vol de démonstration", lat: 48, lon: 4, heading: 80 }], airports: [{ id: "cdg", code: "CDG", lat: 49.01, lon: 2.55 }] })
 * @associated bpm.aircraftMarker, bpm.flightInstruments, bpm.flightProfile, bpm.airportBoard
 */
export function FlightMap({ flights = [], airports = [], routes = [], boundaries = [], title = "Carte des vols",
  caption = "Positions fournies · routes indicatives en l’absence de trajectoire · projection équirectangulaire",
  height = 440, selectedFlightId, onFlightSelect, onAirportSelect, renderAircraft, renderOverlay, renderDetails, className }: FlightMapProps) {
  const [localId, setLocalId] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const selectId = React.useId();
  const input = Array.isArray(flights) ? flights : [];
  const airportInput = Array.isArray(airports) ? airports : [];
  const routeInput = Array.isArray(routes) ? routes : [];
  const flightIds = new Set<string>(), airportIds = new Set<string>();
  const placed = input.filter(f => {
    if (!validGeo(f) || typeof f.id !== "string" || !f.id || typeof f.label !== "string" || flightIds.has(f.id)) return false;
    flightIds.add(f.id); return true;
  });
  const ports = airportInput.filter(a => {
    if (!validGeo(a) || typeof a.id !== "string" || !a.id || typeof a.code !== "string" || airportIds.has(a.id)) return false;
    airportIds.add(a.id); return true;
  });
  const routePaths = routeInput.flatMap((r, index) => {
    if (!r || !validGeo(r.from) || !validGeo(r.to)) return [];
    const points = r.points === undefined ? greatCircle(r.from, r.to) : r.points;
    if (!Array.isArray(points) || points.length < 2 || !points.every(validGeo)) return [];
    return [{ route: r, index, path: geoPath(points) }];
  });
  const selected = placed.find(f => f.id === (selectedFlightId === undefined ? localId : selectedFlightId));
  const center = selected ? projectGeo(selected) : { x: 450, y: 225 };
  const width = 900 / zoom, viewHeight = 450 / zoom;
  const left = clamp(center.x - width / 2, 0, 900 - width), top = clamp(center.y - viewHeight / 2, 0, 450 - viewHeight);
  const choose = (flight: FlightPosition) => { setLocalId(flight.id); onFlightSelect?.(flight); };
  return <SceneFrame title={title} subtitle={caption} className={className} controls={<div style={{ display: "flex", gap: 6 }}>
    <button type="button" aria-label="Dézoomer la carte des vols" style={sceneControl} onClick={() => setZoom(z => Math.max(1, z / 1.5))}>−</button>
    <button type="button" aria-label="Zoomer sur le vol" style={sceneControl} onClick={() => setZoom(z => Math.min(6, z * 1.5))}>+</button>
    <button type="button" style={sceneControl} onClick={() => setZoom(1)}>Monde</button>
  </div>} footer={<>
    {placed.length > 0 && <label htmlFor={selectId} style={{ display: "grid", gap: 6 }}>Sélectionner un vol
      <select id={selectId} value={selected?.id ?? ""} style={sceneControl} onChange={event => { const flight = placed.find(f => f.id === event.target.value); if (flight) choose(flight); }}>
        <option value="">Choisir un aéronef</option>{placed.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
      </select></label>}
    {selected && <div role="status">{renderDetails ? renderDetails(selected) : <><strong>{selected.label}</strong> · {selected.lat.toFixed(3)}°, {selected.lon.toFixed(3)}°{selected.description && <p>{selected.description}</p>}</>}</div>}
    {input.length === 0 && <div>Aucun aéronef fourni.</div>}
    {(placed.length < input.length || ports.length < airportInput.length || routePaths.length < routeInput.length) && <div role="status">
      {input.length - placed.length} aéronef(s), {airportInput.length - ports.length} aéroport(s), {routeInput.length - routePaths.length} route(s) non affiché(s) : données invalides ou arc antipodal indéterminé.
    </div>}
  </>}>
    <svg viewBox={`${left} ${top} ${width} ${viewHeight}`} aria-label="Positions géographiques des vols" role="group"
      style={{ width: "100%", height, minHeight: 230, maxHeight: "75svh", display: "block", background: "#071321", touchAction: "pan-y" }}>
      <defs><radialGradient id={`${selectId}-bg`}><stop stopColor="#163446" /><stop offset="1" stopColor="#071321" /></radialGradient></defs>
      <rect width="900" height="450" fill={`url(#${selectId}-bg)`} />
      <g stroke="#3a6174" strokeWidth="0.65" opacity="0.55" fill="none" aria-hidden="true">
        {Array.from({ length: 13 }, (_, i) => <path key={`lon${i}`} d={`M${i * 75} 0 V450`} />)}
        {Array.from({ length: 7 }, (_, i) => <path key={`lat${i}`} d={`M0 ${i * 75} H900`} />)}
        {(Array.isArray(boundaries) ? boundaries : []).filter(Array.isArray).map((line, i) => <path key={`boundary${i}`} d={geoPath(line)} stroke="#82a3ae" strokeWidth="1.2" />)}
      </g>
      <g fill="#83a0b1" fontSize="11" aria-hidden="true">{[-120, -60, 0, 60, 120].map(lon => <text key={lon} x={projectGeo({ lat: 0, lon }).x + 4} y="443">{lon}°</text>)}</g>
      <g fill="none" strokeWidth="1.8">{routePaths.map(({ route, path, index }) => <path key={`${route.id}-${index}`} data-flight-route={route.id}
        d={path} stroke={route.color ?? "#69cdda"} strokeDasharray="5 5"><title>{route.label ?? "Route indicative"}</title></path>)}</g>
      {ports.map(airport => { const p = projectGeo(airport); return <g key={airport.id} transform={`translate(${p.x} ${p.y})`}
        role={onAirportSelect ? "button" : undefined} tabIndex={onAirportSelect ? 0 : undefined} aria-label={airport.label ?? airport.code}
        onClick={() => onAirportSelect?.(airport)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onAirportSelect?.(airport); } }}>
        <circle r="15" fill="transparent" /><circle r="3" fill="#d7e9eb" /><text x="7" y="-6" fontSize="11" fill="#c4dde5">{airport.code}</text>
      </g>; })}
      {placed.map(flight => { const p = projectGeo(flight); return <g key={flight.id}>
        {Array.isArray(flight.trail) && <path d={geoPath(flight.trail)} fill="none" stroke={flight.color ?? "#f3bf75"} opacity="0.6" strokeWidth="1.5" />}
        <g transform={`translate(${p.x} ${p.y})`} data-aircraft={flight.id} role="button" tabIndex={0} aria-label={flight.label}
          aria-pressed={selected?.id === flight.id} onClick={() => choose(flight)} style={{ cursor: "pointer" }}
          onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(flight); } }}>
          <circle r="20" fill="transparent" />{selected?.id === flight.id && <circle r="19" fill="none" stroke={flight.color ?? "#80d9ff"} />}
          {renderAircraft ? renderAircraft(flight) : <g transform="translate(-13 -13)"><AircraftMarker size={26} heading={numberOr(flight.heading, 0)} kind={flight.kind} color={flight.color} label={flight.label} /></g>}
          <text x="18" y="5" fill="#dcecf6" fontSize="12" paintOrder="stroke" stroke="#071321" strokeWidth="3">{flight.label}</text>
        </g>
      </g>; })}
      {renderOverlay?.(projectGeo)}
    </svg>
  </SceneFrame>;
}
