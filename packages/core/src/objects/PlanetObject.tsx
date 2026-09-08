"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { createPlanetRenderer } from "./planet-renderer";
import { createCanvasPlanetRenderer } from "./planet-canvas-renderer";
import {planetBudget,createPlanetClock} from "./planet-budget";
import { PLANET_PITCHES, PLANET_ACTIVITY, planetSurfacePath, planetPosterPath, PLANET_ATMOSPHERES, UNIVERSE_ASSET_PATH, type PlanetId, type PlanetStyle } from "./universe";

export interface PlanetObjectProps {
  id:PlanetId; label:string; size?:number; style?:PlanetStyle; playing?:boolean; speed?:number;
  angle?:number; interactive?:boolean; assetBaseUrl?:string; thumbnail?:boolean;
  textureUrl?:string;
}
/** A textured sphere with independent cloud motion, fixed lighting and occluding rings.
 * Reduced motion, hidden tabs and offscreen objects stop the animation clock.
 * Drag horizontally to rotate, vertically to tip; arrows provide the same control.
 * Assets are shipped with core and must be copied into the consumer's public/objects. */
export function PlanetObject({id,label,size=360,style="photorealistic",playing=true,speed=1,angle=0,interactive=true,assetBaseUrl=UNIVERSE_ASSET_PATH,thumbnail=false,textureUrl}:PlanetObjectProps){
  const rootRef=useRef<HTMLSpanElement>(null);
  const elapsed=useRef(0);
  const [inView,setInView]=useState(false),[pageVisible,setPageVisible]=useState(true),[displayWidth,setDisplayWidth]=useState(size);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const instructionsId=useId();
  const settings=useRef({playing,speed,angle,style});settings.current={playing,speed,angle,style};
  const orientation=useRef({rotation:.05,pitch:0});
  const repaint=useRef(()=>{});
  const drag=useRef<{x:number;y:number;pointer:number}|null>(null);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const [restart,setRestart]=useState(0),[softwareOnly,setSoftwareOnly]=useState(false);
  const safeSize=Number.isFinite(size)?Math.max(48,Math.min(size,1000)):360;
  useEffect(()=>{orientation.current={rotation:.05,pitch:0};elapsed.current=0;},[id]);
  useEffect(()=>{repaint.current();},[playing,speed,angle,style]);
  useEffect(()=>{
    if(thumbnail)return;
    const element=rootRef.current;if(!element)return;
    const visibility=()=>setPageVisible(!document.hidden);visibility();
    document.addEventListener("visibilitychange",visibility);
    const observer=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:.01}):null;
    if(observer)observer.observe(element);else setInView(true);
    const resize=()=>setDisplayWidth(Math.max(48,Math.round(element.getBoundingClientRect().width||safeSize)));
    const sizing=typeof ResizeObserver!=="undefined"?new ResizeObserver(resize):null;sizing?.observe(element);resize();
    return()=>{observer?.disconnect();sizing?.disconnect();document.removeEventListener("visibilitychange",visibility);};
  },[thumbnail,safeSize]);
  useEffect(()=>{
    if(thumbnail||!inView||!pageVisible)return;
    const canvas=canvasRef.current;if(!canvas)return;
    let disposed=false,ready=false;
    setStatus("loading");
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const constrained=window.matchMedia("(pointer: coarse)").matches||window.innerWidth<600||(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData===true;
    const budget=planetBudget(Math.min(safeSize,displayWidth),window.devicePixelRatio||1,constrained,softwareOnly);
    canvas.width=budget.size;canvas.height=canvas.width;
    let renderer:ReturnType<typeof createPlanetRenderer>|ReturnType<typeof createCanvasPlanetRenderer>|undefined;
    const draw=()=>{
      if(!ready||disposed)return;
      const s=settings.current;
      renderer?.draw({rotation:orientation.current.rotation,tilt:(Number.isFinite(s.angle)?s.angle:0)*Math.PI/180+(id==="uranus"?1.45:-.25),
        pitch:orientation.current.pitch+(PLANET_PITCHES[id]??.08),illustrated:s.style==="illustration",time:elapsed.current});
    };
    const clock=createPlanetClock(budget.fps,delta=>{
      const v=settings.current.speed,rate=Number.isFinite(v)?Math.max(.1,Math.min(3,v)):1;
      elapsed.current+=delta*rate;
      orientation.current.rotation-=delta/42*rate*(id==="venus"?-1:1);draw();
    });
    const refresh=()=>{if(disposed)return;draw();if(ready&&!media.matches&&settings.current.playing)clock.start();else clock.stop();};
    repaint.current=refresh;
    try{
      const config={surface:textureUrl??`${assetBaseUrl}/${planetSurfacePath(id,style)}`,clouds:!textureUrl&&id==="earth"?`${assetBaseUrl}/compact/earth-clouds.webp`:undefined,
        rings:id==="saturn"?`${assetBaseUrl}/saturn-rings.png`:undefined,atmosphere:PLANET_ATMOSPHERES[id],star:id==="sun",activity:textureUrl?0:PLANET_ACTIVITY[id]??0};
      if(softwareOnly)renderer=createCanvasPlanetRenderer(canvas,config);
      else {try{renderer=createPlanetRenderer(canvas,config);}catch{setSoftwareOnly(true);}}
      renderer?.ready.then(()=>{if(!disposed){ready=true;setStatus("ready");refresh();}},()=>{if(!disposed)setStatus("error");});
    }catch(error){console.error("[PlanetObject]",error);setStatus("error");}
    media.addEventListener("change",refresh);
    const lost=(event:Event)=>{event.preventDefault();ready=false;clock.stop();setStatus("error");};
    const restored=()=>setRestart(n=>n+1);
    canvas.addEventListener("webglcontextlost",lost);canvas.addEventListener("webglcontextrestored",restored);
    return()=>{disposed=true;repaint.current=()=>{};clock.stop();media.removeEventListener("change",refresh);
      canvas.removeEventListener("webglcontextlost",lost);canvas.removeEventListener("webglcontextrestored",restored);renderer?.dispose();};
  },[id,safeSize,displayWidth,inView,pageVisible,assetBaseUrl,thumbnail,restart,textureUrl,style,softwareOnly]);
  const poster=`${assetBaseUrl}/${planetPosterPath(id,style)}`;
  return <span ref={rootRef} data-planet-style={style} data-planet-state={thumbnail?"poster":status} style={{position:"relative",display:"inline-block",width:safeSize,maxWidth:"100%",aspectRatio:"1",verticalAlign:"middle"}}>
    {/* Pre-rendered poster: native picture keeps this renderer portable outside Next.js. */}
    {(thumbnail||status!=="ready"||!inView||!pageVisible)&&<picture><img src={textureUrl??poster} alt={label} loading="lazy" width={safeSize} height={safeSize} style={{width:"100%",height:"100%",objectFit:"contain"}}/></picture>}
    {!thumbnail&&interactive&&<span id={instructionsId} hidden>Drag or use arrow keys to rotate the globe</span>}
    {!thumbnail&&<canvas key={softwareOnly?"software":"webgl"} ref={canvasRef} role="img" aria-label={label} tabIndex={interactive?0:undefined} aria-describedby={interactive?instructionsId:undefined}
      style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:status==="ready"&&inView&&pageVisible?1:0,touchAction:"pan-y",cursor:interactive?"grab":"default"}}
      onPointerDown={e=>{if(!interactive)return;drag.current={x:e.clientX,y:e.clientY,pointer:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{const d=drag.current;if(!d||!interactive)return;orientation.current.rotation-=(e.clientX-d.x)/safeSize*.45;orientation.current.pitch=Math.max(-.8,Math.min(.8,orientation.current.pitch+(e.clientY-d.y)/safeSize));drag.current={x:e.clientX,y:e.clientY,pointer:e.pointerId};repaint.current();}}
      onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}
      onKeyDown={e=>{if(!interactive)return;if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){e.preventDefault();
        if(e.key==="ArrowLeft"||e.key==="ArrowRight")orientation.current.rotation+=e.key==="ArrowLeft"?.04:-.04;
        else orientation.current.pitch=Math.max(-.8,Math.min(.8,orientation.current.pitch+(e.key==="ArrowUp"?.1:-.1)));repaint.current();}}}/>}
    {!thumbnail&&status==="error"&&<span role="status" style={{position:"absolute",bottom:0,left:0,right:0,fontSize:11,textAlign:"center"}}>Aperçu fixe · animation indisponible</span>}
  </span>;
}
