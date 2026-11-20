import { getPersonalModuleSession, hasWriteRole } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { contractEdit, reviseContract } from "@/lib/asset-manager/contracts";
import { coveredIds } from "@/lib/asset-manager/contract-terms";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const row = await prisma.assetContract.findUnique({ where: { id: (await params).id } });
  if (!row) return Response.json({ error: "Contrat introuvable." }, { status: 404 });
  const coveredAssets = await prisma.asset.findMany({ where: { domainId: row.domainId, id: { in: coveredIds(row.assetIds) } },
    select: { id: true, reference: true, label: true }, orderBy: { reference: "asc" } });
  return Response.json({ ...row, coveredAssets, canEdit: hasWriteRole(session.user) });
}

export async function PUT(request: Request, { params }: Context) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(session.user);
  if (forbidden) return forbidden;
  const result = contractEdit.safeParse(await request.json().catch(() => null));
  if (!result.success) return Response.json({ error: result.error.issues[0].message }, { status: 400 });
  return reviseContract((await params).id, session.user.id, result.data.expectedUpdatedAt, result.data);
}

export async function DELETE(request: Request, { params }: Context) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(session.user);
  if (forbidden) return forbidden;
  return reviseContract((await params).id, session.user.id, new URL(request.url).searchParams.get("expectedUpdatedAt") ?? undefined);
}
