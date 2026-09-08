"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { createPlanetRenderer } from "./planet-renderer";
import { createCanvasPlanetRenderer } from "./planet-canvas-renderer";
import { PLANET_ATMOSPHERES, UNIVERSE_ASSET_PATH, type PlanetId, type PlanetStyle } from "./universe";

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
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const instructionsId=useId();
  const settings=useRef({playing,speed,angle,style});settings.current={playing,speed,angle,style};
  const orientation=useRef({rotation:.05,pitch:0});
  const repaint=useRef(()=>{});
  const drag=useRef<{x:number;y:number;pointer:number}|null>(null);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const [restart,setRestart]=useState(0),[softwareOnly,setSoftwareOnly]=useState(false);
  const safeSize=Number.isFinite(size)?Math.max(48,Math.min(size,1000)):360;
  useEffect(()=>{repaint.current();},[playing,speed,angle,style]);
  useEffect(()=>{
    if(thumbnail)return;
    const canvas=canvasRef.current;if(!canvas)return;
    let disposed=false,visible=true,ready=false,raf=0,last=0,lastDraw=0,maxFps=30;
    setStatus("loading");orientation.current={rotation:.05,pitch:0};
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const ratio=Math.min(window.devicePixelRatio||1,1.5);
    canvas.width=Math.round(safeSize*ratio);canvas.height=canvas.width;
    let renderer:ReturnType<typeof createPlanetRenderer>|ReturnType<typeof createCanvasPlanetRenderer>;
    const draw=()=>{
      if(!ready||disposed)return;
      const s=settings.current;
      renderer.draw({rotation:orientation.current.rotation,tilt:(Number.isFinite(s.angle)?s.angle:0)*Math.PI/180+(id==="uranus"?1.45:-.25),
        pitch:orientation.current.pitch+(id==="saturn"?.45:.08),illustrated:s.style==="illustration"});
    };
    const active=()=>ready&&visible&&!document.hidden&&!media.matches&&settings.current.playing;
    const tick=(time:number)=>{
      raf=0;if(disposed)return;
      const delta=last?Math.min((time-last)/1000,.05):0;last=time;
      if(active()){
        const v=settings.current.speed;
        orientation.current.rotation-=delta/42*(Number.isFinite(v)?Math.max(.1,Math.min(3,v)):1)*(id==="venus"?-1:1);
        if(time-lastDraw>=1000/maxFps){draw();lastDraw=time;}raf=requestAnimationFrame(tick);
      }
    };
    const refresh=()=>{if(disposed)return;cancelAnimationFrame(raf);raf=0;last=0;draw();if(active())raf=requestAnimationFrame(tick);};
    repaint.current=refresh;
    try{const config={surface:textureUrl??`${assetBaseUrl}/${style==="illustration"?"illustrations/":""}${id}.jpg`,clouds:!textureUrl&&id==="earth"?`${assetBaseUrl}/earth-clouds.jpg`:undefined,
      rings:id==="saturn"?`${assetBaseUrl}/saturn-rings.png`:undefined,atmosphere:PLANET_ATMOSPHERES[id],star:id==="sun"};
      try{if(softwareOnly){const software=createCanvasPlanetRenderer(canvas,config);renderer=software;maxFps=software.maxFps;}else renderer=createPlanetRenderer(canvas,config);}catch(error){if(!softwareOnly){setSoftwareOnly(true);}throw error;}
      renderer.ready.then(()=>{if(!disposed){ready=true;setStatus("ready");refresh();}},()=>{if(!disposed)setStatus("error");});
    }catch(error){console.error("[PlanetObject]",error);setStatus("error");}
    const observer=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;refresh();},{threshold:.01}):null;
    observer?.observe(canvas);media.addEventListener("change",refresh);document.addEventListener("visibilitychange",refresh);
    const lost=(event:Event)=>{event.preventDefault();ready=false;cancelAnimationFrame(raf);setStatus("error");};
    const restored=()=>setRestart(n=>n+1);
    canvas.addEventListener("webglcontextlost",lost);canvas.addEventListener("webglcontextrestored",restored);
    return()=>{disposed=true;repaint.current=()=>{};cancelAnimationFrame(raf);observer?.disconnect();media.removeEventListener("change",refresh);
      document.removeEventListener("visibilitychange",refresh);canvas.removeEventListener("webglcontextlost",lost);canvas.removeEventListener("webglcontextrestored",restored);renderer?.dispose();};
  },[id,safeSize,assetBaseUrl,thumbnail,restart,textureUrl,style,softwareOnly]);
  const poster=`${assetBaseUrl}/previews/${id}-${style}.png`;
  return <span data-planet-style={style} data-planet-state={thumbnail?"poster":status} style={{position:"relative",display:"inline-block",width:safeSize,maxWidth:"100%",aspectRatio:"1",verticalAlign:"middle"}}>
    {/* Pre-rendered poster: native picture keeps this renderer portable outside Next.js. */}
    {(thumbnail||status!=="ready")&&<picture><img src={textureUrl??poster} alt={label} loading={thumbnail?"lazy":"eager"} width={safeSize} height={safeSize} style={{width:"100%",height:"100%",objectFit:"contain"}}/></picture>}
    {!thumbnail&&interactive&&<span id={instructionsId} hidden>Drag or use arrow keys to rotate the globe</span>}
    {!thumbnail&&<canvas key={softwareOnly?"software":"webgl"} ref={canvasRef} role="img" aria-label={label} tabIndex={interactive?0:undefined} aria-describedby={interactive?instructionsId:undefined}
      style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:status==="ready"?1:0,touchAction:"pan-y",cursor:interactive?"grab":"default"}}
      onPointerDown={e=>{if(!interactive)return;drag.current={x:e.clientX,y:e.clientY,pointer:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{const d=drag.current;if(!d||!interactive)return;orientation.current.rotation-=(e.clientX-d.x)/safeSize*.45;orientation.current.pitch=Math.max(-.8,Math.min(.8,orientation.current.pitch+(e.clientY-d.y)/safeSize));drag.current={x:e.clientX,y:e.clientY,pointer:e.pointerId};repaint.current();}}
      onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}
      onKeyDown={e=>{if(!interactive)return;if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){e.preventDefault();
        if(e.key==="ArrowLeft"||e.key==="ArrowRight")orientation.current.rotation+=e.key==="ArrowLeft"?.04:-.04;
        else orientation.current.pitch=Math.max(-.8,Math.min(.8,orientation.current.pitch+(e.key==="ArrowUp"?.1:-.1)));repaint.current();}}}/>}
    {!thumbnail&&status==="error"&&<span role="status" style={{position:"absolute",bottom:0,left:0,right:0,fontSize:11,textAlign:"center"}}>Aperçu fixe · animation indisponible</span>}
  </span>;
}
