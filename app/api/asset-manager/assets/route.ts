import { NextResponse } from "next/server";
import { inventoryInput, inventoryDetails } from "@/lib/asset-manager/inventory-input";
import { writeAuditLog } from "@/lib/asset-manager/audit";
import { generateAssetReference } from "@/lib/asset-manager/numbering";
import { Prisma } from "@prisma/client";
import { getPersonalModuleSession } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { prisma } from "@/lib/prisma";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const assetTypeId = searchParams.get("assetTypeId");
  const statusId = searchParams.get("statusId");
  const lifecycleStageParam = searchParams.get("lifecycleStage");
  const search = searchParams.get("search")?.trim();

  if (!domainId || !getDomainConfig(domainId)) {
    return NextResponse.json({ error: "Domaine invalide" }, { status: 400 });
  }

  const where: Prisma.AssetWhereInput = { domainId };
  if (assetTypeId) where.assetTypeId = assetTypeId;
  if (statusId) where.statusId = statusId;
  if (lifecycleStageParam !== null && lifecycleStageParam !== undefined)
    where.lifecycleStage = lifecycleStageParam.trim() || null;
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: "insensitive" } },
      { label: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
      { serialNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      attributes: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json(assets);
}

export async function POST(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const parsed = inventoryInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifiez les champs de la fiche." }, { status: 400 });
  const { reference: requested, attributes, statusId, ...data } = parsed.data;
  const config = getDomainConfig(data.domainId);
  if (!config?.asset_types.some(type => type.id === data.assetTypeId))
    return NextResponse.json({ error: "Domaine ou type d’actif inconnu" }, { status: 400 });
  const status = statusId ?? config.statuses[0]?.id;
  if (!config.statuses.some(item => item.id === status))
    return NextResponse.json({ error: "Statut inconnu dans ce domaine" }, { status: 400 });
  if (new Set(attributes.map(attr => attr.key)).size !== attributes.length)
    return NextResponse.json({ error: "Un attribut est présent deux fois" }, { status: 400 });

  try {
    const asset = await prisma.$transaction(async tx => {
      const reference = requested || await generateAssetReference(tx, data.assetTypeId, config.asset_id_prefix);
      const created = await tx.asset.create({
        data: { ...data, domainId: data.domainId, assetTypeId: data.assetTypeId, label: data.label,
          reference, statusId: status, createdById: result.user.id,
          attributes: { create: attributes.map(attr => ({ ...attr, key: attr.key })) } },
        include: inventoryDetails,
      });
      await writeAuditLog({ domainId: created.domainId, userId: result.user.id, action: "create", resourceType: "asset",
        resourceId: created.id, afterState: created }, tx);
      return created;
    });
    return NextResponse.json(asset);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return NextResponse.json({ error: "Cette référence existe déjà" }, { status: 409 });
    throw error;
  }
}
