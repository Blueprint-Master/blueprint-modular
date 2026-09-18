"use client";
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createPlanetClock} from './planet-budget';
import {flagDesign,parseFlagSettings,type FlagSettings,type FlagStyle} from './flags';
import type {FlagCloth} from './flag-cloth';
export interface FlagObjectProps{flag?:FlagSettings;style?:FlagStyle;label?:string;size?:number;playing?:boolean;speed?:number;thumbnail?:boolean;assetBaseUrl?:string}
export function FlagArtworkLayer({href,width,height,opacity=1}:{href:string;width:number;height:number;opacity?:number}){return <g data-flag-layer="artwork" opacity={opacity}><image href={href} width={width} height={height} preserveAspectRatio="xMidYMid meet"/></g>;}
export function FlagObject({flag,style='photorealistic',label,size=360,playing=true,speed=1,thumbnail=false,assetBaseUrl='/objects/flags-v1'}:FlagObjectProps){
 const settings=useMemo(()=>parseFlagSettings(flag),[flag]),design=flagDesign(settings?.design??'fr'),root=useRef<HTMLSpanElement>(null),canvas=useRef<HTMLCanvasElement>(null),time=useRef(0),latest=useRef({settings,style,playing,speed}),refresh=useRef(()=>{});
 const [visible,setVisible]=useState(false),[state,setState]=useState<'loading'|'ready'|'error'>('loading');const safeSize=Number.isFinite(size)?Math.max(48,Math.min(1000,size)):360;
 useEffect(()=>{latest.current={settings,style,playing,speed};refresh.current();},[settings,style,playing,speed]);
 useEffect(()=>{const el=root.current;if(!el||thumbnail)return;const update=()=>{const r=el.getBoundingClientRect();setVisible(!document.hidden&&r.bottom>0&&r.top<window.innerHeight&&r.right>0&&r.left<window.innerWidth);};const observer=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting&&!document.hidden)):null;observer?.observe(el);document.addEventListener('visibilitychange',update);if(!observer)void Promise.resolve().then(update);return()=>{observer?.disconnect();document.removeEventListener('visibilitychange',update);};},[thumbnail]);
 useEffect(()=>{if(!visible||thumbnail||!design||!canvas.current)return;const target=canvas.current,reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(pointer: coarse)').matches||innerWidth<600;let disposed=false,renderer:FlagCloth|undefined;
  const draw=()=>{const s=latest.current.settings;if(s)renderer?.draw(time.current,s,latest.current.style);};
  const clock=createPlanetClock(mobile?18:24,delta=>{const s=latest.current.speed;time.current+=delta*(Number.isFinite(s)?Math.max(.1,Math.min(3,s)):1);draw();});
  const update=()=>{draw();const s=latest.current.settings;if(renderer&&latest.current.playing&&s?.mode==='waving'&&s.wind>0&&!reduced.matches)clock.start();else clock.stop();};
  void Promise.resolve().then(()=>{if(!disposed)setState('loading');});const image=new Image();image.crossOrigin='anonymous';const fail=()=>{if(!disposed){clock.stop();setState('error');}};
  // Promise.all preserves the deferred export in the library Rollup build.
  void Promise.all([import('./flag-cloth')]).then(([{createFlagCloth}])=>{if(disposed)return;image.onload=()=>{if(disposed)return;try{target.width=target.height=Math.min(mobile?384:640,Math.round(safeSize*Math.min(devicePixelRatio||1,1.5)));renderer=createFlagCloth(target,image,design.ratio);setState('ready');refresh.current=update;reduced.addEventListener('change',update);update();}catch{fail();}};image.onerror=fail;image.src=`${assetBaseUrl}/${design.id}.svg`;}).catch(fail);
  const lost=(e:Event)=>{e.preventDefault();fail();};target.addEventListener('webglcontextlost',lost);
  return()=>{disposed=true;image.onload=image.onerror=null;clock.stop();renderer?.dispose();reduced.removeEventListener('change',update);target.removeEventListener('webglcontextlost',lost);refresh.current=()=>{};};
 },[visible,thumbnail,design,safeSize,assetBaseUrl]);
 if(!settings||!design)return <span role="status">Drapeau indisponible</span>;
 const title=label??design.name.fr,ready=state==='ready'&&visible&&!thumbnail,w=Math.min(.82,.66*design.ratio),h=w/design.ratio;
 return <span ref={root} data-flag-id={design.id} data-flag-state={thumbnail?'poster':state} style={{display:'inline-block',position:'relative',width:safeSize,maxWidth:'100%',aspectRatio:'1',verticalAlign:'middle',background:settings.background==='midnight'?'#0b1420':settings.background==='paper'?'#f4f1e9':'transparent'}}>
  <picture><img src={`${assetBaseUrl}/${design.id}.svg`} alt={title} loading="lazy" width={safeSize} height={safeSize} onError={()=>setState('error')} style={{position:'absolute',left:'9%',top:`${(1-h)*50}%`,width:`${w*100}%`,height:`${h*100}%`,objectFit:'contain',visibility:ready?'hidden':'visible',opacity:settings.layers.artwork?1:0}}/></picture>
  {!thumbnail&&<canvas ref={canvas} role="img" aria-label={title} style={{position:'absolute',inset:0,width:'100%',height:'100%',visibility:ready?'visible':'hidden'}}/>}
  {settings.layers.pole&&<svg data-flag-layer="pole" viewBox="0 0 100 100" aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}><path d="M8.5 10v82" stroke="#9ba5ab"/><circle cx="8.5" cy="9" r="1.6" fill="#b7c0c7"/></svg>}
  {state==='error'&&<span role="status" style={{position:'absolute',bottom:4,left:8,fontSize:11,color:settings.background==='midnight'?'#fff':'inherit'}}>Rendu indisponible · aperçu fixe si disponible</span>}
 </span>;
}
