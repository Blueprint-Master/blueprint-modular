import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { countByStatus, requestSchema } from "@/lib/reports/snapshots";

export async function GET() {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json(await prisma.reportSnapshot.findMany({
    where: { userId: session.user.id }, orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: { id: true, source: true, since: true, through: true, createdAt: true, rows: true },
  }));
}

export async function POST(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  const result = requestSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return Response.json({ error: "invalid_report" }, { status: 400 });
  const input = result.data;
  const userId = session.user.id;
  return prisma.$transaction(async tx => {
    const rows = await countByStatus(tx, userId, input);
    const { count } = await tx.reportSnapshot.createMany({
      data: { id: input.id, userId, source: input.source, since: new Date(input.since), through: new Date(input.through), rows },
      skipDuplicates: true,
    });
    const report = await tx.reportSnapshot.findFirst({ where: { id: input.id, userId, source: input.source, since: new Date(input.since), through: new Date(input.through) },
      select: { id: true, source: true, since: true, through: true, createdAt: true, rows: true } });
    if (!report) return Response.json({ error: "request_conflict" }, { status: 409 });
    return Response.json(report, { status: count ? 201 : 200 });
  });
}
