import { prisma } from "@/lib/prisma";
import { getPersonalModuleSession } from "@/lib/auth";
import TeamTasks from "./team-tasks";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await getPersonalModuleSession();
  const memberships = session ? await prisma.orgMember.findMany({ where: { userId: session.user.id },
    select: { role: true, organization: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } }) : [];
  return <TeamTasks userId={session?.user.id} organizations={memberships.map(m => ({ ...m.organization, role: m.role }))} />;
}
