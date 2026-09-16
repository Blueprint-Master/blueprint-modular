/** Data-only molecular compositions. Coordinates are Cartesian, in ångströms. */
export const MOLECULE_ELEMENTS = ["H", "C", "N", "O", "F", "P", "S", "Cl", "Br", "I"] as const;
export type MolecularElement = typeof MOLECULE_ELEMENTS[number];
export type Position3 = [number, number, number];
export interface MoleculeAtom { id: string; element: MolecularElement; position: Position3; }
export interface MoleculeBond { from: string; to: string; order: 1 | 2 | 3; }
export interface MoleculeGraph { atoms: MoleculeAtom[]; bonds: MoleculeBond[]; }
export interface MoleculeLayers { atoms: boolean; bonds: boolean; labels: boolean; measurements: boolean; }
export interface MoleculeSettings {
  preset: "water" | "carbon-dioxide" | "methane" | "ammonia" | "custom";
  graph?: MoleculeGraph;
  yaw: number; pitch: number;
  layers: MoleculeLayers;
}
export const DEFAULT_MOLECULE_SETTINGS: Readonly<MoleculeSettings> = Object.freeze({
  preset: "water", yaw: 0, pitch: 0,
  layers: Object.freeze({ atoms: true, bonds: true, labels: true, measurements: true }),
});
/** Familiar CPK/Jmol convention; display sizes are symbolic, not atomic radii. */
export const MOLECULE_COLORS: Record<MolecularElement, string> = {
  H: "#f4f5f7", C: "#343a45", N: "#305ce8", O: "#e43c44", F: "#80c54b",
  P: "#f49a3b", S: "#e4c43e", Cl: "#59bd57", Br: "#9c3827", I: "#884bbb",
};
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const keys = (v: Record<string, unknown>, allowed: string[]) => Object.keys(v).every(k => allowed.includes(k));
const identifier = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z][A-Za-z0-9_-]{0,15}$/.test(v);
const finite = (v: unknown, limit: number): v is number => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= limit;
export function parseMoleculeGraph(raw: unknown): MoleculeGraph | undefined {
  if (!record(raw) || !keys(raw, ["atoms", "bonds"]) || !Array.isArray(raw.atoms) || !Array.isArray(raw.bonds)) return;
  if (!raw.atoms.length || raw.atoms.length > 24 || raw.bonds.length > 48) return;
  const ids = new Set<string>(), pairs = new Set<string>(), atoms: MoleculeAtom[] = [], bonds: MoleculeBond[] = [];
  for (const a of raw.atoms) {
    if (!record(a) || !keys(a, ["id", "element", "position"]) || !identifier(a.id) || ids.has(a.id) || !(MOLECULE_ELEMENTS as readonly unknown[]).includes(a.element)) return;
    if (!Array.isArray(a.position) || a.position.length !== 3 || ![0, 1, 2].every(i => finite((a.position as unknown[])[i], 50))) return;
    ids.add(a.id); atoms.push({ id: a.id, element: a.element as MolecularElement, position: [...a.position] as Position3 });
  }
  for (const b of raw.bonds) {
    if (!record(b) || !keys(b, ["from", "to", "order"]) || !identifier(b.from) || !identifier(b.to) || !ids.has(b.from) || !ids.has(b.to) || b.from === b.to || ![1, 2, 3].includes(b.order as number)) return;
    const pair = [b.from, b.to].sort().join(":");
    if (pairs.has(pair)) return;
    pairs.add(pair); bonds.push({ from: b.from, to: b.to, order: b.order as 1 | 2 | 3 });
  }
  return { atoms, bonds };
}
export function parseMoleculeSettings(raw: unknown): MoleculeSettings | undefined {
  if (!record(raw) || !keys(raw, ["preset", "graph", "yaw", "pitch", "layers"])) return;
  if (!["water", "carbon-dioxide", "methane", "ammonia", "custom"].includes(raw.preset as string) || !finite(raw.yaw, 180) || !finite(raw.pitch, 90)) return;
  if (!record(raw.layers) || !keys(raw.layers, ["atoms", "bonds", "labels", "measurements"]) || Object.keys(DEFAULT_MOLECULE_SETTINGS.layers).some(k => typeof (raw.layers as Record<string, unknown>)[k] !== "boolean")) return;
  const graph = raw.preset === "custom" ? parseMoleculeGraph(raw.graph) : undefined;
  if (raw.preset === "custom" ? !graph : raw.graph !== undefined) return;
  return { preset: raw.preset as MoleculeSettings["preset"], ...(graph ? { graph } : {}), yaw: raw.yaw, pitch: raw.pitch, layers: { ...raw.layers } as unknown as MoleculeLayers };
}
export function bondLength(a: Position3, b: Position3) { return Math.hypot(...a.map((v, i) => v - b[i])); }
export function bondAngle(a: Position3, centre: Position3, b: Position3) {
  const u = a.map((v, i) => v - centre[i]), v = b.map((n, i) => n - centre[i]), norm = Math.hypot(...u) * Math.hypot(...v);
  return norm < 1e-12 ? undefined : Math.acos(Math.max(-1, Math.min(1, u.reduce((s, n, i) => s + n * v[i], 0) / norm))) * 180 / Math.PI;
}
/** Diagnostics, never a chemical-validity certificate or an energy optimisation. */
export function moleculeWarnings(graph: MoleculeGraph): string[] {
  const warnings: string[] = [], valence: Partial<Record<MolecularElement, number>> = { H: 1, C: 4, N: 3, O: 2, F: 1, Cl: 1, Br: 1, I: 1 };
  for (const atom of graph.atoms) {
    const order = graph.bonds.filter(b => b.from === atom.id || b.to === atom.id).reduce((n, b) => n + b.order, 0);
    if (valence[atom.element] !== undefined && order > valence[atom.element]!) warnings.push(`valence:${atom.id}`);
  }
  graph.atoms.forEach((a, i) => graph.atoms.slice(i + 1).forEach(b => { if (bondLength(a.position, b.position) < .2) warnings.push(`overlap:${a.id}/${b.id}`); }));
  return warnings;
}
