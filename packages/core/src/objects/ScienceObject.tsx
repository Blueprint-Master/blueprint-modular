"use client";
import React,{useEffect,useId,useRef,useState} from "react";
import {DEFAULT_SCIENCE_LAYERS,ELEMENTS,elementBySymbol,type ElementCategory,type ElementDatum,type ScienceColorMode,type ScienceId,type ScienceLayers,type ScienceStyle} from "./science";

export interface ScienceObjectProps {
 id:ScienceId;label:string;locale?:"fr"|"en";size?:number;style?:ScienceStyle;playing?:boolean;speed?:number;thumbnail?:boolean;interactive?:boolean;
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

type DensityZone="nucleus"|"inner"|"valence";
function Atom({element,locale,visualStyle,colorMode,layers,running,speed,interactive}:{element:ElementDatum;locale:"fr"|"en";visualStyle:ScienceStyle;colorMode:ScienceColorMode;layers:ScienceLayers;running:boolean;speed:number;interactive:boolean;uid:string}){
 const c=frame(visualStyle),accent=tone(element,colorMode),[zone,setZone]=useState<DensityZone>("valence"),dots=Math.min(14,Math.max(6,Math.ceil(Math.sqrt(element.atomicNumber)*1.45))),play=running?"running":"paused",duration=12/Math.max(.1,speed),plotFill=visualStyle==="paper"?"#f7f4ed":visualStyle==="midnight"?"#0a1726":"transparent",displayFamily=visualStyle==="paper"?'"Iowan Old Style",Baskerville,Georgia,serif':"ui-sans-serif,system-ui,sans-serif";
 const activeSubshell=element.block==="d"?`${Math.max(1,element.period-1)}d · ${element.period}s`:element.block==="f"?`${Math.max(1,element.period-2)}f · ${element.period}s`:`${element.period}${element.block}`;
 const densityRegions=element.block==="s"?
  [{d:"M260 177C313 177 350 210 350 254C350 300 313 332 260 332C207 332 170 300 170 254C170 210 207 177 260 177Z",delay:0}]:element.block==="p"?
  [{d:"M111 254C140 203 201 190 244 229C218 279 160 299 111 254Z",delay:0},{d:"M409 254C380 203 319 190 276 229C302 279 360 299 409 254Z",delay:-6}]:
  [{d:"M260 139C299 163 313 207 276 238C235 219 220 174 260 139Z",delay:0},{d:"M376 254C352 293 308 307 277 270C296 229 341 214 376 254Z",delay:-3},{d:"M260 369C221 345 207 301 244 270C285 289 300 334 260 369Z",delay:-6},{d:"M144 254C168 215 212 201 243 238C224 279 179 294 144 254Z",delay:-9}];
 const zoneInfo:Record<DensityZone,{label:string;value:string}>={
  nucleus:{label:locale==="fr"?"Noyau":"Nucleus",value:`${element.atomicNumber} p+`},
  inner:{label:locale==="fr"?"Couches internes":"Inner shells",value:`${Math.max(0,element.period-1)} ${locale==="fr"?"couches":"shells"}`},
  valence:{label:"Valence",value:activeSubshell},
 };
 const zoneButtons:[DensityZone,number][]=[["nucleus",54],["inner",190],["valence",326]];
 const activate=(next:DensityZone)=>interactive&&setZone(next);
 return <svg role="img" aria-label={(locale==="fr"?"Carte de densité atomique ":"Atomic density map ")+element.name[locale]} data-active-density-zone={zone} viewBox="0 0 520 520" style={{display:"block",width:"100%",height:"100%",overflow:"visible",fontFamily:"ui-sans-serif,system-ui,sans-serif"}}>
  {c.canvas&&<rect width="520" height="520" rx="32" fill={c.bg}/>}
  {layers.identity&&<g><text x="36" y="42" fill={c.muted} fontSize="9" letterSpacing="2.2">{locale==="fr"?"CARTE DE DENSITÉ · SCHÉMA QUALITATIF":"DENSITY MAP · QUALITATIVE MODEL"}</text><text x="36" y="103" fill={c.ink} fontFamily={displayFamily} fontSize="54" fontWeight="720" letterSpacing="-2">{element.symbol}</text><text x="124" y="77" fill={c.ink} fontSize="17" fontWeight="650">{element.name[locale]}</text><text x="124" y="100" fill={c.muted} fontSize="11">Z {element.atomicNumber} · {locale==="fr"?"période":"period"} {element.period} · {locale==="fr"?"bloc":"block"} {element.block}</text></g>}
  {layers.classification&&<g><rect x="390" y="56" width="94" height="28" rx="14" fill={accent} fillOpacity=".12" stroke={accent} strokeOpacity=".55"/><text x="437" y="74" fill={accent} textAnchor="middle" fontSize="9" fontWeight="650" letterSpacing=".7">{activeSubshell}</text></g>}
  {layers.structure&&<rect x="36" y="124" width="448" height="278" rx="22" fill={plotFill} stroke={c.line}/>}
  {layers.guides&&<g stroke={c.line} strokeWidth=".7" opacity=".28"><path d="M92 124V402M148 124V402M204 124V402M260 124V402M316 124V402M372 124V402M428 124V402"/><path d="M36 180H484M36 236H484M36 292H484M36 348H484"/></g>}
  {layers.structure&&<g>
   <g fill={accent} data-science-density-regions={densityRegions.length}>{densityRegions.map((density,index)=><path key={index} d={density.d} fillOpacity={zone==="valence"?.22:.1} stroke={accent} strokeOpacity={zone==="valence"?.62:.28} strokeWidth={zone==="valence"?1.3:.8} style={{transformBox:"fill-box",transformOrigin:"center",animation:`science-density-pulse ${duration}s cubic-bezier(.45,0,.25,1) infinite`,animationDelay:(density.delay/Math.max(.1,speed))+"s",animationPlayState:play}}/>)}</g>
   <path d="M260 151C338 151 404 196 411 254C403 318 338 358 260 362C180 358 117 317 109 254C118 194 181 151 260 151Z" fill="none" stroke={zone==="valence"?accent:c.line} strokeOpacity={zone==="valence"?.9:.54} strokeWidth={zone==="valence"?2:1}/>
   <path d="M260 181C320 181 369 213 376 254C369 298 320 329 260 332C198 329 150 298 144 254C151 211 199 181 260 181Z" fill={accent} fillOpacity={zone==="inner"?.1:.035} stroke={zone==="inner"?accent:c.line} strokeOpacity={zone==="inner"?.86:.52} strokeWidth={zone==="inner"?2:1}/>
   <path d="M260 210C298 210 328 229 333 254C328 282 298 300 260 302C221 300 192 281 188 254C193 228 222 210 260 210Z" fill="none" stroke={c.line} strokeOpacity=".62"/>
   <circle cx="260" cy="254" r="34" fill={accent} fillOpacity={zone==="nucleus"?.2:.1} stroke={zone==="nucleus"?accent:c.line} strokeWidth={zone==="nucleus"?2.4:1.2}/>
   {Array.from({length:dots},(_,i)=>{const a=i*2.399,r=6+Math.sqrt(i)*6;return <circle key={i} cx={260+Math.cos(a)*r} cy={254+Math.sin(a)*r} r={i%3===0?4.3:3.2} fill={i%2?accent:c.ink} fillOpacity={.72+(i%4)*.06}/>;})}
  </g>}
  {layers.guides&&<g fill={c.muted} fontFamily="ui-monospace,monospace" fontSize="7.5" letterSpacing="1"><text x="47" y="143">1.0</text><text x="47" y="199">0.8</text><text x="47" y="255">0.5</text><text x="47" y="311">0.2</text><text x="429" y="390">ρ(r)</text></g>}
  {layers.analysis&&<g>{zoneButtons.map(([key,x],index)=>{const active=zone===key;return <g key={key} transform={`translate(${x} 360)`} role={interactive?"button":undefined} tabIndex={interactive?0:undefined} aria-pressed={interactive?active:undefined} aria-label={zoneInfo[key].label} data-density-zone={key} onClick={()=>activate(key)} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();activate(key);}}} style={{cursor:interactive?"pointer":"default",outline:"none"}}><rect width="120" height="27" rx="13.5" fill={active?accent:plotFill} fillOpacity={active?.18:1} stroke={active?accent:c.line}/><text x="13" y="17.5" fill={active?accent:c.muted} fontSize="8.5" fontWeight={active?650:500} letterSpacing=".8">0{index+1} · {zoneInfo[key].label.toUpperCase()}</text></g>;})}</g>}
  {layers.analysis&&<g transform="translate(36 430)"><path d="M0 0H448" stroke={c.line}/><text y="22" fill={c.muted} fontSize="8.5" letterSpacing="1.15">{locale==="fr"?"ZONE LUE":"READING"}</text><text y="47" fill={accent} fontSize="14" fontWeight="650">{zoneInfo[zone].label}</text><text x="148" y="22" fill={c.muted} fontSize="8.5" letterSpacing="1.15">{locale==="fr"?"VALEUR":"VALUE"}</text><text x="148" y="47" fill={c.ink} fontSize="14" fontWeight="650">{zoneInfo[zone].value}</text><text x="296" y="22" fill={c.muted} fontSize="8.5" letterSpacing="1.15">{locale==="fr"?"FAMILLE":"FAMILY"}</text><text x="296" y="47" fill={accent} fontSize="12" fontWeight="600">{locale==="fr"?CATEGORY_FR[element.category]:element.category.replace("-"," ")}</text><text y="70" fill={c.muted} fontSize="8">{locale==="fr"?"Représentation qualitative · non calculée · non à l’échelle":"Qualitative view · not computed · not to scale"}</text></g>}
  <style>{"@keyframes science-density-pulse{0%,100%{opacity:.46;transform:scale(.9)}24%{opacity:.7;transform:scale(.98)}48%{opacity:1;transform:scale(1.045)}72%{opacity:.62;transform:scale(.96)}}@media(prefers-reduced-motion:reduce){svg *{animation:none!important}}"}</style>
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
export function ScienceObject({id,label,locale="fr",size=360,style="midnight",playing=true,speed=1,thumbnail=false,interactive=true,element="C",compareElement="O",colorMode="category",layers,onElementChange}:ScienceObjectProps){
 const root=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(true),uid=useId().replace(/:/g,"");
 useEffect(()=>{if(thumbnail||!root.current||typeof IntersectionObserver==="undefined")return;const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.01});observer.observe(root.current);return()=>observer.disconnect();},[thumbnail]);
 const safeSize=Number.isFinite(size)?Math.max(120,Math.min(1000,size)):360,safeSpeed=Number.isFinite(speed)?Math.max(.1,Math.min(3,speed)):1,selected=elementBySymbol(element)??ELEMENTS[5],compare=elementBySymbol(compareElement)??ELEMENTS[7],resolved={...DEFAULT_SCIENCE_LAYERS,...layers},running=!thumbnail&&playing&&visible;
 return <span ref={root} role="group" aria-label={label} data-science-id={id} data-science-state={thumbnail?"poster":running?"active":"paused"} style={{display:"inline-block",width:safeSize,maxWidth:"100%",aspectRatio:"1",verticalAlign:"middle"}}>
  {id==="science-periodic-table"?<PeriodicTable selected={selected} locale={locale} visualStyle={style} colorMode={colorMode} layers={resolved} interactive={!thumbnail&&interactive} onSelect={onElementChange} uid={uid}/>:id==="science-atom"?<Atom element={selected} locale={locale} visualStyle={style} colorMode={colorMode} layers={resolved} running={running} speed={safeSpeed} interactive={!thumbnail&&interactive} uid={uid}/>:id==="science-element-card"?<ElementCard element={selected} locale={locale} visualStyle={style} colorMode={colorMode} layers={resolved} uid={uid}/>:<Comparator left={selected} right={compare} locale={locale} visualStyle={style} colorMode={colorMode} layers={resolved}/>}
 </span>;
}
