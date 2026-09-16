"use client";
import React, { useId } from "react";
import { DEFAULT_ATOMIC_SETTINGS, type AtomicLayerSettings } from "./atomic-settings";
import { MOLECULE_COLORS, type MolecularElement } from "./molecules";

export interface AtomSphereLayerProps { element: string; x?: number; y?: number; radius?: number; labels?: boolean; opacity?: number; }
/** A background-free SVG group: compose inside your own SVG, transform or clipPath.
 * Symbolic ball, NOT a nucleus, electron surface or van der Waals radius. */
export function AtomSphereLayer({ element, x = 0, y = 0, radius = 40, labels = true, opacity = 1 }: AtomSphereLayerProps) {
  const uid = "sphere-" + useId().replace(/:/g, ""), color = MOLECULE_COLORS[element as MolecularElement] ?? "#7b8495";
  return <g data-science-layer="atom-sphere" transform={`translate(${x} ${y})`} opacity={opacity}>
    <defs><radialGradient id={uid} cx="30%" cy="23%" r="76%"><stop stopColor="#ffffff" stopOpacity=".96"/><stop offset=".18" stopColor={color}/><stop offset=".56" stopColor={color}/><stop offset="1" stopColor={element === "H" ? "#8d9eb4" : "#101724"}/></radialGradient></defs>
    <circle r={radius} fill={`url(#${uid})`} stroke={element === "H" ? "#62758d" : "#ffffff"} strokeOpacity=".4" strokeWidth="1"/>
    <path d={`M${-radius * .66} ${-radius * .32} A${radius * .75} ${radius * .75} 0 0 1 ${radius * .25} ${-radius * .76}`} fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth={radius * .04} strokeLinecap="round"/>
    {labels && <text textAnchor="middle" dominantBaseline="central" fill={element === "H" || element === "S" ? "#182332" : "#ffffff"} fontSize={radius * .48} fontWeight="650" fontFamily="ui-sans-serif,system-ui,sans-serif">{element}</text>}
  </g>;
}

export interface AtomicDensityLayerProps { settings?: Partial<AtomicLayerSettings>; accent?: string; ink?: string; }
/** Qualitative reading layer only, NOT an orbital/electron-density calculation.
 * No fake numeric contours, individual electron paths, or fabricated nucleons.
 * Coordinates centred on (0,0), extent 180 × 140. No frame, text or background. */
export function AtomicDensityLayer({ settings, accent = "#138d82", ink = "currentColor" }: AtomicDensityLayerProps) {
  const s = { ...DEFAULT_ATOMIC_SETTINGS, ...settings }, uid = "density-" + useId().replace(/:/g, "");
  return <g data-science-layer="atomic-density" data-scientific-status="qualitative-not-computed" opacity={s.opacity}>
    <defs><radialGradient id={uid}><stop stopColor={accent} stopOpacity=".48"/><stop offset=".35" stopColor={accent} stopOpacity=".2"/><stop offset="1" stopColor={accent} stopOpacity="0"/></radialGradient></defs>
    {s.density && <g data-atomic-sublayer="density"><ellipse rx="180" ry="138" fill={`url(#${uid})`}/>{[1, .76, .48].map((r, i) => <ellipse key={r} rx={160 * r} ry={120 * r} fill="none" stroke={accent} strokeWidth={i ? 1 : 1.6} strokeOpacity={.75 - i * .18}/>)}</g>}
    {s.nucleus && <g data-atomic-sublayer="nucleus"><circle r="6" fill={ink}/><circle r="13" fill="none" stroke={ink} strokeOpacity=".45"/><path d="M-21 0H-16M16 0H21M0-21V-16M0 16V21" stroke={ink} strokeOpacity=".5"/></g>}
  </g>;
}
