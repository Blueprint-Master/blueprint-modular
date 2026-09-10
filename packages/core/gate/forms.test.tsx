import React from "react";
import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {ModularObject,FORM_IDS,FORM_OBJECTS,parseModularObjectAttachment,searchModularObjects} from "../src/objects";
import {createFormField,formPoint} from "../src/objects/forms-renderer";
import {formBudget} from "../src/objects/forms";
describe("Formes & ondes — exact public references",()=>{
 it("adds exactly four distinct objects in their own theme",()=>{expect(FORM_OBJECTS).toHaveLength(4);expect(searchModularObjects("","forms")).toHaveLength(4);});
 for(const id of FORM_IDS)for(const style of ["photorealistic","illustration"] as const)it(`${id}/${style}: exact SSR reference and local deformation`,()=>{
  const ref={schemaVersion:1,kind:"modular-object",id,version:"1.0.0",style,animation:{playing:false,speed:.5}};
  expect(parseModularObjectAttachment(ref)).toEqual(ref);expect(parseModularObjectAttachment({...ref,version:"2.0.0"})).toBeUndefined();
  expect(parseModularObjectAttachment({...ref,code:"execute()"})).not.toHaveProperty("code");
  const html=renderToStaticMarkup(<ModularObject id={id} variant={style} thumbnail/>);
  expect(html).toContain(`/objects/forms-v1/previews/${id}-${style}.webp`);expect(html).not.toContain("<canvas");
  const field=createFormField(96),a=field.draw(id,style,0).slice(),b=field.draw(id,style,2).slice();
  expect(a[3]).toBe(0);expect(a.filter((x,i)=>Math.abs(x-b[i])>12).length).toBeGreaterThan(200);
  expect(field.draw(id,style,12)).toEqual(a);
  // Distances between points change: this cannot pass with a rigid rotation/translation.
  const distance=(t:number)=>Math.hypot(...formPoint(id,.17,.3,t).map((x,i)=>x-formPoint(id,.48,.7,t)[i]));
  expect(Math.abs(distance(0)-distance(2))).toBeGreaterThan(.001);
 });
 it("bounds resolution and rejects invalid allocations",()=>{expect(formBudget(1000,3,true)).toEqual({size:224,fps:12});expect(formBudget(1000,3)).toEqual({size:320,fps:18});expect(()=>createFormField(NaN)).toThrow();expect(()=>createFormField(4096)).toThrow();});
 it("distinguishes material and illustrated shading without changing the silhouette",()=>{
  const f=createFormField(96),a=f.draw("form-shell","photorealistic",2).slice(),b=f.draw("form-shell","illustration",2).slice();
  expect(a).not.toEqual(b);expect(a.filter((_,i)=>i%4===3)).toEqual(b.filter((_,i)=>i%4===3));
 });
});
