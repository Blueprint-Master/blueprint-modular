"use client";
import React,{useId} from "react";
import {DEFAULT_SCIENCE_LAYERS,ELEMENTS,elementBySymbol,type ElementCategory,type ElementDatum,type ScienceColorMode,type ScienceId,type ScienceLayers,type ScienceStyle} from "./science";

import {AtomicObject} from "./AtomicObject";
import {MoleculeObject} from "./MoleculeObject";
import type {AtomicLayerSettings} from "./atomic-settings";
import type {MoleculeSettings} from "./molecules";

export interface ScienceObjectProps {
 id:ScienceId;label:string;locale?:"fr"|"en";size?:number;style?:ScienceStyle;playing?:boolean;speed?:number;thumbnail?:boolean;interactive?:boolean;
 atomic?:AtomicLayerSettings;molecule?:MoleculeSettings;
 element?:string;compareElement?:string;colorMode?:ScienceColorMode;layers?:Partial<ScienceLayers>;onElementChange?:(symbol:string)=>void;
}
const CATEGORY_COLORS:Record<ElementCategory,string>={alkali:"#ff806f",alkaline:"#ffc66f",transition:"#68d9c9","post-transition":"#79aaff",metalloid:"#aa8dff",nonmetal:"#73e4a7",halogen:"#e87be0","noble-gas":"#8f9eff",lanthanoid:"#f09b6e",actinoid:"#d97fa0"};
const BLOCK_COLORS={s:"#63d9c8",p:"#8ea9ff",d:"#f2a570",f:"#d088d9"} as const;
const CATEGORY_FR:Record<ElementCategory,string>={alkali:"Métal alcalin",alkaline:"Alcalino-terreux",transition:"Métal de transition","post-transition":"Métal pauvre",metalloid:"Métalloïde",nonmetal:"Non-métal",halogen:"Halogène","noble-gas":"Gaz noble",lanthanoid:"Lanthanoïde",actinoid:"Actinoïde"};
function tone(element:ElementDatum,mode:ScienceColorMode){if(mode==="mono")return "#83d9d0";if(mode==="block")return BLOCK_COLORS[element.block];if(mode==="period")return ["#6bd6c8","#7dc8ee","#8caef7","#ad97ee","#d98fca","#ed9b91","#f2bd78"][element.period-1];return CATEGORY_COLORS[element.category];}
function frame(style:ScienceStyle){
 if(style==="paper")return {bg:"#f1eee7",ink:"#14222b",muted:"#53646b",line:"#bec8c6",canvas:true};
 if(style==="transparent")return {bg:"transparent",ink:"var(--bpm-text, currentColor)",muted:"var(--bpm-text-muted, currentColor)",line:"var(--bpm-border, currentColor)",canvas:false};
 return {bg:"#07111f",ink:"#f6fbff",muted:"#9bb0c2",line:"#294052",canvas:true};
}
function tableNeighbor(current:ElementDatum,key:string){
 const horizontal=key==="ArrowLeft"||key==="ArrowRight",candidates=ELEMENTS.filter(element=>horizontal?element.row===current.row:element.column===current.column).sort((a,b)=>horizontal?a.column-b.column:a.row-b.row),index=candidates.findIndex(element=>element.symbol===current.symbol),step=key==="ArrowLeft"||key==="ArrowUp"?-1:1;
 return index<0?undefined:candidates[index+step];
}

