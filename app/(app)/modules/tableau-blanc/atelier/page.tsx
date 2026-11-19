import { prisma } from "@/lib/prisma";
import { getPersonalModuleSession } from "@/lib/auth";
import Workshop from "./workshop";

export const dynamic = "force-dynamic";

export default async function WorkshopPage() {
  const session = await getPersonalModuleSession();
  const memberships = session ? await prisma.orgMember.findMany({
    where: { userId: session.user.id }, select: { organization: { select: { id: true, name: true } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  }) : [];
  return <Workshop signedIn={Boolean(session)} organizations={memberships.map(m => m.organization)} />;
}
