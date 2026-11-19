import JSZip from "jszip";
import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@prisma/client";

const url = process.env.MODULAR_TEST_DATABASE_URL;
const postgres = new PrismaClient({ datasourceUrl: url });
let userId: string | null;
const owner = randomUUID();
const other = randomUUID();
let wikiRole = "USER";
vi.mock("@/lib/prisma", () => ({ get prisma() { return postgres; } }));
vi.mock("@/lib/auth", () => ({
  canApproveChange: (user: { role?: string }) => user.role === "ADMIN",
  hasWriteRole: (user: { role?: string }) => user.role === "ADMIN",
  getSessionOrTestUser: async () => userId ? { user: { id: userId, role: wikiRole } } : null,
  getPersonalModuleSession: async () => userId ? { user: { id: userId, role: wikiRole } } : null,
}));
import { GET as auditPage } from "@/app/api/asset-manager/audit-log/route";
import { runEscalations } from "@/lib/asset-manager/escalate-sla.mjs";
import { ticketSla } from "@/lib/asset-manager/ticket-sla";
import { GET as loans, POST as issue } from "@/app/api/asset-manager/assignments/route";
import { PUT as editLoan } from "@/app/api/asset-manager/assignments/[id]/route";
import { POST as returnLoan } from "@/app/api/asset-manager/assignments/[id]/return/route";
import * as changeItem from "@/app/api/asset-manager/changes/[id]/route";
import { POST as approveChange } from "@/app/api/asset-manager/changes/[id]/approve/route";
import { POST as rejectChange } from "@/app/api/asset-manager/changes/[id]/reject/route";
import * as assetContracts from "@/app/api/asset-manager/contracts/route";
import * as assetContract from "@/app/api/asset-manager/contracts/[id]/route";
import { contractAlert } from "@/lib/asset-manager/contract-terms";
import * as movements from "@/app/api/asset-manager/movements/route";
import * as movementItem from "@/app/api/asset-manager/movements/[id]/route";
import * as relations from "@/app/api/asset-manager/ci-relations/route";
import * as relationItem from "@/app/api/asset-manager/ci-relations/[id]/route";
import * as changes from "@/app/api/asset-manager/changes/route";
import * as knowledge from "@/app/api/asset-manager/knowledge/route";
import * as knowledgeItem from "@/app/api/asset-manager/knowledge/[id]/route";
import { PUT as recordReading } from "@/app/api/asset-manager/knowledge/[id]/reader/route";
import * as tickets from "@/app/api/asset-manager/tickets/route";
import * as ticketItem from "@/app/api/asset-manager/tickets/[id]/route";
import { GET as warnings } from "@/app/api/asset-manager/sla-escalation/route";
import * as assetItem from "@/app/api/asset-manager/assets/[id]/route";
import * as inventory from "@/app/api/asset-manager/assets/route";
import { GET as workflow } from "@/app/api/workflow/entity/[id]/route";
import { POST as advance } from "@/app/api/workflow/entity/[id]/transition/route";
import * as newsletter from "@/app/api/newsletter/articles/route";
import * as edition from "@/app/api/newsletter/articles/[id]/route";
import { PATCH as archive } from "@/app/api/newsletter/articles/[id]/archive/route";
import * as newsletterHeader from "@/app/api/newsletter/settings/route";
import * as board from "@/app/api/whiteboards/[organizationId]/[board]/route";
import { GET as wikiIndex, POST as wikiCreate } from "@/app/api/wiki/route";
import { GET as wikiRead, PUT as wikiEdit } from "@/app/api/wiki/[slug]/route";
import { POST as wikiRestore } from "@/app/api/wiki/[slug]/restore/route";
import { GET as wikiLinks } from "@/app/api/wiki/[slug]/backlinks/route";
import { GET as wikiZip } from "@/app/api/wiki/export/zip/route";
import * as comments from "@/app/api/wiki/[slug]/comments/route";
import * as reservations from "@/app/api/reservations/route";
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
    await postgres.auditLog.deleteMany({ where: { userId: { in: [owner, other] } } });
    await postgres.user.deleteMany({ where: { id: { in: [owner, other] } } });
    await postgres.$disconnect();
  });

  it("delivers SLA escalations once, routes reassignment and records the personal inbox receipts", async () => {
    const job = await postgres.user.create({ data: { email: randomUUID() + "@example.test", role: "ADMIN" } });
    const tech = await postgres.user.create({ data: { email: randomUUID() + "@example.test", role: "ADMIN" } });
    const org = await postgres.organization.create({ data: { name: "QA", slug: randomUUID() } });
    const workspace = await postgres.workspace.create({ data: { organizationId: org.id, name: "QA", slug: "qa" } });
    await postgres.orgMember.createMany({ data: [job.id, tech.id, owner].map(userId => ({ userId, organizationId: org.id })) });
    const prefix = randomUUID();
    const now = new Date("2026-11-17T12:00:00Z");
    const openedAt = new Date("2026-11-17T10:00:00Z");
    const slaDueAt = new Date("2026-11-17T14:00:00Z");
    const base = { workspaceId: workspace.id, domainId: "it", title: prefix, description: "QA", typeId: "incident", status: "on_hold", priorityId: "critical",
      categoryId: "hardware", requesterId: owner, openedAt, slaDueAt };
    const routing = { workspaceId: workspace.id, domainId: "it", actorId: job.id, targets: { notify_manager: owner, senior_tech: tech.id, notify_director: owner } };
    try {
      const incident = await postgres.ticket.create({ data: { ...base, reference: prefix } });
      await postgres.ticket.create({ data: { ...base, reference: prefix + "-resolved", status: "resolved" } });
      await expect(runEscalations(postgres, { ...routing, targets: { ...routing.targets, senior_tech: "unknown" } }, now)).rejects.toThrow();
      await expect(runEscalations(postgres, { ...routing, actorId: other }, now)).rejects.toThrow();
      await expect(runEscalations(postgres, { ...routing, targets: { ...routing.targets, senior_tech: owner } }, now)).rejects.toThrow();
      await postgres.ticket.create({ data: { ...base, workspaceId: null, reference: prefix + "-other-scope" } });
      const concurrent = await Promise.all([runEscalations(postgres, routing, now), runEscalations(postgres, routing, now)]);
      expect(concurrent.map(result => result.actions).sort()).toEqual([0, 1]);
      const later = await runEscalations(postgres, routing, slaDueAt);
      expect(later.actions).toBe(2);
      expect((await runEscalations(postgres, routing, slaDueAt)).actions).toBe(0);
      expect(await postgres.ticket.findUnique({ where: { id: incident.id } })).toMatchObject({ assigneeId: tech.id });
      userId = tech.id;
      const inbox = await (await notifications.GET(request("/?read=false"))).json();
      expect(inbox.notifications.filter((row: { title: string }) => row.title === prefix)).toHaveLength(1);
      expect(await postgres.notification.count({ where: { userId: owner, title: prefix } })).toBe(2);
      const logs = await postgres.auditLog.findMany({ where: { resourceId: incident.id, action: "escalate" } });
      expect(logs).toHaveLength(3);
      for (const log of logs) {
        const action = JSON.parse(log.afterState!);
        expect(log.userId).toBe(job.id);
        expect(await postgres.notification.findUnique({ where: { id: action.notificationId } })).toMatchObject({ userId: action.recipientId });
      }
    } finally {
      await postgres.ticket.deleteMany({ where: { title: prefix } });
      await postgres.notification.deleteMany({ where: { title: prefix } });
      await postgres.auditLog.deleteMany({ where: { userId: job.id } });
      await postgres.organization.delete({ where: { id: org.id } });
      await postgres.user.deleteMany({ where: { id: { in: [job.id, tech.id] } } });
    }
  });

  it("finds an older on-hold SLA incident and pages equal-date tickets and loans beyond 200", async () => {
    userId = owner;
    const prefix = "SLA-" + randomUUID();
    const start = new Date(Date.now() - 3_600_000);
    const due = new Date(start.getTime() + 1_800_000);
    const legacy = { openedAt: start, status: "on_hold", priorityId: "low" };
    expect(ticketSla(legacy, [{ id: "low", sla_hours: 120 }]).atRisk).toBe(false);
    const clock = { ...legacy, slaDueAt: due };
    expect(ticketSla(clock, [], start.getTime() + 1_439_999).atRisk).toBe(false);
    expect(ticketSla(clock, [], start.getTime() + 1_440_000).atRisk).toBe(true);
    expect(ticketSla(clock, [], due.getTime() - 1).overdue).toBe(false);
    expect(ticketSla(clock, [], due.getTime()).overdue).toBe(true);
    expect(ticketSla({ ...clock, status: "closed" }, []).atRisk).toBe(false);
    const asset = await postgres.asset.create({ data: {
      reference: prefix, domainId: "it", assetTypeId: "laptop", statusId: "in_stock", label: prefix, createdById: owner,
    } });
    try {
      const entries = Array.from({ length: 201 }, (_, i) => ({
        domainId: "it", reference: prefix + i, title: prefix, description: "QA", typeId: "incident", status: "closed",
        priorityId: "low", categoryId: "hardware", openedAt: new Date(start.getTime() + 1), requesterId: owner,
      }));
      await postgres.ticket.createMany({ data: entries });
      const oldest = await postgres.ticket.create({ data: { ...entries[0], ...clock, reference: prefix } });
      await postgres.assignment.createMany({ data: entries.map(row => ({
        reference: row.reference, domainId: "it", assetId: asset.id, assigneeId: owner,
        assignmentType: "temporary", status: "returned", startDate: start, actualEndDate: start,
      })) });
      for (const [read, count] of [[tickets.GET, 202], [loans, 201]] as const) {
        const first = await read(request("/?domainId=it"));
        const page = await first.json();
        expect(page).toHaveLength(200);
        const next = await read(request("/?domainId=it&cursor=" + first.headers.get("X-Next-Cursor")));
        const rest = await next.json();
        const fixtures = [...page, ...rest].filter(row => row.reference.startsWith(prefix));
        expect(new Set(fixtures.map(row => row.id)).size).toBe(count);
        expect(next.headers.get("X-Next-Cursor")).toBeNull();
        expect((await read(request("/?domainId=it&cursor=invalid"))).status).toBe(400);
      }
      const report = await (await warnings(request("/?domainId=it"))).json();
      expect(report.atRisk).toContainEqual(expect.objectContaining({ id: oldest.id, overdue: true, slaDueAt: due.toISOString() }));
    } finally {
      await postgres.ticket.deleteMany({ where: { reference: { startsWith: prefix } } });
      await postgres.asset.delete({ where: { id: asset.id } });
    }
  });

  it("pages a filtered audit by timestamp and id while newer entries arrive", async () => {
    wikiRole = "ADMIN";
    const resourceId = randomUUID();
    const details = { resourceId, domainId: "it", resourceType: "asset", action: "delete", userId: owner, beforeState: '{"label":"QA"}' };
    const timestamp = new Date("2026-11-17T16:00:00Z");
    const search = "/?resourceId=" + resourceId + "&domainId=it&resourceType=asset&action=delete&from=2026-11-17&to=2026-11-17&limit=2";
    userId = owner;
    await postgres.auditLog.createMany({ data: [
      ...Array.from({ length: 3 }, () => ({ ...details, timestamp })),
      { ...details, timestamp: new Date("2026-11-18T00:00:00Z") },
      { ...details, domainId: "maintenance", timestamp },
    ] });
    const expected = await postgres.auditLog.findMany({ where: { resourceId, domainId: "it", timestamp }, orderBy: { id: "desc" } });
    const first = await auditPage(request(search));
    const rows = await first.json();
    expect(rows.map((row: { id: string }) => row.id)).toEqual(expected.slice(0, 2).map(row => row.id));
    expect(rows[0]).toMatchObject({ userId: owner, beforeState: details.beforeState });
    const cursor = first.headers.get("X-Next-Cursor");
    expect(cursor).toBeTruthy();
    await postgres.auditLog.create({ data: { ...details, timestamp: new Date("2026-11-17T23:59:59Z") } });
    const last = await auditPage(request(search + "&cursor=" + cursor));
    expect((await last.json()).map((row: { id: string }) => row.id)).toEqual([expected[2].id]);
    expect(last.headers.get("X-Next-Cursor")).toBeNull();
    for (const query of ["from=2026-02-30", "from=2026-11-18&to=2026-11-17", "cursor=invalid"]) {
      expect((await auditPage(request("/?" + query))).status).toBe(400);
    }
    wikiRole = "USER";
    expect((await auditPage(request(search))).status).toBe(403);
    wikiRole = "ADMIN";
    userId = null;
    expect((await auditPage(request(search))).status).toBe(401);
  });

  it("reserves contract references per domain and keeps deadlines, notice and coverage consistent across edits", async () => {
    wikiRole = "ADMIN";
    userId = owner;
    const reference = "QA-contract-" + randomUUID();
    const asset = await postgres.asset.create({ data: {
      domainId: "it", reference: randomUUID(), assetTypeId: "laptop", label: reference, statusId: "in_stock", createdById: owner,
    } });
    const body = { domainId: "it", type: "garantie", label: reference, reference, startDate: "2026-01-01", endDate: "2026-12-31",
      amount: 0, autoRenewal: true, noticeDays: 30, alertDaysBefore: 0, assetIds: [asset.id, asset.id] };
    const add = (patch: object) => assetContracts.POST(request("/", "POST", { ...body, ...patch }));
    try {
      expect((await add({ endDate: "2026-02-30" })).status).toBe(400);
      expect((await add({ amount: -1 })).status).toBe(400);
      expect((await add({ domainId: "maintenance" })).status).toBe(400);
      const race = await Promise.all([add({}), add({})]);
      expect(race.map(r => r.status).sort()).toEqual([200, 409]);
      const row = await race.find(r => r.ok)!.json();
      const ctx = context(row.id);
      const read = async () => (await assetContract.GET(request("/"), ctx)).json();
      expect(await read()).toMatchObject({ coveredAssets: [{ id: asset.id }], amount: 0, alertDaysBefore: 0 });
      expect(contractAlert(row, new Date("2026-11-30"))).toBe(false);
      expect(contractAlert(row, new Date("2026-12-01"))).toBe(true);
      expect(contractAlert(row, new Date("2027-01-01"))).toBe(false);
      expect((await add({ domainId: "maintenance", assetIds: [] })).status).toBe(200);
      const edit = (patch: object) => assetContract.PUT(request("/", "PUT", patch), ctx);
      expect((await edit({ endDate: "2025-01-01" })).status).toBe(400);
      expect((await Promise.all([edit({ noticeDays: 0, expectedUpdatedAt: row.updatedAt }),
        edit({ supplier: "QA", expectedUpdatedAt: row.updatedAt })])).map(r => r.status).sort()).toEqual([200, 409]);
      expect((await edit({ assetIds: null, noticeDays: 0 })).status).toBe(200);
      const saved = await read();
      expect(saved).toMatchObject({ coveredAssets: [], noticeDays: 0 });
      const remove = (version: string) => assetContract.DELETE(request("/?expectedUpdatedAt=" + encodeURIComponent(version), "DELETE"), ctx);
      expect((await remove(row.updatedAt)).status).toBe(409);
      expect((await remove(saved.updatedAt)).status).toBe(200);
      expect((await assetContract.GET(request("/"), ctx)).status).toBe(404);
    } finally {
      wikiRole = "USER";
      await postgres.assetContract.deleteMany({ where: { reference } });
      await postgres.auditLog.deleteMany({ where: { userId: owner, resourceType: "contract" } });
      await postgres.asset.delete({ where: { id: asset.id } });
    }
  });

  it("retries a physical move once, reconciles location in date order and guards revisions including withdrawal", async () => {
    wikiRole = "ADMIN";
    userId = owner;
    const asset = await postgres.asset.create({ data: {
      label: "QA-move", reference: randomUUID(), domainId: "it", assetTypeId: "laptop", statusId: "in_stock", locationId: "A", createdById: owner,
    } });
    const key = randomUUID();
    const base = { assetId: asset.id, movementType: "transfer", date: "2026-10-10", toLocationId: "B" };
    const add = (patch: object, token: string) => {
      const req = request("/", "POST", { ...base, ...patch });
      req.headers.set("Idempotency-Key", token);
      return movements.POST(req);
    };
    const location = async () => (await postgres.asset.findUniqueOrThrow({ where: { id: asset.id } })).locationId;
    const history = async () => (await movements.GET(request("/?assetId=" + asset.id))).json();
    try {
      expect((await add({ date: "2026-02-30" }, key)).status).toBe(400);
      expect((await add({ ticketId: randomUUID() }, key)).status).toBe(400);
      const [a, b] = await Promise.all([add({}, key), add({}, key)]);
      const [first, retry] = await Promise.all([a.json(), b.json()]);
      expect(first.id).toBe(retry.id);
      expect(first.fromLocationId).toBe("A");
      expect(await location()).toBe("B");
      expect((await add({ toLocationId: "C" }, key)).status).toBe(409);
      expect((await add({ fromLocationId: "A" }, randomUUID())).status).toBe(409);
      const early = await (await add({ date: "2026-10-01", toLocationId: "A" }, randomUUID())).json();
      expect(await location()).toBe("B");
      const ctx = context(first.id);
      const revise = (patch: object) => movementItem.PUT(request("/", "PUT", { revision: 0, ...patch }), ctx);
      const race = await Promise.all([revise({ toLocationId: "C" }), revise({ toLocationId: "D" })]);
      expect(race.map(r => r.status).sort()).toEqual([200, 409]);
      const [latest, older] = await history();
      expect([latest.id, older.id]).toEqual([first.id, early.id]);
      expect(await location()).toBe(latest.toLocationId);
      expect((await movementItem.DELETE(request("/?revision=0", "DELETE"), ctx)).status).toBe(409);
      expect((await movementItem.DELETE(request("/?revision=1", "DELETE"), ctx)).status).toBe(200);
      expect(await location()).toBe("A");
      expect((await add({}, key)).status).toBe(410);
      expect((await movementItem.GET(request("/"), ctx)).status).toBe(404);
      expect(await history()).toHaveLength(1);
      expect(await postgres.auditLog.count({ where: { resourceId: first.id } })).toBe(3);
    } finally {
      wikiRole = "USER";
      await postgres.asset.delete({ where: { id: asset.id } });
      await postgres.auditLog.deleteMany({ where: { resourceType: "movement", userId: owner } });
    }
  });

  it("preserves directional links and serializes symmetric CMDB relations across both asset records", async () => {
    wikiRole = "ADMIN";
    userId = owner;
    const label = "QA-CMDB-" + randomUUID();
    const asset = (domainId: string) => postgres.asset.create({ data: {
      domainId, label, reference: randomUUID(), assetTypeId: "qa", statusId: "active", createdById: owner,
    } });
    const [a, b, m] = await Promise.all([asset("it"), asset("it"), asset("maintenance")]);
    const create = (sourceAssetId: string, targetAssetId: string, relationType: string) =>
      relations.POST(request("/", "POST", { domainId: "it", sourceAssetId, targetAssetId, relationType }));
    try {
      expect((await create(a.id, m.id, "connected_to")).status).toBe(400);
      expect((await create(a.id, a.id, "connected_to")).status).toBe(400);
      expect((await create(a.id, b.id, "unknown")).status).toBe(400);
      const paired = await Promise.all([create(a.id, b.id, "connected_to"), create(b.id, a.id, "connected_to")]);
      expect(paired.map(r => r.status).sort()).toEqual([200, 409]);
      const pair = await paired.find(r => r.ok)!.json();
      expect((await create(a.id, b.id, "prints_to")).status).toBe(200);
      expect((await create(b.id, a.id, "prints_to")).status).toBe(200);
      const list = async (query: string) => (await relations.GET(request("/?domainId=it&" + query))).json();
      expect(await list("assetId=" + b.id)).toHaveLength(3);
      const direction = await list("sourceAssetId=" + a.id + "&targetAssetId=" + b.id);
      expect(direction.every((row: { targetAssetId: string }) => row.targetAssetId === b.id)).toBe(true);
      wikiRole = "USER";
      expect((await relationItem.GET(request("/"), context(pair.id))).status).toBe(200);
      expect((await relationItem.DELETE(request("/", "DELETE"), context(pair.id))).status).toBe(403);
      wikiRole = "ADMIN";
      const remove = () => relationItem.DELETE(request("/", "DELETE"), context(pair.id));
      expect((await Promise.all([remove(), remove()])).map(r => r.status).sort()).toEqual([200, 404]);
      expect(await postgres.auditLog.count({ where: { resourceId: pair.id } })).toBe(2);
      await postgres.asset.delete({ where: { id: a.id } });
      expect(await list("assetId=" + b.id)).toEqual([]);
    } finally {
      wikiRole = "USER";
      await postgres.asset.deleteMany({ where: { label } });
      await postgres.auditLog.deleteMany({ where: { userId: owner, resourceType: "relation" } });
    }
  });

  it("records one CAB vote per member and review, enforces the quorum and retains the decision on restart", async () => {
    userId = owner;
    wikiRole = "ADMIN";
    const title = "QA-CAB-" + randomUUID();
    const origin = { domainId: "it", title, description: "Mise à jour", impact: "Poste QA", rollbackPlan: "Restaurer",
      riskLevel: "low", plannedStart: "2026-11-25" };
    const createdIds: string[] = [];
    const create = async (patch: object = {}) => {
      const row = await (await changes.POST(request("/", "POST", { ...origin, ...patch }))).json();
      createdIds.push(row.id);
      return context(row.id);
    };
    try {
      await postgres.user.updateMany({ where: { id: { in: [owner, other] } }, data: { role: "ADMIN" } });
      const ctx = await create();
      const edit = (patch: object) => changeItem.PUT(request("/", "PUT", patch), ctx);
      const read = async () => (await changeItem.GET(request("/"), ctx)).json();
      const review = await (await edit({ status: "cab_review" })).json();
      expect(review).toMatchObject({ cabRound: 1, cabRequiredVotes: 2, status: "cab_review" });
      const vote = (round: number) => approveChange(request("/", "POST", { round }), ctx);
      const [first, retry] = await Promise.all([vote(1), vote(1)]);
      expect(first.status).toBe(200);
      expect(retry.status).toBe(200);
      expect(await read()).toMatchObject({ status: "cab_review", cabReviewerIds: JSON.stringify([owner]) });
      userId = other;
      const rejected = await rejectChange(request("/", "POST", { round: 1, comment: "Fenêtre à revoir" }), ctx);
      expect(await rejected.json()).toMatchObject({ status: "rejected", implementationNotes: "Fenêtre à revoir" });
      expect((await changeItem.DELETE(request("/", "DELETE"), ctx)).status).toBe(409);
      await edit({ status: "draft" });
      await edit({ status: "cab_review" });
      expect((await vote(1)).status).toBe(409);
      await vote(2);
      userId = owner;
      expect(await (await vote(2)).json()).toMatchObject({ status: "approved" });
      expect((await edit({ status: "scheduled", expectedUpdatedAt: review.updatedAt })).status).toBe(409);
      expect((await edit({ plannedEnd: "2026-11-24" })).status).toBe(400);
      await edit({ status: "scheduled" });
      await edit({ status: "in_progress" });
      await edit({ status: "completed" });
      expect(await read()).toMatchObject({ status: "completed", actualStart: expect.any(String), actualEnd: expect.any(String), success: true });
      expect((await edit({ success: false })).status).toBe(400);
      expect((await edit({ actualEnd: null })).status).toBe(400);
      expect(await postgres.auditLog.count({ where: { resourceId: createdIds[0], afterState: { contains: "vote_approve" } } })).toBe(3);

      const urgent = await create({ type: "emergency" });
      const submit = () => changeItem.PUT(request("/", "PUT", { status: "cab_review" }), urgent);
      const pending = await (await submit()).json();
      await submit();
      expect(pending.cabRequiredVotes).toBe(1);
      expect(await postgres.notification.count({ where: { title: pending.reference } })).toBe(2);
      const conflicting = await Promise.all([approveChange(request("/", "POST"), urgent), rejectChange(request("/", "POST"), urgent)]);
      expect(conflicting.map(r => r.status).sort()).toEqual([200, 409]);
      const legacy = await create();
      const legacyId = (await legacy.params).id;
      await postgres.changeRequest.update({ where: { id: legacyId }, data: {
        status: "cab_review", cabReviewerIds: JSON.stringify([randomUUID(), other]),
      } });
      expect(await (await approveChange(request("/", "POST"), legacy)).json()).toMatchObject({
        status: "approved", cabRequiredVotes: 2, cabReviewerIds: JSON.stringify([other, owner]),
      });
      const standard = await create({ type: "standard", title: "Redémarrage programmé" });
      expect(await (await changeItem.PUT(request("/", "PUT", { status: "cab_review" }), standard)).json()).toMatchObject({ status: "approved" });
    } finally {
      wikiRole = "USER";
      await postgres.notification.deleteMany({ where: { userId: { in: [owner, other] }, message: { contains: title } } });
      await postgres.auditLog.deleteMany({ where: { resourceType: "change", resourceId: { in: createdIds } } });
      await postgres.changeRequest.deleteMany({ where: { id: { in: createdIds } } });
      await postgres.user.updateMany({ where: { id: { in: [owner, other] } }, data: { role: "USER" } });
    }
  });

  it("allocates change numbers across domains and preserves linked assets and planning dates", async () => {
    wikiRole = "ADMIN";
    userId = owner;
    const title = "QA-change-" + randomUUID();
    const body = { domainId: "it", title, description: "Bascule", impact: "Atelier", rollbackPlan: "Restaurer", riskLevel: "low",
      plannedStart: "2026-11-29", plannedEnd: "2026-12-01" };
    const create = (patch: object) => changes.POST(request("/", "POST", { ...body, ...patch }));
    const asset = await postgres.asset.create({ data: {
      reference: randomUUID(), domainId: "it", label: title, assetTypeId: "laptop", createdById: owner, statusId: "in_stock",
    } });
    try {
      expect((await create({ plannedStart: "2026-02-30" })).status).toBe(400);
      expect((await create({ plannedEnd: "2026-11-28" })).status).toBe(400);
      expect((await create({ ticketsLinked: [randomUUID()] })).status).toBe(400);
      expect((await create({ domainId: "maintenance", assetsImpacted: [asset.id] })).status).toBe(400);
      const result = await Promise.all([create({ assetsImpacted: [asset.id, asset.id] }), create({ domainId: "maintenance" })]);
      expect(result.map(r => r.status)).toEqual([200, 200]);
      const [it, maintenance] = await Promise.all(result.map(r => r.json()));
      expect(it.reference).not.toBe(maintenance.reference);
      const calendar = async (month: string) => (await changes.GET(request("/?domainId=it&month=" + month))).json();
      expect(await calendar("2026-12")).toMatchObject([{ id: it.id }]);
      expect(await calendar("2027-01")).toEqual([]);
      expect((await changes.GET(request("/?domainId=it&month=2026-13"))).status).toBe(400);
      expect(JSON.parse(it.assetsImpacted)).toEqual([asset.id]);
      expect(it.plannedStart).toBe("2026-11-29T00:00:00.000Z");
      const list = await (await changes.GET(request("/?domainId=it&status=draft"))).json();
      expect(list.find((row: {id: string}) => row.id === it.id)).toMatchObject({ title, type: "normal", plannedEnd: it.plannedEnd });
    } finally {
      await postgres.changeRequest.deleteMany({ where: { title } });
      await postgres.asset.delete({ where: { id: asset.id } });
      wikiRole = "USER";
    }
  });

  it("links ticket solutions, scopes reader visibility and records each reader and vote once across retries", async () => {
    userId = owner;
    wikiRole = "ADMIN";
    const title = "QA-article-" + randomUUID();
    const ticket = await postgres.ticket.create({ data: {
      domainId: "it", reference: randomUUID(), title, description: "Poste isolé", typeId: "Incident",
      priorityId: "normal", categoryId: "hardware", status: "in_progress", requesterId: owner,
    } });
    const create = (visibility: string) => knowledge.POST(request("/", "POST", {
      domainId: "it", title, content: "Diagnostic", categoryId: "procedure", sourceTicketId: ticket.id, visibility,
    }));
    const list = async (category: string) => (await knowledge.GET(request("/?domainId=it&ticketCategoryId=" + category))).json();
    try {
      expect((await create("public")).status).toBe(400);
      await postgres.ticket.update({ where: { id: ticket.id }, data: { status: "resolved" } });
      const responses = await Promise.all([create("public"), create("technicians_only")]);
      const [article, internal] = await Promise.all(responses.map(r => r.json()));
      expect(article.sourceTicketId).toBe(ticket.id);
      expect(article.slug).not.toBe(internal.slug);
      const ctx = context(article.id);
      const read = (body: object) => recordReading(request("/", "PUT", body), ctx);
      const detail = async () => (await knowledgeItem.GET(request("/"), ctx)).json();
      const edit = (content: string) => knowledgeItem.PUT(request("/", "PUT", { content, expectedUpdatedAt: article.updatedAt }), ctx);
      const remove = (version: string) => knowledgeItem.DELETE(request("/?expectedUpdatedAt=" + encodeURIComponent(version), "DELETE"), ctx);
      expect(await list("hardware")).toHaveLength(2);
      expect(await list("software")).toHaveLength(0);
      wikiRole = "USER";
      userId = other;
      expect(await list("hardware")).toMatchObject([{ id: article.id }]);
      const search = async (word: string) => (await knowledge.GET(request("/?domainId=it&q=" + word))).json();
      expect(await search("diagnostic")).toMatchObject([{ id: article.id }]);
      expect(await search("introuvable")).toEqual([]);
      expect((await knowledgeItem.GET(request("/"), context(internal.id))).status).toBe(404);
      expect((await read({ helpful: "invalid" })).status).toBe(400);
      await Promise.all([read({ helpful: true }), read({ helpful: true }), read({})]);
      expect(await detail()).toMatchObject({ canEdit: false, viewsCount: 1, helpfulCount: 1, notHelpfulCount: 0, updatedAt: article.updatedAt });
      expect(await (await read({ helpful: false })).json()).toMatchObject({ viewsCount: 1, helpfulCount: 0, notHelpfulCount: 1 });
      userId = owner;
      wikiRole = "ADMIN";
      expect(await (await read({ helpful: true })).json()).toMatchObject({ viewsCount: 2, helpfulCount: 1, notHelpfulCount: 1 });
      expect(await (await read({ helpful: null })).json()).toMatchObject({ viewsCount: 2, helpfulCount: 0, notHelpfulCount: 1 });
      expect((await Promise.all([edit("Diagnostic A"), edit("Diagnostic B")])).map(r => r.status).sort()).toEqual([200, 409]);
      expect((await remove(article.updatedAt)).status).toBe(409);
      expect((await remove((await detail()).updatedAt)).status).toBe(200);
      expect(await postgres.knowledgeReader.count({ where: { articleId: article.id } })).toBe(0);
    } finally {
      wikiRole = "USER";
      await postgres.knowledgeArticle.deleteMany({ where: { createdById: owner, title } });
      await postgres.ticket.delete({ where: { id: ticket.id } });
    }
  });

  it("keeps ticket numbers, deadlines and resolution dates coherent across concurrent edits and reopening", async () => {
    userId = owner;
    wikiRole = "ADMIN";
    const title = "QA-ticket-" + randomUUID();
    const body = { domainId: "it", title, description: "Lot isolé", priorityId: "critical" };
    const add = (patch = {}) => tickets.POST(request("/", "POST", { ...body, ...patch }));
    try {
      expect((await add({ typeId: "inconnu" })).status).toBe(400);
      const results = await Promise.all([add(), add()]);
      expect(results.map(r => r.status)).toEqual([200, 200]);
      const [a,b] = await Promise.all(results.map(r => r.json()));
      expect(a.reference).not.toBe(b.reference);
      expect(Date.parse(a.slaDueAt) - Date.parse(a.openedAt)).toBe(4 * 3_600_000);
      const edit = (patch: object) => ticketItem.PUT(request("/", "PUT", patch), context(a.id));
      const concurrent = await Promise.all(["en cours", "à suivre"].map(solution => edit({ solution, status: "in_progress", expectedUpdatedAt: a.updatedAt })));
      expect(concurrent.map(r => r.status).sort()).toEqual([200, 409]);
      const closed = await (await edit({ status: "closed" })).json();
      expect(closed.takenAt && closed.resolvedAt && closed.closedAt).toBeTruthy();
      expect((await (await edit({ status: "closed" })).json()).closedAt).toBe(closed.closedAt);
      const reopened = await (await edit({ status: "in_progress" })).json();
      expect(reopened.resolvedAt).toBeNull();
      expect(reopened.closedAt).toBeNull();
      await postgres.ticket.update({ where: { id: a.id }, data: { openedAt: new Date(Date.now() - 5 * 3_600_000), slaDueAt: new Date() } });
      const report = await (await warnings(request("/?domainId=it"))).json();
      expect(report.atRisk.some((t: { id: string }) => t.id === a.id)).toBe(true);
      expect(report.atRisk.some((t: { id: string }) => t.id === b.id)).toBe(false);
    } finally {
      wikiRole = "USER";
      await postgres.ticket.deleteMany({ where: { title } });
    }
  });

  it("serializes loans and returns without changing the maintenance domain's operating status", async () => {
    userId = owner;
    wikiRole = "ADMIN";
    const label = "QA-loan-" + randomUUID();
    try {
      for (const [domainId, initial] of [["it", "in_stock"], ["maintenance", "running"]]) {
        const asset = await postgres.asset.create({ data: { domainId, label, assetTypeId: "qa", reference: randomUUID(), statusId: initial, createdById: owner } });
        const body = { domainId, assetId: asset.id, assigneeId: other, startDate: "2025-01-01" };
        const open = (fields = {}) => issue(request("/", "POST", { ...body, ...fields }));
        expect((await open({ expectedEndDate: "2024-12-01" })).status).toBe(400);
        const results = await Promise.all([open(), open()]);
        expect(results.map(r => r.status).sort()).toEqual([200, 409]);
        const loan = await results.find(r => r.ok)!.json();
        const currentStatus = async () => (await postgres.asset.findUniqueOrThrow({ where: { id: asset.id } })).statusId;
        expect(await currentStatus()).toBe(domainId === "it" ? "assigned" : initial);
        const ctx = context(loan.id);
        const patch = (data: object) => editLoan(request("/", "PUT", data), ctx);
        expect((await patch({ status: "overdue", expectedUpdatedAt: loan.updatedAt })).status).toBe(200);
        expect((await patch({ reason: "ancien", expectedUpdatedAt: loan.updatedAt })).status).toBe(409);
        const returns = await Promise.all([1, 2].map(() => returnLoan(request("/", "POST"), ctx)));
        expect(returns.map(r => r.status)).toEqual([200, 200]);
        const [a, b] = await Promise.all(returns.map(r => r.json()));
        expect(a.updatedAt).toBe(b.updatedAt);
        expect(a.actualEndDate).toBeTruthy();
        expect(await currentStatus()).toBe(initial);
        expect((await open()).status).toBe(200);
        expect((await patch({ status: "active" })).status).toBe(409);
      }
    } finally {
      wikiRole = "USER";
      await postgres.asset.deleteMany({ where: { label } });
    }
  });

  it("edits inventory and its attributes in one revision and records the complete lifecycle audit", async () => {
    wikiRole = "ADMIN";
    userId = owner;
    const label = "QA-edit-" + randomUUID();
    const result = await inventory.POST(request("/", "POST", { domainId: "it", assetTypeId: "laptop", label,
      attributes: [{ key: "ram_go", valueNumber: 16 }, { key: "legacy-field", valueText: "ancienne valeur" }] }));
    const row = await result.json();
    const ctx = context(row.id);
    const read = async () => (await assetItem.GET(request("/"), ctx)).json();
    const edit = (data: object) => assetItem.PUT(request("/", "PUT", data), ctx);
    try {
      expect((await edit({ label: "autre", attributes: [{ key: "same" }, { key: "same" }] })).status).toBe(400);
      expect(await read()).toMatchObject({ label, attributes: expect.arrayContaining([{ ...row.attributes[0] }]) });
      expect((await edit({ lifecycleStage: "inconnu" })).status).toBe(400);
      const changes = await Promise.all(["maintenance", "reforme"].map(lifecycleStage =>
        edit({ expectedUpdatedAt: row.updatedAt, lifecycleStage })));
      expect(changes.map(r => r.status).sort()).toEqual([200, 409]);
      const updated = await (await edit({ label: "Corrigé", attributes: [{ key: "ram_go", valueNumber: 32 }] })).json();
      expect(updated.attributes).toHaveLength(1);
      expect(updated.attributes[0].valueNumber).toBe(32);
      expect((await assetItem.DELETE(request("/?expectedUpdatedAt=" + row.updatedAt, "DELETE"), ctx)).status).toBe(409);
      expect((await assetItem.DELETE(request("/?expectedUpdatedAt=" + updated.updatedAt, "DELETE"), ctx)).status).toBe(200);
      const entries = await postgres.auditLog.findMany({ where: { resourceType: "asset", resourceId: row.id }, orderBy: { timestamp: "asc" } });
      expect(entries.map(entry => entry.action)).toEqual(["create", "update", "update", "delete"]);
      expect(JSON.parse(entries[2].beforeState!).attributes).toHaveLength(2);
      expect(JSON.parse(entries[3].beforeState!).attributes[0].valueNumber).toBe(32);
      expect((await assetItem.GET(request("/"), ctx)).status).toBe(404);
    } finally {
      wikiRole = "USER";
      await postgres.asset.deleteMany({ where: { id: row.id } });
      await postgres.auditLog.deleteMany({ where: { resourceId: row.id } });
    }
  });

  it("creates inventory records and their attributes together with independent concurrent references", async () => {
    userId = owner;
    wikiRole = "ADMIN";
    const label = "QA-" + randomUUID();
    const asset = { domainId: "it", assetTypeId: "laptop", label, attributes: [{ key: "hostname", valueText: label }] };
    const create = (fields = {}) => inventory.POST(request("/", "POST", { ...asset, ...fields }));
    try {
      const responses = await Promise.all([create(), create()]);
      expect(responses.map(r => r.status)).toEqual([200, 200]);
      const [first, second] = await Promise.all(responses.map(r => r.json()));
      expect(first.reference).not.toBe(second.reference);
      expect(first.attributes[0].valueText).toBe(label);
      await postgres.asset.delete({ where: { id: first.id } });
      expect((await create()).status).toBe(200);
      expect((await create({ reference: second.reference })).status).toBe(409);
      expect((await create({ purchaseDate: "2026-02-30" })).status).toBe(400);
      expect((await create({ attributes: [asset.attributes[0], asset.attributes[0]] })).status).toBe(400);
      expect((await create({ statusId: "hors-domaine" })).status).toBe(400);
      const list = await inventory.GET(request("/?domainId=it&search=" + encodeURIComponent(label)));
      expect((await list.json()).map((record: { label: string }) => record.label)).toEqual([label, label]);
    } finally {
      wikiRole = "USER";
      await postgres.asset.deleteMany({ where: { label } });
    }
  });

  it("serializes wiki edits and restores the title, content and backlinks in one revision", async () => {
    userId = owner;
    const slug = "qa-editor-" + randomUUID();
    const target = await postgres.wikiArticle.create({ data: { slug: slug + "-guide", authorId: owner, title: "Guide", content: "", isPublished: true } });
    const original = { slug, title: "Initial", content: "[[" + target.slug + "]]", isPublished: true };
    const ctx = { params: Promise.resolve({ slug }) };
    try {
      const creation = await Promise.all([1, 2].map(() => wikiCreate(request("/", "POST", original))));
      expect(creation.map(r => r.status).sort()).toEqual([200, 409]);
      const article = await postgres.wikiArticle.findUniqueOrThrow({ where: { slug } });
      const links = () => postgres.wikiBacklink.count({ where: { sourceArticleId: article.id } });
      expect(await links()).toBe(1);
      userId = other;
      wikiRole = "ADMIN";
      const edit = () => wikiEdit(request("/", "PUT", { title: "Nouveau", content: "Sans lien", revision: 0 }), ctx);
      expect((await Promise.all([edit(), edit()])).map(r => r.status).sort()).toEqual([200, 409]);
      const snapshot = await postgres.wikiRevision.findFirstOrThrow({ where: { articleId: article.id } });
      expect(snapshot.authorId).toBe(other);
      expect(await links()).toBe(0);
      userId = owner;
      wikiRole = "USER";
      const restore = (revision: number) => wikiRestore(request("/", "POST", { revisionId: snapshot.id, revision }), ctx);
      expect((await restore(0)).status).toBe(409);
      expect(await (await restore(1)).json()).toMatchObject({ title: original.title, content: original.content, revision: 2 });
      expect(await links()).toBe(1);
      expect(await postgres.wikiRevision.count({ where: { articleId: article.id } })).toBe(2);
    } finally {
      wikiRole = "USER";
      await postgres.wikiArticle.deleteMany({ where: { slug: { startsWith: slug } } });
    }
  });

  it("lists article children, their count and backlinks consistently for editorial and published views", async () => {
    const slug = "qa-rubrique-" + randomUUID();
    const folder = await postgres.wikiArticle.create({ data: { slug, authorId: owner, title: "Rubrique QA", content: "", isPublished: true } });
    const ctx = { params: Promise.resolve({ slug }) };
    try {
      for (const [suffix, published] of [["public", true], ["brouillon", false]] as const) {
        const child = await postgres.wikiArticle.create({ data: { slug: slug + "-" + suffix, content: "QA", title: suffix, parentId: folder.id, authorId: owner, isPublished: published } });
        await postgres.wikiBacklink.create({ data: { sourceArticleId: child.id, targetArticleId: folder.id } });
      }
      for (const [user, count] of [[owner, 2], [null, 1]] as const) {
        userId = user;
        const page = await (await wikiRead(request("/"), ctx)).json();
        expect(page.children).toHaveLength(count);
        const index = await (await wikiIndex(request("/?parent=root&include=children_count&search=" + slug))).json();
        expect(index).toContainEqual(expect.objectContaining({ slug, childrenCount: count }));
        expect(await (await wikiLinks(request("/"), ctx)).json()).toHaveLength(count);
      }
    } finally {
      await postgres.wikiArticle.deleteMany({ where: { authorId: owner, slug: { startsWith: slug } } });
    }
  });

  it("streams a complete selected Wiki issue and preserves Markdown and YAML values", async () => {
    const slug = "qa-manuel-" + randomUUID();
    const title = "Manuel : préparation";
    const tags = ["true", "Réunion #2"];
    const content = "# Guide de recette\n" + randomBytes(160000).toString("base64");
    await postgres.wikiArticle.create({ data: { authorId: owner, title, slug, content, tags, isPublished: true } });
    try {
      userId = null;
      expect((await wikiZip(request("/"))).status).toBe(400);
      expect((await wikiZip(request("/?slugs=" + slug + ",article-absent-de-recette"))).status).toBe(409);
      const response = await wikiZip(request("/?slugs=" + slug + "," + slug));
      const zip = await JSZip.loadAsync(await response.arrayBuffer(), { checkCRC32: true });
      expect(Object.keys(zip.files)).toEqual([slug + ".md"]);
      const md = await zip.file(slug + ".md")!.async("string");
      expect(md).toContain("title: " + JSON.stringify(title));
      expect(md).toContain("tags: " + JSON.stringify(tags));
      expect(md.endsWith(content)).toBe(true);
    } finally {
      await postgres.wikiArticle.delete({ where: { slug } });
    }
  });

  it("creates one newsletter issue, preserves concurrent edits and archives or removes the expected revision", async () => {
    userId = owner;
    const body = { requestId: randomUUID(), title: "Recette", content: "Article" };
    const add = (payload: object) => newsletter.POST(request("/", "POST", payload));
    expect((await add({ ...body, publishedAt: "absent" })).status).toBe(400);
    const creates = await Promise.all([add(body), add(body)]);
    expect(creates.map(r => r.status).sort()).toEqual([200, 201]);
    const { id } = await creates[0].json();
    const ctx = context(id);
    const save = (payload: object) => edition.PUT(request("/", "PUT", payload), ctx);
    const setArchived = (archived: boolean, revision: number) => archive(request("/", "PATCH", { archived, revision }), ctx);
    const del = (revision: number) => edition.DELETE(request("/?revision=" + revision, "DELETE"), ctx);
    expect((await add({ ...body, title: "Autre" })).status).toBe(409);
    expect((await save({ title: " " })).status).toBe(400);
    userId = other;
    expect((await edition.GET(request("/"), ctx)).status).toBe(404);
    userId = owner;
    const edits = await Promise.all([save({ title: "Révisé", revision: 0 }), save({ content: "Révisé", revision: 0 })]);
    expect(edits.map(r => r.status).sort()).toEqual([200, 409]);
    expect((await setArchived(true, 1)).status).toBe(200);
    expect(await (await newsletter.GET(request("/?archived=true"))).json()).toContainEqual(expect.objectContaining({ id, revision: 2 }));
    expect((await setArchived(false, 2)).status).toBe(200);
    expect((await del(1)).status).toBe(409);
    expect((await del(3)).status).toBe(200);
    expect((await edition.GET(request("/"), ctx)).status).toBe(404);
    expect((await add(body)).status).toBe(409);
  });

  it("inherits the original newsletter image until the author explicitly clears it", async () => {
    userId = owner;
    const legacy = await postgres.newsletterSettings.createMany({
      data: { id: "default", headerImageUrl: "/qa/existing.png" }, skipDuplicates: true,
    });
    try {
      const original = await postgres.newsletterSettings.findUniqueOrThrow({ where: { id: "default" } });
      const read = () => newsletterHeader.GET().then(r => r.json());
      expect(await read()).toMatchObject({ headerImageUrl: original.headerImageUrl, revision: 0 });
      const cleared = await newsletterHeader.PUT(request("/", "PUT", { headerImageUrl: null, revision: 0 }));
      expect(await cleared.json()).toMatchObject({ headerImageUrl: null, revision: 1 });
      userId = other;
      expect(await read()).toMatchObject({ headerImageUrl: original.headerImageUrl, revision: 0 });
    } finally {
      await postgres.newsletterSettings.deleteMany({ where: { ownerId: owner } });
      if (legacy.count) await postgres.newsletterSettings.delete({ where: { id: "default" } });
    }
  });

  it("keeps newsletter headers private and guards concurrent replacements", async () => {
    const read = () => newsletterHeader.GET();
    const save = (url: string | null, revision: number) => newsletterHeader.PUT(request("/", "PUT", { headerImageUrl: url, revision }));
    userId = null;
    expect((await read()).status).toBe(401);
    userId = owner;
    const initial = await (await read()).json();
    expect(initial.revision).toBe(0);
    expect(await postgres.newsletterSettings.count({ where: { ownerId: owner } })).toBe(0);
    expect((await save("invalid-scheme:logo", 0)).status).toBe(400);
    const concurrent = await Promise.all([save("/qa/header-a.png", 0), save("/qa/header-b.png", 0)]);
    expect(concurrent.map(r => r.status).sort()).toEqual([200, 409]);
    const first = await (await read()).json();
    userId = other;
    expect(await (await read()).json()).toEqual(initial);
    expect((await save("qa/header-other.png", 0)).status).toBe(200);
    expect((await (await read()).json()).headerImageUrl).toBe("/qa/header-other.png");
    userId = owner;
    expect(await (await read()).json()).toEqual(first);
    expect((await save(null, 0)).status).toBe(409);
    const cleared = await (await save(null, 1)).json();
    expect(cleared).toMatchObject({ revision: 2, headerImageUrl: null });
  });

  it("shares whiteboard notes inside one workshop, with retry and revision checks", async () => {
    const organizationId = randomUUID();
    await postgres.organization.create({ data: { id: organizationId, slug: organizationId, name: "Recette",
      members: { create: { userId: owner } } } });
    const ctx = { params: Promise.resolve({ organizationId, board: "retro" }) };
    const list = () => board.GET(request("/"), ctx);
    const input = { id: randomUUID(), content: " Qualité ", column: "bien" };
    const post = (body: object) => board.POST(request("/", "POST", body), ctx);
    const edit = (body: object) => board.PATCH(request("/", "PATCH", body), ctx);
    const del = (revision: number) => board.DELETE(request("/", "DELETE", { id: input.id, revision }), ctx);
    try {
      userId = null;
      expect((await list()).status).toBe(401);
      userId = other;
      expect((await post(input)).status).toBe(403);
      userId = owner;
      expect((await post({ ...input, content: " " })).status).toBe(400);
      expect((await post({ ...input, column: "inconnue" })).status).toBe(400);
      const results = await Promise.all([post(input), post(input)]);
      expect(results.map(r => r.status).sort()).toEqual([200, 201]);
      expect((await post({ ...input, content: "Autre" })).status).toBe(409);
      expect(await (await list()).json()).toEqual([expect.objectContaining({ id: input.id, content: "Qualité", revision: 0 })]);
      const second = { params: Promise.resolve({ organizationId, board: "achats" }) };
      expect(await (await board.GET(request("/"), second)).json()).toEqual([]);
      await postgres.orgMember.create({ data: { organizationId, userId: other } });
      userId = other;
      const changes = await Promise.all([edit({ id: input.id, revision: 0, column: "action" }),
        edit({ id: input.id, revision: 0, content: "Corrigé" })]);
      expect(changes.map(r => r.status).sort()).toEqual([204, 409]);
      expect((await edit({ id: input.id, revision: 1, column: "action", content: "Validé" })).status).toBe(204);
      expect(await (await list()).json()).toEqual([expect.objectContaining({ revision: 2, column: "action", content: "Validé" })]);
      expect((await del(1)).status).toBe(409);
      expect((await del(2)).status).toBe(204);
      expect(await (await list()).json()).toEqual([]);
      userId = owner;
      expect((await post(input)).status).toBe(409);
    } finally {
      await postgres.organization.delete({ where: { id: organizationId } });
    }
  });

  it("keeps one article comment per submission and preserves replies during concurrent changes", async () => {
    userId = owner;
    const slug = "qa-" + randomUUID();
    const article = await postgres.wikiArticle.create({ data: { slug, authorId: owner, content: "QA", title: "QA", isPublished: false } });
    const ctx = { params: Promise.resolve({ slug }) };
    const post = (body: object) => comments.POST(request("/", "POST", body), ctx);
    const patch = (body: object) => comments.PATCH(request("/", "PATCH", body), ctx);
    const remove = (body: object) => comments.DELETE(request("/", "DELETE", body), ctx);
    const list = () => comments.GET(request("/"), ctx);
    try {
      expect((await post({ content: " " })).status).toBe(400);
      const input = { content: "Décision qualité", requestId: randomUUID(), kind: "décision" };
      const race = await Promise.all([post(input), post(input)]);
      expect(race.map(r => r.status).sort()).toEqual([200, 201]);
      const { id } = await race[0].json();
      expect(await (await list()).json()).toHaveLength(1);
      expect((await post({ ...input, content: "Autre texte" })).status).toBe(409);
      userId = other;
      expect((await list()).status).toBe(403);
      await postgres.wikiArticle.update({ where: { id: article.id }, data: { isPublished: true } });
      const reply = await (await post({ content: "Bien reçu", parentId: id })).json();
      expect(reply.parentId).toBe(id);
      expect((await remove({ id, revision: 0 })).status).toBe(404);
      userId = owner;
      const updates = await Promise.all([patch({ id, revision: 0, resolved: true }), patch({ id, revision: 0, content: "Corrigé" })]);
      expect(updates.map(r => r.status).sort()).toEqual([204, 409]);
      expect((await remove({ id, revision: 1 })).status).toBe(204);
      userId = null;
      const rows = await (await list()).json();
      expect(rows).toContainEqual(expect.objectContaining({ id, deleted: true, content: "" }));
      expect(rows).toContainEqual(expect.objectContaining({ id: reply.id, parentId: id, content: "Bien reçu" }));
      expect((await post({ content: "Anonymous" })).status).toBe(401);
    } finally {
      await postgres.wikiArticle.delete({ where: { id: article.id } });
    }
  });

  it("serializes room occupancy, scopes access and releases both hours on cancellation", async () => {
    const org = randomUUID();
    const second = randomUUID();
    const day = "2090-06-05";
    for (const id of [org, second]) {
      await postgres.organization.create({ data: { id, name: id, slug: id } });
    }
    try {
      await postgres.orgMember.createMany({ data: [
        { userId: owner, organizationId: org }, { userId: other, organizationId: org },
        { userId: other, organizationId: second },
      ] });
      const book = (startHour: number, duration: number, organizationId = org) => reservations.POST(request("/", "POST", {
        day, startHour, duration, room: "hugo", organizationId, title: "Comité confidentiel",
      }));
      const list = (id = org) => reservations.GET(request("/?organizationId=" + id + "&day=" + day));
      const cancel = (id: string) => reservations.DELETE(request("/?id=" + id, "DELETE"));
      userId = null;
      expect((await list()).status).toBe(401);
      userId = owner;
      expect((await list(second)).status).toBe(403);
      expect((await book(9, 1, second)).status).toBe(403);
      expect((await book(17, 2)).status).toBe(400);
      const first = book(9, 2);
      userId = other;
      const race = await Promise.all([first, book(10, 1)]);
      expect(race.map(r => r.status).sort()).toEqual([201, 409]);
      const winningIndex = race.findIndex(r => r.status === 201);
      const winner = winningIndex === 0 ? owner : other;
      const loser = winner === owner ? other : owner;
      const { id } = await race[winningIndex].json();
      userId = loser;
      expect(await (await list()).json()).toEqual([expect.objectContaining({ id: null, title: null })]);
      expect((await cancel(id)).status).toBe(404);
      userId = winner;
      expect(await (await list()).json()).toEqual([expect.objectContaining({ id, title: "Comité confidentiel" })]);
      expect((await book(11, 1)).status).toBe(201);
      userId = other;
      expect((await book(9, 2, second)).status).toBe(201);
      userId = winner;
      expect((await cancel(id)).status).toBe(204);
      expect((await book(9, 2)).status).toBe(201);
      expect((await book(10, 2)).status).toBe(409);
      expect(await postgres.roomReservation.count({ where: { organizationId: org } })).toBe(2);
    } finally {
      await postgres.organization.deleteMany({ where: { id: { in: [org, second] } } });
    }
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
