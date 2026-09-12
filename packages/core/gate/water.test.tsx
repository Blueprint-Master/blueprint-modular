import React from "react";
import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {ModularObject,WATER_IDS,WATER_OBJECTS,parseModularObjectAttachment,searchModularObjects} from "../src/objects";
import {createWaterField,waterSample} from "../src/objects/water-renderer";
describe("Eau & phénomènes naturels — exact public references",()=>{
 it("adds exactly four distinct objects in their own theme",()=>{expect(WATER_OBJECTS).toHaveLength(4);expect(searchModularObjects("","water")).toHaveLength(4);});
 for(const id of WATER_IDS)for(const style of ["photorealistic","illustration"] as const)it(`${id}/${style}: pinned SSR poster and evolving material`,()=>{
  const ref={schemaVersion:1,kind:"modular-object",id,version:"1.0.0",style,animation:{playing:false,speed:.5}};
  expect(parseModularObjectAttachment(ref)).toEqual(ref);expect(parseModularObjectAttachment({...ref,version:"2.0.0"})).toBeUndefined();
  const html=renderToStaticMarkup(<ModularObject id={id} variant={style} thumbnail/>);expect(html).toContain(`/objects/water-v1/previews/${id}-${style}.webp`);expect(html).not.toContain("<canvas");
  const field=createWaterField(96),a=field.draw(id,style,0).slice(),b=field.draw(id,style,2).slice();expect(a.filter((x,i)=>Math.abs(x-b[i])>12).length).toBeGreaterThan(200);expect(field.draw(id,style,12)).toEqual(a);
  const sa=waterSample(id,.18,.08,0),sb=waterSample(id,.18,.08,2);expect(Math.abs(sa.alpha-sb.alpha)+Math.abs(sa.depth-sb.depth)+Math.abs(sa.foam-sb.foam)).toBeGreaterThan(.001);
 });
 it("bounds allocations and keeps both treatments distinct",()=>{expect(()=>createWaterField(4096)).toThrow();const f=createWaterField(96);expect(f.draw("water-whirlpool","photorealistic",2).slice()).not.toEqual(f.draw("water-whirlpool","illustration",2).slice());});
});
