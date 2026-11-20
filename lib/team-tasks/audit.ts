import type { Prisma } from "@prisma/client";

export async function readTeamAudit(db: Prisma.TransactionClient, organizationId: string, userId: string, before?: string | null) {
  const task = { organizationId, organization: { members: { some: { userId } } } };
  const cursor = before ? await db.teamTaskEvent.findFirst({
    where: { id: before, task }, select: { id: true, createdAt: true },
  }) : null;
  if (before && !cursor) return null;
  const events = await db.teamTaskEvent.findMany({
    where: { task, ...(cursor && { OR: [
      { createdAt: { lt: cursor.createdAt } }, { createdAt: cursor.createdAt, id: { lt: cursor.id } },
    ] }) },
    select: { id: true, revision: true, actorName: true, action: true, details: true, createdAt: true, task: { select: { id: true, title: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 51,
  });
  return { events: events.slice(0, 50), before: events.length > 50 ? events[49].id : null };
}
