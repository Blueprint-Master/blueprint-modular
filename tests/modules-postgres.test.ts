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
  hasWriteRole: (user: { role?: string }) => user.role === "ADMIN",
  getSessionOrTestUser: async () => userId ? { user: { id: userId, role: wikiRole } } : null,
  getPersonalModuleSession: async () => userId ? { user: { id: userId, role: wikiRole } } : null,
}));
import { POST as issue } from "@/app/api/asset-manager/assignments/route";
import { PUT as editLoan } from "@/app/api/asset-manager/assignments/[id]/route";
import { POST as returnLoan } from "@/app/api/asset-manager/assignments/[id]/return/route";
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
    await postgres.user.deleteMany({ where: { id: { in: [owner, other] } } });
    await postgres.$disconnect();
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
