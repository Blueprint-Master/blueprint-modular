import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/calendar — liste par plage (query: start, end ISO ; défaut = mois courant). */
export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;

  const { searchParams } = new URL(request.url);
  let start: Date;
  let end: Date;
  try {
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    if (startParam && endParam) {
      start = new Date(startParam);
      end = new Date(endParam);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("Invalid date");
  } catch {
    return NextResponse.json({ error: "Invalid start/end query params" }, { status: 400 });
  }

  const events = await prisma.calendarEvent.findMany({
    where: { userId: user.id, startAt: { lte: end }, endAt: { gte: start } },
    orderBy: { startAt: "asc" },
    select: { id: true, title: true, startAt: true, endAt: true, allDay: true, description: true, color: true },
  });

  return NextResponse.json(
    events.map((e) => ({
      id: e.id,
      title: e.title,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt.toISOString(),
      allDay: e.allDay,
      description: e.description ?? null,
      color: e.color ?? null,
    }))
  );
}

/** POST /api/calendar — body: title, startAt, endAt, allDay?, description?, color? */
export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;

  let body: { title?: string; startAt?: string; endAt?: string; allDay?: boolean; description?: string | null; color?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, startAt, endAt, allDay, description, color } = body;
  if (!title || !startAt || !endAt) return NextResponse.json({ error: "title, startAt and endAt required" }, { status: 400 });

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return NextResponse.json({ error: "Invalid startAt or endAt" }, { status: 400 });
  if (end < start) return NextResponse.json({ error: "endAt must be >= startAt" }, { status: 400 });

  const event = await prisma.calendarEvent.create({
    data: {
      userId: user.id,
      title: title.trim(),
      startAt: start,
      endAt: end,
      allDay: allDay ?? false,
      description: description?.trim() || null,
      color: color?.trim() || null,
    },
    select: { id: true, title: true, startAt: true, endAt: true, allDay: true, description: true, color: true, createdAt: true },
  });

  return NextResponse.json({
    id: event.id,
    title: event.title,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    allDay: event.allDay,
    description: event.description ?? null,
    color: event.color ?? null,
    createdAt: event.createdAt.toISOString(),
  });
}
