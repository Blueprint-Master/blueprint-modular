import React from "react";
import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {ModularObject,WEATHER_IDS,WEATHER_OBJECTS,resolveModularObject,parseModularObjectAttachment,searchModularObjects} from "../src/objects";
import {createWeatherField} from "../src/objects/weather-renderer";
import {weatherAssetPaths,weatherBudget} from "../src/objects/weather";
const texture={width:32,height:32,data:new Uint8ClampedArray(32*32*4)};
for(let y=0;y<32;y++)for(let x=0;x<32;x++){const k=(y*32+x)*4;texture.data.set([180+x,200+y,230,Math.hypot(x-16,y-16)<12?255:0],k);}
describe("weather exact identity and portable references",()=>{
 it("adds five weather situations without substituting an unfinished sun",()=>{expect(WEATHER_OBJECTS).toHaveLength(5);expect(searchModularObjects("","weather")).toHaveLength(5);expect(resolveModularObject("weather-sun")).toBeUndefined();});
 for(const id of WEATHER_IDS)for(const style of ["photorealistic","illustration"] as const)it(`${id}/${style} resolves, transports and renders a lazy SSR poster`,()=>{
  const ref={schemaVersion:1,kind:"modular-object",id,version:"1.0.0",style,animation:{playing:true,speed:.5}};
  expect(parseModularObjectAttachment(ref)).toEqual(ref);expect(parseModularObjectAttachment({...ref,version:"2.0.0"})).toBeUndefined();
  const markup=renderToStaticMarkup(<ModularObject id={id} version="1.0.0" variant={style} thumbnail/>);
  expect(markup).toContain(`${id}-${style}.webp`);expect(markup).not.toContain("<canvas");expect(markup).not.toContain("<svg");
  expect(weatherAssetPaths(id,style)).toEqual([`previews/${id}-${style}.webp`,`cloud-${style}.webp`]);
 });
 it("rejects wrong style and arbitrary code",()=>{expect(renderToStaticMarkup(<ModularObject id="weather-rain" variant={"vector" as "illustration"}/>)).toContain("Objet indisponible");expect(parseModularObjectAttachment({schemaVersion:1,kind:"modular-object",id:"weather-rain",version:"1.0.0",style:"illustration",animation:{playing:true,speed:1},code:"alert(1)"})).not.toHaveProperty("code");});
});
describe("weather actual material evolution",()=>{
 for(const id of WEATHER_IDS)it(`${id}: deterministic, changing locally, transparent and exactly periodic`,()=>{
  const field=createWeatherField(96,texture),a=field.draw(id,"photorealistic",0).slice(),b=field.draw(id,"photorealistic",2).slice();
  expect(b).not.toEqual(a);expect(field.draw(id,"photorealistic",24)).toEqual(a);expect(a[3]).toBe(0);
  const changed=a.filter((v,i)=>Math.abs(v-b[i])>12).length;expect(changed).toBeGreaterThan(200);
 });
 it("keeps lightning out of small/reduced-motion renders",()=>{const field=createWeatherField(96,texture);expect(field.draw("weather-storm","illustration",5.5,true).slice()).not.toEqual(field.draw("weather-storm","illustration",5.5,false));});
 it("caps rendering independently of CSS size and high DPR",()=>{expect(weatherBudget(1000,3,true)).toEqual({size:224,fps:12});expect(weatherBudget(1000,3,false)).toEqual({size:320,fps:18});});
});
