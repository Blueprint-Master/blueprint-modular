import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentOrganization, assertOrganizationAccess } from "@/lib/auth/organization";
import { prisma } from "@/lib/prisma";
import {
  calculateTRS,
  calculateAvailability,
  calculatePerformance,
  calculateQuality,
  calculateLossRate,
} from "@/lib/compute";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const org = await getCurrentOrganization(session);
  if (!org) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }
  try {
    await assertOrganizationAccess(session, org.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const line = await prisma.productionLine.findFirst({
    where: { id, organizationId: org.id },
    include: {
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 10,
      },
    },
  });
  if (!line) {
    return NextResponse.json({ error: "Line not found" }, { status: 404 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const allSessions = await prisma.productionSession.findMany({
    where: { lineId: id, organizationId: org.id, startedAt: { gte: thirtyDaysAgo } },
    orderBy: { startedAt: "asc" },
  });

  const byDate = new Map<string, typeof allSessions>();
  for (const s of allSessions) {
    const d = s.startedAt.toISOString().slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(s);
  }

  const trsHistory: { date: string; trs: number; availability: number; performance: number; quality: number }[] = [];
  const lossHistory: { date: string; lossRate: number; rawMaterialUsed: number; rawMaterialLost: number }[] = [];

  for (const [date, sessions] of Array.from(byDate.entries())) {
    if (sessions.length === 0) continue;
    const agg = sessions.reduce(
      (acc, s) => ({
        availableTime: acc.availableTime + s.availableTime,
        stopsTime: acc.stopsTime + s.stopsTime,
        goodParts: acc.goodParts + s.goodParts,
        totalParts: acc.totalParts + s.totalParts,
        rawMaterialUsed: acc.rawMaterialUsed + s.rawMaterialUsed,
        rawMaterialLost: acc.rawMaterialLost + s.rawMaterialLost,
      }),
      { availableTime: 0, stopsTime: 0, goodParts: 0, totalParts: 0, rawMaterialUsed: 0, rawMaterialLost: 0 }
    );
    const netTimeHours = Math.max(0, (agg.availableTime - agg.stopsTime) / 60);
    const availability = calculateAvailability({
      available_time: agg.availableTime,
      stops_time: agg.stopsTime,
    });
    const performance = calculatePerformance({
      produced_parts: agg.goodParts,
      theoretical_rate: line.theoreticalRate,
      net_time: netTimeHours,
    });
    const quality = calculateQuality({
      good_parts: agg.goodParts,
      total_parts: agg.totalParts,
    });
    const trs = calculateTRS({
      available_time: agg.availableTime,
      stops_time: agg.stopsTime,
      good_parts: agg.goodParts,
      total_parts: agg.totalParts,
      produced_parts: agg.goodParts,
      theoretical_rate: line.theoreticalRate,
      net_time: netTimeHours,
    });
    trsHistory.push({
      date,
      trs: Math.round(trs * 100) / 100,
      availability: Math.round(availability * 100) / 100,
      performance: Math.round(performance * 100) / 100,
      quality: Math.round(quality * 100) / 100,
    });
    const total = agg.rawMaterialUsed + agg.rawMaterialLost;
    const lossRate = total > 0 ? calculateLossRate({ total, rejects: agg.rawMaterialLost }) : 0;
    lossHistory.push({
      date,
      lossRate: Math.round(lossRate * 100) / 100,
      rawMaterialUsed: Math.round(agg.rawMaterialUsed * 100) / 100,
      rawMaterialLost: Math.round(agg.rawMaterialLost * 100) / 100,
    });
  }

  trsHistory.sort((a, b) => a.date.localeCompare(b.date));
  lossHistory.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    line: {
      id: line.id,
      name: line.name,
      code: line.code,
      status: line.status,
      theoreticalRate: line.theoreticalRate,
    },
    trsHistory,
    lossHistory,
    sessions: line.sessions.map((s) => ({
      id: s.id,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      goodParts: s.goodParts,
      totalParts: s.totalParts,
      rawMaterialUsed: s.rawMaterialUsed,
      rawMaterialLost: s.rawMaterialLost,
    })),
  });
}
