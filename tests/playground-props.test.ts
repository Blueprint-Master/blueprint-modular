/**
 * Tests du générateur de specs de props du playground (feat/components-playground).
 *
 * Vérifie que les contrôles sont bien dérivés de la source de vérité
 * `public/llms.txt` : booléen→toggle, énumération→select, number→numérique,
 * string/ReactNode→texte, et que les types complexes dégradent en non-éditable
 * sans planter.
 */
import { describe, it, expect } from "vitest";
import { parsePropSpecs, getPlaygroundComponents } from "@/lib/playgroundProps";

describe("parsePropSpecs — dérivation depuis llms.txt", () => {
  it("badge : variant → select avec valeurs et défaut", () => {
    const specs = parsePropSpecs("bpm.badge");
    const variant = specs.find((s) => s.name === "variant");
    expect(variant).toBeDefined();
    expect(variant!.control).toBe("select");
    expect(variant!.options).toContain("success");
    expect(variant!.default).toBe("default");
  });

  it("badge : children (ReactNode) dégrade en champ texte éditable", () => {
    const specs = parsePropSpecs("bpm.badge");
    const children = specs.find((s) => s.name === "children");
    expect(children).toBeDefined();
    expect(children!.control).toBe("string");
    expect(children!.required).toBe(true);
  });

  it("slider : min/max/step/value → contrôles numériques", () => {
    const specs = parsePropSpecs("bpm.slider");
    for (const name of ["value", "min", "max", "step"]) {
      const s = specs.find((x) => x.name === name);
      expect(s, name).toBeDefined();
      expect(s!.control, name).toBe("number");
    }
  });

  it("slider : onChange (callback) reste non éditable", () => {
    const specs = parsePropSpecs("bpm.slider");
    const onChange = specs.find((s) => s.name === "onChange");
    expect(onChange).toBeDefined();
    expect(onChange!.editable).toBe(false);
    expect(onChange!.control).toBeUndefined();
  });

  it("toggle : value → contrôle booléen", () => {
    const specs = parsePropSpecs("bpm.toggle");
    const value = specs.find((s) => s.name === "value");
    expect(value).toBeDefined();
    expect(value!.control).toBe("boolean");
    expect(typeof value!.default).toBe("boolean");
  });

  it("plotlyChart : data (object[]) reste non éditable, height numérique", () => {
    const specs = parsePropSpecs("bpm.plotlyChart");
    const data = specs.find((s) => s.name === "data");
    expect(data).toBeDefined();
    expect(data!.editable).toBe(false);
    const height = specs.find((s) => s.name === "height");
    expect(height?.control).toBe("number");
  });

  it("composant inexistant → liste vide, jamais d'exception", () => {
    expect(parsePropSpecs("bpm.doesNotExist")).toEqual([]);
  });
});

describe("getPlaygroundComponents — couverture du registry", () => {
  it("renvoie une entrée par composant avec slug/name/specs", () => {
    const all = getPlaygroundComponents();
    expect(all.length).toBeGreaterThan(50);
    for (const c of all) {
      expect(c.slug).toBeTruthy();
      expect(c.name.startsWith("bpm.")).toBe(true);
      expect(Array.isArray(c.specs)).toBe(true);
    }
  });
});
