import { MOLECULE_PRESETS } from "./molecule-presets";
import { moleculeFormula } from "./molecule-formula";
import type { MoleculeGraph, MoleculePresetId } from "./molecules";

function topology(g: MoleculeGraph) {
  const index = new Map(g.atoms.map((a,i) => [a.id,i]));
  const edges = g.atoms.map(() => g.atoms.map(() => 0));
  for (const b of g.bonds) { const i=index.get(b.from)!,j=index.get(b.to)!; edges[i][j]=edges[j][i]=b.order; }
  const labels=g.atoms.map((a,i) => a.element+":"+edges[i].map((o,j) => o ? `${g.atoms[j].element}${o}` : "").filter(Boolean).sort().join(","));
  return { edges,labels };
}
/** Bounded exact graph isomorphism of labelled connectivity. Never infers stereochemistry.
 * Undefined means the work limit was reached, NOT a negative identification. */
export function sameMoleculeConnectivity(a: MoleculeGraph,b: MoleculeGraph,limit=20000): boolean | undefined {
  if (a.atoms.length!==b.atoms.length || a.bonds.length!==b.bonds.length || moleculeFormula(a)!==moleculeFormula(b)) return false;
  const x=topology(a),y=topology(b);
  const candidates=x.labels.map(label=>y.labels.flatMap((v,i)=>v===label?[i]:[]));
  if (candidates.some(c=>!c.length)) return false;
  const order=candidates.map((_,i)=>i).sort((i,j)=>candidates[i].length-candidates[j].length || y.edges[j].filter(Boolean).length-y.edges[i].filter(Boolean).length);
  const mapping=new Map<number,number>(),used=new Set<number>(); let steps=0, exhausted=false;
  const visit=(n:number):boolean=>{
    if (++steps>limit) {exhausted=true;return false;}
    if (n===order.length) return true;
    const i=order[n];
    for (const j of candidates[i]) {
      if (used.has(j) || [...mapping].some(([k,v])=>x.edges[i][k]!==y.edges[j][v])) continue;
      mapping.set(i,j);used.add(j);
      if (visit(n+1)) return true;
      mapping.delete(i);used.delete(j);
      if (exhausted) return false;
    }
    return false;
  };
  return visit(0) ? true : exhausted ? undefined : false;
}
const formulaIndex = new Map<string,MoleculePresetId[]>();
for (const [id,p] of Object.entries(MOLECULE_PRESETS)) { const formula=moleculeFormula(p.graph); formulaIndex.set(formula,[...(formulaIndex.get(formula)??[]),id as MoleculePresetId]); }
export function recognizeMolecule(graph: MoleculeGraph) {
  const formula=moleculeFormula(graph), candidates=formulaIndex.get(formula)??[];
  const connectivity:MoleculePresetId[]=[], unresolved:MoleculePresetId[]=[];
  for (const id of candidates) {const match=sameMoleculeConnectivity(graph,MOLECULE_PRESETS[id].graph);if(match)connectivity.push(id);else if(match===undefined)unresolved.push(id);}
  return { formula,candidates,connectivity,unresolved };
}
