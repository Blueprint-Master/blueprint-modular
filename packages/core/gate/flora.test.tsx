import React from "react";
import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {ModularObject,FLORA_IDS,FLORA_OBJECTS,parseModularObjectAttachment,searchModularObjects} from "../src/objects";
import {floraMotion} from "../src/objects/flora-renderer";
import {floraBudget} from "../src/objects/flora";
describe("Végétation — références publiques exactes",()=>{
 it("ajoute quatre silhouettes distinctes dans une famille dédiée",()=>{expect(FLORA_OBJECTS).toHaveLength(4);expect(searchModularObjects("","flora")).toHaveLength(4);});
 for(const id of FLORA_IDS)for(const style of ["photorealistic","illustration"] as const)it(`${id}/${style}: poster SSR, référence exacte et évolution perceptible`,()=>{
  const ref={schemaVersion:1,kind:"modular-object",id,version:"1.0.0",style,animation:{playing:false,speed:.5}};
  expect(parseModularObjectAttachment(ref)).toEqual(ref);expect(parseModularObjectAttachment({...ref,version:"2.0.0"})).toBeUndefined();
  expect(parseModularObjectAttachment({...ref,code:"execute()"})).not.toHaveProperty("code");
  const html=renderToStaticMarkup(<ModularObject id={id} variant={style} thumbnail/>);
  expect(html).toContain(`/objects/flora-v1/previews/${id}-${style}.svg`);expect(html).not.toContain("<canvas");
  const a=floraMotion(id,0),b=floraMotion(id,3),loop=floraMotion(id,12);
  expect(Math.abs(a.main-b.main)+Math.abs(a.detail-b.detail)).toBeGreaterThan(.25);
  expect(loop.main).toBeCloseTo(a.main,10);expect(loop.detail).toBeCloseTo(a.detail,10);
 });
 it("borne une seule boucle légère sur mobile",()=>{expect(floraBudget(1000,3,true)).toEqual({size:224,fps:12});expect(floraBudget(1000,3)).toEqual({size:320,fps:18});});
});
