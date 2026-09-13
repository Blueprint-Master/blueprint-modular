"use client";
import type {EarthLayers} from "./earth-layers";
import React from "react";
import { PlanetObject } from "./PlanetObject";
import { WeatherObject } from "./WeatherObject";
import {FormObject} from "./FormObject";
import {FloraObject} from "./FloraObject";
import {isFloraId,FLORA_VERSION,FLORA_NAMES} from "./flora";
import {isFormId,FORMS_VERSION,FORM_NAMES} from "./forms";
import {isWeatherId,WEATHER_VERSION,WEATHER_NAMES} from "./weather";
import { isPlanetId, UNIVERSE_VERSION, type PlanetStyle } from "./universe";
import { CelestialBody } from "../../../../components/bpm/CelestialBody";
import { resolveModularObject, OBJECT_CATALOG_VERSION, type ModularObjectDefinition } from "./catalog";

export interface ModularObjectProps {
  id: string;
  version?: string;
  label?: string;
  locale?: "fr" | "en";
  size?: number;
  /** Projection angle, not a physically accurate 3D camera. */
  angle?: number;
  color?: string;
  className?: string;
  variant?: PlanetStyle;
  playing?: boolean;
  speed?: number;
  interactive?: boolean;
  assetBaseUrl?: string;
  thumbnail?: boolean;
  earth?: Partial<EarthLayers>;
}

function Solid({ x = 0, y = 0, width = 100, height = 70, depth = 28, color }: {
  x?: number; y?: number; width?: number; height?: number; depth?: number; color: string;
}) {
  return <g transform={`translate(${x} ${y})`}>
    <path d={`M0 0 L${depth} ${-depth * .6} H${width + depth} L${width} 0Z`} fill={color}/>
    <path d={`M${width} 0 l${depth} ${-depth * .6} v${height} l${-depth} ${depth * .6}Z`} fill={color}/>
    <path d={`M${width} 0 l${depth} ${-depth * .6} v${height} l${-depth} ${depth * .6}Z`} fill="#071326" opacity=".28"/>
    <rect width={width} height={height} fill={color}/>
    <path d={`M0 0 L${depth} ${-depth * .6} H${width + depth} L${width} 0Z`} fill="white" opacity=".25"/>
  </g>;
}

function BuiltObject({ item, color }: { item: ModularObjectDefinition; color: string }) {
  const s = item.shape;
  const windows = (columns: number, rows: number, x: number, y: number) => Array.from({length: columns * rows}, (_, i) =>
    <rect key={i} x={x + (i % columns) * 22} y={y + Math.floor(i / columns) * 25} width="12" height="15" rx="1" fill="#ddf1ee" opacity=".86"/>);
  if (s === "car" || s === "van" || s === "truck") return <g>
    <Solid x={36} y={111} width={135} height={35} depth={29} color={color}/>
    {s === "car" ? <><Solid x={76} y={87} width={62} height={26} depth={25} color={color}/><path d="M83 91h48v17H83z" fill="#263d50"/></> :
      <><Solid x={36} y={s === "truck" ? 69 : 74} width={s === "truck" ? 83 : 100} height={s === "truck" ? 68 : 63} depth={29} color={color}/>
      <Solid x={s === "truck" ? 124 : 140} y={89} width={s === "truck" ? 47 : 31} height={48} depth={29} color={color}/>
      <rect x={s === "truck" ? 132 : 145} y="95" width={s === "truck" ? 29 : 20} height="19" rx="2" fill="#263d50"/></>}
    {[65,151].map(x => <g key={x}><circle cx={x} cy="145" r="15" fill="#172431"/><circle cx={x} cy="145" r="7" fill="#a7b8c6"/><circle cx={x} cy="145" r="3" fill="#354a5b"/></g>)}
    <rect x="165" y="118" width="8" height="5" rx="1" fill="#fff0c4"/>
  </g>;
  if (s === "pallet") return <g>{[0,1,2].map(i => <Solid key={i} x={40+i*47} y={142} width={15} height={13} depth={38} color={color}/>)}
    {[0,1,2,3].map(i => <Solid key={i} x={40+i*7} y={126-i*5} width={119} height={8} depth={6} color={color}/>)}</g>;
  if (s === "parcel") return <g><Solid x={64} y={82} width={83} height={69} depth={38} color={color}/>
    <path d="M95 82l38-23h17l-38 23v69H95z" fill="#e5cdaa"/><rect x="73" y="103" width="17" height="22" fill="#f9eedb"/>
    <path d="M76 108h10m-10 5h10m-10 5h6" stroke="#697276" strokeWidth="2"/></g>;
  if (s === "container") return <g><Solid x={37} y={88} width={137} height={65} depth={32} color={color}/>
    {Array.from({length:13}, (_,i) => <path key={i} d={`M${44+i*10} 91v58`} stroke="#071326" opacity=".25" strokeWidth="3"/>)}</g>;
  const tall = s === "building";
  return <g><Solid x={tall?73:43} y={tall?39:91} width={tall?77:121} height={tall?112:60} depth={32} color={color}/>
    {s === "house" && <><path d="M33 92l70-54 70 54Z" fill="#604b50"/><path d="M103 38l32-19 70 54-32 19Z" fill="#967178"/>
      <rect x="93" y="114" width="21" height="37" fill="#314854"/>{windows(2,1,57,108)}</>}
    {tall && windows(3,4,82,46)}
    {s === "warehouse" && <><path d="M36 91l61-33 74 33Z" fill="#546b6b"/><path d="M97 58l32-20 74 34-32 19Z" fill="#9aafaa"/>
      <rect x="70" y="111" width="66" height="40" fill="#334e55"/>{[0,1,2,3,4].map(i=><path key={i} d={`M73 ${116+i*7}h60`} stroke="#88a4a3"/>)}</>}
    {s === "factory" && <><Solid x={148} y={27} width={12} height={66} depth={9} color="#647784"/>
      <path d="M43 91V63l38 28V63l40 28V63l43 28Z" fill="#687589"/>{windows(4,1,54,105)}<rect x="144" y="129" width="17" height="22" fill="#314854"/></>}
  </g>;
}

