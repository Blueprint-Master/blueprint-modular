import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPersonalModuleSession } from "@/lib/auth";

const input = z.object({
  revision: z.number().int().nonnegative(),
  widgets: z.array(z.object({ reportId: z.string().uuid(), display: z.enum(["chart", "total"]) }).strict()).max(32),
}).strict().refine(data => new Set(data.widgets.map(w => w.reportId)).size === data.widgets.length);

export async function GET() {
  const session = await getPersonalModuleSession();
  if (!session) return new Response(null, { status: 401 });
  return Response.json(await prisma.personalDashboard.findUnique({
    where: { userId: session.user.id }, select: { revision: true, widgets: true },
  }) ?? { revision: 0, widgets: [] });
}

export async function PUT(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return new Response(null, { status: 401 });
  const result = input.safeParse(await request.json().catch(() => null));
  if (!result.success) return Response.json({ error: "invalid_layout" }, { status: 400 });
  const { revision, widgets } = result.data;
  const userId = session.user.id;
  const reportIds = widgets.map(w => w.reportId);
  const reportCount = await prisma.reportSnapshot.count({ where: { userId, id: { in: reportIds } } });
  if (reportCount !== reportIds.length) return Response.json({ error: "unknown_report" }, { status: 400 });
  const changed = revision === 0
    ? await prisma.personalDashboard.createMany({ data: { userId, widgets }, skipDuplicates: true })
    : await prisma.personalDashboard.updateMany({ where: { userId, revision }, data: { widgets, revision: { increment: 1 } } });
  return changed.count
    ? Response.json({ revision: revision + 1, widgets })
    : Response.json({ error: "revision_conflict" }, { status: 409 });
}
