// Keep historical deadlines even if the configured priority changes later.
export const openTicketStatuses = ["new", "open", "pending", "in_progress", "on_hold", "assigned"];

type TicketClock = { status: string; priorityId: string; openedAt: string | Date; slaDueAt?: string | Date | null };
export function ticketSla(ticket: TicketClock, priorities: { id: string; sla_hours?: number }[], now = Date.now()) {
  const start = new Date(ticket.openedAt).getTime();
  const hours = priorities.find(priority => priority.id === ticket.priorityId)?.sla_hours ?? 48;
  const due = ticket.slaDueAt ? new Date(ticket.slaDueAt).getTime() : start + hours * 3_600_000;
  const open = openTicketStatuses.includes(ticket.status);
  const duration = due - start;
  const percent = duration > 0 ? Math.max(0, (now - start) / duration * 100) : now >= due ? 100 : 0;
  return { open, hours: Math.max(0, duration / 3_600_000), percent, atRisk: open && percent >= 80, overdue: open && now >= due, due };
}
