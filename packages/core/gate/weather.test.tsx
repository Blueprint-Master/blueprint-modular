import React from "react";
import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {ModularObject,WEATHER_IDS,WEATHER_OBJECTS,resolveModularObject,parseModularObjectAttachment,searchModularObjects} from "../src/objects";
import {createWeatherField} from "../src/objects/weather-renderer";
import {weatherAssetPaths,weatherBudget} from "../src/objects/weather";
const texture={width:32,height:32,data:new Uint8ClampedArray(32*32*4)};
for(let y=0;y<32;y++)for(let x=0;x<32;x++){const k=(y*32+x)*4;texture.data.set([180+x,200+y,230,Math.hypot(x-16,y-16)<12?255:0],k);}
describe("weather exact identity and portable references",()=>{
 it("completes the six ordinary weather situations with a dedicated atmospheric sun",()=>{expect(WEATHER_OBJECTS).toHaveLength(6);expect(searchModularObjects("","weather")).toHaveLength(6);expect(resolveModularObject("weather-sun")).toMatchObject({version:"1.0.0",family:"weather"});});
 for(const id of WEATHER_IDS)for(const style of ["photorealistic","illustration"] as const)it(`${id}/${style} resolves, transports and renders a lazy SSR poster`,()=>{
  const ref={schemaVersion:1,kind:"modular-object",id,version:"1.0.0",style,animation:{playing:true,speed:.5}};
  expect(parseModularObjectAttachment(ref)).toEqual(ref);expect(parseModularObjectAttachment({...ref,version:"2.0.0"})).toBeUndefined();
  const markup=renderToStaticMarkup(<ModularObject id={id} version="1.0.0" variant={style} thumbnail/>);
  expect(markup).toContain(`${id}-${style}.webp`);expect(markup).not.toContain("<canvas");expect(markup).not.toContain("<svg");
  expect(weatherAssetPaths(id,style)).toEqual([`previews/${id}-${style}.webp`,`${id==="weather-sun"?"sun":"cloud"}-${style}.webp`]);
 });
 it("rejects wrong style and arbitrary code",()=>{expect(renderToStaticMarkup(<ModularObject id="weather-rain" variant={"vector" as "illustration"}/>)).toContain("Objet indisponible");expect(parseModularObjectAttachment({schemaVersion:1,kind:"modular-object",id:"weather-rain",version:"1.0.0",style:"illustration",animation:{playing:true,speed:1},code:"alert(1)"})).not.toHaveProperty("code");});
});
 it("grows and dissolves local atmospheric rays without moving the whole sun",()=>{
  const field=createWeatherField(160,texture),a=field.draw("weather-sun","photorealistic",0).slice(),b=field.draw("weather-sun","photorealistic",2).slice();
  let changed=0,stableCore=0;
  for(let y=0;y<160;y++)for(let x=0;x<160;x++){const k=(y*160+x)*4,d=Math.hypot(x/160-.5,y/160-.5);if(Math.abs(a[k+3]-b[k+3])>10&&d>.2)changed++;if(d<.1&&Math.abs(a[k+3]-b[k+3])<8)stableCore++;}
  expect(changed).toBeGreaterThan(120);expect(stableCore).toBeGreaterThan(500);
 });
describe("weather actual material evolution",()=>{
 for(const id of WEATHER_IDS)it(`${id}: deterministic, changing locally, transparent and exactly periodic`,()=>{
  const field=createWeatherField(96,texture),a=field.draw(id,"photorealistic",0).slice(),b=field.draw(id,"photorealistic",2).slice();
  expect(b).not.toEqual(a);expect(field.draw(id,"photorealistic",24)).toEqual(a);expect(a[3]).toBe(0);
  const changed=a.filter((v,i)=>Math.abs(v-b[i])>12).length;expect(changed).toBeGreaterThan(200);
 });
 it("reveals a lightning channel in the first seconds, then lets it dissipate",()=>{
  const field=createWeatherField(224,texture);
  for(const style of ["photorealistic","illustration"] as const){
   for(const t of [1.2,1.35,2])expect(field.draw("weather-storm",style,t,true).slice()).not.toEqual(field.draw("weather-storm",style,t,false));
   for(const t of [0,1,3,5,23])expect(field.draw("weather-storm",style,t,true).slice()).toEqual(field.draw("weather-storm",style,t,false));
   expect(field.draw("weather-storm",style,25.35,true).slice()).toEqual(field.draw("weather-storm",style,1.35,true));
  }
 });
 it("caps rendering independently of CSS size and high DPR",()=>{expect(weatherBudget(1000,3,true)).toEqual({size:224,fps:12});expect(weatherBudget(1000,3,false)).toEqual({size:320,fps:18});});
 it("keeps the discharge fine while lighting the cloud locally",()=>{
  const size=224,field=createWeatherField(size,texture),quiet=field.draw("weather-storm","photorealistic",1.35,false).slice(),lit=field.draw("weather-storm","photorealistic",1.35,true).slice();
  let brightChannel=0,litCloud=0;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const k=(y*size+x)*4,delta=lit[k]-quiet[k];if(y>size*.56&&delta>45&&lit[k+3]>80)brightChannel++;if(y<size*.52&&delta>20)litCloud++;}
  expect(brightChannel).toBeGreaterThan(10);expect(brightChannel).toBeLessThan(size*2);expect(litCloud).toBeGreaterThan(20);
 });
});
