/** Default administrative write access for a single-tenant installation. */
export function hasWriteRole(user: { role?: string } | null | undefined): boolean {
  return user?.role === "OWNER" || user?.role === "ADMIN";
}
