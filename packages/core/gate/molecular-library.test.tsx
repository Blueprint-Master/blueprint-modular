import React,{useState} from "react";
import {describe,it,expect,vi,afterEach} from "vitest";
import {act,cleanup,fireEvent,render,screen} from "@testing-library/react";
import {MOLECULE_PRESETS,moleculePresetSettings} from "../src/objects/molecule-presets";
import {moleculeFormula} from "../src/objects/molecule-formula";
import {recognizeMolecule,sameMoleculeConnectivity} from "../src/objects/molecule-recognition";
import {parseMoleculeGraph,parseMoleculeSettings,type MoleculeGraph} from "../src/objects/molecules";
import {MoleculeControls} from "../src/objects/MoleculeControls";
import {ScienceObject} from "../src/objects/ScienceObject";
import {ELEMENTS} from "../src/objects/science";
import {electronConfiguration,hydrogenicRadial,orbitalAmplitude} from "../src/objects/atomic-orbitals";
import {moleculeMotionPose} from "../src/objects/useMoleculeMotion";
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe("sourced molecular library and reverse composition",()=>{
 it("ships at least 120 bounded, independent, sourced molecular graphs",()=>{
  expect(Object.keys(MOLECULE_PRESETS).length).toBeGreaterThanOrEqual(120);
  for(const p of Object.values(MOLECULE_PRESETS)){
   expect(parseMoleculeGraph(p.graph)).toEqual(p.graph);
   expect(moleculeFormula(p.graph)).toMatch(/^[A-Z]/);
   if(p.method==="computed")expect(p.source).toContain(`/compound/${p.cid}#section=3D-Conformer`);
  }
 });
 it("distinguishes formula candidates from connectivity, independent of atom IDs/order",()=>{
  const graph=MOLECULE_PRESETS.ethanol.graph;
  expect(recognizeMolecule({...graph,bonds:[]})).toMatchObject({formula:"C2H6O",candidates:expect.arrayContaining(["ethanol","dimethyl-ether"]),connectivity:[]});
  const ids=new Map(graph.atoms.map((a,i)=>[a.id,`X${i}`]));
  const permuted:MoleculeGraph={atoms:[...graph.atoms].reverse().map(a=>({...a,id:ids.get(a.id)!,position:[0,0,0]})),bonds:graph.bonds.map(b=>({...b,from:ids.get(b.to)!,to:ids.get(b.from)!}))};
  expect(recognizeMolecule(permuted).connectivity).toEqual(["ethanol"]);
  expect(sameMoleculeConnectivity(graph,MOLECULE_PRESETS["dimethyl-ether"].graph)).toBe(false);
  expect(sameMoleculeConnectivity(graph,graph,0)).toBeUndefined();
 });
 it("does not claim stereochemical identification or invent absent compounds",()=>{
  expect(recognizeMolecule(MOLECULE_PRESETS["cis-2-butene"].graph).connectivity).toEqual(expect.arrayContaining(["cis-2-butene","trans-2-butene"]));
  expect(recognizeMolecule({atoms:[{id:"F",element:"F",position:[0,0,0]}],bonds:[]}).candidates).toEqual([]);
 });
 it("lets people select atoms, inspect candidates and load a sourced geometry",()=>{
  function Composer(){const [v,setV]=useState(moleculePresetSettings("water"));return <MoleculeControls value={v} onChange={setV}/>;}
  render(<Composer/>);
  fireEvent.change(screen.getByLabelText("Nombre d’atomes C"),{target:{value:"2"}});
  fireEvent.change(screen.getByLabelText("Nombre d’atomes H"),{target:{value:"6"}});
  fireEvent.click(screen.getByRole("button",{name:/Rechercher avec ces atomes/}));
  expect(screen.getByRole("button",{name:"Éthanol"})).toBeTruthy();
  expect(screen.getByRole("button",{name:"Éther diméthylique"})).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:"Éthanol"}));
  expect(screen.getByLabelText("Molécule")).toHaveValue("ethanol");
  fireEvent.change(screen.getByLabelText("Rechercher une molécule ou une formule"),{target:{value:"cafeine"}});
  expect(screen.getByRole("option",{name:/Caféine/})).toBeTruthy();
 });
 it("bounds new motion values and keeps legacy references identical",()=>{
  const old=moleculePresetSettings("water");expect(parseMoleculeSettings(old)).toEqual(old);
  for(const extra of [{motion:"yes"},{motionSpeed:Infinity},{motionSpeed:0},{motionSpeed:3}])expect(parseMoleculeSettings({...old,...extra})).toBeUndefined();
  expect(parseMoleculeSettings({...old,motion:true,motionSpeed:.5})).toMatchObject({motion:true,motionSpeed:.5});
 });
});
describe("scientific atomic basis",()=>{
 it("retains exactly Z electrons, subshell capacities and the NIST lawrencium correction",()=>{
  for(const e of ELEMENTS){const shells=electronConfiguration(e.symbol);expect(shells.reduce((n,p)=>n+p.electrons,0),e.symbol).toBe(e.atomicNumber);for(const p of shells)expect(p.electrons).toBeLessThanOrEqual(2*(2*p.l+1));}
  expect(electronConfiguration("O")).toEqual([{id:"1s",n:1,l:0,electrons:2},{id:"2s",n:2,l:0,electrons:2},{id:"2p",n:2,l:1,electrons:4}]);
  expect(electronConfiguration("Lr")).toContainEqual({id:"7p",n:7,l:1,electrons:1});
 });
 it("has analytic 1s decay, 2s radial node and 2p nodal plane/opposite signs",()=>{
  expect(hydrogenicRadial(1,0,1)).toBeCloseTo(Math.exp(-1),12);
  expect(hydrogenicRadial(2,0,2)).toBeCloseTo(0,12);
  expect(orbitalAmplitude(2,1,2,0)).toBe(0);
  expect(orbitalAmplitude(2,1,0,2)).toBeCloseTo(-orbitalAmplitude(2,1,0,-2),12);
  expect(render(<ScienceObject id="science-atom" label="O" element="O"/>).container.querySelector('[data-scientific-status="hydrogenic-basis-not-total-density"]')).toBeTruthy();
 });
});
describe("optional visible-only molecular movement",()=>{
 it("keeps an exact 20s display loop and bounded orientation",()=>{
  expect(moleculeMotionPose(0)).toEqual({yaw:0,pitch:0});
  expect(moleculeMotionPose(20).yaw).toBeCloseTo(0,12);
  expect(moleculeMotionPose(5).yaw).toBeCloseTo(9,12);
 });
 it("runs one loop only when visible, unpaused and motion is allowed",()=>{
  let intersect:(entries:{isIntersecting:boolean}[])=>void=()=>{},reduce=false,hidden=false;
  const changes=new Map<string,()=>void>(),frames=new Map<number,FrameRequestCallback>();let sequence=0;
  vi.stubGlobal("matchMedia",(query:string)=>({get matches(){return query.includes("reduced")?reduce:false;},addEventListener:(_name:string,fn:()=>void)=>changes.set(query,fn),removeEventListener:()=>{}}));
  vi.stubGlobal("IntersectionObserver",class{constructor(cb:typeof intersect){intersect=cb;}observe(){}disconnect(){}});
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>{frames.set(++sequence,callback);return sequence;});
  vi.stubGlobal("cancelAnimationFrame",(id:number)=>frames.delete(id));
  const descriptor=Object.getOwnPropertyDescriptor(document,"hidden");Object.defineProperty(document,"hidden",{configurable:true,get:()=>hidden});
  const molecule={...moleculePresetSettings("water"),motion:true};
  const view=render(<ScienceObject id="science-molecule" label="Water" molecule={molecule}/>);
  expect(frames.size).toBe(0);act(()=>intersect([{isIntersecting:true}]));expect(frames.size).toBe(1);
  const before=view.container.querySelector('[data-science-layer="molecule"]')!.innerHTML;
  for(const time of [100,1100])act(()=>{const [id,cb]=[...frames][0];frames.delete(id);cb(time);});
  expect(frames.size).toBe(1);expect(view.container.querySelector('[data-science-layer="molecule"]')!.innerHTML).not.toBe(before);
  act(()=>{hidden=true;document.dispatchEvent(new Event("visibilitychange"));});expect(frames.size).toBe(0);
  act(()=>{hidden=false;document.dispatchEvent(new Event("visibilitychange"));});expect(frames.size).toBe(1);
  act(()=>{reduce=true;changes.get("(prefers-reduced-motion: reduce)")?.();});expect(frames.size).toBe(0);
  act(()=>{reduce=false;changes.get("(prefers-reduced-motion: reduce)")?.();});expect(frames.size).toBe(1);
  act(()=>intersect([{isIntersecting:false}]));expect(frames.size).toBe(0);
  view.rerender(<ScienceObject id="science-molecule" label="Water" molecule={molecule} playing={false}/>);act(()=>intersect([{isIntersecting:true}]));expect(frames.size).toBe(0);
  view.rerender(<ScienceObject id="science-molecule" label="Water" molecule={molecule} thumbnail/>);expect(frames.size).toBe(0);
  view.unmount();if(descriptor)Object.defineProperty(document,"hidden",descriptor);else Reflect.deleteProperty(document,"hidden");
 });
});
