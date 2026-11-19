import { getPersonalModuleSession } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { movementEdit, movementInclude, reviseMovement } from "@/lib/asset-manager/movements";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  if (!await getPersonalModuleSession()) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const movement = await prisma.assetMovement.findUnique({ where: { id: (await params).id, removedAt: null }, include: movementInclude });
  return movement ? Response.json(movement) : Response.json({ error: "Mouvement introuvable" }, { status: 404 });
}

export async function PUT(request: Request, { params }: Context) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(session.user);
  if (forbidden) return forbidden;
  const patch = movementEdit.safeParse(await request.json().catch(() => null));
  if (!patch.success) return Response.json({ error: patch.error.issues[0].message }, { status: 400 });
  return reviseMovement((await params).id, session.user.id, patch.data.revision, patch.data);
}

export async function DELETE(request: Request, { params }: Context) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(session.user);
  if (forbidden) return forbidden;
  const version = new URL(request.url).searchParams.get("revision");
  if (version !== null && !/^\d+$/.test(version)) return Response.json({ error: "Révision invalide." }, { status: 400 });
  return reviseMovement((await params).id, session.user.id, version === null ? undefined : Number(version));
}
