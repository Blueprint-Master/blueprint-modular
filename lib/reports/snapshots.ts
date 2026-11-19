import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const requestSchema = z.object({
  id: z.string().uuid(), source: z.enum(["documents", "contracts"]),
  since: z.string().date(), through: z.string().date(),
}).strict().refine(range => range.since <= range.through);
export type ReportRequest = z.infer<typeof requestSchema>;
export type ReportRow = { status: string; count: number };

export async function countByStatus(tx: Prisma.TransactionClient, userId: string, request: ReportRequest) {
  const end = new Date(request.through + "T00:00:00Z");
  end.setUTCDate(end.getUTCDate() + 1);
  const where = { uploadedById: userId, createdAt: { gte: new Date(request.since), lt: end } };
  if (request.source === "contracts") {
    const groups = await tx.contract.groupBy({ by: ["status"], where, _count: { _all: true }, orderBy: { status: "asc" } });
    return groups.map(row => ({ status: row.status, count: row._count._all }));
  }
  const groups = await tx.document.groupBy({ by: ["analysisStatus"], where, _count: { _all: true }, orderBy: { analysisStatus: "asc" } });
  return groups.map(row => ({ status: row.analysisStatus, count: row._count._all }));
}
