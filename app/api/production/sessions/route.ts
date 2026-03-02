import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentOrganization, assertOrganizationAccess } from "@/lib/auth/organization";
import { prisma } from "@/lib/prisma";
import { calculateTRS } from "@/lib/compute";

export const dynamic = "force-dynamic";

const TRS_ALERT_THRESHOLD = 70;

export async function POST(request: Request) {
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

  let body: {
    lineId?: string;
    startedAt?: string;
    endedAt?: string;
    availableTime?: number;
    stopsTime?: number;
    plannedStops?: number;
    unplannedStops?: number;
    totalParts?: number;
    goodParts?: number;
    rejectedParts?: number;
    rawMaterialUsed?: number;
    rawMaterialLost?: number;
    operatorName?: string;
    shift?: string;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    lineId,
    startedAt,
    endedAt,
    availableTime = 0,
    stopsTime = 0,
    plannedStops = 0,
    unplannedStops = 0,
    totalParts = 0,
    goodParts = 0,
    rejectedParts = 0,
    rawMaterialUsed = 0,
    rawMaterialLost = 0,
    operatorName,
    shift,
    notes,
  } = body;

  if (!lineId || typeof lineId !== "string") {
    return NextResponse.json({ error: "lineId required" }, { status: 400 });
  }
  if (goodParts > totalParts) {
    return NextResponse.json(
      { error: "goodParts cannot exceed totalParts" },
      { status: 400 }
    );
  }
  if (rejectedParts > totalParts) {
    return NextResponse.json(
      { error: "rejectedParts cannot exceed totalParts" },
      { status: 400 }
    );
  }
  if (goodParts + rejectedParts > totalParts) {
    return NextResponse.json(
      { error: "goodParts + rejectedParts cannot exceed totalParts" },
      { status: 400 }
    );
  }

  const line = await prisma.productionLine.findFirst({
    where: { id: lineId, organizationId: org.id },
  });
  if (!line) {
    return NextResponse.json({ error: "Line not found" }, { status: 404 });
  }

  const start = startedAt ? new Date(startedAt) : new Date();
  const end = endedAt ? new Date(endedAt) : null;
  const netTimeHours = Math.max(0, (availableTime - stopsTime) / 60);

  const trs = calculateTRS({
    available_time: availableTime,
    stops_time: stopsTime,
    good_parts: goodParts,
    total_parts: totalParts,
    produced_parts: goodParts,
    theoretical_rate: line.theoreticalRate,
    net_time: netTimeHours,
  });

  const sessionRecord = await prisma.productionSession.create({
    data: {
      lineId,
      organizationId: org.id,
      startedAt: start,
      endedAt: end,
      availableTime,
      stopsTime,
      plannedStops,
      unplannedStops,
      totalParts,
      goodParts,
      rejectedParts,
      rawMaterialUsed,
      rawMaterialLost,
      operatorName: operatorName ?? null,
      shift: shift ?? null,
      notes: notes ?? null,
    },
  });

  if (trs < TRS_ALERT_THRESHOLD) {
    await prisma.productionAlert.create({
      data: {
        lineId,
        organizationId: org.id,
        type: "trs_low",
        severity: trs < 60 ? "critical" : "warning",
        message: `TRS sous le seuil (${trs.toFixed(1)} % < ${TRS_ALERT_THRESHOLD} %)`,
        value: trs,
        threshold: TRS_ALERT_THRESHOLD,
      },
    });
  }

  return NextResponse.json(
    {
      id: sessionRecord.id,
      lineId: sessionRecord.lineId,
      startedAt: sessionRecord.startedAt,
      endedAt: sessionRecord.endedAt,
      trs: Math.round(trs * 100) / 100,
    },
    { status: 201 }
  );
}
