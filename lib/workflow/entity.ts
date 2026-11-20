import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isWorkflowStatus, nextStatus, type WorkflowStatus } from "./transitions";

export async function readWorkflow(userId: string, entityId: string) {
  const rows = await prisma.workflowTransition.findMany({
    where: { userId, entityId },
    orderBy: { revision: "asc" },
    select: { revision: true, fromState: true, toState: true, userId: true, createdAt: true },
  });
  let status: WorkflowStatus = "brouillon";
  const history = [];
  for (const { revision, fromState, toState, userId: who, createdAt: when } of rows) {
    if (revision !== history.length + 1 || fromState !== status || !isWorkflowStatus(toState) || toState !== nextStatus[status]) {
      throw new Error("Invalid workflow history");
    }
    history.push({ revision, from: fromState, to: toState, who, when });
    status = toState;
  }
  return { entityId, status, revision: history.length, history };
}

export async function advanceWorkflow(userId: string, entityId: string, revision: number, to: WorkflowStatus) {
  const current = await readWorkflow(userId, entityId);
  if (current.revision !== revision || nextStatus[current.status] !== to) return null;
  // This insert is both the change of state and its audit record. The primary key
  // admits only one winner when two clients act on the same revision.
  try {
    const event = await prisma.workflowTransition.create({
      data: { userId, entityId, revision: revision + 1, fromState: current.status, toState: to },
      select: { createdAt: true },
    });
    return {
      entityId, status: to, revision: revision + 1,
      history: [...current.history, { revision: revision + 1, from: current.status, to, who: userId, when: event.createdAt }],
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return null;
    throw error;
  }
}
