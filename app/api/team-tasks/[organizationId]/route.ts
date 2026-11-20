import { readTeamAudit } from "@/lib/team-tasks/audit";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const fields = {
  title: z.string().trim().min(1).max(250), assigneeId: z.string().min(1).max(128),
  due: z.string().date(), priority: z.enum(["low", "normal", "high"]),
};
const create = z.object({ id: z.string().uuid(), ...fields }).strict();
const version = { id: z.string().uuid(), revision: z.number().int().positive() };
const change = z.discriminatedUnion("action", [
  z.object({ ...version, action: z.literal("edit"), ...fields }).strict(),
  z.object({ ...version, action: z.literal("advance") }).strict(),
  z.object({ ...version, action: z.literal("remove") }).strict(),
]);
type Context = { params: Promise<{ organizationId: string }> };
type Member = { id: string; role: string; name: string };
const error = (status: number, code: string) => Response.json({ error: code }, { status });

async function access(ctx: Context, operation: (tx: Prisma.TransactionClient, organizationId: string, member: Member) => Promise<Response>) {
  const session = await getPersonalModuleSession();
  if (!session) return error(401, "unauthorized");
  const { organizationId } = await ctx.params;
  const { id, email, name } = session.user;
  return prisma.$transaction(async tx => {
    const [membership] = await tx.$queryRaw<{ role: string }[]>`SELECT role FROM "OrgMember" WHERE user_id = ${id} AND organization_id = ${organizationId} FOR SHARE`;
    if (!membership) return error(403, "membership_required");
    return operation(tx, organizationId, { id, role: membership.role, name: name || email });
  });
}

export function GET(request: Request, ctx: Context) {
  const params = new URL(request.url).searchParams;
  const taskId = params.get("history");
  return access(ctx, async (tx, organizationId, actor) => {
    if (params.get("audit") === "1") {
      const page = await readTeamAudit(tx, organizationId, actor.id, params.get("before"));
      return page ? Response.json(page) : error(400, "invalid_cursor");
    }
    if (taskId !== null) {
      if (!z.string().uuid().safeParse(taskId).success) return error(400, "invalid_task");
      const task = await tx.teamTask.findFirst({ where: { id: taskId, organizationId }, select: {
        title: true, events: { orderBy: { revision: "asc" }, select: { revision: true, actorName: true, action: true, details: true, createdAt: true } },
      } });
      return task ? Response.json(task) : error(404, "not_found");
    }
    const tasks = await tx.teamTask.findMany({ where: { organizationId, removed: false }, orderBy: [{ due: "asc" }, { id: "asc" }] });
    const memberships = await tx.orgMember.findMany({ where: { organizationId }, select: { user: { select: { id: true, name: true, email: true } } } });
    return Response.json({ tasks, members: memberships.map(m => ({ id: m.user.id, name: m.user.name || m.user.email })) });
  });
}

async function validAssignee(tx: Prisma.TransactionClient, orgId: string, userId: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "OrgMember" WHERE user_id = ${userId} AND organization_id = ${orgId} FOR SHARE`;
  return rows.length > 0;
}

export async function POST(request: Request, ctx: Context) {
  const parsed = create.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error(400, "invalid_task");
  const { id, title, due, priority, assigneeId } = parsed.data;
  return access(ctx, async (tx, organizationId, actor) => {
    if (!await validAssignee(tx, organizationId, assigneeId)) return error(400, "unknown_assignee");
    const { count } = await tx.teamTask.createMany({ data: { id, organizationId, creatorId: actor.id, assigneeId, title, due: new Date(due), priority }, skipDuplicates: true });
    if (!count) {
      const original = await tx.teamTaskEvent.findFirst({ where: { taskId: id, revision: 1, actorId: actor.id, task: { organizationId, removed: false } } });
      const details = original?.details as Record<string, unknown> | undefined;
      if (details && details.title === title && details.due === due && details.priority === priority && details.assigneeId === assigneeId) return Response.json({ id });
      return error(409, "request_conflict");
    }
    await tx.teamTaskEvent.create({ data: { taskId: id, actorId: actor.id, actorName: actor.name, revision: 1, action: "create", details: { title, due, priority, assigneeId } } });
    if (actor.id !== assigneeId) await tx.notification.create({ data: { userId: assigneeId, title: "Tâche assignée", message: title, type: "info" } });
    return Response.json({ id }, { status: 201 });
  });
}

export async function PATCH(request: Request, ctx: Context) {
  const parsed = change.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error(400, "invalid_change");
  const input = parsed.data;
  return access(ctx, async (tx, organizationId, actor) => {
    const task = await tx.teamTask.findFirst({ where: { id: input.id, organizationId, removed: false } });
    if (!task) return error(404, "not_found");
    const manager = actor.id === task.creatorId || ["owner","admin"].includes(actor.role);
    if (!manager && (input.action !== "advance" || actor.id !== task.assigneeId)) return error(403, "not_authorized");
    if (task.revision !== input.revision) return error(409, "revision_conflict");
    const data: Prisma.TeamTaskUpdateManyMutationInput = { revision: { increment: 1 } };
    let details: Record<string, string> = {};
    if (input.action === "edit") {
      if (!await validAssignee(tx, organizationId, input.assigneeId)) return error(400, "unknown_assignee");
      details = { title: input.title, due: input.due, priority: input.priority, assigneeId: input.assigneeId };
      Object.assign(data, details, { due: new Date(input.due) });
    } else if (input.action === "advance") {
      if (task.status === "done") return error(409, "already_done");
      data.status = task.status === "todo" ? "doing" : "done";
      details = { status: data.status };
    } else { data.removed = true; }
    const updated = await tx.teamTask.updateMany({ where: { id: task.id, revision: input.revision, removed: false }, data });
    if (!updated.count) return error(409, "revision_conflict");
    await tx.teamTaskEvent.create({ data: { taskId: task.id, revision: input.revision + 1, actorId: actor.id, actorName: actor.name, action: input.action, details } });
    if (input.action === "edit" && input.assigneeId !== task.assigneeId && input.assigneeId !== actor.id)
      await tx.notification.create({ data: { userId: input.assigneeId, title: "Tâche assignée", message: input.title, type: "info" } });
    return new Response(null, { status: 204 });
  });
}
