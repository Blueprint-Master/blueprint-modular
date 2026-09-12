import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MODULAR_OBJECTS, MOON_OBJECTS, DISCOVERABLE_OBJECTS, planetProvenance, resolveModularObject, searchModularObjects, ModularObject } from "../src/objects";

describe("versioned reusable objects", () => {
  it("contains twenty distinct immutable definitions, including all eight planets", () => {
    expect(MODULAR_OBJECTS).toHaveLength(20);
    expect(new Set(MODULAR_OBJECTS.map(o=>o.id)).size).toBe(20);
    expect(Object.isFrozen(MODULAR_OBJECTS)).toBe(true);
    for (const id of ["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"]) {
      expect(resolveModularObject(id)?.shape).toBe("planet");
    }
  });
  it.each(MODULAR_OBJECTS)("resolves and actually paints $id without fetching assets", item => {
    expect(resolveModularObject(item.id,item.version)).toBe(item);
    expect(Object.isFrozen(item)).toBe(true);
    const markup = renderToStaticMarkup(<ModularObject id={item.id} version={item.version}/>);
    expect(markup).toContain(`data-modular-object="${item.id}@${item.version}"`);
    expect(markup).toContain(`aria-label="${item.name.fr}"`);
    expect(markup).toMatch(/<(path|circle|rect)\b/);
    expect(markup).not.toMatch(/<(?:image|script|iframe)\b/);
    expect(markup).not.toContain("https:");
  });
  it("fails visibly for unknown objects or versions instead of substituting", () => {
    expect(resolveModularObject("unknown")).toBeUndefined();
    expect(resolveModularObject("earth","9.0.0")).toBeUndefined();
    expect(renderToStaticMarkup(<ModularObject id="earth" version="9.0.0"/>)).toContain("Objet indisponible");
  });
  it("searches both languages, ignores accents, and respects the category", () => {
    expect(searchModularObjects("Venus").map(o=>o.id)).toEqual(["venus"]);
    expect(searchModularObjects("warehouse").map(o=>o.id)).toEqual(["warehouse"]);
    expect(searchModularObjects("", "mobility")).toHaveLength(3);
    expect(searchModularObjects("mars", "logistics")).toHaveLength(0);
  });
  it("accepts controlled appearance, clamps non-finite values and escapes labels", () => {
    const markup = renderToStaticMarkup(<ModularObject id="house" angle={NaN} size={Infinity} color="url(https://external.invalid)" label="<script>bad</script>"/>);
    expect(markup).not.toContain("NaN"); expect(markup).not.toContain("Infinity");
    expect(markup).not.toContain("external.invalid"); expect(markup).not.toContain("<script>");
    expect(markup).toContain("&lt;script&gt;");
    expect(renderToStaticMarkup(<ModularObject id="house" angle={30}/>)).not.toEqual(renderToStaticMarkup(<ModularObject id="house" angle={0}/>));
  });
});

it("discovers new moons under their parent without inventing v1 versions",()=>{
 expect(DISCOVERABLE_OBJECTS).toHaveLength(42);expect(MOON_OBJECTS).toHaveLength(8);
 for(const moon of MOON_OBJECTS){expect(resolveModularObject(moon.id,"2.0.0")).toBe(moon);expect(resolveModularObject(moon.id,"1.0.0")).toBeUndefined();expect(moon.parent).toBeTruthy();
  expect(renderToStaticMarkup(<ModularObject id={moon.id} version="2.0.0" thumbnail/>)).toContain(`${moon.id}-photorealistic.webp`);}
 expect(searchModularObjects("jupiter").filter(o=>o.parent==="jupiter")).toHaveLength(4);
});

it("preserves the distinct redistribution licenses of the imported maps",()=>{
 expect(planetProvenance("titania").license).toBe("CC-BY-SA-4.0");
 expect(planetProvenance("triton").license).toBe("CC-BY-3.0");
 expect(planetProvenance("europa").license).toBe("LicenseRef-NASA-Media");
 expect(resolveModularObject("titania","2.0.0")?.license).toBe("CC-BY-SA-4.0");
});
