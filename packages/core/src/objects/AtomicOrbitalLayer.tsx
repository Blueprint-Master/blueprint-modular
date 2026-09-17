"use client";
import React,{useMemo} from "react";
import {orbitalContours} from "./atomic-orbitals";
export interface AtomicOrbitalLayerProps { n:number;l:number;opacity?:number;positive?:string;negative?:string;nucleus?:boolean;density?:boolean;guides?:boolean; }
/** Background-free, reusable SVG group. Analytic hydrogenic xz section, m=0,
 * normalized for display. No electron trajectories or fictitious nucleons. */
export function AtomicOrbitalLayer({n,l,opacity=1,positive="#63d9e7",negative="#f6b477",nucleus=true,density=true,guides=false}:AtomicOrbitalLayerProps){
  const paths=useMemo(()=>Number.isInteger(n)&&n>=1&&n<=7&&Number.isInteger(l)&&l>=0&&l<Math.min(n,4)?orbitalContours(n,l):[],[n,l]);
  return <g data-science-layer="atomic-orbital" data-scientific-status="hydrogenic-basis-not-total-density" opacity={opacity}>
    {guides&&<g stroke="currentColor" strokeOpacity=".18" fill="none"><path d="M-170 0H170M0-155V155" strokeDasharray="2 5"/><text x="172" y="4" fill="currentColor" stroke="none" fontSize="10">x</text><text x="6" y="-146" fill="currentColor" stroke="none" fontSize="10">z</text></g>}
    {density&&paths.map(({sign,level,path})=><path key={`${sign}:${level}`} d={path} fill={sign>0?positive:negative} fillRule="evenodd" fillOpacity={.035+level*.12} stroke={sign>0?positive:negative} strokeWidth={level>.4?2.2:1.3} strokeOpacity={.28+level*.8}/>)}
    {nucleus&&<g data-atomic-sublayer="nucleus"><circle r="3" fill="currentColor"/><circle r="8" fill="none" stroke="currentColor" strokeOpacity=".35"/></g>}
  </g>;
}
