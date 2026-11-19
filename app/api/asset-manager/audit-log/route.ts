import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { getPersonalModuleSession } from "@/lib/auth";
import { parseCalendarDate } from "@/lib/calendar/event-input";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const marker = z.tuple([z.string().datetime(), z.string().min(1)]);

export async function GET(request: Request) {
  if (!await getPersonalModuleSession()) return Response.json({ error: "Non autorisé" }, { status: 401 });
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
    try {
      const [timestamp, id] = marker.parse(JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")));
      where.OR = [{ timestamp: { lt: new Date(timestamp) } }, { timestamp: new Date(timestamp), id: { lt: id } }];
    } catch { return Response.json({ error: "Curseur de journal invalide." }, { status: 400 }); }
  }
  const rows = await prisma.auditLog.findMany({ where, orderBy: [{ timestamp: "desc" }, { id: "desc" }], take: limit + 1 });
  const page = rows.slice(0, limit);
  const users = await prisma.user.findMany({ where: { id: { in: [...new Set(page.map(row => row.userId))] } }, select: { id: true, name: true } });
  const names = new Map(users.map(user => [user.id, user.name]));
  const last = page.at(-1);
  const headers = new Headers();
  if (rows.length > limit && last) headers.set("X-Next-Cursor", Buffer.from(JSON.stringify([last.timestamp, last.id])).toString("base64url"));
  return Response.json(page.map(row => ({ ...row, userName: names.get(row.userId) ?? null })), { headers });
}
