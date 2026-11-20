import { z } from "zod";
import type { LoggedQuestion, SlideContext } from "./prompteur-api";

const presentation = z.object({
  title: z.string(),
  slides: z.array(z.object({
    id: z.number().int(), title: z.string(), script: z.string(),
    notes: z.string().nullish().transform(value => value ?? ""), kpis: z.array(z.string()).default([]),
  })).min(1),
});
const logged = z.array(z.object({ question: z.string(), answer: z.string(), slide_title: z.string() }));
const session = z.object({ pres: presentation, cur: z.number().int().nonnegative(), logged });
export type MonitorSession = {
  pres: { title: string; slides: (SlideContext & { notes: string })[] };
  cur: number;
  logged: LoggedQuestion[];
};
const key = "bpm-monitor-session-v1";

export function loadMonitorSession(defaultPresentation: MonitorSession["pres"]): { data: MonitorSession; stored: string | null } {
  const fallback = { pres: defaultPresentation, cur: 0, logged: [] };
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const data = session.parse(JSON.parse(stored)) as MonitorSession;
      return { data: { ...data, cur: Math.min(data.cur, data.pres.slides.length - 1) }, stored };
    }
    const pres = presentation.parse(JSON.parse(localStorage.getItem("bpm-monitor-pres") ?? "null") ?? defaultPresentation) as MonitorSession["pres"];
    const cur = Number(localStorage.getItem("bpm-monitor-cur"));
    const history = logged.parse(JSON.parse(localStorage.getItem("bpm-monitor-logged") ?? "[]")) as LoggedQuestion[];
    return { data: { pres, cur: Number.isInteger(cur) ? Math.max(0, Math.min(cur, pres.slides.length - 1)) : 0, logged: history }, stored };
  } catch {
    return { data: fallback, stored: null };
  }
}

export async function saveMonitorSession(data: MonitorSession, baseline: { current: string | null }) {
  function write() {
    const serialized = JSON.stringify(data);
    const stored = localStorage.getItem(key);
    if (serialized === stored) { baseline.current = stored; return; }
    if (stored !== baseline.current) throw new Error("conflict");
    localStorage.setItem(key, serialized);
    baseline.current = serialized;
  }
  if (navigator.locks) await navigator.locks.request(key, write);
  else write();
}
