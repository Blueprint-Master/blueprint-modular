// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Simulate } from "react-dom/test-utils";
import { expect, it, vi } from "vitest";
import Calendar from "@/app/(app)/modules/calendrier/simulateur/page";
import { formatDateKey } from "@/lib/calendar/civil-days";

vi.mock("@/components/bpm", async () => ({
  Button: (await import("@/components/bpm/Button")).Button,
  Input: (await import("@/components/bpm/Input")).Input,
  Chip: (await import("@/components/bpm/Chip")).Chip,
  Modal: (await import("@/components/bpm/Modal")).Modal,
  Selectbox: (await import("@/components/bpm/Selectbox")).Selectbox,
  Textarea: (await import("@/components/bpm/Textarea")).Textarea,
}));

it("creates and deletes an appointment on the day selected after navigation", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const root = createRoot(document.body.appendChild(document.createElement("div")));
  const button = (label: string) => {
    const found = [...document.querySelectorAll("button")].find(b => b.textContent?.includes(label));
    expect(found, label).toBeDefined();
    return found!;
  };
  try {
    act(() => root.render(<Calendar />));
    act(() => button("Jour").click());
    act(() => button("→").click());
    act(() => button("+ Nouvel événement").click());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(document.querySelector<HTMLInputElement>('input[type="date"]')!.value).toBe(formatDateKey(tomorrow));
    const title = document.querySelector<HTMLInputElement>("input[placeholder=\"Titre de l'événement\"]")!;
    act(() => { title.value = "Recette agenda"; Simulate.change(title); });
    act(() => Simulate.submit(document.querySelector("form")!));
    act(() => button("Recette agenda").click());
    act(() => button("Supprimer").click());
    expect(document.body.textContent).not.toContain("Recette agenda");
  } finally {
    act(() => root.unmount());
    vi.unstubAllGlobals();
  }
});
