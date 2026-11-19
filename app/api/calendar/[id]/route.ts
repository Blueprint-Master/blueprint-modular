import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calendarEventPatch, eventFields } from "@/lib/calendar/event-input";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const missing = () => NextResponse.json({ error: "Not found" }, { status: 404 });
const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function GET(_request: Request, { params }: Context) {
  const session = await getPersonalModuleSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const event = await prisma.calendarEvent.findFirst({
    where: { id, userId: session.user.id },
    select: { ...eventFields, createdAt: true, updatedAt: true },
  });
  return event ? NextResponse.json(event) : missing();
}

/** Partial edits preserve all omitted fields, including dates changed by another request. */
export async function PUT(request: Request, { params }: Context) {
  const session = await getPersonalModuleSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const owner = { id, userId: session.user.id };
  const patch = calendarEventPatch.safeParse(await request.json().catch(() => null));
  if (!patch.success) return NextResponse.json({ error: "Invalid calendar event" }, { status: 400 });
  const { startAt, endAt } = patch.data;
  const invalidRange = () => NextResponse.json({ error: "endAt must be >= startAt" }, { status: 400 });
  if (startAt && endAt && endAt < startAt) return invalidRange();

  try {
    const event = await prisma.calendarEvent.update({
      // A one-sided edit must be valid against the OTHER endpoint at write time.
      where: {
        ...owner,
        ...(startAt && !endAt && { endAt: { gte: startAt } }),
        ...(endAt && !startAt && { startAt: { lte: endAt } }),
      },
      data: patch.data,
      select: { ...eventFields, updatedAt: true },
    });
    return NextResponse.json(event);
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2025") throw error;
    const exists = await prisma.calendarEvent.findFirst({ where: owner, select: { id: true } });
    return exists ? invalidRange() : missing();
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await getPersonalModuleSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const deleted = await prisma.calendarEvent.deleteMany({ where: { id, userId: session.user.id } });
  return deleted.count ? new NextResponse(null, { status: 204 }) : missing();
}
