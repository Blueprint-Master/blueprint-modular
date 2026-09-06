"use client";
import React from "react";
import { SceneFrame, sceneControl } from "./scene-ui";

export interface AirportFlight {
  id: string;
  flightNumber: string;
  destination: string;
  /** Display string supplied with the intended airport timezone; no implicit conversion. */
  scheduledTime: string;
  expectedTime?: string;
  gate?: string;
  status?: string;
  statusColor?: string;
  airline?: string;
  direction?: "departure" | "arrival";
}
export interface AirportBoardProps {
  flights?: AirportFlight[];
  title?: string;
  timezoneLabel?: string;
  direction?: "all" | "departure" | "arrival";
  searchable?: boolean;
  onFlightSelect?: (flight: AirportFlight) => void;
  renderStatus?: (flight: AirportFlight) => React.ReactNode;
  className?: string;
}

/**
 * @component bpm.airportBoard
 * @description Tableau d'aéroport des départs et arrivées avec recherche, horaire prévu/estimé, porte, compagnie et statut libre ; données et fuseau horaire fournis par l'application.
 * @param {object} props - flights dans l'ordre d'affichage voulu ; renderStatus permet des états de vol propres au domaine.
 * @example bpm.airportBoard({ timezoneLabel: "Heure locale · Europe/Paris", flights: [{ id: "demo", flightNumber: "DEMO 42", destination: "Lisbonne", scheduledTime: "14:20", gate: "B12", status: "Embarquement", direction: "departure" }] })
 * @associated bpm.flightMap, bpm.seatMap, bpm.timeline
 */
export function AirportBoard({ flights = [], title = "Tableau des vols", timezoneLabel = "Horaires fournis",
  direction = "all", searchable = true, onFlightSelect, renderStatus, className }: AirportBoardProps) {
  const [query, setQuery] = React.useState("");
  const input = Array.isArray(flights) ? flights : [];
  const ids = new Set<string>();
  const valid = input.filter(f => {
    if (!f || typeof f.id !== "string" || !f.id || ids.has(f.id) || typeof f.flightNumber !== "string" ||
      typeof f.destination !== "string" || typeof f.scheduledTime !== "string") return false;
    ids.add(f.id); return true;
  });
  const matching = valid.filter(f => (direction === "all" || f.direction === direction) &&
    (!searchable || `${f.flightNumber} ${f.destination} ${f.airline ?? ""}`.toLowerCase().includes(query.toLowerCase())));
  const cells: React.CSSProperties = { padding: "14px 18px", textAlign: "left", borderBottom: "1px solid var(--bpm-border, #334155)" };
  return <SceneFrame title={title} subtitle={timezoneLabel} className={className} controls={searchable &&
    <input aria-label="Rechercher un vol" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Vol ou destination" style={{ ...sceneControl, width: 220 }} />}
    footer={input.length > valid.length ? <div role="status">{input.length - valid.length} vol(s) invalide(s) ou dupliqué(s).</div> : undefined}>
    <div tabIndex={0} role="region" aria-label="Tableau des vols défilable" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 590 }}>
        <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>{title}</caption>
        <thead><tr>{["Horaire", "Vol", "Destination / provenance", "Porte", "Statut"].map(label => <th key={label} scope="col" style={{ ...cells, fontSize: 11,
          letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--bpm-text-secondary, #94a3b8)" }}>{label}</th>)}</tr></thead>
        <tbody>{matching.map(flight => <tr key={flight.id}>
          <td style={{ ...cells, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{flight.scheduledTime}{flight.expectedTime && <div style={{ color: "#d7a653", fontSize: 12 }}>{flight.expectedTime}</div>}</td>
          <td style={cells}>{onFlightSelect ? <button type="button" style={sceneControl} onClick={() => onFlightSelect(flight)}>{flight.flightNumber}</button> : <strong>{flight.flightNumber}</strong>}
            {flight.airline && <div style={{ fontSize: 11, marginTop: 5 }}>{flight.airline}</div>}</td>
          <td style={cells}><span aria-label={flight.direction === "arrival" ? "Arrivée" : flight.direction === "departure" ? "Départ" : undefined}>
            {flight.direction === "arrival" ? "↘ " : flight.direction === "departure" ? "↗ " : ""}</span>{flight.destination}</td>
          <td style={cells}>{flight.gate ?? "—"}</td><td style={cells}>{renderStatus ? renderStatus(flight) : <span style={{ color: flight.statusColor ?? "var(--bpm-text-primary, #e2e8f0)" }}>{flight.status ?? "Non renseigné"}</span>}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {matching.length === 0 && <div role="status" style={{ padding: 20 }}>Aucun vol pour cette sélection.</div>}
  </SceneFrame>;
}
