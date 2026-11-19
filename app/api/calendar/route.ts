import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calendarEventInput, eventFields, parseCalendarDate } from "@/lib/calendar/event-input";

export const dynamic = "force-dynamic";

/** List the user's events intersecting an inclusive interval (default: current month). */
export async function GET(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const now = new Date();
  let start = new Date(now.getFullYear(), now.getMonth(), 1);
  let end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  if (params.has("start") || params.has("end")) {
    const from = parseCalendarDate(params.get("start") ?? "");
    const to = parseCalendarDate(params.get("end") ?? "");
    if (!from || !to || from > to) {
      return NextResponse.json({ error: "Invalid start/end query params" }, { status: 400 });
    }
    start = from;
    end = to;
  }
  const events = await prisma.calendarEvent.findMany({
    where: { userId: session.user.id, startAt: { lte: end }, endAt: { gte: start } },
    orderBy: [{ startAt: "asc" }, { id: "asc" }],
    select: eventFields,
  });
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = calendarEventInput.safeParse(await request.json().catch(() => null));
  if (!input.success || input.data.endAt < input.data.startAt) {
    return NextResponse.json({ error: "Invalid calendar event" }, { status: 400 });
  }
  const { title, startAt, endAt, allDay, description, color } = input.data;
  const event = await prisma.calendarEvent.create({
    data: { userId: session.user.id, title, startAt, endAt, allDay, description, color },
    select: { ...eventFields, createdAt: true },
  });
  return NextResponse.json(event);
}
