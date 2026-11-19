import { getPersonalModuleSession, hasWriteRole } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { createMovement, movementCreate, movementInclude, movementOrder } from "@/lib/asset-manager/movements";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const query = new URL(request.url).searchParams;
  const assetId = query.get("assetId");
  const domainId = query.get("domainId");
  if (!assetId && !domainId) return Response.json({ error: "assetId ou domainId requis" }, { status: 400 });
  const movements = await prisma.assetMovement.findMany({
    where: { removedAt: null, assetId: assetId || undefined, asset: domainId ? { domainId } : undefined },
    orderBy: movementOrder, include: assetId ? undefined : movementInclude,
  });
  return Response.json(movements, { headers: { "X-Can-Edit": String(hasWriteRole(session.user)) } });
}

export async function POST(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(session.user);
  if (forbidden) return forbidden;
  const parsed = movementCreate.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  return createMovement(session.user.id, request.headers.get("Idempotency-Key"), parsed.data);
}
