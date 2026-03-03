import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params): Promise<{ id: string }> {
  return typeof (params as Promise<{ id: string }>)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

/**
 * GET /api/calendar/[id]
 * Détail d'un événement.
 */
export async function GET(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await resolveParams(context.params);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const event = await prisma.calendarEvent.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      allDay: true,
      description: true,
      color: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: event.id,
    title: event.title,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    allDay: event.allDay,
    description: event.description ?? null,
    color: event.color ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  });
}

/**
 * PUT /api/calendar/[id]
 * Met à jour un événement. Body: title?, startAt?, endAt?, allDay?, description?, color?
 */
export async function PUT(request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await resolveParams(context.params);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.calendarEvent.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { title?: string; startAt?: string; endAt?: string; allDay?: boolean; description?: string | null; color?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const startAt = body.startAt != null ? new Date(body.startAt) : existing.startAt;
  const endAt = body.endAt != null ? new Date(body.endAt) : existing.endAt;
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return NextResponse.json({ error: "Invalid startAt or endAt" }, { status: 400 });
  }
  if (endAt < startAt) {
    return NextResponse.json({ error: "endAt must be >= startAt" }, { status: 400 });
  }

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      startAt,
      endAt,
      ...(body.allDay !== undefined && { allDay: body.allDay }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.color !== undefined && { color: body.color?.trim() || null }),
    },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      allDay: true,
      description: true,
      color: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    id: event.id,
    title: event.title,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    allDay: event.allDay,
    description: event.description ?? null,
    color: event.color ?? null,
    updatedAt: event.updatedAt.toISOString(),
  });
}

/**
 * DELETE /api/calendar/[id]
 */
export async function DELETE(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await resolveParams(context.params);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const deleted = await prisma.calendarEvent.deleteMany({
    where: { id, userId: user.id },
  });
  if (deleted.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(null, { status: 204 });
}
