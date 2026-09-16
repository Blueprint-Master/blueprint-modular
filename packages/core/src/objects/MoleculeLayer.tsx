"use client";
import React from "react";
import { AtomSphereLayer } from "./ScienceLayers";
import { DEFAULT_MOLECULE_SETTINGS, MOLECULE_COLORS, type MoleculeGraph, type MoleculeLayers, type Position3 } from "./molecules";

export interface MoleculeLayerProps { graph: MoleculeGraph; layers?: Partial<MoleculeLayers>; yaw?: number; pitch?: number; }
/** Orthographic display projection only. Never changes the stored Å coordinates. */
export function projectMolecule(graph: MoleculeGraph, yaw = 0, pitch = 0) {
  const a = yaw * Math.PI / 180, b = pitch * Math.PI / 180;
  const centre = [0, 1, 2].map(i => graph.atoms.reduce((s, atom) => s + atom.position[i], 0) / graph.atoms.length);
  const extent = Math.max(.5, ...graph.atoms.map(atom => Math.hypot(...atom.position.map((n, i) => n - centre[i]))));
  const scale = 135 / extent;
  return graph.atoms.map(atom => {
    const [x, y, z] = atom.position.map((n, i) => n - centre[i]) as Position3;
    const horizontal = y * Math.cos(a) + z * Math.sin(a), vertical = z * Math.cos(a) - y * Math.sin(a);
    return { ...atom, x: horizontal * scale, y: -(vertical * Math.cos(b) + x * Math.sin(b)) * scale,
      depth: x * Math.cos(b) - vertical * Math.sin(b), radius: atom.element === "H" ? 25 : 39 };
  });
}
/** Background-free SVG group centred at (0,0). Extent ≤ 350 × 350.
 * Ball radii are symbolic; bond lengths/angles must be read from the 3D graph. */
export function MoleculeLayer({ graph, layers, yaw = 0, pitch = 0 }: MoleculeLayerProps) {
  const visible = { ...DEFAULT_MOLECULE_SETTINGS.layers, ...layers }, atoms = projectMolecule(graph, yaw, pitch);
  const bonds = graph.bonds.map(bond => ({ ...bond, a: atoms.find(a => a.id === bond.from)!, b: atoms.find(a => a.id === bond.to)! }));
  const draw = [
    ...atoms.map(atom => ({ depth: atom.depth, key: atom.id, render: () => visible.atoms ? <g data-molecule-atom={atom.id} aria-label={`${atom.id} ${atom.element}`}><AtomSphereLayer element={atom.element} x={atom.x} y={atom.y} radius={atom.radius} labels={visible.labels}/></g> : visible.labels ? <text x={atom.x} y={atom.y} textAnchor="middle" fill="currentColor" fontSize="16">{atom.element}</text> : null })),
    ...bonds.map((bond, index) => ({ depth: (bond.a.depth + bond.b.depth) / 2, key: `bond-${index}`, render: () => {
      if (!visible.bonds) return null;
      const dx = bond.b.x - bond.a.x, dy = bond.b.y - bond.a.y, length = Math.hypot(dx, dy);
      if (length < .01) return null;
      // Trim to visible sphere surfaces; preserve short/end-on projections gracefully.
      const trimA = visible.atoms ? Math.min(bond.a.radius * .86, length * .36) : 0;
      const trimB = visible.atoms ? Math.min(bond.b.radius * .86, length * .36) : 0;
      return <g data-molecule-bond={`${bond.from}-${bond.to}`} data-bond-order={bond.order}>{Array.from({ length: bond.order }, (_, i) => {
        const offset = (i - (bond.order - 1) / 2) * 9, ox = -dy / length * offset, oy = dx / length * offset;
        const x1 = bond.a.x + dx / length * trimA + ox, y1 = bond.a.y + dy / length * trimA + oy, x2 = bond.b.x - dx / length * trimB + ox, y2 = bond.b.y - dy / length * trimB + oy, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        return <g key={i} strokeLinecap="round"><path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#597087" strokeWidth="9"/><path d={`M${x1} ${y1}L${mx} ${my}`} stroke={MOLECULE_COLORS[bond.a.element]} strokeWidth="6"/><path d={`M${mx} ${my}L${x2} ${y2}`} stroke={MOLECULE_COLORS[bond.b.element]} strokeWidth="6"/><path d={`M${x1 - 1} ${y1 - 1}L${x2 - 1} ${y2 - 1}`} stroke="#fff" strokeOpacity=".28" strokeWidth="1"/></g>;
      })}</g>;
    } })),
  ].sort((a, b) => a.depth - b.depth);
  return <g data-science-layer="molecule" data-projection="orthographic">{draw.map(item => <React.Fragment key={item.key}>{item.render()}</React.Fragment>)}</g>;
}
