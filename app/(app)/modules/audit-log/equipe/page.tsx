import { readTeamAudit } from "@/lib/team-tasks/audit";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPersonalModuleSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function TeamAudit({ searchParams }: { searchParams: Promise<{ org?: string; before?: string }> }) {
  const session = await getPersonalModuleSession();
  const en = await getLocale() === "en";
  const title = en ? "Team task history" : "Journal des tâches de l’équipe";
  if (!session) return <div className="doc-page"><h1>{title}</h1><Link href="/login?callbackUrl=%2Fmodules%2Faudit-log%2Fequipe">{en ? "Sign in" : "Se connecter"}</Link></div>;
  const organizations = await prisma.organization.findMany({ where: { members: { some: { userId: session.user.id } } },
    select: { id: true, name: true }, orderBy: { name: "asc" } });
  const query = await searchParams;
  const org = query.org ? organizations.find(o => o.id === query.org) : organizations[0];
  const page = org ? await readTeamAudit(prisma, org.id, session.user.id, query.before) : null;
  const events = page?.events ?? [];
  const labels: Record<string,string> = en ? { create: "Created", edit: "Edited", advance: "Status changed", remove: "Removed" }
    : { create: "Création", edit: "Modification", advance: "Changement de statut", remove: "Retrait" };
  return <div className="doc-page space-y-4"><h1>{title}</h1>
    <nav className="flex gap-3">{organizations.map(o => <Link key={o.id} aria-current={o.id === org?.id ? "page" : undefined} href={`?org=${o.id}`}>{o.name}</Link>)}</nav>
    {!events.length && <p>{en ? "No events available." : "Aucun événement disponible."}</p>}
    <ol>{events.map(e => <li key={e.id} className="mb-3">
      <strong>{e.task.title}</strong> · {labels[e.action]} · {e.actorName} · {e.createdAt.toISOString()}
      <details><summary>{en ? "Recorded values" : "Valeurs enregistrées"}</summary><pre>{JSON.stringify(e.details, null, 2)}</pre></details>
    </li>)}</ol>
    {org && page?.before && <Link href={`?org=${org.id}&before=${page.before}`}>{en ? "Older events" : "Événements précédents"}</Link>}
  </div>;
}
