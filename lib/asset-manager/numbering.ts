import { Prisma } from "@prisma/client";

/** Reserve a generated inventory number until the enclosing insert commits. */
export async function generateAssetReference(tx: Prisma.TransactionClient, type: string, prefix: string) {
  const stem = `${prefix}-${type}-${new Date().getFullYear()}-`;
  return nextInventoryReference(tx, "Asset", stem);
}

export async function nextInventoryReference(tx: Prisma.TransactionClient, table: "Asset" | "Assignment" | "Ticket" | "ChangeRequest", stem: string) {
  const source = { Asset: Prisma.sql`"Asset"`, Assignment: Prisma.sql`"Assignment"`, Ticket: Prisma.sql`"Ticket"`, ChangeRequest: Prisma.sql`"ChangeRequest"` }[table];
  await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${stem}, 0))`;
  const [row] = await tx.$queryRaw<{ next: string }[]>`
    SELECT (COALESCE(MAX(suffix::numeric), 0) + 1)::text AS next
    FROM (SELECT substring(reference FROM char_length(${stem}::text) + 1) AS suffix
          FROM ${source} WHERE starts_with(reference, ${stem})) AS numbered
    WHERE suffix ~ '^[0-9]{1,32}$'
  `;
  return stem + row.next.padStart(4, "0");
}
