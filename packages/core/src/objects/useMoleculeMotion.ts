"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
/** One 12–18 fps loop per selected visible molecule. No atom/coordinate deformation. */
export function moleculeMotionPose(seconds:number) {
  const phase=seconds*Math.PI/10;
  return { yaw:9*Math.sin(phase),pitch:4*Math.sin(phase*2) };
}
export function useMoleculeMotion(ref:RefObject<SVGSVGElement|null>,enabled:boolean,speed=1) {
  const elapsed=useRef(0);
  const [pose,setPose]=useState({yaw:0,pitch:0}),[active,setActive]=useState(false);
  useEffect(()=>{
    const node=ref.current;if(!enabled||!node)return;
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)"),mobile=window.matchMedia("(max-width: 640px)");
    let visible=false,disposed=false,raf=0,last=0,drawn=0;
    const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;setActive(false);};
    const tick=(time:number)=>{
      if(last)elapsed.current+=(time-last)/1000*speed;
      last=time;
      if(time-drawn>=1000/(mobile.matches?12:18)){setPose(moleculeMotionPose(elapsed.current));drawn=time;}
      raf=requestAnimationFrame(tick);
    };
    const update=()=>{if(disposed)return;if(visible&&!reduce.matches&&!document.hidden){if(!raf){setActive(true);raf=requestAnimationFrame(tick);}}else stop();};
    const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);update();});observer.observe(node);
    reduce.addEventListener("change",update);document.addEventListener("visibilitychange",update);
    return()=>{disposed=true;stop();observer.disconnect();reduce.removeEventListener("change",update);document.removeEventListener("visibilitychange",update);};
  },[ref,enabled,speed]);
  return {pose,active};
}
