import type { MoleculeGraph } from "./molecules";
/** Hill order, explicitly counted H atoms; no inferred valence, charge or isotope. */
export function moleculeFormula(graph: Pick<MoleculeGraph, "atoms">): string {
  const counts = new Map<string, number>();
  for (const a of graph.atoms) counts.set(a.element, (counts.get(a.element) ?? 0) + 1);
  const keys = [...counts.keys()].sort();
  const ordered = counts.has("C") ? ["C", ...(counts.has("H") ? ["H"] : []), ...keys.filter(k => k !== "C" && k !== "H")] : keys;
  return ordered.map(k => k + (counts.get(k)! > 1 ? counts.get(k) : "")).join("");
}
export const displayFormula = (formula: string) => formula.replace(/\d/g, n => "₀₁₂₃₄₅₆₇₈₉"[Number(n)]);
