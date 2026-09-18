"use client";
import React,{useState} from 'react';
import {FLAG_DESIGNS,flagDesign,type FlagSettings,type FlagDesignId} from './flags';
export function FlagControls({value,onChange,locale='fr',allowedDesigns}:{value:FlagSettings;onChange:(s:FlagSettings)=>void;locale?:'fr'|'en';allowedDesigns?:readonly FlagDesignId[]}){
 const [query,setQuery]=useState(''),fr=locale==='fr',normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const matches=FLAG_DESIGNS.filter(x=>(!allowedDesigns||allowedDesigns.includes(x.id))&&normalize(`${x.id} ${x.name.fr} ${x.name.en}`).includes(normalize(query)));
 const update=(patch:Partial<FlagSettings>)=>onChange({...value,...patch}),labels={artwork:fr?'Motif':'Artwork',fabric:fr?'Tissu et coutures':'Fabric and seams',lighting:fr?'Éclairage':'Lighting',pole:fr?'Mât':'Pole'};
 return <fieldset style={{display:'grid',gap:12,border:0,padding:0,minWidth:0}}><legend>{fr?'Composer le drapeau':'Compose the flag'}</legend>
 <label>{fr?'Rechercher un drapeau':'Search flags'}<input value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <label>{fr?'Drapeau':'Flag'}<select style={{maxWidth:'100%'}} value={value.design} onChange={e=>{const d=flagDesign(e.target.value);if(d)update({design:d.id});}}>{!matches.some(x=>x.id===value.design)&&<option value={value.design}>{flagDesign(value.design)?.name[locale]}</option>}{matches.map(x=><option key={x.id} value={x.id}>{x.name[locale]} · {x.id.toUpperCase()}</option>)}</select></label>
 <span role="status">{matches.length} {fr?'résultats':'results'}</span>
 <label>{fr?'Présentation':'Presentation'}<select value={value.mode} onChange={e=>update({mode:e.target.value as FlagSettings['mode']})}><option value="flat">{fr?'À plat, figé':'Flat, still'}</option><option value="waving">{fr?'Tissu flottant':'Waving cloth'}</option></select></label>
 <label>{fr?'Fond':'Background'}<select value={value.background} onChange={e=>update({background:e.target.value as FlagSettings['background']})}>{(['transparent','midnight','paper'] as const).map((x,i)=><option key={x} value={x}>{(fr?['Transparent','Nuit','Papier']:['Transparent','Midnight','Paper'])[i]}</option>)}</select></label>
 <label>{fr?'Force du vent':'Wind strength'}<input type="range" min="0" max="1" step=".05" value={value.wind} onChange={e=>update({wind:Number(e.target.value)})}/></label>
 {Object.entries(labels).map(([key,label])=><label key={key}><input type="checkbox" checked={value.layers[key as keyof FlagSettings['layers']]} onChange={e=>update({layers:{...value.layers,[key]:e.target.checked}})}/>{label}</label>)}
 </fieldset>;
}
