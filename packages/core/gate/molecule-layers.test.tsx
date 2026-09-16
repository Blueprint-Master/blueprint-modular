import React, {useState} from "react";
import {render,fireEvent,screen,cleanup} from "@testing-library/react";
import {afterEach,describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {DEFAULT_MOLECULE_SETTINGS,parseMoleculeGraph,parseMoleculeSettings,bondLength,bondAngle,moleculeWarnings,MOLECULE_COLORS} from "../src/objects/molecules";
import {MOLECULE_PRESETS,moleculeGraph} from "../src/objects/molecule-presets";
import {AtomicDensityLayer} from "../src/objects/ScienceLayers";
import {MoleculeLayer,projectMolecule} from "../src/objects/MoleculeLayer";
import {ScienceObject} from "../src/objects/ScienceObject";
import {ScienceControls} from "../src/objects/ScienceControls";
import {DEFAULT_SCIENCE_SETTINGS,parseScienceSettings} from "../src/objects/science";
import {parseModularObjectAttachment} from "../src/objects/universe";
import {DEFAULT_ATOMIC_SETTINGS,parseAtomicSettings} from "../src/objects/atomic-settings";
afterEach(cleanup);
describe("scientifically explicit composable layers",()=>{
 it.each([["water",.9578,104.478],["carbon-dioxide",1.1621,180],["methane",1.087,109.471],["ammonia",1.0124,106.67]] as const)("matches transcribed NIST Cartesian geometry: %s",(id,length,angle)=>{
  const {atoms,bonds}=MOLECULE_PRESETS[id].graph;
  expect(bondLength(atoms[0].position,atoms[1].position)).toBeCloseTo(length,3);
  expect(bondAngle(atoms[1].position,atoms[0].position,atoms[2].position)).toBeCloseTo(angle,2);
  expect(parseMoleculeGraph({atoms,bonds})).toEqual({atoms,bonds});
  expect(moleculeWarnings({atoms,bonds})).toEqual([]);
 });
 it("uses conventional white hydrogen, red oxygen, dark carbon, blue nitrogen",()=>{
  expect(MOLECULE_COLORS).toMatchObject({H:"#f4f5f7",O:"#e43c44",C:"#343a45",N:"#305ce8"});
 });
 it("does not alter source coordinates under orientation changes",()=>{
  const graph=MOLECULE_PRESETS.water.graph, before=JSON.stringify(graph);
  expect(projectMolecule(graph,30,60)).not.toEqual(projectMolecule(graph,0,0));
  expect(JSON.stringify(graph)).toBe(before);
 });
 it("exports independently composable SVG groups without any canvas",()=>{
  const html=renderToStaticMarkup(<svg><g transform="translate(200 200)"><AtomicDensityLayer settings={{opacity:.4,nucleus:false}}/><MoleculeLayer graph={MOLECULE_PRESETS.water.graph}/></g></svg>);
  expect(html).toContain('data-science-layer="atomic-density"');expect(html).toContain('data-science-layer="molecule"');
  expect(html).not.toContain("<rect");expect(html).not.toContain('data-atomic-sublayer="nucleus"');
 });
 it.each(["midnight","paper","transparent"] as const)("roundtrips custom editable geometry and layers in %s",style=>{
  const molecule={...DEFAULT_MOLECULE_SETTINGS,preset:"custom" as const,graph:MOLECULE_PRESETS.water.graph,layers:{atoms:true,bonds:false,labels:false,measurements:true},yaw:72,pitch:10};
  const science={...DEFAULT_SCIENCE_SETTINGS,molecule,atomic:{...DEFAULT_ATOMIC_SETTINGS,opacity:.45}};
  const attachment={schemaVersion:1,kind:"modular-object",id:"science-molecule",version:"1.0.0",style,science,animation:{playing:false,speed:1}};
  expect(parseModularObjectAttachment(JSON.parse(JSON.stringify(attachment)))).toEqual(attachment);
  const {container}=render(<ScienceObject id="science-molecule" label="Test" style={style} molecule={molecule}/>);
  expect(container.querySelectorAll("[data-molecule-atom]")).toHaveLength(3);expect(container.querySelectorAll("[data-molecule-bond]")).toHaveLength(0);
  expect(container.innerHTML).toContain("Composition non validée");expect(container.querySelector('svg > rect')===null).toBe(style==="transparent");
 });
 it("rejects executable/unknown keys, fake provenance, malformed graphs and unbounded input",()=>{
  const g=MOLECULE_PRESETS.water.graph, a=g.atoms[0];
  for(const bad of [{...g,script:"alert(1)"},{...g,atoms:[...g.atoms,a]},{...g,atoms:[{...a,element:"Xx"}]},{...g,atoms:[{...a,position:[NaN,0,0]}]},{...g,atoms:[{...a,position:[51,0,0]}]},{...g,bonds:[{from:"O1",to:"evil",order:1}]},{...g,bonds:[{from:"O1",to:"O1",order:1}]},{...g,bonds:[g.bonds[0],g.bonds[0]]},{...g,atoms:Array.from({length:25},(_,i)=>({...a,id:"A"+i}))}])expect(parseMoleculeGraph(bad)).toBeUndefined();
  expect(parseMoleculeSettings({...DEFAULT_MOLECULE_SETTINGS,graph:g})).toBeUndefined();
  expect(parseMoleculeSettings({...DEFAULT_MOLECULE_SETTINGS,preset:"custom"})).toBeUndefined();
  expect(parseMoleculeSettings({...DEFAULT_MOLECULE_SETTINGS,yaw:181})).toBeUndefined();
  expect(parseAtomicSettings({...DEFAULT_ATOMIC_SETTINGS,opacity:Infinity})).toBeUndefined();
  expect(parseScienceSettings({...DEFAULT_SCIENCE_SETTINGS,atomic:{...DEFAULT_ATOMIC_SETTINGS,script:true}})).toBeUndefined();
  expect(parseScienceSettings({...DEFAULT_SCIENCE_SETTINGS,layers:JSON.parse('{"__proto__":true}')})).toBeUndefined();
 });
 it("surfaces invalid direct renderer settings instead of displaying a default molecule",()=>{
  const {container}=render(<ScienceObject id="science-molecule" label="Bad" molecule={{...DEFAULT_MOLECULE_SETTINGS,preset:"custom"}}/>);
  expect(screen.getByRole("alert")).toHaveTextContent("invalide");expect(container.querySelector("svg")).toBeNull();
 });
 it("keeps stationary models identical for pause, thumbnail, speed and reduced-motion safety",()=>{
  const a=renderToStaticMarkup(<ScienceObject id="science-molecule" label="Water" playing={false} speed={.1}/>);
  const b=renderToStaticMarkup(<ScienceObject id="science-molecule" label="Water" playing speed={3}/>);
  expect(a).toBe(b);expect(a).not.toMatch(/animation:|requestAnimationFrame|<animate/);
 });
 it("edits the mounted composer, revokes curated status and updates the displayed graph",()=>{
  function Demo(){const [s,set]=useState(DEFAULT_SCIENCE_SETTINGS);return <><ScienceObject id="science-molecule" label="Molécule test" molecule={s.molecule}/><ScienceControls id="science-molecule" value={s} onChange={set}/></>;}
  const {container}=render(<Demo/>);
  fireEvent.change(screen.getByLabelText("Molécule"),{target:{value:"methane"}});
  expect(container.querySelectorAll("[data-molecule-atom]")).toHaveLength(5);
  fireEvent.change(screen.getByLabelText("C1 x Å"),{target:{value:"0.3"}});
  expect(container.querySelector('[data-molecule-status="unvalidated"]')).toBeTruthy();
  fireEvent.click(screen.getByRole("checkbox",{name:"Liaisons",exact:true}));
  expect(container.querySelectorAll("[data-molecule-bond]")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button",{name:"+ Ajouter un atome"}));
  expect(container.querySelectorAll("[data-molecule-atom]")).toHaveLength(6);
  expect(moleculeGraph({...DEFAULT_MOLECULE_SETTINGS})).toBe(MOLECULE_PRESETS.water.graph);
 });
});
