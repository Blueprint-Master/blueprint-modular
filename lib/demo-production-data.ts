import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  calculateTRS,
  calculateAvailability,
  calculatePerformance,
  calculateQuality,
  calculateLossRate,
} from "@/lib/compute";

const DEFAULT_ORG_SLUG = process.env.DEFAULT_ORG_SLUG ?? "default";
const TRS_TARGET = 80;

function getTodayBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function fetchDemoProductionData() {
  const org = await prisma.organization.findFirst({
    where: { slug: DEFAULT_ORG_SLUG },
  });
  if (!org) {
    return {
      metrics: null,
      lines: [] as Array<{
        id: string;
        name: string;
        code: string;
        status: string;
        todayTRS: number;
        todayAvailability: number;
        todayPerformance: number;
        todayQuality: number;
        activeSessions: number;
        activeAlerts: number;
      }>,
      alerts: [] as Array<{
        id: string;
        type: string;
        severity: string;
        message: string;
        line: { name: string; code: string };
      }>,
    };
  }

  const period = "30d";
  const days = 30;
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const { start: todayStart, end: todayEnd } = getTodayBounds();

  const [lines, sessions, alerts] = await Promise.all([
    prisma.productionLine.findMany({
      where: { organizationId: org.id },
      include: {
        sessions: { where: { startedAt: { gte: todayStart, lt: todayEnd } } },
        alerts: { where: { acknowledgedAt: null } },
      },
    }),
    prisma.productionSession.findMany({
      where: { organizationId: org.id, startedAt: { gte: from } },
      orderBy: { startedAt: "asc" },
      include: { line: true },
    }),
    prisma.productionAlert.findMany({
      where: { organizationId: org.id, acknowledgedAt: null },
      orderBy: { createdAt: "desc" },
      include: { line: { select: { name: true, code: true } } },
    }),
  ]);

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

  const linesResult = lines.map((line) => {
    const lineSessions = line.sessions;
    let todayTRS = 0;
    let todayAvailability = 0;
    let todayPerformance = 0;
    let todayQuality = 0;
    if (lineSessions.length > 0) {
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
      todayAvailability = calculateAvailability({
        available_time: agg.availableTime,
        stops_time: agg.stopsTime,
      });
      todayPerformance = calculatePerformance({
        produced_parts: agg.goodParts,
        theoretical_rate: line.theoreticalRate,
        net_time: netTimeHours,
      });
      todayQuality = calculateQuality({
        good_parts: agg.goodParts,
        total_parts: agg.totalParts,
      });
      todayTRS = calculateTRS({
        available_time: agg.availableTime,
        stops_time: agg.stopsTime,
        good_parts: agg.goodParts,
        total_parts: agg.totalParts,
        produced_parts: agg.goodParts,
        theoretical_rate: line.theoreticalRate,
        net_time: netTimeHours,
      });
    }
    return {
      id: line.id,
      name: line.name,
      code: line.code,
      status: line.status,
      todayTRS: Math.round(todayTRS * 100) / 100,
      todayAvailability: Math.round(todayAvailability * 100) / 100,
      todayPerformance: Math.round(todayPerformance * 100) / 100,
      todayQuality: Math.round(todayQuality * 100) / 100,
      activeSessions: lineSessions.length,
      activeAlerts: line.alerts.length,
    };
  });

  return {
    metrics: {
      globalTRS,
      bestLine: { name: bestLine.name, trs: Math.round(bestLine.trs * 100) / 100 },
      worstLine: { name: worstLine.name, trs: Math.round(worstLine.trs * 100) / 100 },
      totalProduction,
      totalRejects,
      globalLossRate,
      trsEvolution,
      trsTarget: TRS_TARGET,
    },
    lines: linesResult,
    alerts: alerts.map((a) => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      message: a.message,
      line: a.line,
    })),
  };
}

export async function getCachedDemoProductionData() {
  return unstable_cache(
    fetchDemoProductionData,
    ["demo-production-data"],
    { revalidate: 3600 }
  )();
}