function PeriodicTable({selected,locale,visualStyle,colorMode,layers,interactive,onSelect,uid}:{selected:ElementDatum;locale:"fr"|"en";visualStyle:ScienceStyle;colorMode:ScienceColorMode;layers:ScienceLayers;interactive:boolean;onSelect?:(symbol:string)=>void;uid:string}){
 const c=frame(visualStyle),cellW=37,cellH=40,x=(column:number)=>31+(column-1)*40,y=(row:number)=>31+(row-1)*43,glow=uid+"-glow";
 return <svg role={interactive?"group":"img"} aria-label={locale==="fr"?"Tableau périodique interactif":"Interactive periodic table"} viewBox="0 0 760 470" style={{display:"block",width:"100%",height:"100%"}}>
  <defs><filter id={glow}><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>{c.canvas&&<rect width="760" height="470" rx="28" fill={c.bg}/>}
  {layers.guides&&<g fill={c.muted} fontFamily="ui-monospace,monospace" fontSize="9">{Array.from({length:18},(_,i)=><text key={i} x={x(i+1)+cellW/2} y="20" textAnchor="middle">{i+1}</text>)}{Array.from({length:7},(_,i)=><text key={i} x="16" y={y(i+1)+24} textAnchor="middle">{i+1}</text>)}<text x="8" y={y(8)+24}>Ln</text><text x="8" y={y(9)+24}>An</text></g>}
  {layers.analysis&&<g transform="translate(151 75)"><text fill={c.muted} fontSize="10" letterSpacing="2">{locale==="fr"?"ÉLÉMENT SÉLECTIONNÉ":"SELECTED ELEMENT"}</text><text y="45" fill={c.ink} fontSize="38" fontWeight="700">{selected.symbol}</text><text x="70" y="27" fill={c.ink} fontSize="15" fontWeight="600">{selected.name[locale]}</text><text x="70" y="48" fill={c.muted} fontSize="11">Z {selected.atomicNumber} · {locale==="fr"?"période":"period"} {selected.period} · {locale==="fr"?"groupe":"group"} {selected.group}</text><rect y="62" width="176" height="1" fill={c.line}/><text y="82" fill={tone(selected,colorMode)} fontSize="11">{locale==="fr"?CATEGORY_FR[selected.category]:selected.category.replace("-"," ")}</text></g>}
  <g>{ELEMENTS.map(element=>{const active=element.symbol===selected.symbol,fill=tone(element,colorMode);return <g key={element.symbol} transform={"translate("+x(element.column)+" "+y(element.row)+")"} role={interactive?"button":undefined} tabIndex={interactive?(active?0:-1):undefined} aria-pressed={interactive?active:undefined} aria-label={element.atomicNumber+" "+element.name[locale]+" "+element.symbol} data-element={interactive?element.symbol:undefined} onClick={()=>interactive&&onSelect?.(element.symbol)} onKeyDown={event=>{if(!interactive)return;if(event.key==="Enter"||event.key===" "){event.preventDefault();onSelect?.(element.symbol);return;}const next=tableNeighbor(element,event.key);if(next){event.preventDefault();onSelect?.(next.symbol);event.currentTarget.ownerSVGElement?.querySelector<SVGGElement>(`[data-element="${next.symbol}"]`)?.focus();}}} style={{cursor:interactive?"pointer":"default",outline:"none"}}>
   {layers.structure&&<rect width={cellW} height={cellH} rx="5" fill={fill} fillOpacity={visualStyle==="paper"?.14:.18} stroke={active?fill:c.line} strokeWidth={active?2:.65} filter={active?"url(#"+glow+")":undefined}/>}
   {layers.identity&&<><text x="5" y="10" fill={c.muted} fontFamily="ui-monospace,monospace" fontSize="6.5">{element.atomicNumber}</text><text x={cellW/2} y="29" fill={c.ink} textAnchor="middle" fontSize="15" fontWeight="650">{element.symbol}</text></>}
   {layers.classification&&<rect x="4" y="35" width={cellW-8} height="2" rx="1" fill={fill}/>}
  </g>;})}</g>
 </svg>;
}

function ElementCard({element,locale,visualStyle,colorMode,layers,uid}:{element:ElementDatum;locale:"fr"|"en";visualStyle:ScienceStyle;colorMode:ScienceColorMode;layers:ScienceLayers;uid:string}){
 const c=frame(visualStyle),accent=tone(element,colorMode),sheen=uid+"-sheen";
 return <svg role="img" aria-label={element.name[locale]+" "+element.symbol} viewBox="0 0 520 520" style={{display:"block",width:"100%",height:"100%"}}><defs><linearGradient id={sheen} x2="1" y2="1"><stop stopColor={accent} stopOpacity=".38"/><stop offset=".55" stopColor={accent} stopOpacity=".08"/><stop offset="1" stopColor={c.ink} stopOpacity=".02"/></linearGradient></defs>{c.canvas&&<rect width="520" height="520" rx="32" fill={c.bg}/>}
  {layers.structure&&<><rect x="44" y="42" width="432" height="436" rx="28" fill={"url(#"+sheen+")"} stroke={c.line}/><path d="M44 350C170 298 314 392 476 310V478H44Z" fill={accent} fillOpacity=".12"/></>}
  {layers.guides&&<g stroke={c.line} opacity=".45"><path d="M68 132H452M68 350H452"/><circle cx="404" cy="92" r="22" fill="none"/></g>}
  {layers.identity&&<g><text x="72" y="102" fill={c.muted} fontSize="16">Z {element.atomicNumber}</text><text x="72" y="292" fill={c.ink} fontSize="172" fontWeight="720" letterSpacing="-8">{element.symbol}</text><text x="72" y="334" fill={c.ink} fontSize="26" fontWeight="600">{element.name[locale]}</text></g>}
  {layers.classification&&<g><circle cx="404" cy="92" r="8" fill={accent}/><text x="72" y="396" fill={accent} fontSize="14">{locale==="fr"?CATEGORY_FR[element.category]:element.category.replace("-"," ")}</text></g>}
  {layers.analysis&&<g fill={c.muted} fontSize="12"><text x="72" y="434">{locale==="fr"?"Période ":"Period "}<tspan fill={c.ink}>{element.period}</tspan></text><text x="194" y="434">{locale==="fr"?"Groupe ":"Group "}<tspan fill={c.ink}>{element.group}</tspan></text><text x="318" y="434">{locale==="fr"?"Bloc ":"Block "}<tspan fill={c.ink}>{element.block}</tspan></text></g>}
 </svg>;
}

