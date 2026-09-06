"use client";
import React from "react";
import { SceneFrame, sceneControl } from "./scene-ui";

export interface CabinSeat {
  id: string;
  label: string;
  status?: "available" | "occupied" | "blocked";
  cabin?: string;
  description?: string;
}
export interface CabinRow {
  id: string;
  label: string;
  /** Null entries represent aisles or deliberate empty spaces. */
  seats: (CabinSeat | null)[];
  exit?: boolean;
}
export interface SeatMapProps {
  rows?: CabinRow[];
  selectedSeatIds?: string[];
  defaultSelectedSeatIds?: string[];
  onSelectionChange?: (ids: string[], seat: CabinSeat) => void;
  multiple?: boolean;
  title?: string;
  /** Custom seat content, inside the existing accessible button. */
  renderSeat?: (seat: CabinSeat, selected: boolean) => React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * @component bpm.seatMap
 * @description Plan de cabine d'avion configurable : rangées libres, couloirs, classes, issues et sièges disponibles/occupés/bloqués, sélection simple ou multiple et rendu de siège personnalisable.
 * @param {object} props - rows définit la géométrie ; null crée un couloir ; la sélection émet une intention sans réserver le siège.
 * @example bpm.seatMap({ rows: [{ id: "1", label: "1", seats: [{ id: "1A", label: "1A" }, null, { id: "1C", label: "1C", status: "occupied" }] }] })
 * @associated bpm.airportBoard, bpm.flightMap, bpm.card
 */
export function SeatMap({ rows = [], selectedSeatIds, defaultSelectedSeatIds = [], onSelectionChange,
  multiple = false, title = "Plan de cabine", renderSeat, children, className }: SeatMapProps) {
  const [localIds, setIds] = React.useState(defaultSelectedSeatIds);
  const input = Array.isArray(rows) ? rows : [];
  const rowIds = new Set<string>(), seatIds = new Set<string>();
  let rejectedSeats = 0;
  const valid = input.flatMap(row => {
    if (!row || typeof row.id !== "string" || !row.id || typeof row.label !== "string" || !Array.isArray(row.seats) || rowIds.has(row.id)) return [];
    rowIds.add(row.id);
    return [{ ...row, seats: row.seats.map(seat => {
      if (seat === null) return null;
      if (!seat || typeof seat.id !== "string" || !seat.id || seatIds.has(seat.id) || typeof seat.label !== "string" ||
        (seat.status !== undefined && !["available", "occupied", "blocked"].includes(seat.status))) { rejectedSeats++; return null; }
      seatIds.add(seat.id); return seat;
    }) }];
  });
  const seats = valid.flatMap(row => row.seats.filter((seat): seat is CabinSeat => !!seat));
  const rawSelected = selectedSeatIds === undefined ? localIds : selectedSeatIds;
  const selected = new Set((Array.isArray(rawSelected) ? rawSelected : []).filter(id => seats.some(seat => seat.id === id && (!seat.status || seat.status === "available"))));
  const choose = (seat: CabinSeat) => {
    if (seat.status === "occupied" || seat.status === "blocked") return;
    const next = selected.has(seat.id) ? [...selected].filter(id => id !== seat.id) : multiple ? [...selected, seat.id] : [seat.id];
    setIds(next); onSelectionChange?.(next, seat);
  };
  const columns = Math.max(1, ...valid.map(row => row.seats.length));
  return <SceneFrame title={title} subtitle="Sélection de sièges · disposition fournie" className={className} footer={<>
    <div role="status">{selected.size ? `Siège(s) sélectionné(s) : ${seats.filter(seat => selected.has(seat.id)).map(seat => seat.label).join(", ")}` : "Aucun siège sélectionné."}</div>
    <div>Disponible · ✓ Sélectionné · × Occupé · − Bloqué</div>
    {(valid.length < input.length || rejectedSeats > 0) && <div role="status">{input.length - valid.length} rangée(s) et {rejectedSeats} siège(s) invalides ou dupliqués.</div>}
    {children}
  </>}>
    <div role="region" aria-label="Cabine défilable horizontalement" tabIndex={0} style={{ overflowX: "auto", padding: "0 18px 18px", WebkitOverflowScrolling: "touch" }}>
      <div style={{ minWidth: Math.max(220, columns * 52 + 48), maxWidth: Math.max(300, columns * 62 + 48), margin: "0 auto" }}>
        <div style={{ textAlign: "center", border: "1px solid var(--bpm-border, #334155)", borderRadius: "100% 100% 0 0", padding: "24px 0 18px", color: "var(--bpm-text-secondary, #94a3b8)", fontSize: 11 }}>AVANT DE LA CABINE</div>
        {valid.map(row => <div key={row.id}>
          {row.exit && <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 4px 4px", color: "var(--bpm-accent, #2fa989)", fontSize: 11 }}><span>← ISSUE</span><span>ISSUE →</span></div>}
          <div style={{ display: "grid", gridTemplateColumns: `32px repeat(${columns}, minmax(44px, 1fr))`, gap: 8, paddingTop: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--bpm-text-secondary, #94a3b8)" }}>{row.label}</span>
            {Array.from({ length: columns }, (_, index) => {
              const seat = row.seats[index];
              if (!seat) return <span key={`aisle-${index}`} aria-hidden="true" />;
              const active = selected.has(seat.id), unavailable = seat.status === "occupied" || seat.status === "blocked";
              return <button key={seat.id} type="button" aria-label={`Siège ${seat.label}${seat.cabin ? `, ${seat.cabin}` : ""}, ${seat.status === "occupied" ? "occupé" : seat.status === "blocked" ? "bloqué" : "disponible"}`}
                aria-pressed={active} disabled={unavailable} title={seat.description} onClick={() => choose(seat)} style={{ ...sceneControl, padding: "8px 3px", minHeight: 48,
                  background: active ? "var(--bpm-accent, #3a8bab)" : unavailable ? "var(--bpm-bg, #172333)" : "var(--bpm-surface, #0f172a)",
                  color: active ? "var(--bpm-accent-contrast, #fff)" : "var(--bpm-text-primary, #e2e8f0)", cursor: unavailable ? "not-allowed" : "pointer" }}>
                {renderSeat ? renderSeat(seat, active) : <><span style={{ fontSize: 12 }}>{seat.label}</span><span aria-hidden="true" style={{ display: "block", fontSize: 11 }}>{active ? "✓" : seat.status === "occupied" ? "×" : seat.status === "blocked" ? "−" : "·"}</span></>}
              </button>;
            })}
          </div>
        </div>)}
        {seats.length === 0 && <p>Aucun siège configuré.</p>}
      </div>
    </div>
  </SceneFrame>;
}
