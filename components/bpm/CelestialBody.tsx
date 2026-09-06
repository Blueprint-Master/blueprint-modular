"use client";
import React from "react";
import { clamp, numberOr } from "./spatial";

export interface CelestialBodyProps {
  /** Accessible object name. */
  label?: string;
  kind?: "star" | "planet" | "moon" | "asteroid" | "black-hole";
  color?: string;
  size?: number;
  /** Optional ring system. */
  rings?: boolean;
  /** Ring/axis tilt in degrees. */
  tilt?: number;
  /** SVG content inside the disc, in a 100 × 100 viewBox. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * @component bpm.celestialBody
 * @description Astre vectoriel personnalisable : étoile, planète, lune, astéroïde ou trou noir, avec anneaux, inclinaison et couche SVG libre.
 * @param {object} props - Apparence de l'astre ; children reçoit du SVG dans un repère 100 × 100.
 * @example bpm.celestialBody({ label: "Saturne", kind: "planet", rings: true, color: "#d9bb83", tilt: -24 })
 * @associated bpm.celestialScene, bpm.orbitalSystem, bpm.moonPhase
 */
export function CelestialBody({ label = "Astre", kind = "planet", color = "#71b7eb", size = 160,
  rings = false, tilt = -20, children, className = "" }: CelestialBodyProps) {
  const id = React.useId().replace(/:/g, "");
  const diameter = clamp(numberOr(size, 160), 16, 1000);
  const star = kind === "star", hole = kind === "black-hole";
  return <svg role="img" aria-label={label} className={className} viewBox="0 0 100 100" width={diameter} height={diameter}
    style={{ display: "block", maxWidth: "100%", overflow: "visible" }}>
    <title>{label}</title>
    <defs>
      <radialGradient id={`${id}-disc`} cx="30%" cy="26%" r="75%">
        <stop offset="0" stopColor={star ? "#fff6cb" : color} />
        <stop offset="0.5" stopColor={color} /><stop offset="1" stopColor={hole ? "#000" : "#090e20"} />
      </radialGradient>
      <radialGradient id={`${id}-halo`}><stop stopColor={color} stopOpacity="0.55" />
        <stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient>
      <clipPath id={`${id}-clip`}><circle cx="50" cy="50" r="29" /></clipPath>
    </defs>
    {(star || hole) && <circle cx="50" cy="50" r="49" fill={`url(#${id}-halo)`} />}
    {(rings || hole) && <ellipse cx="50" cy="50" rx="45" ry="13" transform={`rotate(${numberOr(tilt, -20)} 50 50)`}
      fill="none" stroke={color} strokeWidth={hole ? 7 : 5} opacity="0.55" />}
    <circle cx="50" cy="50" r="29" fill={hole ? "#020308" : `url(#${id}-disc)`} stroke={color} strokeOpacity="0.4" strokeWidth="0.5" />
    <g clipPath={`url(#${id}-clip)`}>
      {kind === "planet" && <g fill="none" stroke={color} strokeWidth="2" opacity="0.3">
        <path d="M16 39 Q45 55 84 37 M17 47 Q45 63 83 45 M20 61 Q48 74 80 59" />
      </g>}
      {(kind === "moon" || kind === "asteroid") && <g fill="#0a1023" opacity="0.24">
        <circle cx="40" cy="36" r="7" /><circle cx="57" cy="60" r="9" /><circle cx="33" cy="60" r="4" />
      </g>}
      {children}
    </g>
    {rings && <path d="M8 54 Q49 77 92 54" transform={`rotate(${numberOr(tilt, -20)} 50 50)`}
      fill="none" stroke={color} strokeWidth="4" opacity="0.8" />}
  </svg>;
}
