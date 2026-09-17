"use client";
import React from "react";
import {AtomicDensityLayer,AtomSphereLayer} from "./ScienceLayers";
import {AtomicOrbitalLayer} from "./AtomicOrbitalLayer";
import {DEFAULT_ATOMIC_SETTINGS,type AtomicLayerSettings} from "./atomic-settings";
import {electronConfiguration,selectedSubshell} from "./atomic-orbitals";
import {ELECTRON_CONFIGURATIONS} from "./electron-configurations.generated";
import type {ElementDatum,ScienceLayers,ScienceStyle} from "./science";

const superscript=(s:string)=>s.replace(/([spdf])(\d+)/g,(_,letter,digits:string)=>letter+digits.replace(/\d/g,n=>"⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(n)]));
export function AtomicObject({element,locale,visualStyle,layers,atomic}:{element:ElementDatum;locale:"fr"|"en";visualStyle:ScienceStyle;layers:ScienceLayers;atomic?:AtomicLayerSettings}){
  const s={...DEFAULT_ATOMIC_SETTINGS,...atomic},fr=locale==="fr",paper=visualStyle==="paper",transparent=visualStyle==="transparent";
  const ink=transparent?"currentColor":paper?"#182f43":"#e8f2fa",muted=transparent?"currentColor":paper?"#516776":"#99aec1";
  const positive=paper?"#006e91":transparent?"#2387a0":"#67ddeb",negative=paper?"#a04c17":transparent?"#b66b32":"#efb27c";
  const subshell=selectedSubshell(element.symbol,s.orbital),shells=electronConfiguration(element.symbol);
  const raw=ELECTRON_CONFIGURATIONS[element.symbol]??"",configuration=superscript(raw.replace(/\s*\([^)]*\)/g,"").replace(/\]([1-7])/,"] $1"));
  const populations=Array.from({length:7},(_,i)=>({n:i+1,electrons:shells.filter(p=>p.n===i+1).reduce((sum,p)=>sum+p.electrons,0)})).filter(p=>p.electrons);
  const orbitals=s.representation==="orbitals",prediction=/predicted|calculated/.test(raw);
  return <svg role="img" aria-label={(fr?"Analyseur atomique : ":"Atomic analyser: ")+element.name[locale]} viewBox="0 0 520 520" style={{display:"block",width:"100%",height:"100%",color:transparent?undefined:ink,fontFamily:"ui-sans-serif,system-ui,sans-serif"}}>
    <title>{element.name[locale]}</title><desc>{fr?"Configuration de référence de l’atome neutre et coupe d’une orbitale hydrogénoïde m=0. Ce modèle à un électron n’est pas la densité totale de l’élément. Les couleurs indiquent le signe de la fonction d’onde, pas des charges. Aucun isotope n’est implicite.":"Neutral-atom reference configuration and a hydrogenic orbital section, m=0. This one-electron basis is not the element’s total density. Colours represent wavefunction sign, not charge. No isotope is implied."}</desc>
    {!transparent&&<rect width="520" height="520" rx="28" fill={paper?"#f6f3ed":"#0a1321"}/>}
    {layers.identity&&<g fill={ink}><text x="32" y="34" fill={muted} fontSize="9" letterSpacing="2">{fr?"EXPLORER LA STRUCTURE ÉLECTRONIQUE":"EXPLORE ELECTRONIC STRUCTURE"}</text><text x="30" y="102" fontSize="62" fontWeight="650">{element.symbol}</text><text x="154" y="72" fontSize="21" fontWeight="600">{element.name[locale]}</text><text x="154" y="96" fontSize="12" fill={muted}>Z = {element.atomicNumber} · {fr?"atome neutre":"neutral atom"}</text><text x="488" y="73" textAnchor="end" fontSize="11" fill={muted}>{fr?"bloc":"block"} {element.block}</text></g>}
    {layers.analysis&&<g><path d="M32 122H488" stroke={muted} strokeOpacity=".25"/><text x="32" y="146" fontSize="9" letterSpacing="1" fill={muted}>{prediction?(fr?"CONFIGURATION PRÉDITE":"PREDICTED CONFIGURATION"):(fr?"CONFIGURATION DE RÉFÉRENCE":"REFERENCE CONFIGURATION")}</text><text x="488" y="147" textAnchor="end" fill={ink} fontSize={configuration.length>30?12:16} fontFamily="ui-monospace,monospace">{configuration||"—"}</text></g>}
    {layers.classification&&<g fill={muted}><text x="32" y="188" fontSize="9" letterSpacing="1">{fr?"COUCHES":"SHELLS"}</text>{populations.map((p,i)=><g key={p.n} transform={`translate(32 ${210+i*23})`}><text fontSize="10">n={p.n}</text><rect x="32" y="-8" width={Math.max(4,p.electrons*1.8)} height="6" rx="3" fill={positive} fillOpacity=".65"/><text x="102" fontSize="11" fill={ink}>{p.electrons} e⁻</text></g>)}</g>}
    {layers.structure&&<g transform="translate(317 278) scale(.82)">{orbitals&&subshell?<AtomicOrbitalLayer n={subshell.n} l={subshell.l} density={s.density} nucleus={s.nucleus} opacity={s.opacity} positive={positive} negative={negative} guides={layers.guides}/>:s.representation==="sphere"?<AtomSphereLayer element={element.symbol} radius={96} opacity={s.opacity} labels={layers.identity}/>:<AtomicDensityLayer settings={s} accent={positive} ink={ink}/>}</g>}
    {layers.guides&&orbitals&&subshell&&<g fontSize="10" fill={muted}><text x="190" y="182">{subshell.id} · m = 0 · {fr?"coupe xz":"xz section"}</text><text x="190" y="387" fill={positive}>ψ +</text><text x="235" y="387" fill={negative}>ψ −</text><text x="286" y="387">{fr?"signes, pas charges":"signs, not charges"}</text></g>}
    {layers.analysis&&<g fill={ink}><path d="M32 408H488" stroke={muted} strokeOpacity=".25"/><text x="32" y="431" fontSize="9" letterSpacing="1" fill={muted}>{fr?"PROTONS / ÉLECTRONS":"PROTONS / ELECTRONS"}</text><text x="32" y="463" fontSize="24" fontWeight="600">{element.atomicNumber} / {element.atomicNumber}</text><text x="223" y="431" fontSize="9" letterSpacing="1" fill={muted}>{fr?"SOUS-COUCHE LUE":"SELECTED SUBSHELL"}</text><text x="223" y="463" fontSize="24" fontWeight="600">{subshell?`${subshell.id} · ${subshell.electrons} e⁻`:"—"}</text><text x="488" y="431" textAnchor="end" fontSize="9" fill={muted}>{fr?"NEUTRONS":"NEUTRONS"}</text><text x="488" y="461" textAnchor="end" fontSize="11" fill={muted}>{fr?"Isotope requis":"Isotope needed"}</text></g>}
    <text x="32" y="497" fill={muted} fontSize="9">{orbitals?(fr?"Base hydrogénoïde · contours relatifs · pas la densité totale de l’atome":"Hydrogenic basis · relative contours · not the atom’s total density"):(fr?"Représentation symbolique · aucune trajectoire électronique":"Symbolic representation · no electron trajectories")}</text>
  </svg>;
}
