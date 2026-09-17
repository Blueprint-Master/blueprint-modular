"use client";
import React,{useMemo,useState} from "react";
import {MOLECULE_PRESETS,moleculeGraph,moleculePresetSettings} from "./molecule-presets";
import {MAX_MOLECULE_ATOMS,MOLECULE_ELEMENTS,type MoleculeSettings,type MoleculePresetId,type MolecularElement} from "./molecules";
import {recognizeMolecule} from "./molecule-recognition";
import {displayFormula} from "./molecule-formula";

const control:React.CSSProperties={minHeight:40,minWidth:0,padding:8,border:"1px solid currentColor",borderRadius:7,background:"transparent",color:"inherit"};
const searchable=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[₀-₉]/g,n=>String("₀₁₂₃₄₅₆₇₈₉".indexOf(n)));
type Props={value:MoleculeSettings;onChange:(v:MoleculeSettings)=>void;locale:"fr"|"en"};
export function MoleculeLibraryControls({value,onChange,locale}:Props){
  const fr=locale==="fr",[query,setQuery]=useState("");
  const choose=(id:MoleculePresetId)=>onChange({...moleculePresetSettings(id),layers:value.layers,motion:value.motion,motionSpeed:value.motionSpeed});
  const available=Object.entries(MOLECULE_PRESETS).filter(([,p])=>searchable(`${p.name.fr} ${p.name.en} ${p.formula}`).includes(searchable(query)));
  const current=value.preset!=="custom"?MOLECULE_PRESETS[value.preset]:undefined;
  return <>
    <label>{fr?"Rechercher une molécule ou une formule":"Search a molecule or formula"}<input type="search" aria-label={fr?"Rechercher une molécule ou une formule":"Search a molecule or formula"} value={query} onChange={e=>setQuery(e.target.value)} placeholder="H2O, C2H6O, caféine…" style={{...control,display:"block",width:"100%",boxSizing:"border-box"}}/></label>
    <label>{fr?"Molécule":"Molecule"} · {Object.keys(MOLECULE_PRESETS).length} {fr?"structures":"structures"}<select aria-label={fr?"Molécule":"Molecule"} value={value.preset} style={{...control,display:"block",width:"100%"}} onChange={e=>{if(e.target.value!=="custom")choose(e.target.value as MoleculePresetId);}}>
      {current&&!available.some(([id])=>id===value.preset)&&<option value={value.preset}>{current.formula} · {current.name[locale]}</option>}
      {available.map(([id,p])=><option key={id} value={id}>{p.formula} · {p.name[locale]}</option>)}
      {value.preset==="custom"&&<option value="custom">{fr?"Composition libre":"Custom composition"}</option>}
    </select></label>
    {query&&<span role="status" style={{fontSize:12}}>{available.length} {fr?"résultat(s) dans la bibliothèque":"result(s) in the library"}</span>}
    <MoleculeCompositionSearch value={value} onChange={onChange} locale={locale}/>
    <div style={{display:"grid",gap:8}}><label><input type="checkbox" checked={value.motion??false} onChange={e=>onChange({...value,motion:e.target.checked})}/> {fr?"Mouvement léger":"Gentle motion"}</label>
      {value.motion&&<label>{fr?"Vitesse du mouvement":"Motion speed"} ×{value.motionSpeed??1}<input aria-label={fr?"Vitesse du mouvement":"Motion speed"} type="range" min=".25" max="2" step=".25" value={value.motionSpeed??1} onChange={e=>onChange({...value,motionSpeed:Number(e.target.value)})} style={{display:"block",width:"100%"}}/></label>}
      <span style={{fontSize:12}}>{fr?"Variation douce du point de vue ; les distances restent fixes. Décochez pour figer la vue. Respecte la réduction des animations.":"Gentle viewpoint change; distances remain fixed. Uncheck to freeze. Respects reduced motion."}</span>
    </div>
  </>;
}
function MoleculeCompositionSearch({value,onChange,locale}:Props){
  const fr=locale==="fr",graph=moleculeGraph(value);
  const result=useMemo(()=>recognizeMolecule(graph),[graph]);
  const [counts,setCounts]=useState<Partial<Record<MolecularElement,number>>>({H:2,O:1});
  const total=Object.values(counts).reduce((sum,n)=>sum+(n??0),0);
  const build=()=>{
    const atoms=MOLECULE_ELEMENTS.flatMap(element=>Array.from({length:counts[element]??0},()=>element)).map((element,i)=>({id:`A${i+1}`,element,position:[0,(i%8)*1.5,Math.floor(i/8)*1.5] as [number,number,number]}));
    onChange({...value,preset:"custom",graph:{atoms,bonds:[]}});
  };
  return <details><summary style={{cursor:"pointer",padding:"10px 0"}}>{fr?"Atomes → molécules possibles":"Atoms → possible molecules"}</summary>
    <p style={{fontSize:12}}>{fr?"Choisissez les nombres d’atomes, puis recherchez. Une formule peut correspondre à plusieurs isomères ; les liaisons aident à les distinguer.":"Choose atom counts, then search. A formula may have several isomers; bonds help distinguish them."}</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:6}}>{MOLECULE_ELEMENTS.map(e=><label key={e}>{e}<input aria-label={`${fr?"Nombre d’atomes":"Atom count"} ${e}`} type="number" min="0" max={MAX_MOLECULE_ATOMS} value={counts[e]??0} style={{...control,width:"100%",boxSizing:"border-box"}} onChange={event=>{const n=event.target.valueAsNumber;if(Number.isInteger(n)&&n>=0&&n<=MAX_MOLECULE_ATOMS)setCounts({...counts,[e]:n});}}/></label>)}</div>
    <button type="button" disabled={total<1||total>MAX_MOLECULE_ATOMS} style={{...control,marginTop:10}} onClick={build}>{fr?"Rechercher avec ces atomes":"Search with these atoms"} ({total}/{MAX_MOLECULE_ATOMS})</button>
    <div role="status" style={{marginTop:12,fontSize:13}}><strong>{displayFormula(result.formula)}</strong> · {result.connectivity.length ? (fr?"Liaisons compatibles avec":"Connectivity matches") : (fr?"Candidats pour la composition actuelle":"Candidates for the current composition")}
      <ul style={{paddingLeft:18}}>{(result.connectivity.length?result.connectivity:result.candidates).map(id=><li key={id}><button type="button" style={{...control,marginTop:5}} onClick={()=>onChange({...moleculePresetSettings(id),layers:value.layers,motion:value.motion,motionSpeed:value.motionSpeed})}>{MOLECULE_PRESETS[id].name[locale]}</button></li>)}</ul>
      {!result.candidates.length&&<p>{fr?"Aucun candidat dans cette bibliothèque. Cela ne signifie pas que la composition est impossible.":"No candidate in this library. This does not mean the composition is impossible."}</p>}
      {!!result.unresolved.length&&<p>{fr?"Comparaison des liaisons incomplète (limite de calcul).":"Connectivity comparison incomplete (work limit)."}</p>}
      <p>{fr?"Reconnaissance limitée aux atomes et ordres de liaison. Stéréochimie, isotopes, charges et stabilité non identifiés. Choisir un candidat remplace les coordonnées par sa géométrie sourcée.":"Matches atoms and bond orders only. Stereochemistry, isotopes, charges and stability are not identified. Choosing a candidate loads its sourced geometry."}</p>
    </div>
  </details>;
}
