"use client";
import React from "react";
import { SceneFrame } from "./scene-ui";
import { clamp, finite, numberOr, wrapDegrees } from "./spatial";

export interface FlightInstrumentsProps {
  /** Positive pitch = nose up; positive roll = bank right, in degrees. */
  pitch?: number;
  roll?: number;
  heading?: number;
  altitude?: number;
  airspeed?: number;
  verticalSpeed?: number;
  altitudeUnit?: string;
  speedUnit?: string;
  verticalSpeedUnit?: string;
  title?: string;
  /** Human-readable provenance/time supplied by the caller. */
  caption?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * @component bpm.flightInstruments
 * @description Instruments d'aviation : horizon artificiel, assiette, roulis, cap, altitude, vitesse et variomètre à partir de télémétrie fournie ; unités et panneaux complémentaires personnalisables.
 * @param {object} props - Angles en degrés ; valeurs et unités explicites, sans conversion implicite ni télémétrie simulée.
 * @example bpm.flightInstruments({ pitch: 8, roll: 15, heading: 82, altitude: 32000, airspeed: 280, verticalSpeed: 1200, caption: "Télémétrie de démonstration" })
 * @associated bpm.flightMap, bpm.flightProfile, bpm.liveChart
 */
export function FlightInstruments({ pitch, roll, heading, altitude, airspeed, verticalSpeed,
  altitudeUnit = "ft", speedUnit = "kt", verticalSpeedUnit = "ft/min", title = "Instruments de vol",
  caption = "Télémétrie fournie", children, className }: FlightInstrumentsProps) {
  const id = React.useId().replace(/:/g, "");
  const attitude = finite(pitch) && Math.abs(pitch) <= 90 && finite(roll);
  const text = (v: unknown, digits = 0) => finite(v) ? v.toFixed(digits) : "—";
  return <SceneFrame title={title} subtitle={caption} className={className} footer={children}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, padding: "0 18px 18px", alignItems: "center" }}>
      <svg viewBox="0 0 300 300" role="img" aria-label={attitude ? `Assiette ${pitch}°, roulis ${roll}°` : "Attitude non renseignée"}
        style={{ width: 300, flex: "1 1 220px", maxWidth: "100%", background: "#08111e", borderRadius: 18 }}>
        <defs><clipPath id={`${id}-attitude`}><circle cx="150" cy="150" r="108" /></clipPath></defs>
        <circle cx="150" cy="150" r="128" fill="#122035" stroke="#354861" strokeWidth="2" />
        <g clipPath={`url(#${id}-attitude)`}>
          <rect x="40" y="40" width="220" height="220" fill="#283446" />
          {attitude && <g transform={`rotate(${-numberOr(roll, 0)} 150 150)`}>
            <g transform={`translate(0 ${clamp(numberOr(pitch, 0), -90, 90) * 2})`}>
              <rect x="-300" y="-600" width="900" height="750" fill="#216c9a" />
              <rect x="-300" y="150" width="900" height="750" fill="#806449" />
              <path d="M-300 150 H600" stroke="#fff" strokeWidth="2" />
              {[-40, -30, -20, -10, 10, 20, 30, 40].map(angle => <g key={angle} transform={`translate(150 ${150 - angle * 2})`} fill="#e5eef5" stroke="#e5eef5">
                <path d={`M${angle % 20 === 0 ? -28 : -18} 0 H${angle % 20 === 0 ? 28 : 18}`} />
                <text x="35" y="4" stroke="none" fontSize="11">{angle}</text>
              </g>)}
            </g>
          </g>}
          {!attitude && <text x="150" y="145" fill="#c6d2e0" textAnchor="middle" fontSize="12">Attitude indisponible</text>}
        </g>
        <path d="M85 150 H124 L135 160 H165 L176 150 H215 M150 137 V148" fill="none" stroke="#ffd277" strokeWidth="4" />
        <path d="M150 22 L143 34 H157 Z" fill="#ffd277" />
        {[-60, -30, 0, 30, 60].map(a => <path key={a} d="M150 35 V44" stroke="#dce7f5" strokeWidth="2" transform={`rotate(${a} 150 150)`} />)}
        <text x="150" y="281" fill="#dbe9fb" textAnchor="middle" fontSize="12">CAP {finite(heading) ? `${Math.round(wrapDegrees(heading)) % 360}°` : "—"}</text>
      </svg>
      <div style={{ flex: "1 1 200px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        {[["Altitude", altitude, altitudeUnit], ["Vitesse air", airspeed, speedUnit], ["Vitesse verticale", verticalSpeed, verticalSpeedUnit],
          ["Cap", finite(heading) ? wrapDegrees(heading) : undefined, "°"]].map(([label, value, unit]) => <div key={String(label)} style={{ padding: 14,
            border: "1px solid var(--bpm-border, #334155)", borderRadius: 12 }}>
          <div style={{ color: "var(--bpm-text-secondary, #94a3b8)", fontSize: 12 }}>{label}</div>
          <div style={{ fontSize: 26, fontVariantNumeric: "tabular-nums", marginTop: 8, overflowWrap: "anywhere" }}>{text(value)}</div>
          <div style={{ fontSize: 11, color: "var(--bpm-text-secondary, #94a3b8)" }}>{unit}</div>
        </div>)}
      </div>
    </div>
  </SceneFrame>;
}
