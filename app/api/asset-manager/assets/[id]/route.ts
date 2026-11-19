import { NextResponse } from "next/server";
import { getPersonalModuleSession, hasWriteRole } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { prisma } from "@/lib/prisma";
import { inventoryEdit, inventoryDetails } from "@/lib/asset-manager/inventory-input";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";
import { writeAuditLog, getClientIpAndAgent } from "@/lib/asset-manager/audit";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params): Promise<{ id: string }> {
  return typeof (params as Promise<{ id: string }>)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

export async function GET(_request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      attributes: true,
      createdBy: { select: { id: true, name: true, email: true } },
      tickets: { orderBy: [{ openedAt: "desc" }, { id: "desc" }], select: { id: true, reference: true, title: true, status: true, openedAt: true } },
      assignments: { select: { id: true, reference: true, status: true, startDate: true, assignee: { select: { name: true } } } },
    },
  });
  if (!asset) return NextResponse.json({ error: "Actif introuvable" }, { status: 404 });
  return NextResponse.json({ ...asset, canEdit: hasWriteRole(result.user) });
}

export async function PUT(request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const { id } = await resolveParams(context.params);
  const parsed = inventoryEdit.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifiez les champs de la fiche." }, { status: 400 });
  const { attributes, expectedUpdatedAt, ...fields } = parsed.data;
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Asset" WHERE id = ${id} FOR UPDATE`;
    const before = await tx.asset.findUnique({ where: { id }, include: inventoryDetails });
    if (!before) return NextResponse.json({ error: "Actif introuvable." }, { status: 404 });
    if (expectedUpdatedAt && expectedUpdatedAt !== before.updatedAt.toISOString())
      return NextResponse.json({ error: "L’actif a été modifié. Rechargez la fiche avant de confirmer." }, { status: 409 });
    const config = getDomainConfig(before.domainId);
    const nextStatus = fields.statusId === undefined ? before.statusId : fields.statusId;
    if (nextStatus !== before.statusId && !config?.statuses.some(status => status.id === nextStatus))
      return NextResponse.json({ error: "Statut inconnu dans ce domaine." }, { status: 400 });
    if (fields.lifecycleStage && fields.lifecycleStage !== before.lifecycleStage && !config?.lifecycle_stages?.some(stage => stage.id === fields.lifecycleStage))
      return NextResponse.json({ error: "Étape de cycle de vie inconnue." }, { status: 400 });
    if (nextStatus !== before.statusId && before.domainId === "it" && nextStatus === "in_stock"
        && await tx.assignment.count({ where: { assetId: id, status: { in: ["active", "overdue"] } } }))
      return NextResponse.json({ error: "Restituez le prêt avant la remise en stock." }, { status: 409 });
    if (attributes && new Set(attributes.map(attr => attr.key)).size !== attributes.length)
      return NextResponse.json({ error: "Un attribut est présent deux fois." }, { status: 400 });
    if (attributes) {
      await tx.assetAttribute.deleteMany({ where: { assetId: id } });
      if (attributes.length) await tx.assetAttribute.createMany({ data: attributes.map(attr => ({ ...attr, key: attr.key, assetId: id })) });
    }
    const updated = await tx.asset.update({ where: { id }, data: {
      ...fields, updatedAt: new Date(Math.max(Date.now(), before.updatedAt.getTime() + 1)),
    }, include: inventoryDetails });
    await writeAuditLog({ domainId: before.domainId, userId: result.user.id, action: "update", resourceType: "asset", resourceId: id,
      beforeState: before, afterState: updated, changedFields: [...Object.keys(fields), ...(attributes ? ["attributes"] : [])],
      ...getClientIpAndAgent(request) }, tx);
    return NextResponse.json({ ...updated, canEdit: true });
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getPersonalModuleSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(session.user);
  if (forbidden) return forbidden;
  const { id } = await params;
  const version = new URL(request.url).searchParams.get("expectedUpdatedAt");
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Asset" WHERE id = ${id} FOR UPDATE`;
    const row = await tx.asset.findUnique({ where: { id }, include: inventoryDetails });
    if (!row) return NextResponse.json({ error: "Actif introuvable." }, { status: 404 });
    if (version && version !== row.updatedAt.toISOString()) return NextResponse.json({ error: "La fiche a été modifiée." }, { status: 409 });
    if (await tx.assignment.count({ where: { assetId: id, status: { in: ["active", "overdue"] } } }))
      return NextResponse.json({ error: "Restituez les prêts ouverts avant la suppression." }, { status: 409 });
    await tx.asset.delete({ where: { id } });
    await writeAuditLog({ domainId: row.domainId, userId: session.user.id, action: "delete", resourceType: "asset",
      resourceId: id, beforeState: row, ...getClientIpAndAgent(request) }, tx);
    return NextResponse.json({ ok: true });
  });
}
