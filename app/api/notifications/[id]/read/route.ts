import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/notifications/[id]/read
 * Marque la notification comme lue (readAt = now).
 */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updated = await prisma.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  if (updated.count === 0) {
    const exists = await prisma.notification.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
