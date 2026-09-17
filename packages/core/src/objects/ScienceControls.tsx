"use client";
import React from "react";
import {DEFAULT_SCIENCE_SETTINGS,ELEMENTS,type ScienceColorMode,type ScienceId,type ScienceLayers,type ScienceSettings} from "./science";

import {MoleculeControls} from "./MoleculeControls";
import {AtomicControls} from "./AtomicControls";

const FR={title:"Composer la vue scientifique",element:"Élément",compare:"Comparer avec",colors:"Lecture couleur",category:"Famille chimique",block:"Bloc électronique",period:"Période",mono:"Monochrome",layers:"Calques",structure:"Structure",identity:"Identité",classification:"Classification",guides:"Repères",analysis:"Analyse",reset:"Réinitialiser"};
const EN:typeof FR={title:"Compose scientific view",element:"Element",compare:"Compare with",colors:"Colour reading",category:"Chemical family",block:"Electron block",period:"Period",mono:"Monochrome",layers:"Layers",structure:"Structure",identity:"Identity",classification:"Classification",guides:"Guides",analysis:"Analysis",reset:"Reset"};
export function ScienceControls({id,value,onChange,locale="fr"}:{id:ScienceId;value?:Partial<ScienceSettings>;onChange:(value:ScienceSettings)=>void;locale?:"fr"|"en"}){
 const s=locale==="fr"?FR:EN,current={...DEFAULT_SCIENCE_SETTINGS,...value,layers:{...DEFAULT_SCIENCE_SETTINGS.layers,...value?.layers}},button:React.CSSProperties={minHeight:40,padding:"7px 10px",border:"1px solid currentColor",borderRadius:8,background:"transparent",color:"inherit",cursor:"pointer"};
 const set=<K extends keyof ScienceSettings>(key:K,next:ScienceSettings[K])=>onChange({...current,[key]:next});
 const layer=(key:keyof ScienceLayers)=><label key={key} style={{display:"flex",alignItems:"center",gap:8,minHeight:36}}><input type="checkbox" checked={current.layers[key]} onChange={event=>set("layers",{...current.layers,[key]:event.target.checked})}/>{s[key]}</label>;
 const select=(label:string,key:"element"|"compareElement")=><label style={{display:"grid",gap:6}}><span>{label}</span><select aria-label={label} value={current[key]} onChange={event=>set(key,event.target.value)} style={{minHeight:42,border:"1px solid currentColor",borderRadius:8,padding:"0 10px",color:"inherit",background:"transparent"}}>{ELEMENTS.map(element=><option key={element.symbol} value={element.symbol}>{element.atomicNumber} · {element.symbol} · {element.name[locale]}</option>)}</select></label>;
 return <fieldset style={{border:0,padding:0,margin:"16px 0",minWidth:0,display:"grid",gap:14}}><legend style={{fontWeight:650,marginBottom:10}}>{s.title}</legend>{id!=="science-molecule"&&select(s.element,"element")}{id==="science-comparator"&&select(s.compare,"compareElement")}
  <div hidden={id==="science-molecule"||id==="science-atom"}><span style={{display:"block",marginBottom:7}}>{s.colors}</span><div role="group" aria-label={s.colors} style={{display:"flex",flexWrap:"wrap",gap:6}}>{(["category","block","period","mono"] as ScienceColorMode[]).map(mode=><button type="button" key={mode} aria-pressed={current.colorMode===mode} onClick={()=>set("colorMode",mode)} style={{...button,background:current.colorMode===mode?"#69cfc333":undefined}}>{s[mode]}</button>)}</div></div>
  {id==="science-molecule"&&<MoleculeControls value={current.molecule} onChange={next=>set("molecule",next)} locale={locale}/>}
  {id==="science-atom"&&<AtomicControls element={current.element} value={current.atomic} onChange={next=>set("atomic",next)} locale={locale}/>}
  <div><span style={{display:"block",marginBottom:4}}>{s.layers}</span><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}>{(["structure","identity","classification","guides","analysis"] as Array<keyof ScienceLayers>).map(layer)}</div></div>
  <button type="button" style={button} onClick={()=>onChange({...DEFAULT_SCIENCE_SETTINGS,layers:{...DEFAULT_SCIENCE_SETTINGS.layers}})}>{s.reset}</button>
 </fieldset>;
}
