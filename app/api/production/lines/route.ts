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
} from "@/lib/compute";

export const dynamic = "force-dynamic";

function getTodayBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function GET() {
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

  const { start, end } = getTodayBounds();
  const lines = await prisma.productionLine.findMany({
    where: { organizationId: org.id },
    include: {
      sessions: {
        where: { startedAt: { gte: start, lt: end } },
      },
      alerts: {
        where: { acknowledgedAt: null },
      },
    },
  });

  const result = lines.map((line) => {
    const sessions = line.sessions;
    let todayTRS = 0;
    let todayAvailability = 0;
    let todayPerformance = 0;
    let todayQuality = 0;
    if (sessions.length > 0) {
      const agg = sessions.reduce(
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
      activeSessions: sessions.length,
      activeAlerts: line.alerts.length,
    };
  });

  return NextResponse.json({ lines: result });
}
