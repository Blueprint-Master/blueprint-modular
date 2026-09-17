"use client";
import React from "react";
import {DEFAULT_ATOMIC_SETTINGS,type AtomicLayerSettings} from "./atomic-settings";
import {electronConfiguration,selectedSubshell} from "./atomic-orbitals";
const control:React.CSSProperties={minHeight:40,padding:"7px 10px",border:"1px solid currentColor",borderRadius:8,background:"transparent",color:"inherit"};
export function AtomicControls({element,value,onChange,locale}:{element:string;value?:AtomicLayerSettings;onChange:(v:AtomicLayerSettings)=>void;locale:"fr"|"en"}){
  const current={...DEFAULT_ATOMIC_SETTINGS,...value},fr=locale==="fr",shells=electronConfiguration(element),selected=selectedSubshell(element,current.orbital);
  return <div style={{display:"grid",gap:10}}>
    <label>{fr?"Représentation":"Representation"} <select aria-label={fr?"Représentation":"Representation"} value={current.representation} style={control} onChange={e=>onChange({...current,representation:e.target.value as AtomicLayerSettings["representation"]})}><option value="orbitals">{fr?"Orbitale et configuration":"Orbital and configuration"}</option><option value="sphere">{fr?"Boule conventionnelle":"Conventional ball"}</option><option value="density">{fr?"Ancien schéma qualitatif":"Legacy qualitative diagram"}</option></select></label>
    {current.representation==="orbitals"&&<><label>{fr?"Sous-couche à explorer":"Explore subshell"} <select aria-label={fr?"Sous-couche à explorer":"Explore subshell"} value={selected?.id??""} style={control} onChange={e=>onChange({...current,orbital:e.target.value})}>{shells.map(p=><option key={p.id} value={p.id}>{p.id} · {p.electrons} e⁻</option>)}</select></label><p style={{fontSize:12,margin:0}}>{fr?"La configuration concerne l’atome neutre. La forme montre une orbitale hydrogénoïde à un électron (m = 0), pas la densité réelle de cet élément. Bleu et ambre : signes de ψ, pas des charges.":"Configuration describes the neutral atom. The shape is a one-electron hydrogenic orbital (m = 0), not the element’s actual density. Blue and amber: signs of ψ, not charges."}</p></>}
    {(["density","nucleus"] as const).map(key=><label key={key}><input type="checkbox" checked={current[key]} disabled={current.representation==="sphere"} onChange={e=>onChange({...current,[key]:e.target.checked})}/> {key==="density"?(fr?"Forme / contours":"Shape / contours"):(fr?"Repère du noyau":"Nucleus marker")}</label>)}
    <label>{fr?"Opacité du calque":"Layer opacity"}<input aria-label={fr?"Opacité du calque":"Layer opacity"} type="range" min="0" max="1" step=".05" value={current.opacity} onChange={e=>onChange({...current,opacity:Number(e.target.value)})}/></label>
  </div>;
}
