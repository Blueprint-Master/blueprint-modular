import React from "react";
import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {ModularObject,MATERIAL_IDS,MATERIAL_OBJECTS,parseModularObjectAttachment,searchModularObjects} from "../src/objects";
import {materialMotion} from "../src/objects/material-renderer";
import {materialBudget} from "../src/objects/materials";
describe("Cristaux & matières — références publiques exactes",()=>{
 it("conserve cinq références compatibles mais les retire de la découverte",()=>{expect(MATERIAL_OBJECTS).toHaveLength(5);expect(searchModularObjects("","materials")).toHaveLength(0);});
 for(const id of MATERIAL_IDS)for(const style of ["photorealistic","illustration"] as const)it(`${id}/${style}: poster SSR, référence exacte et évolution perceptible`,()=>{
  const ref={schemaVersion:1,kind:"modular-object",id,version:"1.0.0",style,animation:{playing:false,speed:.5}};
  expect(parseModularObjectAttachment(ref)).toEqual(ref);expect(parseModularObjectAttachment({...ref,version:"2.0.0"})).toBeUndefined();
  expect(parseModularObjectAttachment({...ref,code:"execute()"})).not.toHaveProperty("code");
  const html=renderToStaticMarkup(<ModularObject id={id} variant={style} thumbnail/>);
  expect(html).toContain(`/objects/materials-v1/previews/${id}-${style}.svg`);expect(html).not.toContain("<canvas");
  const a=materialMotion(id,0),b=materialMotion(id,3),loop=materialMotion(id,12);
  expect(Math.abs(a.main-b.main)+Math.abs(a.detail-b.detail)).toBeGreaterThan(.2);
  expect(loop.main).toBeCloseTo(a.main,10);expect(loop.detail).toBeCloseTo(a.detail,10);
 });
 it("borne une seule boucle légère sur mobile",()=>{expect(materialBudget(1000,3,true)).toEqual({size:224,fps:12});expect(materialBudget(1000,3)).toEqual({size:320,fps:18});});
});
