"use client";
import React from "react";
import { clamp, numberOr, wrapDegrees } from "./spatial";

export interface AircraftMarkerProps {
  kind?: "jet" | "propeller" | "helicopter" | "drone";
  /** Heading in degrees clockwise from north; 0 points up. */
  heading?: number;
  size?: number;
  color?: string;
  label?: string;
  /** Custom SVG silhouette centered at 32,32 in a 64 × 64 viewBox. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * @component bpm.aircraftMarker
 * @description Symbole d'aéronef orientable : avion à réaction, avion à hélice, hélicoptère ou drone, couleur et silhouette SVG libres pour cartes et radars.
 * @param {object} props - heading en degrés depuis le nord ; children remplace la silhouette dans un repère 64 × 64.
 * @example bpm.aircraftMarker({ kind: "jet", heading: 45, color: "#80d9ff", label: "Avion sélectionné" })
 * @associated bpm.flightMap, bpm.flightInstruments
 */
export function AircraftMarker({ kind = "jet", heading = 0, size = 40, color = "#80d9ff", label = "Aéronef", children, className }: AircraftMarkerProps) {
  const dimension = clamp(numberOr(size, 40), 12, 512);
  return <svg role="img" aria-label={label} viewBox="0 0 64 64" width={dimension} height={dimension}
    className={className} style={{ display: "block", maxWidth: "100%" }}>
    <title>{label}</title><g transform={`rotate(${wrapDegrees(numberOr(heading, 0))} 32 32)`} fill={color}>
      {children ?? (kind === "helicopter" ? <><ellipse cx="32" cy="29" rx="8" ry="15" /><path d="M29 40 L30 59 L34 59 L35 40 Z M5 20 H59 V23 H5 Z M21 54 H43 V57 H21 Z" /></> :
        kind === "drone" ? <g fill="none" stroke={color} strokeWidth="3"><path d="M16 16 L48 48 M48 16 L16 48" />
          {[16, 48].flatMap(x => [16, 48].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="10" />))}<circle cx="32" cy="32" r="5" fill={color} /></g> :
        kind === "propeller" ? <><path d="M29 8 Q32 3 35 8 L36 25 L58 26 L58 32 L36 31 L35 49 L44 51 L44 56 L32 54 L20 56 L20 51 L29 49 L28 31 L6 32 L6 26 L28 25 Z" /><path d="M19 9 H45 V12 H19 Z" /></> :
          <path d="M29 7 Q32 1 35 7 L37 26 L58 40 L58 46 L37 39 L36 52 L44 58 L44 61 L32 57 L20 61 L20 58 L28 52 L27 39 L6 46 L6 40 L27 26 Z" />)}
    </g>
  </svg>;
}
