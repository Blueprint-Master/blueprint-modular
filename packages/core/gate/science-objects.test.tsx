import React from "react";
import {fireEvent,render,screen} from "@testing-library/react";
import {describe,expect,it,vi} from "vitest";
import {ScienceObject} from "../src/objects/ScienceObject";
import {DISCOVERABLE_OBJECTS,resolveModularObject} from "../src/objects/catalog";
import {DEFAULT_SCIENCE_SETTINGS,ELEMENTS,parseScienceSettings} from "../src/objects/science";
import {parseModularObjectAttachment} from "../src/objects/universe";

describe("scientific object contract",()=>{
 it("contains all 118 elements with stable atomic numbers and positions",()=>{
  expect(ELEMENTS).toHaveLength(118);expect(ELEMENTS[0]).toMatchObject({atomicNumber:1,symbol:"H",group:1,period:1});
  expect(ELEMENTS[5]).toMatchObject({atomicNumber:6,symbol:"C",group:14,period:2,block:"p"});
  expect(ELEMENTS[117]).toMatchObject({atomicNumber:118,symbol:"Og",group:18,period:7});
  expect(ELEMENTS.filter(element=>element.name.en===element.symbol)).toEqual([]);
 });
 it("withdraws rejected decorative families without breaking exact resolution",()=>{
  expect(DISCOVERABLE_OBJECTS.some(item=>item.family==="flora"||item.family==="materials")).toBe(false);
  expect(resolveModularObject("flora-fern","1.0.0")).toBeTruthy();expect(resolveModularObject("material-crystal","1.0.0")).toBeTruthy();
  expect(DISCOVERABLE_OBJECTS.filter(item=>item.family==="science")).toHaveLength(5);
 });
 it("keeps every layer and rejects unknown or invalid science settings",()=>{
  expect(parseScienceSettings(DEFAULT_SCIENCE_SETTINGS)).toEqual(DEFAULT_SCIENCE_SETTINGS);
  expect(parseScienceSettings({...DEFAULT_SCIENCE_SETTINGS,element:"Xx"})).toBeUndefined();
  expect(parseScienceSettings({...DEFAULT_SCIENCE_SETTINGS,layers:{...DEFAULT_SCIENCE_SETTINGS.layers,script:"alert(1)"}})).toBeUndefined();
 });
 it("round-trips a data-only layered attachment",()=>{
  const attachment={schemaVersion:1,kind:"modular-object",id:"science-periodic-table",version:"1.0.0",style:"midnight",animation:{playing:false,speed:.8},science:DEFAULT_SCIENCE_SETTINGS};
  expect(parseModularObjectAttachment(attachment)).toEqual(attachment);
  const transparent={...attachment,id:"science-element-card",style:"transparent" as const};
  expect(parseModularObjectAttachment(transparent)).toEqual(transparent);
 });
 it("offers a genuinely transparent canvas for every scientific view",()=>{
  for(const id of ["science-periodic-table","science-atom","science-element-card","science-comparator","science-molecule"] as const){
   const {container}=render(<ScienceObject id={id} label={id} style="transparent" thumbnail/>);
   expect(container.querySelector(id==="science-periodic-table"?'svg > rect[width="760"][height="470"]':'svg > rect[width="520"][height="520"]')).toBeNull();
   expect(container.innerHTML).toContain("currentColor");
  }
 });
 it("selects an element from the real SVG table and exposes paused state",()=>{
  const onChange=vi.fn();const {container}=render(<ScienceObject id="science-periodic-table" label="Tableau périodique" locale="fr" element="C" onElementChange={onChange} playing={false}/>);
  const carbon=screen.getByRole("button",{name:/6 Carbone C/}),oxygen=screen.getByRole("button",{name:/8 Oxygène O/});
  expect(screen.getByRole("group",{name:"Tableau périodique interactif"})).toBeTruthy();expect(carbon).toHaveAttribute("tabindex","0");expect(oxygen).toHaveAttribute("tabindex","-1");
  fireEvent.keyDown(carbon,{key:"ArrowRight"});expect(onChange).toHaveBeenCalledWith("N");fireEvent.click(oxygen);expect(onChange).toHaveBeenLastCalledWith("O");
  expect(container.querySelector("[data-science-state=static]")).toBeTruthy();
 });
 it("never labels an illustrative distribution as measured, and keeps it stationary",()=>{
  const {container}=render(<ScienceObject id="science-atom" label="Atome" element="Ru" speed={Number.POSITIVE_INFINITY}/>);
  expect(container.innerHTML).toContain('data-scientific-status="qualitative-not-computed"');
  expect(container.innerHTML).toContain("Isotope requis");
  expect(container.innerHTML).not.toMatch(/science-density-pulse|Infinity|ρ\(r\)|feGaussianBlur/);
  expect(render(<ScienceObject id="science-atom" label="Vignette" thumbnail/>).container.querySelector("[data-science-state=poster]")).toBeTruthy();
 });

});
