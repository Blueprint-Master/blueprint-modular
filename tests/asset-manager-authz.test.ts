/**
 * Tests RBAC asset-manager (PR #2a — privesc verticale).
 *
 * Vérifie la politique d'autorisation :
 *  - USER          → lecture seule (pas de droit d'écriture, pas d'approbation CAB)
 *  - ADMIN / OWNER → écriture autorisée + approbation/rejet CAB autorisés
 *
 * Le module est mono-tenant : contrôle de rôle vertical, pas de filtrage par
 * ownership. On teste donc la logique de rôle pure (`lib/auth`) et les gardes
 * de route (`lib/asset-manager/authz`) qui renvoient 403 ou `null`.
 */
import { describe, it, expect } from "vitest";
import { hasWriteRole, canApproveChange, canEdit, canContributeToWiki } from "@/lib/auth";
import { requireWriteRole, requireApproveRole } from "@/lib/asset-manager/authz";

const USER = { role: "USER" };
const ADMIN = { role: "ADMIN" };
const OWNER = { role: "OWNER" };

describe("lib/auth — politique de rôle (mono-tenant)", () => {
  it("hasWriteRole : OWNER/ADMIN peuvent écrire, USER non", () => {
    expect(hasWriteRole(OWNER)).toBe(true);
    expect(hasWriteRole(ADMIN)).toBe(true);
    expect(hasWriteRole(USER)).toBe(false);
  });

  it("hasWriteRole : rôle absent/inconnu = lecture seule (conservateur)", () => {
    expect(hasWriteRole(null)).toBe(false);
    expect(hasWriteRole(undefined)).toBe(false);
    expect(hasWriteRole({})).toBe(false);
    expect(hasWriteRole({ role: "GUEST" })).toBe(false);
  });

  it("canEdit reflète hasWriteRole (n'est plus toujours true)", () => {
    expect(canEdit(OWNER)).toBe(true);
    expect(canEdit(ADMIN)).toBe(true);
    expect(canEdit(USER)).toBe(false);
  });

  it("canApproveChange (CAB) : OWNER/ADMIN seulement", () => {
    expect(canApproveChange(OWNER)).toBe(true);
    expect(canApproveChange(ADMIN)).toBe(true);
    expect(canApproveChange(USER)).toBe(false);
    expect(canApproveChange(null)).toBe(false);
  });

  it("aligné sur la politique wiki existante (canContributeToWiki)", () => {
    expect(hasWriteRole(USER)).toBe(canContributeToWiki(USER));
    expect(hasWriteRole(ADMIN)).toBe(canContributeToWiki(ADMIN));
    expect(hasWriteRole(OWNER)).toBe(canContributeToWiki(OWNER));
  });
});

describe("lib/asset-manager/authz — gardes de route", () => {
  it("requireWriteRole : USER → 403", async () => {
    const res = requireWriteRole(USER);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
    const body = await res!.json();
    expect(body.error).toBeTruthy();
  });

  it("requireWriteRole : ADMIN/OWNER → null (la route continue)", () => {
    expect(requireWriteRole(ADMIN)).toBeNull();
    expect(requireWriteRole(OWNER)).toBeNull();
  });

  it("requireWriteRole : rôle absent → 403 (défaut sûr)", () => {
    expect(requireWriteRole(null)?.status).toBe(403);
    expect(requireWriteRole({})?.status).toBe(403);
  });

  it("requireApproveRole (approve/reject CAB) : USER → 403", async () => {
    const res = requireApproveRole(USER);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("requireApproveRole : ADMIN/OWNER → null (autorisé)", () => {
    expect(requireApproveRole(ADMIN)).toBeNull();
    expect(requireApproveRole(OWNER)).toBeNull();
  });
});
