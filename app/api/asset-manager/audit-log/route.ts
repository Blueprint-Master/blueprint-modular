import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId")?.trim() || undefined;
  const resourceType = searchParams.get("resourceType")?.trim() || undefined;
  const resourceId = searchParams.get("resourceId")?.trim() || undefined;
  const userId = searchParams.get("userId")?.trim() || undefined;
  const action = searchParams.get("action")?.trim() || undefined;
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));

  const where: { domainId?: string; resourceType?: string; resourceId?: string; userId?: string; action?: string; timestamp?: { gte?: Date; lte?: Date } } = {};
  if (domainId) where.domainId = domainId;
  if (resourceType) where.resourceType = resourceType;
  if (resourceId) where.resourceId = resourceId;
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from);
    if (to) where.timestamp.lte = new Date(to);
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit,
  });
  return NextResponse.json(logs);
}
