"use client";
import React,{useEffect,useRef,useState} from "react";
import {createPlanetClock} from "./planet-budget";
import {FORMS_ASSET_PATH,formBudget,formPosterPath,type FormId,type FormStyle} from "./forms";
export interface FormObjectProps {
  id:FormId;label:string;size?:number;style?:FormStyle;playing?:boolean;speed?:number;
  thumbnail?:boolean;assetBaseUrl?:string;
}
/** Deforming sculpture. Static lazy SSR posters, no raster material download.
 * One capped clock only while selected, onscreen, visible and motion is allowed. */
export function FormObject({id,label,size=360,style="photorealistic",playing=true,speed=1,thumbnail=false,assetBaseUrl=FORMS_ASSET_PATH}:FormObjectProps){
  const root=useRef<HTMLSpanElement>(null),canvas=useRef<HTMLCanvasElement>(null),elapsed=useRef(0);
  const settings=useRef({playing,speed}),refresh=useRef(()=>{});
  const [visible,setVisible]=useState(false),[width,setWidth]=useState(size),[pageVisible,setPageVisible]=useState(true);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading"),[posterError,setPosterError]=useState(false);
  const safeSize=Number.isFinite(size)?Math.max(48,Math.min(1000,size)):360;
  useEffect(()=>{settings.current={playing,speed};refresh.current();},[playing,speed]);
  useEffect(()=>{elapsed.current=0;},[id]);
  useEffect(()=>{
    if(thumbnail)return;const element=root.current;if(!element)return;
    const page=()=>setPageVisible(!document.hidden),resize=()=>setWidth(element.getBoundingClientRect().width||safeSize);
    const intersection=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.01}):null;
    const sizing=typeof ResizeObserver!=="undefined"?new ResizeObserver(resize):null;
    intersection?.observe(element);sizing?.observe(element);document.addEventListener("visibilitychange",page);
    let subscribed=true;void Promise.resolve().then(()=>{if(subscribed){page();resize();if(!intersection)setVisible(true);}});
    return()=>{subscribed=false;intersection?.disconnect();sizing?.disconnect();document.removeEventListener("visibilitychange",page);};
  },[thumbnail,safeSize]);
  useEffect(()=>{
    if(thumbnail||!visible||!pageVisible)return;const target=canvas.current;if(!target)return;
    let disposed=false;const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const constrained=window.matchMedia("(pointer: coarse)").matches||window.innerWidth<600||(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData===true;
    const budget=formBudget(Math.min(width,safeSize),window.devicePixelRatio||1,constrained);
    let draw=()=>{};const clock=createPlanetClock(budget.fps,delta=>{const s=settings.current.speed;elapsed.current+=delta*(Number.isFinite(s)?Math.max(.1,Math.min(3,s)):1);draw();});
    const update=()=>{if(disposed)return;draw();if(settings.current.playing&&!media.matches)clock.start();else clock.stop();};
    void Promise.resolve().then(()=>{if(!disposed)setStatus("loading");});
    void import("./forms-renderer").then(({createFormField})=>{
      if(disposed)return;target.width=target.height=budget.size;
      const ctx=target.getContext("2d");if(!ctx)throw Error("Canvas unavailable");
      const field=createFormField(budget.size),frame=ctx.createImageData(budget.size,budget.size);
      draw=()=>{frame.data.set(field.draw(id,style,elapsed.current));ctx.putImageData(frame,0,0);};
      refresh.current=update;media.addEventListener("change",update);setStatus("ready");update();
    }).catch(()=>{if(!disposed){clock.stop();setStatus("error");}});
    return()=>{disposed=true;clock.stop();media.removeEventListener("change",update);refresh.current=()=>{};};
  },[id,style,thumbnail,visible,pageVisible,width,safeSize]);
  return <span ref={root} data-form-id={id} data-form-state={thumbnail?"poster":status} style={{position:"relative",display:"inline-block",width:safeSize,maxWidth:"100%",aspectRatio:"1",verticalAlign:"middle"}}>
    {(thumbnail||status!=="ready"||!visible||!pageVisible)&&<picture><img key={`${id}-${style}`} src={`${assetBaseUrl}/${formPosterPath(id,style)}`} alt={label} loading="lazy" width={safeSize} height={safeSize} onLoad={()=>setPosterError(false)} onError={()=>setPosterError(true)} style={{width:"100%",height:"100%",objectFit:"contain"}}/></picture>}
    {!thumbnail&&<canvas ref={canvas} role="img" aria-label={label} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:status==="ready"&&visible&&pageVisible?1:0}}/>}
    {(status==="error"||posterError)&&<span role="status" style={{position:"absolute",bottom:0,left:0,right:0,textAlign:"center",fontSize:11}}>{posterError?"Aperçu indisponible":"Aperçu fixe · animation indisponible"}</span>}
  </span>;
}
