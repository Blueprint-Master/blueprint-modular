import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Reserve a generated inventory number until the enclosing insert commits. */
export async function generateAssetReference(tx: Prisma.TransactionClient, type: string, prefix: string) {
  const stem = `${prefix}-${type}-${new Date().getFullYear()}-`;
  await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${stem}, 0))`;
  const [row] = await tx.$queryRaw<{ next: string }[]>`
    SELECT (COALESCE(MAX(suffix::numeric), 0) + 1)::text AS next
    FROM (SELECT substring(reference FROM char_length(${stem}::text) + 1) AS suffix
          FROM "Asset" WHERE starts_with(reference, ${stem})) AS numbered
    WHERE suffix ~ '^[0-9]{1,32}$'
  `;
  return stem + row.next.padStart(4, "0");
}

/** Génère le prochain numéro de ticket (pattern ex: TK-[YEAR]-[SEQ:4] ou OT-[YEAR]-[SEQ:4]). */
export async function generateTicketReference(
  domainId: string,
  patternPrefix: string
): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${patternPrefix}-${year}-`;
  const existing = await prisma.ticket.findMany({
    where: { domainId, reference: { startsWith: pattern } },
    orderBy: { reference: "desc" },
    take: 1,
    select: { reference: true },
  });
  const lastSeq = existing[0]?.reference
    ? parseInt(existing[0].reference.slice(pattern.length), 10) || 0
    : 0;
  return `${pattern}${String(lastSeq + 1).padStart(4, "0")}`;
}

/** Génère le prochain numéro de mise à disposition (pattern ex: MAD-[YEAR]-[SEQ:4]). */
export async function generateAssignmentReference(
  domainId: string,
  patternPrefix: string
): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${patternPrefix}-${year}-`;
  const existing = await prisma.assignment.findMany({
    where: { domainId, reference: { startsWith: pattern } },
    orderBy: { reference: "desc" },
    take: 1,
    select: { reference: true },
  });
  const lastSeq = existing[0]?.reference
    ? parseInt(existing[0].reference.slice(pattern.length), 10) || 0
    : 0;
  return `${pattern}${String(lastSeq + 1).padStart(4, "0")}`;
}

/** Génère le prochain numéro de demande de changement (ex: CHG-2026-0001). */
export async function generateChangeReference(domainId: string): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `CHG-${year}-`;
  const existing = await prisma.changeRequest.findMany({
    where: { domainId, reference: { startsWith: pattern } },
    orderBy: { reference: "desc" },
    take: 1,
    select: { reference: true },
  });
  const lastSeq = existing[0]?.reference
    ? parseInt(existing[0].reference.slice(pattern.length), 10) || 0
    : 0;
  return `${pattern}${String(lastSeq + 1).padStart(4, "0")}`;
}
