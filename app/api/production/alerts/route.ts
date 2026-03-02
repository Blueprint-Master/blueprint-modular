import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentOrganization, assertOrganizationAccess } from "@/lib/auth/organization";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
  const status = searchParams.get("status") ?? "active";
  const severity = searchParams.get("severity");

  const where: { organizationId: string; acknowledgedAt?: null } = {
    organizationId: org.id,
  };
  if (status === "active") {
    where.acknowledgedAt = null;
  }
  if (severity && ["critical", "warning", "info"].includes(severity)) {
    (where as { severity?: string }).severity = severity;
  }

  const alerts = await prisma.productionAlert.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { line: { select: { id: true, name: true, code: true } } },
  });

  return NextResponse.json({
    alerts: alerts.map((a) => ({
      id: a.id,
      lineId: a.lineId,
      line: a.line,
      type: a.type,
      severity: a.severity,
      message: a.message,
      value: a.value,
      threshold: a.threshold,
      acknowledgedAt: a.acknowledgedAt,
      acknowledgedBy: a.acknowledgedBy,
      createdAt: a.createdAt,
    })),
  });
}

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

  let body: { alertId?: string; acknowledgedBy?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { alertId, acknowledgedBy } = body;
  if (!alertId || typeof alertId !== "string") {
    return NextResponse.json({ error: "alertId required" }, { status: 400 });
  }

  const alert = await prisma.productionAlert.findFirst({
    where: { id: alertId, organizationId: org.id },
  });
  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  await prisma.productionAlert.update({
    where: { id: alertId },
    data: {
      acknowledgedAt: new Date(),
      acknowledgedBy: acknowledgedBy ?? session.user.email,
    },
  });

  return NextResponse.json({ ok: true });
}
