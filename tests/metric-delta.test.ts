// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { bpm } from "../packages/core/src/artifact";
import { artifactSpec } from "../lib/artifact/contract";

function renderedDelta(delta?: number | string | null, inverse = false) {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(bpm.metric({
    label: "Écart", value: 100, delta, deltaType: inverse ? "inverse" : "normal",
  }));
  return host.querySelector(".bpm-metric")!.lastElementChild!;
}

describe("metric delta in HTML and React", () => {
  it.each([
    ["-1,2 pt", "▼"], ["+1,2 k€", "▲"], ["+1 234,5 €", "▲"], ["1.234,5", "▲"],
    ["−1\u202f234,50 €", "▼"], ["+1\u00a0234,5 €", "▲"], ["+1\u2009234,5 €", "▲"],
    ["−2.345.678,01", "▼"], ["0 000,0 €", "—"],
    [Intl.NumberFormat("fr-FR", {style:"currency", currency:"EUR"}).format(1234.5), "▲"],
  ])("preserves %s exactly and determines its direction", (text, arrow) => {
    const spec = {title:"Écarts", blocks:[{kind:"indicator", label:"Écart", value:100, delta:text}]};
    expect(artifactSpec.safeParse(spec).success).toBe(true);
    const element = renderedDelta(text);
    expect(element.textContent).toBe(arrow + text);
    expect(element.classList.contains("opacity-0")).toBe(false);
    expect(element.classList.contains("text-red-600")).toBe(arrow === "▼");
    expect(element.classList.contains("text-green-600")).toBe(arrow === "▲");
  });

  it.each(["à confirmer", "  à confirmer  ", "1 23,4 €", "1.23.45", "12,3,4", "+", "<b>indisponible</b>"])(
    "keeps unreadable text visible, neutral and escaped: %s", text => {
      const element = renderedDelta(text);
      expect(element.textContent).toBe(text);
      expect(element.childElementCount).toBe(0);
      expect(element.className).not.toMatch(/opacity-0|text-(red|green)-600/);
    },
  );

  it.each([undefined, null, "", "  "])("reserves blank space for an absent delta", delta => {
    const element = renderedDelta(delta);
    expect(element.textContent?.trim()).toBe("");
    expect(element.classList.contains("opacity-0")).toBe(true);
  });

  it("retains numeric currency formatting and inverse color semantics", () => {
    expect(renderedDelta(1000).textContent).toBe("▲+1\u202f000 €");
    expect(renderedDelta("−1\u202f234,5 €", true).classList.contains("text-green-600")).toBe(true);
  });
});
