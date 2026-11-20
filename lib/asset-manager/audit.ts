import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditParams = {
  domainId?: string | null;
  userId: string;
  action: "create" | "update" | "delete" | "login" | "export";
  resourceType: string;
  resourceId?: string | null;
  beforeState?: unknown;
  afterState?: unknown;
  changedFields?: string[];
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function writeAuditLog(params: AuditParams, db: Prisma.TransactionClient = prisma): Promise<void> {
  await db.auditLog.create({
      data: {
        domainId: params.domainId ?? null,
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId ?? null,
        beforeState: params.beforeState != null ? JSON.stringify(params.beforeState) : null,
        afterState: params.afterState != null ? JSON.stringify(params.afterState) : null,
        changedFields: params.changedFields ?? [],
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
  });
}

export function getClientIpAndAgent(request: Request): { ipAddress: string | null; userAgent: string | null } {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? null;
  const ua = request.headers.get("user-agent") ?? null;
  return { ipAddress: ip, userAgent: ua };
}
