import { z } from "zod";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ReportRow } from "@/lib/reports/snapshots";

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getPersonalModuleSession();
  if (!session) return new Response(null, { status: 401 });
  const { id } = await ctx.params;
  if (!z.string().uuid().safeParse(id).success) return new Response(null, { status: 404 });
  const report = await prisma.reportSnapshot.findFirst({ where: { id, userId: session.user.id },
    select: { id: true, source: true, since: true, through: true, createdAt: true, rows: true } });
  if (!report) return new Response(null, { status: 404 });
  if (new URL(request.url).searchParams.get("format") !== "csv") return Response.json(report);
  const lines = ["status;count"];
  for (const row of report.rows as ReportRow[]) {
    const status = /^[=+@\s-]/.test(row.status) ? "'" + row.status : row.status;
    lines.push(`"${status.replaceAll('"', '""')}";${row.count}`);
  }
  return new Response("\uFEFF" + lines.join("\r\n") + "\r\n", { headers: {
    "Content-Type": "text/csv;charset=utf-8", "Content-Disposition": `attachment; filename="rapport-${id}.csv"`,
  } });
}