/** Version 1 renders stable vectors; Universe version 2 renders interactive textured spheres. */
export function ModularObject({ id, version = OBJECT_CATALOG_VERSION, label, locale = "fr", size = 240, angle = 0, color, className, variant="photorealistic",playing=true,speed=1,interactive=true,assetBaseUrl,thumbnail=false,earth }: ModularObjectProps) {
  if(version===FLORA_VERSION&&isFloraId(id)&&(variant==="photorealistic"||variant==="illustration"))return <span className={className} data-modular-object={`${id}@${version}`}><FloraObject id={id} label={label??FLORA_NAMES[id][locale]} size={size} style={variant} playing={playing} speed={speed} assetBaseUrl={assetBaseUrl} thumbnail={thumbnail}/></span>;
  if(version===FORMS_VERSION&&isFormId(id)&&(variant==="photorealistic"||variant==="illustration"))return <span className={className} data-modular-object={`${id}@${version}`}><FormObject id={id} label={label??FORM_NAMES[id][locale]} size={size} style={variant} playing={playing} speed={speed} assetBaseUrl={assetBaseUrl} thumbnail={thumbnail}/></span>;
  if(version===WEATHER_VERSION&&isWeatherId(id)&&(variant==="photorealistic"||variant==="illustration"))return <span className={className} data-modular-object={`${id}@${version}`}><WeatherObject id={id} label={label??WEATHER_NAMES[id][locale]} size={size} style={variant} playing={playing} speed={speed} assetBaseUrl={assetBaseUrl} thumbnail={thumbnail}/></span>;
  if(version===UNIVERSE_VERSION&&isPlanetId(id)&&(variant==="photorealistic"||variant==="illustration")){
    const definition=resolveModularObject(id,version)!;
    return <span className={className} data-modular-object={`${id}@${version}`}><PlanetObject id={id} label={label??definition.name[locale]} size={size} angle={angle} style={variant} playing={playing} speed={speed} earth={earth} interactive={interactive} assetBaseUrl={assetBaseUrl} thumbnail={thumbnail}/></span>;
  }
  const item = resolveModularObject(id, version);
  const safeSize = Number.isFinite(size) ? Math.max(48, Math.min(1000,size)) : 240;
  if (!item || version===UNIVERSE_VERSION || item.family==="weather" || item.family==="forms" || item.family==="flora") return <span role="status" data-object-unavailable={`${id}@${version}`}>{locale === "fr" ? "Objet indisponible" : "Object unavailable"}</span>;
  const title = label ?? item.name[locale];
  // Reject URL paint servers and arbitrary CSS; the host may supply a hex theme token value.
  const paint = color && /^#[0-9a-f]{6}$/i.test(color) ? color : item.color;
  const a = Number.isFinite(angle) ? Math.max(-35, Math.min(35,angle)) : 0;
  const celestial = item.family === "space";
  return <span className={className} data-modular-object={`${id}@${version}`} style={{display:"inline-flex",justifyContent:"center",alignItems:"center",width:safeSize,maxWidth:"100%",aspectRatio:"1",verticalAlign:"middle"}}>
    {celestial ? <span style={{display:"block",width:"100%",transform:`rotate(${a}deg)`}}>
      <CelestialBody label={title} kind={item.shape as "planet"|"star"|"moon"} color={paint} size={safeSize} rings={item.rings} tilt={-24}>
        {id === "earth" && <><path d="M24 29l17-3 8 11-7 8 7 8-4 17-9-12-3-14-10-4Z M59 30l18 6-5 13-10-4-7-8Z M62 61l12-3 6 11-10 4Z" fill="#88bd8b"/><path d="M22 41q24-10 56 1M27 62q24-8 44 1" fill="none" stroke="white" strokeWidth="2" opacity=".5"/></>}
        {(id === "jupiter" || id === "venus") && <g stroke="#f5dfb7" opacity=".4" strokeWidth="5"><path d="M18 34h64M18 47h64M18 62h64"/></g>}
        {id === "jupiter" && <ellipse cx="61" cy="61" rx="9" ry="4" fill="#b76848"/>}
        {id === "mars" && <path d="M29 40l18-7 7 13-11 12 7 15-19-4Z" fill="#713e37" opacity=".5"/>}
      </CelestialBody>
    </span> : <svg role="img" aria-label={title} viewBox="0 0 240 220" width={safeSize} style={{display:"block",maxWidth:"100%",height:"auto"}}>
      <title>{title}</title><ellipse cx="125" cy="173" rx="77" ry="13" fill="#182e42" opacity=".12"/>
      <g transform={`translate(120 110) rotate(${a*.18}) skewY(${a*.12}) translate(-120 -110)`}><BuiltObject item={item} color={paint}/></g>
    </svg>}
  </span>;
}
