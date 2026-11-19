import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { suggestComposition } from "@/lib/mcp/registry";
import { artifactSpec } from "@/lib/artifact/contract";
import example from "@/lib/artifact/example.json";
import { bpm } from "../packages/core/src/artifact";

describe("standalone HTML composition", () => {
  it("filters the ranked catalogue before applying the limit and keeps the app contract", () => {
    const need = "dashboard avec indicateurs et graphique";
    const result = suggestComposition(need, 4, "html");
    expect(result.suggestions.length).toBeGreaterThan(0);
    const supported = Object.values(result.artifact!.components);
    for (const suggestion of result.suggestions) {
      expect(supported).toContain(suggestion.name);
      for (const pair of suggestion.meaning?.pairWith ?? []) expect(supported).toContain(pair);
    }
    expect(suggestComposition(need)).toEqual(suggestComposition(need, undefined, "app"));
    expect(suggestComposition(need)).not.toHaveProperty("artifact");
    expect(suggestComposition("zzqvx", 2, "html").suggestions).toEqual([]);
  });

  it("validates the reference example and rejects an unlabeled badge or incomplete reference", () => {
    expect(artifactSpec.safeParse(example).success).toBe(true);
    for (const block of [
      {kind:"status", label:"Clôturé"},
      {kind:"indicator", label:"Marge", value:41.5, context:{reference:42.7}},
      {kind:"trend", title:"Ventes", data:[{x:"Mars",y:12}]},
    ]) expect(artifactSpec.safeParse({...example, blocks:[block]}).success).toBe(false);
  });

  it("preserves explicit units, including their precision, and formats numeric deltas", () => {
    for (const delta of ["-1,2 pt", "−1,25 pt", "+0,75 %", "+2 kg"]) {
      const html = renderToStaticMarkup(bpm.metric({label:"Marge", value:41.5, delta}));
      expect(html).toContain(delta);
      expect(html).not.toContain("€");
    }
    expect(renderToStaticMarkup(bpm.metric({label:"CA",value:100,delta:-2}))).toContain("-2 €");
  });

  it("draws signed comparisons above and below zero", () => {
    const html = renderToStaticMarkup(bpm.barChart({data:[{x:"A",y:-8},{x:"B",y:8}]}));
    expect(html).toContain('y="100" width="176" height="80"');
    expect(html).toContain('y="20" width="176" height="80"');
  });
});
