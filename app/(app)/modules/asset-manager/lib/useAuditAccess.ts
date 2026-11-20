"use client";

import { useSession } from "next-auth/react";
import { hasWriteRole } from "@/lib/auth/roles";

export function useAuditAccess() {
  const { data } = useSession();
  return hasWriteRole(data?.user as { role?: string } | undefined);
}
