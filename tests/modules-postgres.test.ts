import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@prisma/client";

const url = process.env.MODULAR_TEST_DATABASE_URL;
const postgres = new PrismaClient({ datasourceUrl: url });
let userId: string | null;
const owner = randomUUID();
const other = randomUUID();
vi.mock("@/lib/prisma", () => ({ get prisma() { return postgres; } }));
vi.mock("@/lib/auth", () => ({
  getPersonalModuleSession: async () => userId ? { user: { id: userId } } : null,
}));
import { GET as workflow } from "@/app/api/workflow/entity/[id]/route";
import { POST as advance } from "@/app/api/workflow/entity/[id]/transition/route";
import * as calendar from "@/app/api/calendar/route";
import * as item from "@/app/api/calendar/[id]/route";
import * as notifications from "@/app/api/notifications/route";
import { PATCH as markRead } from "@/app/api/notifications/[id]/read/route";

function request(path: string, method = "GET", body?: unknown) {
  return new Request("http://localhost" + path, { method, body: JSON.stringify(body) });
}
const context = (id: string) => ({ params: Promise.resolve({ id }) });

describe.skipIf(!url)("module API handlers with PostgreSQL", () => {
  beforeAll(async () => {
    await postgres.user.createMany({ data: [owner, other].map(id => ({ id, email: id + "@example.test" })) });
  });
  afterAll(async () => {
    await postgres.user.deleteMany({ where: { id: { in: [owner, other] } } });
    await postgres.$disconnect();
  });

  it("creates, lists, partially edits and deletes an event for its owner", async () => {
    userId = owner;
    const startAt = "2026-10-25T08:00:00+01:00";
    const endAt = "2026-10-25T09:00:00+01:00";
    const created = await calendar.POST(request("/api/calendar", "POST", { title: "  Équipe  ", startAt, endAt }));
    expect(created.status).toBe(200);
    const event = await created.json();
    expect(event).toMatchObject({ title: "Équipe", startAt: "2026-10-25T07:00:00.000Z" });
    const ctx = context(event.id);
    const range = request("/api/calendar?start=2026-10-25T07:15Z&end=2026-10-25T07:45Z");
    expect((await (await calendar.GET(range)).json()).map(e => e.id)).toContain(event.id);
    expect((await item.PUT(request("/", "PUT", { title: "Renommé" }), ctx)).status).toBe(200);
    expect((await item.PUT(request("/", "PUT", { endAt: "2026-10-24" }), ctx)).status).toBe(400);
    const saved = await (await item.GET(request("/"), ctx)).json();
    expect(saved).toMatchObject({ title: "Renommé", startAt: event.startAt, endAt: event.endAt });
    userId = other;
    expect(await (await calendar.GET(range)).json()).toEqual([]);
    expect((await item.GET(request("/"), ctx)).status).toBe(404);
    expect((await item.PUT(request("/", "PUT", { title: "Other" }), ctx)).status).toBe(404);
    expect((await item.DELETE(request("/", "DELETE"), ctx)).status).toBe(404);
    userId = owner;
    expect((await item.DELETE(request("/", "DELETE"), ctx)).status).toBe(204);
    expect((await item.GET(request("/"), ctx)).status).toBe(404);
  });

  it("rechecks opposing one-sided edits at write time", async () => {
    userId = owner;
    const event = await (await calendar.POST(request("/", "POST", {
      title: "Concurrent", startAt: "2026-06-01", endAt: "2026-06-30",
    }))).json();
    const responses = await Promise.all([
      item.PUT(request("/", "PUT", { startAt: "2026-06-20" }), context(event.id)),
      item.PUT(request("/", "PUT", { endAt: "2026-06-10" }), context(event.id)),
    ]);
    expect(responses.map(r => r.status).sort()).toEqual([200, 400]);
    const saved = await postgres.calendarEvent.findUniqueOrThrow({ where: { id: event.id } });
    expect(saved.startAt.getTime()).toBeLessThanOrEqual(saved.endAt.getTime());
  });

  it("keeps the first reading time across retries and filters by recipient", async () => {
    userId = owner;
    const created = await notifications.POST(request("/", "POST", { message: " Inspection ", type: "error" }));
    expect(created.status).toBe(201);
    const n = await created.json();
    expect(n).toMatchObject({ message: "Inspection", level: 1, readAt: null });
    const list = async (read: boolean) => (await (await notifications.GET(request("/?read=" + read))).json()).notifications;
    expect(await list(false)).toContainEqual(n);
    userId = other;
    expect(await list(false)).toEqual([]);
    expect((await markRead(request("/", "PATCH"), context(n.id))).status).toBe(404);
    userId = owner;
    expect((await markRead(request("/", "PATCH"), context(n.id))).status).toBe(200);
    const [first] = await list(true);
    expect(first.readAt).toBeTruthy();
    expect((await markRead(request("/", "PATCH"), context(n.id))).status).toBe(200);
    expect(await list(true)).toEqual([first]);
    expect(await list(false)).toEqual([]);
  });

  it("commits each workflow revision once and returns the ordered journal on reload", async () => {
    userId = owner;
    const ctx = context("contract-42");
    const load = async () => (await workflow(request("/"), ctx)).json();
    const action = (revision: number, to: string) => advance(request("/", "POST", { revision, to }), ctx);
    expect(await load()).toMatchObject({ status: "brouillon", revision: 0, history: [] });
    expect((await action(0, "archivé")).status).toBe(409);
    const race = await Promise.all([action(0, "validé"), action(0, "validé")]);
    expect(race.map(res => res.status).sort()).toEqual([200, 409]);
    expect((await action(0, "archivé")).status).toBe(409);
    expect((await action(1, "archivé")).status).toBe(200);
    const saved = await load();
    expect(saved.status).toBe("archivé");
    expect(saved.history).toEqual([
      { revision: 1, from: "brouillon", to: "validé", who: owner, when: expect.any(String) },
      { revision: 2, from: "validé", to: "archivé", who: owner, when: expect.any(String) },
    ]);
    expect((await action(2, "brouillon")).status).toBe(409);
    userId = other;
    expect(await load()).toMatchObject({ revision: 0, status: "brouillon", history: [] });
    expect((await action(0, "validé")).status).toBe(200);
    expect((await load()).history[0].who).toBe(other);
    userId = null;
    expect((await action(0, "validé")).status).toBe(401);
  });

  it("rejects malformed requests and requires a session", async () => {
    userId = owner;
    for (const body of [null, [], {title: "   ", startAt: "2026-09-01", endAt: "2026-09-01"},
      {title: "Bad date", startAt: "2026-02-30", endAt: "2026-03-01"}]) {
      expect((await calendar.POST(request("/", "POST", body))).status).toBe(400);
    }
    for (const query of ["?start=2026-01-01", "?start=2027-01-01&end=2026-01-01"]) {
      expect((await calendar.GET(request("/" + query))).status).toBe(400);
    }
    expect((await notifications.POST(request("/", "POST", { message: " ", type: "info" }))).status).toBe(400);
    expect((await notifications.POST(request("/", "POST", { message: "x", userId: other }))).status).toBe(400);
    userId = null;
    expect((await calendar.POST(request("/", "POST", {}))).status).toBe(401);
    expect((await notifications.GET(request("/"))).status).toBe(401);
    expect((await markRead(request("/", "PATCH"), context("missing"))).status).toBe(401);
  });
});
