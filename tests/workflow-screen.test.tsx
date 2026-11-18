// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { WorkflowSimulator } from "@/app/(app)/modules/workflow/WorkflowSimulator";

vi.mock("@/components/bpm", async () => ({
  Badge: (await import("@/components/bpm/Badge")).Badge,
  Button: (await import("@/components/bpm/Button")).Button,
  Card: (await import("@/components/bpm/Card")).Card,
}));

it("archives, resets the demo journal and validates a new draft", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const root = createRoot(document.body.appendChild(document.createElement("div")));
  const click = (label: string) => {
    const button = [...document.querySelectorAll("button")].find(b => b.textContent === label);
    expect(button, label).toBeDefined();
    act(() => button!.click());
  };
  try {
    act(() => root.render(<WorkflowSimulator />));
    click("Archiver");
    expect(document.querySelectorAll("li")).toHaveLength(2);
    click("Réinitialiser (démo)");
    expect(document.querySelectorAll("li")).toHaveLength(0);
    click("Valider");
    expect(document.querySelector("li")?.textContent).toContain("brouillon → validé");
    click("Archiver");
    expect(document.querySelectorAll("li")).toHaveLength(2);
  } finally {
    act(() => root.unmount());
    vi.unstubAllGlobals();
  }
});
