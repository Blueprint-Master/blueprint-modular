import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import example from "@/lib/artifact/example.json";

describe("offline HTML renderer", () => {
  it("renders and re-reads a report without dependencies in the consumer directory", () => {
    execFileSync(process.execPath, ["scripts/build-artifact.mjs"]);
    const cli = join(process.cwd(), "public/artifacts/bpm-artifact.cjs");
    const cwd = mkdtempSync(join(tmpdir(), "modular-html-"));
    function run(...args: string[]) {
      return execFileSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    }
    try {
      const spec = {...example, title:"Texte littéral </script> & fin"};
      writeFileSync(join(cwd, "spec.json"), JSON.stringify(spec));
      const html = run("spec.json");
      expect(html).toContain("-1,2 pt");
      expect(html).toContain("Clôturé");
      expect(html).toContain("bpm-line-chart");
      expect(html).not.toMatch(/<script src=|@import|<link[^>]+href=/i);
      writeFileSync(join(cwd, "dashboard.html"), html);
      const {spec: recovered, observations} = JSON.parse(run("--inspect", "dashboard.html"));
      expect(recovered).toEqual(spec);
      expect(observations[1]).toMatchObject({difference:-1.2, differenceUnit:"pt", unit:"%", assessment:"unfavorable", referenceLabel:"Marge du mois précédent (%)"});
      expect(JSON.parse(run("--schema")).properties.blocks).toBeDefined();
      expect(JSON.parse(run("--example"))).toEqual(example);
      writeFileSync(join(cwd, "spec.json"), JSON.stringify({...spec, blocks:[{kind:"status",label:"Clôturé"}]}));
      expect(() => run("spec.json")).toThrow();
    } finally {
      rmSync(cwd, {recursive:true, force:true});
    }
  });
});
