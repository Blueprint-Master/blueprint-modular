import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPersonalModuleSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
const column = z.enum(["bien", "ameliorer", "action"]);
const content = z.string().trim().min(1).max(4000);
const identity = { id: z.string().uuid(), revision: z.number().int().nonnegative() };
const addition = z.object({ id: identity.id, content, column }).strict();
const change = z.object({ ...identity, column: column.optional(), content: content.optional() }).strict()
  .refine(value => value.column !== undefined || value.content !== undefined);
const removal = z.object(identity).strict();
type Scope = { organizationId: string; board: string };
type Context = { params: Promise<Scope> };
type Transaction = Prisma.TransactionClient;
const error = (status: number, message: string) => Response.json({ error: message }, { status });

async function access(ctx: Context, operation: (tx: Transaction, scope: Scope, userId: string) => Promise<Response>) {
  const session = await getPersonalModuleSession();
  if (!session) return error(401, "unauthenticated");
  const scope = await ctx.params;
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(scope.board)) return error(400, "invalid_board");
  const userId = session.user.id;
  return prisma.$transaction(async tx => {
    const membership = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "OrgMember" WHERE user_id = ${userId}
        AND organization_id = ${scope.organizationId} FOR SHARE`;
    if (!membership.length) return error(403, "membership_required");
    return operation(tx, scope, userId);
  });
}

export function GET(_: Request, ctx: Context) {
  return access(ctx, async (tx, scope) => Response.json(await tx.whiteboardNote.findMany({
    where: { ...scope, removed: false }, orderBy: [{ positionAt: "asc" }, { id: "asc" }],
    select: { id: true, revision: true, column: true, content: true, authorName: true, createdAt: true },
  })));
}

export async function POST(req: Request, ctx: Context) {
  const input = addition.safeParse(await req.json().catch(() => null));
  if (!input.success) return error(400, "invalid_note");
  return access(ctx, async (tx, scope, authorId) => {
    const { id, column, content } = input.data;
    const creationDigest = createHash("sha256").update(JSON.stringify([column, content])).digest("hex");
    const user = await tx.user.findUniqueOrThrow({ where: { id: authorId }, select: { name: true } });
    const created = await tx.whiteboardNote.createMany({
      data: { ...scope, id, column, content, authorId, creationDigest, authorName: user.name || "Membre" },
      skipDuplicates: true,
    });
    if (created.count) return Response.json({ id }, { status: 201 });
    const replay = await tx.whiteboardNote.count({ where: { ...scope, id, authorId, creationDigest, removed: false } });
    return replay ? Response.json({ id }) : error(409, "request_conflict");
  });
}

async function mutate(req: Request, ctx: Context, remove: boolean) {
  const raw = await req.json().catch(() => null);
  const result = remove ? removal.safeParse(raw) : change.safeParse(raw);
  if (!result.success) return error(400, "invalid_change");
  const { id, revision } = result.data;
  const data: Prisma.WhiteboardNoteUpdateManyMutationInput = { revision: { increment: 1 } };
  if (remove) Object.assign(data, { removed: true, content: "", authorName: "" });
  if ("content" in result.data) data.content = result.data.content as string;
  if ("column" in result.data) Object.assign(data, { column: result.data.column, positionAt: new Date() });
  return access(ctx, async (tx, scope) => {
    const where = { ...scope, id, removed: false };
    const updated = await tx.whiteboardNote.updateMany({ where: { ...where, revision }, data });
    if (updated.count) return new Response(null, { status: 204 });
    return await tx.whiteboardNote.count({ where }) ? error(409, "revision_conflict") : error(404, "unknown_note");
  });
}
export const PATCH = (req: Request, ctx: Context) => mutate(req, ctx, false);
export const DELETE = (req: Request, ctx: Context) => mutate(req, ctx, true);
