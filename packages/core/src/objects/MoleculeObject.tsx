"use client";
import React from "react";
import { MoleculeLayer } from "./MoleculeLayer";
import { MOLECULE_PRESETS, moleculeGraph } from "./molecule-presets";
import { bondAngle, bondLength, DEFAULT_MOLECULE_SETTINGS, moleculeWarnings, parseMoleculeSettings, type MoleculeSettings } from "./molecules";
import type { ScienceLayers, ScienceStyle } from "./science";

export function MoleculeObject({ settings = DEFAULT_MOLECULE_SETTINGS, visualStyle, layers, locale }: { settings?: MoleculeSettings; visualStyle: ScienceStyle; layers: ScienceLayers; locale: "fr" | "en" }) {
  const valid = parseMoleculeSettings(settings), fr = locale === "fr";
  if (!valid) return <span role="alert">{fr ? "Composition moléculaire invalide." : "Invalid molecular composition."}</span>;
  const graph = moleculeGraph(valid), preset = valid.preset === "custom" ? undefined : MOLECULE_PRESETS[valid.preset];
  const ink = visualStyle === "paper" ? "#152d40" : visualStyle === "transparent" ? "currentColor" : "#f1f5fb";
  const muted = visualStyle === "paper" ? "#4e6172" : visualStyle === "transparent" ? "currentColor" : "#a6b5c7";
  const accent = visualStyle === "transparent" ? "currentColor" : visualStyle === "paper" ? "#176a87" : "#78cddd", warnings = moleculeWarnings(graph);
  const first = graph.bonds[0], centre = first && graph.atoms.find(a => a.id === first.from), next = centre && graph.bonds.find(b => b !== first && (b.from === centre.id || b.to === centre.id));
  const a = first && graph.atoms.find(n => n.id === first.to), b = next && graph.atoms.find(n => n.id === (next.from === centre?.id ? next.to : next.from));
  const angle = a && b && centre ? bondAngle(a.position, centre.position, b.position) : undefined;
  const name = preset?.name[locale] ?? (fr ? "Composition libre" : "Custom composition");
  return <svg role="img" aria-label={name} data-molecule-status={preset ? "sourced-geometry" : "unvalidated"} viewBox="0 0 520 520" style={{ width: "100%", height: "100%", display: "block", color: visualStyle === "transparent" ? undefined : ink, fontFamily: "ui-sans-serif,system-ui,sans-serif" }}>
    <title>{name}</title><desc>{fr ? "Boules et bâtonnets ; couleurs CPK ; rayons symboliques. Mesures calculées sur les coordonnées 3D en ångströms, pas sur la projection." : "Ball-and-stick; CPK colours; symbolic radii. Measurements use 3D ångström coordinates, not the projection."}</desc>
    {visualStyle !== "transparent" && <rect width="520" height="520" rx="28" fill={visualStyle === "paper" ? "#f6f3ed" : "#0a1321"}/>}
    {layers.identity && <g fill={ink}><text x="32" y="38" fontSize="9" letterSpacing="2" fill={muted}>{fr ? "MODÈLE MOLÉCULAIRE · BOULES ET BÂTONNETS" : "MOLECULAR MODEL · BALL AND STICK"}</text><text x="32" y="90" fontSize="42" fontWeight="700">{preset?.formula ?? `${graph.atoms.length} ${fr ? "atomes" : "atoms"}`}</text><text x="488" y="86" textAnchor="end" fontSize="15">{name}</text></g>}
    {layers.guides && <g stroke={muted} strokeOpacity=".18" fill="none"><path d="M32 110H488M32 406H488"/><circle cx="260" cy="260" r="128" strokeDasharray="2 8"/></g>}
    {layers.structure && <g transform="translate(260 255)"><MoleculeLayer graph={graph} layers={valid.layers} yaw={valid.yaw} pitch={valid.pitch}/></g>}
    {layers.classification && <g fill={muted} fontSize="10"><text x="32" y="393">{fr ? "CPK · H blanc / O rouge / C gris / N bleu" : "CPK · H white / O red / C grey / N blue"}</text><text x="488" y="393" textAnchor="end">{preset?.geometry[locale] ?? (fr ? "Non validée" : "Unvalidated")}</text></g>}
    {layers.analysis && valid.layers.measurements && <g fill={ink}><text x="32" y="434" fontSize="9" letterSpacing="1" fill={muted}>{centre && a ? `${centre.id}—${a.id}` : (fr ? "LIAISONS" : "BONDS")}</text><text x="32" y="465" fontSize="23" fontWeight="600">{centre && a ? `${bondLength(centre.position, a.position).toFixed(4)} Å` : "—"}</text><text x="212" y="434" fontSize="9" letterSpacing="1" fill={muted}>{a && centre && b ? `${a.id}—${centre.id}—${b.id}` : "ANGLE 3D"}</text><text x="212" y="465" fontSize="23" fontWeight="600">{angle !== undefined ? `${angle.toFixed(2)}°` : "—"}</text><text x="488" y="434" textAnchor="end" fontSize="9" fill={muted}>{fr ? "SOURCE" : "SOURCE"}</text>{preset ? <a href={preset.source} target="_blank" rel="noreferrer"><text x="488" y="462" textAnchor="end" fill={accent} fontSize="13">NIST · gaz ↗</text></a> : <text x="488" y="462" textAnchor="end" fill={accent} fontSize="12">{fr ? "Personnalisée" : "Custom"}</text>}</g>}
    <text x="32" y="498" fill={muted} fontSize="9">{warnings.length ? (fr ? "⚠ Recouvrement ou valence inhabituelle — vérifier la composition." : "⚠ Overlap or unusual valence — check composition.") : preset ? (fr ? "Géométrie expérimentale · projection 2D · rayons non à l’échelle" : "Experimental geometry · 2D projection · radii not to scale") : (fr ? "Composition non validée · ni calcul quantique ni optimisation" : "Unvalidated composition · no quantum calculation or optimisation")}</text>
  </svg>;
}
