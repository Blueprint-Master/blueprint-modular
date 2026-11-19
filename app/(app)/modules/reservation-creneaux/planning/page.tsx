import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { firstPlanningDay } from "@/lib/reservations/planning";
import Planning from "./planning";

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
  const session = await getPersonalModuleSession();
  const memberships = session ? await prisma.orgMember.findMany({
    where: { userId: session.user.id }, select: { organization: { select: { id: true, name: true } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  }) : [];
  return <Planning organizations={memberships.map(m => m.organization)} signedIn={Boolean(session)} initialDay={firstPlanningDay()} />;
}
