// Run from the installed application using its Prisma client and database.
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { openTicketStatuses, ticketSla } from "./ticket-sla.ts";
import { getNotificationLevel } from "../notificationLevels.ts";

const routingSchema = z.object({
  domainId: z.enum(["it", "maintenance"]),
  actorId: z.string().min(1),
  workspaceId: z.string().min(1).optional(),
  targets: z.record(z.string().min(1)),
}).strict();

function receiptId(ticket, sla, level) {
  const key = [ticket.domainId, ticket.id, ticket.priorityId, ticket.openedAt, sla.due, level.after_percent, level.action, level.target_group];
  return "sla-" + createHash("sha256").update(JSON.stringify(key)).digest("hex");
}

function destination(level) {
  if (level.action === "reassign_group") return level.target_group;
  if (["notify_manager", "notify_director"].includes(level.action)) return level.action;
  throw new Error("Action d’escalade non prise en charge : " + level.action);
}

export async function runEscalations(db, routingInput, now = new Date()) {
  const routing = routingSchema.parse(routingInput);
  const config = JSON.parse(await readFile(new URL("./config/domain." + routing.domainId + ".json", import.meta.url), "utf8"));
  const rules = config.sla_escalation ?? [];
  const expectedUsers = new Set([routing.actorId]);
  for (const rule of rules) {
    for (const level of rule.levels) {
      const target = destination(level);
      if (!target || !routing.targets[target]) throw new Error("Destinataire manquant pour " + (target ?? level.action));
      expectedUsers.add(routing.targets[target]);
    }
  }
  const workspaceId = routing.workspaceId ?? null;
  const workspace = workspaceId ? await db.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { organizationId: true } }) : null;
  const users = await db.user.findMany({
    where: { id: { in: [...expectedUsers] }, ...(workspace ? { orgMemberships: { some: { organizationId: workspace.organizationId } } } : {}) },
    select: { id: true, role: true },
  });
  if (users.length !== expectedUsers.size) throw new Error("Compte de service ou destinataire introuvable dans ce périmètre.");
  const writers = new Set(users.filter(user => ["ADMIN", "OWNER"].includes(user.role)).map(user => user.id));
  if (!writers.has(routing.actorId)) throw new Error("Le compte de service doit pouvoir gérer les tickets.");
  for (const rule of rules) {
    for (const level of rule.levels) {
      if (level.action === "reassign_group" && !writers.has(routing.targets[level.target_group])) {
        throw new Error("Le technicien de permanence doit pouvoir traiter les tickets.");
      }
    }
  }

  let after;
  let checked = 0;
  let actions = 0;
  for (;;) {
    const rows = await db.ticket.findMany({
      where: { domainId: routing.domainId, workspaceId, status: { in: openTicketStatuses }, priorityId: { in: rules.map(rule => rule.priority_id) },
        ...(after ? { id: { gt: after } } : {}) },
      orderBy: { id: "asc" }, select: { id: true }, take: 100,
    });
    for (const { id } of rows) {
      checked++;
      actions += await db.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "Ticket" WHERE id = ${id} FOR UPDATE`;
        const ticket = await tx.ticket.findUnique({ where: { id } });
        if (!ticket || ticket.domainId !== routing.domainId || ticket.workspaceId !== workspaceId) return 0;
        const rule = rules.find(item => item.priority_id === ticket.priorityId);
        const sla = ticketSla(ticket, config.priorities, now.getTime());
        if (!rule || !sla.open) return 0;
        let written = 0;
        for (const level of [...rule.levels].sort((a, b) => a.after_percent - b.after_percent)) {
          if (sla.percent < level.after_percent) continue;
          const id = receiptId(ticket, sla, level);
          if (await tx.auditLog.findUnique({ where: { id }, select: { id: true } })) continue;
          const targetId = routing.targets[destination(level)];
          const type = level.after_percent >= 100 ? "error" : "warning";
          const notice = await tx.notification.create({ data: {
            userId: targetId, title: ticket.reference, message: level.message, type, level: getNotificationLevel({ type }),
          } });
          const previousAssignee = ticket.assigneeId;
          if (level.action === "reassign_group" && previousAssignee !== targetId) {
            const updatedAt = new Date(Math.max(Date.now(), ticket.updatedAt.getTime() + 1));
            await tx.ticket.update({ where: { id: ticket.id }, data: { assigneeId: targetId, updatedAt } });
            ticket.updatedAt = updatedAt;
            ticket.assigneeId = targetId;
          }
          await tx.auditLog.create({ data: {
            id, domainId: ticket.domainId, userId: routing.actorId, action: "escalate", resourceType: "ticket", resourceId: ticket.id,
            beforeState: JSON.stringify({ assigneeId: previousAssignee }),
            afterState: JSON.stringify({ action: level.action, threshold: level.after_percent, dueAt: new Date(sla.due),
              group: level.target_group, assigneeId: ticket.assigneeId, recipientId: targetId, notificationId: notice.id }),
          } });
          written++;
        }
        return written;
      });
    }
    if (rows.length < 100) break;
    after = rows.at(-1).id;
  }
  return { domainId: routing.domainId, checked, actions };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = new PrismaClient();
  try {
    if (!process.argv[2]) throw new Error("Fichier JSON de routage requis.");
    const routing = JSON.parse(await readFile(process.argv[2], "utf8"));
    process.stdout.write(JSON.stringify(await runEscalations(db, routing)) + "\n");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}
