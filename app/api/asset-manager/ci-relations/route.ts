import { z } from "zod";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";
import { relationTypes, symmetricRelation } from "@/lib/asset-manager/relation-types";
import { NextResponse } from "next/server";
import { getPersonalModuleSession, hasWriteRole } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const id = z.string().trim().min(1);
const relationInput = z.object({ domainId: id, sourceAssetId: id, targetAssetId: id, relationType: id, description: z.string().trim().nullish() });
const assetSummary = { select: { id: true, reference: true, label: true } };
const include = { sourceAsset: assetSummary, targetAsset: assetSummary };

export async function GET(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const sourceAssetId = searchParams.get("sourceAssetId");
  const targetAssetId = searchParams.get("targetAssetId");
  const assetId = searchParams.get("assetId"); // relations où cet actif est source OU cible

  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });

  const where = {
    domainId,
    sourceAssetId: sourceAssetId || undefined,
    targetAssetId: targetAssetId || undefined,
    OR: assetId ? [{ sourceAssetId: assetId }, { targetAssetId: assetId }] : undefined,
  };

  const relations = await prisma.cIRelation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include,
  });
  return NextResponse.json(relations, { headers: { "X-Can-Edit": String(hasWriteRole(result.user)) } });
}

export async function POST(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const parsed = relationInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Relation invalide." }, { status: 400 });
  const { domainId, sourceAssetId, targetAssetId, relationType, description } = parsed.data;
  const config = getDomainConfig(domainId);
  if (!config || !relationTypes(config).includes(relationType)) return NextResponse.json({ error: "Type de relation inconnu dans ce domaine." }, { status: 400 });
  if (sourceAssetId === targetAssetId) return NextResponse.json({ error: "Source et cible doivent être différentes." }, { status: 400 });

  return prisma.$transaction(async tx => {
    const assets = await tx.$queryRaw<{ domain_id: string }[]>`
      SELECT domain_id FROM "Asset" WHERE id IN (${sourceAssetId}, ${targetAssetId}) ORDER BY id FOR UPDATE
    `;
    if (assets.length !== 2) return NextResponse.json({ error: "Actif source ou cible introuvable." }, { status: 404 });
    if (assets.some(asset => asset.domain_id !== domainId)) return NextResponse.json({ error: "Les actifs doivent appartenir au même domaine." }, { status: 400 });
    const directions = [{ sourceAssetId, targetAssetId }];
    if (symmetricRelation(relationType)) directions.push({ sourceAssetId: targetAssetId, targetAssetId: sourceAssetId });
    const existing = await tx.cIRelation.findFirst({ where: { domainId, relationType, OR: directions } });
    if (existing) return NextResponse.json({ error: "Cette relation existe déjà.", id: existing.id }, { status: 409 });
    const relation = await tx.cIRelation.create({ data: {
      domainId, sourceAssetId, targetAssetId, relationType, description: description || null, createdById: result.user.id,
    }, include });
    await tx.auditLog.create({ data: {
      domainId, resourceType: "relation", resourceId: relation.id, userId: result.user.id, action: "create",
      afterState: JSON.stringify({ sourceAssetId, targetAssetId, relationType }),
    } });
    return NextResponse.json(relation);
  });
}
