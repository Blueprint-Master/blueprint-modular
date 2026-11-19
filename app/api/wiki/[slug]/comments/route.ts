import { z } from "zod";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";

type Context = { params: Promise<{ slug: string }> };
const fields = { id: true, parentId: true, kind: true, authorId: true, authorName: true, content: true,
  createdAt: true, updatedAt: true, revision: true, resolved: true, deleted: true } as const;
const content = z.string().trim().min(1).max(10000);
const create = z.object({ content, kind: z.enum(["commentaire", "annotation", "décision", "blocage"]).default("commentaire"),
  parentId: z.string().min(1).max(128).nullable().optional(), requestId: z.string().uuid().optional() });
const base = z.object({ id: z.string().min(1).max(128), revision: z.number().int().nonnegative() });
const edit = z.union([base.extend({ content }).strict(), base.extend({ resolved: z.boolean() }).strict()]);
const error = (status: number) => Response.json({ error: status }, { status });

async function access(context: Context, writing: boolean) {
  const user = (await getPersonalModuleSession())?.user;
  if (writing && !user) return error(401);
  const article = await prisma.wikiArticle.findUnique({ where: { slug: normalizeSlug((await context.params).slug) },
    select: { id: true, isPublished: true, authorId: true } });
  if (!article) return error(404);
  if (!article.isPublished && user?.id !== article.authorId && user?.role !== "ADMIN" && user?.role !== "OWNER") {
    return error(user ? 403 : 401);
  }
  return { articleId: article.id, user };
}

export async function GET(_request: Request, context: Context) {
  const scope = await access(context, false);
  if (scope instanceof Response) return scope;
  return Response.json(await prisma.wikiComment.findMany({ where: { articleId: scope.articleId },
    select: fields, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }));
}

export async function POST(request: Request, context: Context) {
  const scope = await access(context, true);
  if (scope instanceof Response) return scope;
  const input = create.safeParse(await request.json().catch(() => null));
  if (!input.success) return error(400);
  const { requestId, parentId, kind, content } = input.data;
  const { articleId, user } = scope;
  if (parentId && !await prisma.wikiComment.findFirst({ where: { articleId, id: parentId }, select: { id: true } })) return error(404);
  const data = { articleId, authorId: user.id, authorName: user.name, kind, content, parentId, requestId };
  if (!requestId) return Response.json(await prisma.wikiComment.create({ data, select: fields }));
  const saved = await prisma.wikiComment.createMany({ data: [data], skipDuplicates: true });
  const row = await prisma.wikiComment.findUnique({ where: { articleId_authorId_requestId: { articleId, authorId: user.id, requestId } }, select: fields });
  if (!row || row.content !== content || row.kind !== kind || row.parentId !== (parentId ?? null)) return error(409);
  return Response.json(row, { status: saved.count ? 201 : 200 });
}

async function modify(request: Request, context: Context, remove: boolean) {
  const scope = await access(context, true);
  if (scope instanceof Response) return scope;
  const input = (remove ? base.strict() : edit).safeParse(await request.json().catch(() => null));
  if (!input.success) return error(400);
  const { id, revision } = input.data;
  const where = { articleId: scope.articleId, id, authorId: scope.user.id, deleted: false };
  const data = remove ? { content: "", deleted: true } : "content" in input.data ? { content: input.data.content as string }
    : { resolved: (input.data as { resolved: boolean }).resolved };
  const result = await prisma.wikiComment.updateMany({ where: { ...where, revision }, data: { ...data, revision: { increment: 1 } } });
  if (result.count) return new Response(null, { status: 204 });
  return error(await prisma.wikiComment.count({ where }) ? 409 : 404);
}

export const PATCH = (request: Request, context: Context) => modify(request, context, false);
export const DELETE = (request: Request, context: Context) => modify(request, context, true);
