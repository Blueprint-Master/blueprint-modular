import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canStart, isWorkingDay, rooms } from "@/lib/reservations/planning";

export const dynamic = "force-dynamic";

const dayKey = z.string().refine(isWorkingDay);
const booking = z.object({
  organizationId: z.string().min(1), day: dayKey, room: z.enum(rooms),
  startHour: z.number().int().min(9).max(17), duration: z.union([z.literal(1), z.literal(2)]),
  title: z.string().trim().min(1).max(160),
}).strict().refine(b => b.startHour + b.duration <= 18 && canStart(b.day, b.startHour));

function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

function member(userId: string, organizationId: string) {
  return prisma.orgMember.findUnique({
    where: { userId_organizationId: { userId, organizationId } }, select: { id: true },
  });
}

export async function GET(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return error(401, "unauthenticated");
  const userId = session.user.id;
  const params = new URL(request.url).searchParams;
  const organizationId = params.get("organizationId");
  if (organizationId === null && !params.has("day")) {
    const memberships = await prisma.orgMember.findMany({
      where: { userId }, select: { organization: { select: { id: true, name: true } } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return Response.json(memberships.map(m => m.organization));
  }
  const day = dayKey.safeParse(params.get("day"));
  if (!organizationId || !day.success) return error(400, "invalid_query");
  if (!await member(userId, organizationId)) return error(403, "membership_required");
  const result = await prisma.roomReservation.findMany({
    where: { organizationId, day: day.data, member: { organization: { members: { some: { userId } } } } },
    orderBy: [{ room: "asc" }, { startHour: "asc" }],
    select: { ownerId: true, id: true, room: true, startHour: true, duration: true, title: true },
  });
  return Response.json(result.map(({ ownerId, id, title, ...slot }) => ({
    ...slot, id: ownerId === userId ? id : null, title: ownerId === userId ? title : null,
  })));
}

export async function POST(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return error(401, "unauthenticated");
  const input = booking.safeParse(await request.json().catch(() => null));
  if (!input.success) return error(400, "invalid_booking");
  const ownerId = session.user.id;
  if (!await member(ownerId, input.data.organizationId)) return error(403, "membership_required");
  try {
    const { organizationId, day, room, startHour, duration, title } = input.data;
    const created = await prisma.roomReservation.create({
      data: { ownerId, organizationId, day, room, startHour, duration, title }, select: { id: true },
    });
    return Response.json(created, { status: 201 });
  } catch (cause) {
    if (cause instanceof Prisma.PrismaClientKnownRequestError) {
      if (cause.code === "P2002") return error(409, "occupied");
      if (cause.code === "P2003") return error(403, "membership_required");
    }
    throw cause;
  }
}

export async function DELETE(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return error(401, "unauthenticated");
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return error(400, "invalid_id");
  const removed = await prisma.roomReservation.deleteMany({ where: { id, ownerId: session.user.id } });
  return removed.count ? new Response(null, { status: 204 }) : error(404, "unknown_booking");
}
