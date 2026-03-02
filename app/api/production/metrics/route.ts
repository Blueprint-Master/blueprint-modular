import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentOrganization, assertOrganizationAccess } from "@/lib/auth/organization";
import { prisma } from "@/lib/prisma";
import { calculateTRS, calculateLossRate } from "@/lib/compute";

export const dynamic = "force-dynamic";

const TRS_TARGET = 80;

function periodToDays(period: string): number {
  if (period === "7d") return 7;
  if (period === "90d") return 90;
  return 30;
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "30d";
  const days = periodToDays(period);

  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const lines = await prisma.productionLine.findMany({
    where: { organizationId: org.id },
  });

  const sessions = await prisma.productionSession.findMany({
    where: {
      organizationId: org.id,
      startedAt: { gte: from },
    },
    orderBy: { startedAt: "asc" },
    include: { line: true },
  });

  const byDate = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const d = s.startedAt.toISOString().slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(s);
  }

  const trsEvolution: { date: string; trs: number }[] = [];
  const lineTRSTotals = new Map<string, { sum: number; count: number }>();
  lines.forEach((l) => lineTRSTotals.set(l.id, { sum: 0, count: 0 }));

  let totalProduction = 0;
  let totalRejects = 0;
  let totalRawUsed = 0;
  let totalRawLost = 0;

  for (const [date, daySessions] of Array.from(byDate.entries())) {
    const byLine = new Map<string, typeof daySessions>();
    for (const s of daySessions) {
      if (!byLine.has(s.lineId)) byLine.set(s.lineId, []);
      byLine.get(s.lineId)!.push(s);
    }
    let daySum = 0;
    let dayCount = 0;
    for (const line of lines) {
      const lineSessions = byLine.get(line.id) ?? [];
      if (lineSessions.length === 0) continue;
      const agg = lineSessions.reduce(
        (acc, s) => ({
          availableTime: acc.availableTime + s.availableTime,
          stopsTime: acc.stopsTime + s.stopsTime,
          goodParts: acc.goodParts + s.goodParts,
          totalParts: acc.totalParts + s.totalParts,
        }),
        { availableTime: 0, stopsTime: 0, goodParts: 0, totalParts: 0 }
      );
      const netTimeHours = Math.max(0, (agg.availableTime - agg.stopsTime) / 60);
      const trs = calculateTRS({
        available_time: agg.availableTime,
        stops_time: agg.stopsTime,
        good_parts: agg.goodParts,
        total_parts: agg.totalParts,
        produced_parts: agg.goodParts,
        theoretical_rate: line.theoreticalRate,
        net_time: netTimeHours,
      });
      const tot = lineTRSTotals.get(line.id)!;
      tot.sum += trs;
      tot.count += 1;
      daySum += trs;
      dayCount += 1;
      for (const s of lineSessions) {
        totalProduction += s.goodParts;
        totalRejects += s.rejectedParts;
        totalRawUsed += s.rawMaterialUsed;
        totalRawLost += s.rawMaterialLost;
      }
    }
    trsEvolution.push({
      date,
      trs: dayCount > 0 ? Math.round((daySum / dayCount) * 100) / 100 : 0,
    });
  }

  trsEvolution.sort((a, b) => a.date.localeCompare(b.date));

  const globalTRS =
    trsEvolution.length > 0
      ? Math.round((trsEvolution.reduce((a, x) => a + x.trs, 0) / trsEvolution.length) * 100) / 100
      : 0;

  const lineAverages = lines
    .map((l) => {
      const t = lineTRSTotals.get(l.id)!;
      return { name: l.name, trs: t.count > 0 ? t.sum / t.count : 0 };
    })
    .filter((l) => l.trs > 0);
  const bestLine = lineAverages.length
    ? lineAverages.reduce((a, b) => (b.trs > a.trs ? b : a), lineAverages[0])
    : { name: "", trs: 0 };
  const worstLine = lineAverages.length
    ? lineAverages.reduce((a, b) => (b.trs < a.trs ? b : a), lineAverages[0])
    : { name: "", trs: 0 };

  const totalRaw = totalRawUsed + totalRawLost;
  const globalLossRate =
    totalRaw > 0
      ? Math.round(calculateLossRate({ total: totalRaw, rejects: totalRawLost }) * 100) / 100
      : 0;

  return NextResponse.json({
    globalTRS,
    bestLine: { name: bestLine.name, trs: Math.round(bestLine.trs * 100) / 100 },
    worstLine: { name: worstLine.name, trs: Math.round(worstLine.trs * 100) / 100 },
    totalProduction,
    totalRejects,
    globalLossRate,
    trsEvolution,
    trsTarget: TRS_TARGET,
  });
}
