import { NextResponse } from "next/server";
import { hasWriteRole, canApproveChange } from "@/lib/auth";

/**
 * Garde de rôle pour les routes asset-manager.
 *
 * Le module est mono-tenant : les actifs appartiennent à l'org, pas à un
 * utilisateur. La protection est donc un contrôle de rôle vertical, pas un
 * filtrage par ownership.
 *
 * Politique :
 *  - GET (lecture)            → tout utilisateur authentifié (pas de garde ici)
 *  - POST/PUT/DELETE (mutation) → OWNER/ADMIN uniquement (`requireWriteRole`)
 *  - changes approve/reject    → OWNER/ADMIN uniquement (`requireApproveRole`)
 */

/**
 * Retourne une réponse 403 si l'utilisateur n'a pas le droit d'écriture,
 * sinon `null` (la route continue).
 *
 * À appeler APRÈS la garde 401 (`getSessionOrTestUser`), avec l'utilisateur résolu.
 */
export function requireWriteRole(user: { role?: string } | null | undefined): NextResponse | null {
  if (hasWriteRole(user)) return null;
  return NextResponse.json(
    { error: "Action réservée aux administrateurs." },
    { status: 403 },
  );
}

/**
 * Retourne une réponse 403 si l'utilisateur n'a pas le droit d'approuver/rejeter
 * une change request (workflow CAB), sinon `null`.
 */
export function requireApproveRole(user: { role?: string } | null | undefined): NextResponse | null {
  if (canApproveChange(user)) return null;
  return NextResponse.json(
    { error: "Approbation CAB réservée aux administrateurs." },
    { status: 403 },
  );
}
