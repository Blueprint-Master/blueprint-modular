import type { Prisma } from "@prisma/client";
import { readHistoryCursor, historyPage } from "@/lib/asset-manager/history-page";
import { getPersonalModuleSession, hasWriteRole } from "@/lib/auth";
import { parseCalendarDate } from "@/lib/calendar/event-input";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  if (!hasWriteRole(session.user)) return Response.json({ error: "Le journal du parc est réservé aux administrateurs." }, { status: 403 });
  const query = new URL(request.url).searchParams;
  const where: Prisma.AuditLogWhereInput = {};
  for (const key of ["domainId", "resourceType", "resourceId", "userId", "action"] as const) {
    const value = query.get(key)?.trim();
    if (value) where[key] = value;
  }
  const size = query.get("limit") ?? "50";
  if (!/^\d+$/.test(size)) return Response.json({ error: "Taille de page invalide." }, { status: 400 });
  const limit = Math.min(200, Math.max(1, Number(size)));
  const from = query.get("from");
  const to = query.get("to");
  const start = from ? parseCalendarDate(from) : undefined;
  const end = to ? parseCalendarDate(to) : undefined;
  if ((from && !start) || (to && !end)) return Response.json({ error: "Date de filtre invalide." }, { status: 400 });
  if (start || end) {
    // Date-only filters include the entire UTC day; timestamps retain instant precision.
    const dayAfter = to?.length === 10 && end ? new Date(end.getTime() + 86_400_000) : undefined;
    if (start && end && (dayAfter ? start >= dayAfter : start > end)) return Response.json({ error: "Intervalle inversé." }, { status: 400 });
    where.timestamp = { gte: start, lt: dayAfter, lte: dayAfter ? undefined : end };
  }
  const cursor = query.get("cursor");
  if (cursor) {
    const point = readHistoryCursor(cursor);
    if (!point) return Response.json({ error: "Curseur de journal invalide." }, { status: 400 });
    where.OR = [{ timestamp: { lt: point.date } }, { timestamp: point.date, id: { lt: point.id } }];
  }
  const rows = await prisma.auditLog.findMany({ where, orderBy: [{ timestamp: "desc" }, { id: "desc" }], take: limit + 1 });
  const page = rows.slice(0, limit);
  const users = await prisma.user.findMany({ where: { id: { in: [...new Set(page.map(row => row.userId))] } }, select: { id: true, name: true } });
  const names = new Map(users.map(user => [user.id, user.name]));
  return historyPage(rows.map(row => ({ ...row, userName: names.get(row.userId) ?? null })), limit, row => row.timestamp);
}
