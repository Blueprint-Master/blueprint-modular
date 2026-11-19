import { z } from "zod";
import { getNotificationLevel } from "@/lib/notificationLevels";
import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Liste les notifications de l'utilisateur connecté.
 * Query: read=true | read=false (optionnel) — filtre lu / non lu.
 */
export async function GET(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;

  const { searchParams } = new URL(request.url);
  const readFilter = searchParams.get("read"); // "true" | "false" | null

  const where: { userId: string; readAt?: null | { not: null } } = {
    userId: user.id,
  };
  if (readFilter === "true") where.readAt = { not: null };
  if (readFilter === "false") where.readAt = null;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
    select: {
      id: true,
      message: true,
      type: true,
      title: true,
      level: true,
      readAt: true,
      createdAt: true,
    },
  });

  const items = notifications.map((n) => ({
    id: n.id,
    message: n.message,
    type: n.type,
    title: n.title ?? null,
    level: n.level ?? 3,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));

  return NextResponse.json({ notifications: items });
}

const notificationInput = z.object({
  message: z.string().trim().min(1),
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
  title: z.string().trim().nullable().optional(),
}).strict();

/** Create an item in the signed-in user's persistent inbox. */
export async function POST(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = notificationInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
  const { message, type, title } = input.data;
  const item = await prisma.notification.create({
    data: { userId: session.user.id, message, type, title: title || null, level: getNotificationLevel(input.data) },
    select: { id: true, message: true, type: true, title: true, level: true, readAt: true, createdAt: true },
  });
  return NextResponse.json(item, { status: 201 });
}
