import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export async function getCurrentOrganization(session: Session | null) {
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orgMemberships: {
        include: { organization: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
  return user?.orgMemberships[0]?.organization ?? null;
}

export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.orgMember.findMany({
    where: { userId },
    include: { organization: { include: { workspaces: true } } },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => m.organization);
}

export async function assertOrganizationAccess(
  session: Session | null,
  organizationId: string
): Promise<void> {
  if (!session?.user?.email) throw new Error("401");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orgMemberships: { where: { organizationId } },
    },
  });
  if (!user?.orgMemberships.length) throw new Error("403");
}

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: { workspaces: true },
  });
}
