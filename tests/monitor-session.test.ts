// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { loadMonitorSession, saveMonitorSession } from "@/lib/monitor-session";

const pres = { title: "Essai", slides: [{ id: 1, title: "Ordre", script: "Un lot", notes: "", kpis: [] }] };
afterEach(() => localStorage.clear());

it("reads a legacy presentation and stores the slide and question history together", async () => {
  localStorage.setItem("bpm-monitor-pres", JSON.stringify(pres));
  localStorage.setItem("bpm-monitor-cur", "10");
  localStorage.setItem("bpm-monitor-logged", JSON.stringify([{ question: "Lots ?", answer: "Un", slide_title: "Ordre" }]));
  const original = loadMonitorSession(pres);
  expect(original.data.cur).toBe(0);
  expect(original.data.logged[0].answer).toBe("Un");
  await saveMonitorSession(original.data, { current: original.stored });
  localStorage.removeItem("bpm-monitor-logged");
  expect(loadMonitorSession(pres).data).toEqual(original.data);
});

it("preserves a saved session when two tabs start editing the same version", async () => {
  const { data, stored } = loadMonitorSession(pres);
  const first = { ...data, pres: { ...pres, title: "Première contribution" } };
  await saveMonitorSession(first, { current: stored });
  await expect(saveMonitorSession(data, { current: stored })).rejects.toThrow("conflict");
  expect(loadMonitorSession(pres).data.pres.title).toBe(first.pres.title);
});
