import { expect, it } from "vitest";
import registry from "@/lib/generated/mcp-registry.json";
import annotations from "@/lib/semantics/bpm-semantics.json";
import { componentDetail, getComponent } from "@/lib/mcp/registry";

it("reports human approval separately from the presence of an annotation", () => {
  const source: Record<string, { status: string }> = annotations.components;
  for (const entry of registry.components) {
    const annotation = source[entry.slug];
    const detail = componentDetail(getComponent(entry.name)!);
    expect(detail.status, entry.name).toBe(annotation?.status === "curated" ? "curated" : "uncurated");
    expect(detail.semantics, entry.name).toEqual(annotation ?? null);
  }
});
