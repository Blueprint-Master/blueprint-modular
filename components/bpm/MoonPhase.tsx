"use client";
import React from "react";
import { clamp, finite, numberOr } from "./spatial";

export interface MoonPhaseProps {
  /** Fraction of the cycle: 0=new, .25=first quarter, .5=full, .75=last quarter. */
  phase?: number;
  hemisphere?: "north" | "south";
  label?: string;
  size?: number;
  color?: string;
  showLabel?: boolean;
  className?: string;
}

/**
 * @component bpm.moonPhase
 * @description Phase lunaire à partir d'une fraction de cycle fournie : nouvelle lune, croissant, quartier, pleine lune, orientation nord/sud et pourcentage éclairé. Aucune phase du jour n'est inventée.
 * @param {object} props - phase attend une fraction entre 0 et 1 ; sans valeur, affiche une absence de données.
 * @example bpm.moonPhase({ phase: 0.18, label: "Lune croissante", hemisphere: "north" })
 * @associated bpm.celestialBody, bpm.solarSystem, bpm.skyMap
 */
export function MoonPhase({ phase, hemisphere = "north", label = "Phase lunaire", size = 160, color = "#e7dfc4",
  showLabel = true, className }: MoonPhaseProps) {
  const valid = finite(phase) && phase >= 0 && phase <= 1;
  const t = valid ? phase : 0;
  const cosine = Math.cos(t * 2 * Math.PI), waxing = t <= 0.5;
  const fraction = (1 - cosine) / 2;
  const points: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const y = -1 + 2 * i / 64, limb = Math.sqrt(Math.max(0, 1 - y * y));
    points.push(`${50 + (waxing ? 1 : -1) * limb * 42},${50 + y * 42}`);
  }
  for (let i = 64; i >= 0; i--) {
    const y = -1 + 2 * i / 64, limb = Math.sqrt(Math.max(0, 1 - y * y));
    points.push(`${50 + (waxing ? 1 : -1) * cosine * limb * 42},${50 + y * 42}`);
  }
  return <figure className={className} style={{ margin: 0, display: "inline-grid", justifyItems: "center", gap: 8, maxWidth: "100%" }}>
    <svg role="img" aria-label={`${label} — ${valid ? `${Math.round(fraction * 100)} % éclairée` : "phase non renseignée"}`}
      width={clamp(numberOr(size, 160), 32, 1000)} viewBox="0 0 100 100" style={{ maxWidth: "100%", height: "auto" }}>
      <circle cx="50" cy="50" r="42" fill="#182238" stroke="#53607b" strokeWidth="0.6" />
      {valid && <polygon points={points.join(" ")} fill={color} transform={hemisphere === "south" ? "rotate(180 50 50)" : undefined} />}
    </svg>
    {showLabel && <figcaption style={{ fontSize: 13, color: "var(--bpm-text-primary, #e2e8f0)", textAlign: "center" }}>
      {label} · {valid ? `${Math.round(fraction * 100)} % éclairée` : "Phase non renseignée"}
    </figcaption>}
  </figure>;
}
