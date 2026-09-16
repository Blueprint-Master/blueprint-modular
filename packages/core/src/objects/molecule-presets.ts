import { DEFAULT_MOLECULE_SETTINGS, type MoleculeGraph, type MoleculeSettings } from "./molecules";
export interface MoleculePreset { name: { fr: string; en: string }; formula: string; graph: MoleculeGraph; source: string; geometry: { fr: string; en: string }; }
/** Individual experimental geometry facts transcribed from NIST CCCBDB, 2026-09-16.
 * No NIST artwork/database is bundled. Reference coordinates retain their source axes. */
export const MOLECULE_PRESETS: Record<Exclude<MoleculeSettings["preset"], "custom">, MoleculePreset> = {
  water: { name: { fr: "Eau", en: "Water" }, formula: "H₂O", geometry: { fr: "Coudée", en: "Bent" }, source: "https://cccbdb.nist.gov/exp2x.asp?casno=7732185&charge=0", graph: {
    atoms: [{ id: "O1", element: "O", position: [0, 0, .1173] }, { id: "H2", element: "H", position: [0, .7572, -.4692] }, { id: "H3", element: "H", position: [0, -.7572, -.4692] }],
    bonds: [{ from: "O1", to: "H2", order: 1 }, { from: "O1", to: "H3", order: 1 }],
  } },
  "carbon-dioxide": { name: { fr: "Dioxyde de carbone", en: "Carbon dioxide" }, formula: "CO₂", geometry: { fr: "Linéaire", en: "Linear" }, source: "https://cccbdb.nist.gov/exp2x.asp?casno=124389&charge=0", graph: {
    atoms: [{ id: "C1", element: "C", position: [0, 0, 0] }, { id: "O2", element: "O", position: [0, 0, 1.1621] }, { id: "O3", element: "O", position: [0, 0, -1.1621] }],
    bonds: [{ from: "C1", to: "O2", order: 2 }, { from: "C1", to: "O3", order: 2 }],
  } },
  methane: { name: { fr: "Méthane", en: "Methane" }, formula: "CH₄", geometry: { fr: "Tétraédrique", en: "Tetrahedral" }, source: "https://cccbdb.nist.gov/exp2x.asp?casno=74828&charge=0", graph: {
    atoms: [{ id: "C1", element: "C", position: [0, 0, 0] }, ...([[.6276, .6276, .6276], [.6276, -.6276, -.6276], [-.6276, .6276, -.6276], [-.6276, -.6276, .6276]] as [number, number, number][]).map((position, i) => ({ id: `H${i + 2}`, element: "H" as const, position }))],
    bonds: [2, 3, 4, 5].map(i => ({ from: "C1", to: `H${i}`, order: 1 })),
  } },
  ammonia: { name: { fr: "Ammoniac", en: "Ammonia" }, formula: "NH₃", geometry: { fr: "Pyramidale", en: "Pyramidal" }, source: "https://cccbdb.nist.gov/exp2x.asp?casno=7664417&charge=0", graph: {
    atoms: [{ id: "N1", element: "N", position: [0, 0, 0] }, { id: "H2", element: "H", position: [0, -.9377, -.3816] }, { id: "H3", element: "H", position: [.8121, .4689, -.3816] }, { id: "H4", element: "H", position: [-.8121, .4689, -.3816] }],
    bonds: [2, 3, 4].map(i => ({ from: "N1", to: `H${i}`, order: 1 })),
  } },
};
// The curated source geometry cannot be silently edited while retaining its provenance.
for (const preset of Object.values(MOLECULE_PRESETS)) {
  for (const atom of preset.graph.atoms) { Object.freeze(atom.position); Object.freeze(atom); }
  for (const bond of preset.graph.bonds) Object.freeze(bond);
  Object.freeze(preset.graph.atoms); Object.freeze(preset.graph.bonds); Object.freeze(preset.graph);
  Object.freeze(preset.name); Object.freeze(preset.geometry); Object.freeze(preset);
}
Object.freeze(MOLECULE_PRESETS);
export function moleculeGraph(settings: MoleculeSettings = DEFAULT_MOLECULE_SETTINGS): MoleculeGraph {
  return settings.preset === "custom" ? settings.graph! : MOLECULE_PRESETS[settings.preset].graph;
}
/** Initial views keep all atoms legible; orientation is presentation, not geometry. */
export function moleculePresetSettings(preset: Exclude<MoleculeSettings["preset"], "custom">): MoleculeSettings {
  return { ...DEFAULT_MOLECULE_SETTINGS, preset, layers: { ...DEFAULT_MOLECULE_SETTINGS.layers }, yaw: preset === "carbon-dioxide" ? 90 : 0, pitch: preset === "methane" ? 22 : preset === "ammonia" ? 45 : 0 };
}