function Comparator({left,right,locale,visualStyle,colorMode,layers}:{left:ElementDatum;right:ElementDatum;locale:"fr"|"en";visualStyle:ScienceStyle;colorMode:ScienceColorMode;layers:ScienceLayers}){
 const c=frame(visualStyle),a=tone(left,colorMode),b=tone(right,colorMode),metrics=[{label:"Z",l:left.atomicNumber,r:right.atomicNumber,max:118},{label:locale==="fr"?"Période":"Period",l:left.period,r:right.period,max:7},{label:locale==="fr"?"Groupe":"Group",l:left.group,r:right.group,max:18}];
 return <svg role="img" aria-label={left.name[locale]+" / "+right.name[locale]} viewBox="0 0 520 520" style={{display:"block",width:"100%",height:"100%"}}>{c.canvas&&<rect width="520" height="520" rx="32" fill={c.bg}/>} {layers.structure&&<path d="M260 52V468" stroke={c.line}/>}
  {layers.identity&&<g><text x="54" y="72" fill={c.muted} fontSize="10" letterSpacing="2">{locale==="fr"?"COMPARER":"COMPARE"}</text><text x="54" y="180" fill={c.ink} fontSize="92" fontWeight="720">{left.symbol}</text><text x="292" y="180" fill={c.ink} fontSize="92" fontWeight="720">{right.symbol}</text><text x="54" y="210" fill={c.muted} fontSize="15">{left.name[locale]}</text><text x="292" y="210" fill={c.muted} fontSize="15">{right.name[locale]}</text></g>}
  {layers.classification&&<g><rect x="54" y="228" width="168" height="4" rx="2" fill={a}/><rect x="292" y="228" width="168" height="4" rx="2" fill={b}/></g>}
  {layers.analysis&&<g>{metrics.map((metric,index)=>{const y=288+index*72;return <g key={metric.label}><text x="54" y={y} fill={c.muted} fontSize="11">{metric.label}</text><text x="460" y={y} fill={c.muted} fontSize="11" textAnchor="end">{metric.l} / {metric.r}</text><rect x="54" y={y+15} width="406" height="9" rx="4.5" fill={c.line} fillOpacity=".5"/><rect x="54" y={y+15} width={406*metric.l/metric.max} height="9" rx="4.5" fill={a}/><rect x="54" y={y+31} width={406*metric.r/metric.max} height="9" rx="4.5" fill={b}/></g>;})}</g>}
 </svg>;
}

/** Layered, inspectable scientific view. No raster asset and no arbitrary code. */
export function ScienceObject({id,label,locale="fr",size=360,style="midnight",thumbnail=false,interactive=true,element="C",compareElement="O",colorMode="category",layers,atomic,molecule,onElementChange}:ScienceObjectProps){
 const uid=useId().replace(/:/g,"");
 const safeSize=Number.isFinite(size)?Math.max(120,Math.min(1000,size)):360,selected=elementBySymbol(element)??ELEMENTS[5],compare=elementBySymbol(compareElement)??ELEMENTS[7],resolved={...DEFAULT_SCIENCE_LAYERS,...layers};
 return <span role="group" aria-label={label} data-science-id={id} data-science-state={thumbnail?"poster":"static"} style={{display:"inline-block",width:safeSize,maxWidth:"100%",aspectRatio:"1",verticalAlign:"middle"}}>
  {id==="science-periodic-table"?<PeriodicTable selected={selected} locale={locale} visualStyle={style} colorMode={colorMode} layers={resolved} interactive={!thumbnail&&interactive} onSelect={onElementChange} uid={uid}/>:id==="science-atom"?<AtomicObject element={selected} locale={locale} visualStyle={style} layers={resolved} atomic={atomic}/>:id==="science-molecule"?<MoleculeObject settings={molecule} visualStyle={style} layers={resolved} locale={locale}/>:id==="science-element-card"?<ElementCard element={selected} locale={locale} visualStyle={style} colorMode={colorMode} layers={resolved} uid={uid}/>:<Comparator left={selected} right={compare} locale={locale} visualStyle={style} colorMode={colorMode} layers={resolved}/>}
 </span>;
}
