"use client";
import React from "react";
import {DEFAULT_EARTH_LAYERS, EARTH_PRESETS, earthLayers, type EarthLayers} from "./earth-layers";

const FR = {title:"Composer la Terre",day:"Jour",night:"Nuit",coordinated:"Jour/nuit coordonnés",lighting:"Éclairage",sun:"Position du Soleil",clouds:"Nuages",cloudCoverage:"Couverture nuageuse",cloudOpacity:"Opacité des nuages",cloudSpeed:"Déplacement des nuages",cloudEvolution:"Évolution des formes",atmosphere:"Atmosphère",atmosphereIntensity:"Intensité du halo",lights:"Lumières des villes",lightsIntensity:"Intensité des lumières",auroras:"Aurores",auroraIntensity:"Intensité des aurores",clear:"Ciel dégagé",light:"Nuages légers",living:"Terre vivante",nightPreset:"Vue nocturne",presets:"Préréglages",advanced:"Réglages détaillés",reset:"Réinitialiser la Terre",hint:"À zéro, les nuages suivent la surface sans dérive, ou conservent leur forme. La pause fige tout.",art:"Animations artistiques · sans données météo en direct"};
const EN:typeof FR = {title:"Compose Earth",day:"Day",night:"Night",coordinated:"Coordinated day/night",lighting:"Lighting",sun:"Sun position",clouds:"Clouds",cloudCoverage:"Cloud coverage",cloudOpacity:"Cloud opacity",cloudSpeed:"Cloud drift",cloudEvolution:"Shape evolution",atmosphere:"Atmosphere",atmosphereIntensity:"Halo intensity",lights:"City lights",lightsIntensity:"Light intensity",auroras:"Auroras",auroraIntensity:"Aurora intensity",clear:"Clear sky",light:"Light clouds",living:"Living Earth",nightPreset:"Night view",presets:"Presets",advanced:"Detailed settings",reset:"Reset Earth",hint:"At zero, clouds follow the surface without drift, or keep their shape. Pause freezes everything.",art:"Artistic animation · no live weather data"};
/** Portable controlled editor, shared by Modular, Maker and generated applications. */
export function EarthControls({value,onChange,locale="fr"}:{value?:Partial<EarthLayers>;onChange:(value:EarthLayers)=>void;locale?:"fr"|"en"}) {
  const e=earthLayers(value),s=locale==="fr"?FR:EN;
  const button:React.CSSProperties={minHeight:44,padding:"8px 12px",border:"1px solid currentColor",borderRadius:8,background:"transparent",color:"inherit",cursor:"pointer"};
  const change=<K extends keyof EarthLayers>(key:K,value:EarthLayers[K])=>onChange({...e,[key]:value});
  const toggle=(key:"clouds"|"atmosphere"|"lights"|"auroras")=><label style={{display:"flex",alignItems:"center",gap:10,minHeight:44}}><input type="checkbox" checked={e[key]} onChange={event=>change(key,event.target.checked)}/>{s[key]}</label>;
  const range=(key:"sunAzimuth"|"cloudCoverage"|"cloudOpacity"|"cloudSpeed"|"cloudEvolution"|"atmosphereIntensity"|"lightsIntensity"|"auroraIntensity",label:string,min:number,max:number,step:number,disabled=false)=>
    <label style={{display:"grid",gap:6,padding:"8px 0",opacity:disabled?.5:1}}><span>{label} <output style={{float:"right",fontVariantNumeric:"tabular-nums"}}>{key==="sunAzimuth"?`${e[key]}°`:key==="cloudCoverage"||key==="cloudOpacity"?`${Math.round(e[key]*100)} %`:`×${e[key].toFixed(1)}`}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} disabled={disabled} value={e[key]} onChange={event=>change(key,Number(event.target.value))} style={{width:"100%",minHeight:24}}/></label>;
  return <fieldset style={{border:0,padding:0,margin:"16px 0",minWidth:0}}><legend style={{fontWeight:600,marginBottom:10}}>{s.title}</legend>
    <div role="group" aria-label={s.lighting} style={{display:"flex",flexWrap:"wrap",gap:8}}>{(["day","night","coordinated"] as const).map(mode=><button key={mode} type="button" aria-pressed={e.lighting===mode} style={{...button,background:e.lighting===mode?"#718aa333":undefined}} onClick={()=>change("lighting",mode)}>{s[mode]}</button>)}</div>
    {e.lighting==="coordinated"&&range("sunAzimuth",s.sun,-180,180,1)}
    <div role="group" aria-label={s.presets} style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>{(Object.keys(EARTH_PRESETS) as Array<keyof typeof EARTH_PRESETS>).map(key=><button type="button" key={key} style={{...button,fontSize:12}} onClick={()=>onChange({...EARTH_PRESETS[key]})}>{s[key==="night"?"nightPreset":key]}</button>)}</div>
    {toggle("clouds")}
    {range("cloudCoverage",s.cloudCoverage,0,1,.05,!e.clouds)}
    {range("cloudSpeed",s.cloudSpeed,0,3,.1,!e.clouds)}
    {range("cloudEvolution",s.cloudEvolution,0,3,.1,!e.clouds)}
    <p style={{fontSize:12,opacity:.7,lineHeight:1.5}}>{s.hint}</p>
    <details><summary style={{cursor:"pointer",minHeight:44,display:"flex",alignItems:"center"}}>{s.advanced}</summary>
      {range("cloudOpacity",s.cloudOpacity,0,1,.05,!e.clouds)}
      {toggle("atmosphere")}{range("atmosphereIntensity",s.atmosphereIntensity,0,2,.1,!e.atmosphere)}
      {toggle("lights")}{range("lightsIntensity",s.lightsIntensity,0,3,.1,!e.lights||e.lighting==="day")}
      {toggle("auroras")}{range("auroraIntensity",s.auroraIntensity,0,2,.1,!e.auroras)}
    </details>
    <button type="button" style={button} onClick={()=>onChange({...DEFAULT_EARTH_LAYERS})}>{s.reset}</button>
    <p style={{fontSize:12,opacity:.65}}>{s.art}</p>
  </fieldset>;
}
