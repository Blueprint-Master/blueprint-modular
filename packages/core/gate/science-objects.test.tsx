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
  expect(DISCOVERABLE_OBJECTS.filter(item=>item.family==="science")).toHaveLength(4);
 });
 it("keeps every layer and rejects unknown or invalid science settings",()=>{
  expect(parseScienceSettings(DEFAULT_SCIENCE_SETTINGS)).toEqual(DEFAULT_SCIENCE_SETTINGS);
  expect(parseScienceSettings({...DEFAULT_SCIENCE_SETTINGS,element:"Xx"})).toBeUndefined();
  expect(parseScienceSettings({...DEFAULT_SCIENCE_SETTINGS,layers:{...DEFAULT_SCIENCE_SETTINGS.layers,script:"alert(1)"}})).toBeUndefined();
 });
 it("round-trips a data-only layered attachment",()=>{
  const attachment={schemaVersion:1,kind:"modular-object",id:"science-periodic-table",version:"1.0.0",style:"midnight",animation:{playing:false,speed:.8},science:DEFAULT_SCIENCE_SETTINGS};
  expect(parseModularObjectAttachment(attachment)).toEqual(attachment);
 });
 it("selects an element from the real SVG table and exposes paused state",()=>{
  const onChange=vi.fn();const {container}=render(<ScienceObject id="science-periodic-table" label="Tableau périodique" locale="fr" element="C" onElementChange={onChange} playing={false}/>);
  const carbon=screen.getByRole("button",{name:/6 Carbone C/}),oxygen=screen.getByRole("button",{name:/8 Oxygène O/});
  expect(screen.getByRole("group",{name:"Tableau périodique interactif"})).toBeTruthy();expect(carbon).toHaveAttribute("tabindex","0");expect(oxygen).toHaveAttribute("tabindex","-1");
  fireEvent.keyDown(carbon,{key:"ArrowRight"});expect(onChange).toHaveBeenCalledWith("N");fireEvent.click(oxygen);expect(onChange).toHaveBeenLastCalledWith("O");
  expect(container.querySelector("[data-science-state=paused]")).toBeTruthy();
 });
 it("animates local density blooms and clamps unsafe motion speed",()=>{
  const {container}=render(<ScienceObject id="science-atom" label="Atome" speed={Number.POSITIVE_INFINITY}/>);
  expect(container.querySelector('[data-science-density-lobes="4"]')?.children).toHaveLength(4);
  expect(container.innerHTML).toContain("science-density-bloom 12s");expect(container.innerHTML).not.toContain("Infinity");
  expect(container.innerHTML).not.toContain("science-cloud");
 });
});
