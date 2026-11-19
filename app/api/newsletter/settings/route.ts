import { newsletterHeaderUrl } from "@/lib/newsletter-header";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPersonalModuleSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const image = z.string().trim().max(2048).refine(value => !value || newsletterHeaderUrl(value) !== null)
  .transform(value => newsletterHeaderUrl(value));
const input = z.object({ headerImageUrl: image.nullable().optional(), revision: z.number().int().nonnegative().max(2147483647).optional() }).strict();
const select = { id: true, headerImageUrl: true, updatedAt: true, revision: true };
const denied = () => Response.json({ error: "Non autorisé" }, { status: 401 });
const conflict = () => Response.json({ error: "Réglage modifié depuis votre dernière lecture" }, { status: 409 });

async function settings(ownerId: string) {
  const personal = await prisma.newsletterSettings.findUnique({ where: { ownerId }, select });
  if (personal) return personal;
  const legacy = await prisma.newsletterSettings.findUnique({ where: { id: "default" }, select });
  return { id: "default", headerImageUrl: legacy?.headerImageUrl ?? null, updatedAt: legacy?.updatedAt ?? null, revision: 0 };
}
export async function GET() {
  const session = await getPersonalModuleSession();
  return session ? Response.json(await settings(session.user.id)) : denied();
}
export async function PUT(req: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return denied();
  const result = input.safeParse(await req.json().catch(() => null));
  if (!result.success) return Response.json({ error: "Paramètres invalides" }, { status: 400 });
  const { headerImageUrl, revision } = result.data;
  const ownerId = session.user.id;
  if (headerImageUrl === undefined) return Response.json(await settings(ownerId));
  const data = { headerImageUrl: headerImageUrl || null };
  const create = { ...data, id: "header:" + ownerId, ownerId, revision: 1 };
  const update = { ...data, revision: { increment: 1 } };
  if (revision === undefined) return Response.json(await prisma.newsletterSettings.upsert({ where: { ownerId }, create, update, select }));
  return prisma.$transaction(async tx => {
    const changed = revision === 0
      ? await tx.newsletterSettings.createMany({ data: create, skipDuplicates: true })
      : await tx.newsletterSettings.updateMany({ where: { ownerId, revision }, data: update });
    if (!changed.count) return conflict();
    return Response.json(await tx.newsletterSettings.findUniqueOrThrow({ where: { ownerId }, select }));
  });
}
