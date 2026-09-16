"use client";
import React from "react";
import { AtomicDensityLayer, AtomSphereLayer } from "./ScienceLayers";
import { DEFAULT_ATOMIC_SETTINGS, type AtomicLayerSettings } from "./atomic-settings";
import type { ElementDatum, ScienceLayers, ScienceStyle } from "./science";

export function AtomicObject({ element, locale, visualStyle, layers, atomic }: { element: ElementDatum; locale: "fr" | "en"; visualStyle: ScienceStyle; layers: ScienceLayers; atomic?: AtomicLayerSettings }) {
  const s = { ...DEFAULT_ATOMIC_SETTINGS, ...atomic }, fr = locale === "fr", sphere = s.representation === "sphere";
  const ink = visualStyle === "paper" ? "#163041" : visualStyle === "transparent" ? "currentColor" : "#f3f6fb";
  const muted = visualStyle === "paper" ? "#4b626e" : visualStyle === "transparent" ? "currentColor" : "#a3b4c6";
  const accent = visualStyle === "transparent" ? "currentColor" : visualStyle === "paper" ? "#08766b" : "#6cd6c6";
  return <svg role="img" aria-label={(fr ? "Calque atomique : " : "Atomic layer: ") + element.name[locale]} viewBox="0 0 520 520" style={{ display: "block", width: "100%", height: "100%", fontFamily: "ui-sans-serif,system-ui,sans-serif" }}>
    <title>{element.name[locale]}</title><desc>{fr ? "Schéma qualitatif indépendant. Ce dessin n’est pas une densité électronique calculée. Le noyau est symbolique ; aucun isotope n’est implicite." : "Independent qualitative diagram. This is not a computed electron density. The nucleus is symbolic; no isotope is implied."}</desc>
    {visualStyle !== "transparent" && <rect width="520" height="520" rx="28" fill={visualStyle === "paper" ? "#f6f3ed" : "#0a1321"}/>}
    {layers.identity && <g fill={ink}><text x="32" y="38" fill={muted} fontSize="9" letterSpacing="1.8">{sphere ? (fr ? "ATOME · REPRÉSENTATION SYMBOLIQUE" : "ATOM · SYMBOLIC REPRESENTATION") : (fr ? "CALQUE ATOMIQUE · SCHÉMA QUALITATIF" : "ATOMIC LAYER · QUALITATIVE DIAGRAM")}</text><text x="32" y="99" fontSize="54" fontWeight="700">{element.symbol}</text><text x="150" y="74" fontSize="18" fontWeight="600">{element.name[locale]}</text><text x="150" y="97" fill={muted} fontSize="12">Z {element.atomicNumber} · {fr ? "période" : "period"} {element.period}</text></g>}
    {layers.guides && <g stroke={muted} strokeOpacity=".24" fill="none"><path d="M32 120H488M32 408H488"/><path d="M260 142V155M260 375V388M68 265H80M440 265H452"/></g>}
    {layers.structure && <g transform="translate(260 264)">{sphere ? <AtomSphereLayer element={element.symbol} radius={88} opacity={s.opacity} labels={layers.identity}/> : <AtomicDensityLayer settings={s} accent={accent} ink={ink}/>}</g>}
    {layers.classification && <text x="488" y="99" fill={accent} fontSize="12" textAnchor="end">{fr ? "Bloc" : "Block"} {element.block}</text>}
    {layers.analysis && <g fill={ink}><text x="32" y="436" fill={muted} fontSize="9" letterSpacing="1">{fr ? "PROTONS" : "PROTONS"}</text><text x="32" y="468" fontSize="24" fontWeight="600">{element.atomicNumber}</text><text x="184" y="436" fill={muted} fontSize="9" letterSpacing="1">{fr ? "ÉLECTRONS · NEUTRE" : "ELECTRONS · NEUTRAL"}</text><text x="184" y="468" fontSize="24" fontWeight="600">{element.atomicNumber}</text><text x="376" y="436" fill={muted} fontSize="9" letterSpacing="1">{fr ? "NEUTRONS" : "NEUTRONS"}</text><text x="376" y="464" fill={accent} fontSize="12">{fr ? "Isotope requis" : "Isotope needed"}</text></g>}
    <text x="32" y="500" fill={muted} fontSize="9">{sphere ? (fr ? "Couleur conventionnelle · rayon symbolique · pas une surface physique" : "Conventional colour · symbolic radius · not a physical surface") : (fr ? "Non calculé · non à l’échelle · aucune trajectoire électronique" : "Not computed · not to scale · no electron trajectories")}</text>
  </svg>;
}
