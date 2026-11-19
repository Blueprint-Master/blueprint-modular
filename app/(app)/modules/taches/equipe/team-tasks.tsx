"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, ConfirmModal, Input, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { formatDateKey } from "@/lib/calendar/civil-days";

type Org = { id: string; name: string; role: string };
type Draft = { title: string; due: string; priority: "normal" | "low" | "high"; assigneeId: string };
type Task = Draft & { id: string; creatorId: string; status: "todo" | "doing" | "done"; revision: number };
type Event = { revision: number; actorName: string; action: "create" | "edit" | "advance" | "remove"; createdAt: string };
const translations = {
  fr: { title: "Tâches de l’équipe", login: "Se connecter", noOrg: "Ce compte doit appartenir à une organisation.", organization: "Organisation", add: "Créer une tâche", save: "Enregistrer", titleLabel: "Intitulé", due: "Échéance", person: "Responsable", priority: "Priorité", normal: "Normale", low: "Basse", high: "Haute", todo: "À faire", doing: "En cours", done: "Terminée", start: "Démarrer", finish: "Terminer", edit: "Modifier", remove: "Retirer", cancel: "Annuler", confirm: "Retirer cette tâche ?", empty: "Aucune tâche dans cette équipe.", error: "L’opération a échoué.", conflict: "Une autre personne a modifié cette tâche. Relisez la fiche avant de réessayer.", late: "En retard", history: "Historique", create: "Création", advance: "Changement de statut" },
  en: { title: "Team tasks", login: "Sign in", noOrg: "This account needs an organization.", organization: "Organization", add: "Create task", save: "Save", titleLabel: "Title", due: "Due date", person: "Assignee", priority: "Priority", normal: "Normal", low: "Low", high: "High", todo: "To do", doing: "In progress", done: "Done", start: "Start", finish: "Finish", edit: "Edit", remove: "Remove", cancel: "Cancel", confirm: "Remove this task?", empty: "No tasks in this team.", error: "The operation failed.", conflict: "Another person changed the task. Review it before trying again.", late: "Overdue", history: "History", create: "Created", advance: "Status change" },
};

function Board({ org, userId }: { org: Org; userId: string }) {
  const { locale } = useI18n();
  const t = translations[locale];
  const empty: Draft = { title: "", due: "", priority: "normal", assigneeId: userId };
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<{id: string; name: string}[]>([]);
  const [draft, setDraft] = useState(empty);
  const [editing, setEditing] = useState<Task | null>(null);
  const [removing, setRemoving] = useState<Task | null>(null);
  const [history, setHistory] = useState<{ title: string; events: Event[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestId, setRequestId] = useState("");
  const endpoint = "/api/team-tasks/" + encodeURIComponent(org.id);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(endpoint, { signal });
    if (!response.ok) throw new Error();
    const result = await response.json();
    if (signal?.aborted) return;
    setTasks(result.tasks);
    setMembers(result.members);
  }, [endpoint]);
  useEffect(() => {
    const abort = new AbortController();
    refresh(abort.signal).catch(() => { if (!abort.signal.aborted) setError(t.error); });
    return () => abort.abort();
  }, [refresh, t.error]);

  async function submit(method: string, data: unknown) {
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (response.status === 409) { await refresh(); setError(t.conflict); return false; }
      if (!response.ok) throw new Error();
      await refresh();
      setHistory(null);
      return true;
    } catch { setError(t.error); return false; }
    finally { setBusy(false); }
  }
  async function showHistory(id: string) {
    try {
      const r = await fetch(endpoint + "?history=" + encodeURIComponent(id));
      if (!r.ok) throw new Error();
      setHistory(await r.json());
    } catch { setError(t.error); }
  }
  return <>
    <Card title={editing ? t.edit : t.add}>
      <form className="space-y-3" onSubmit={async event => {
        event.preventDefault();
        const id = editing?.id || requestId || crypto.randomUUID();
        if (!editing) setRequestId(id);
        const ok = await submit(editing ? "PATCH" : "POST", { ...draft, id, ...(editing && { revision: editing.revision, action: "edit" }) });
        if (ok) { setDraft(empty); setEditing(null); setRequestId(""); }
      }}>
        <Input label={t.titleLabel} value={draft.title} onChange={title => setDraft({ ...draft, title })} />
        <Input type="date" label={t.due} value={draft.due} onChange={due => setDraft({ ...draft, due })} />
        <Selectbox label={t.person} options={members.map(m => ({ value: m.id, label: m.name }))} value={draft.assigneeId} onChange={value => setDraft({ ...draft, assigneeId: value || "" })} />
        <Selectbox label={t.priority} options={["low", "normal", "high"].map(v => ({ value: v, label: t[v as Draft["priority"]] }))} value={draft.priority} onChange={v => setDraft({ ...draft, priority: v as Draft["priority"] })} />
        <Button type="submit" disabled={busy || !draft.title.trim() || !draft.due || !members.length}>{editing ? t.save : t.add}</Button>
        {editing && <Button type="button" onClick={() => { setEditing(null); setDraft(empty); }}>{t.cancel}</Button>}
      </form>
    </Card>
    {error && <p role="alert">{error}</p>}
    {!!members.length && !tasks.length && <p>{t.empty}</p>}
    {tasks.map(task => {
      const manage = task.creatorId === userId || ["admin", "owner"].includes(org.role);
      return <Card key={task.id} title={task.title}>
        <p>{members.find(m => m.id === task.assigneeId)?.name ?? "—"} · {task.due.slice(0,10)} · {t[task.priority]} · {t[task.status]}</p>
        {task.due.slice(0,10) < formatDateKey(new Date()) && task.status !== "done" && <strong>{t.late}</strong>}
        {(manage || task.assigneeId === userId) && task.status !== "done" && <Button disabled={busy} onClick={() => submit("PATCH", { id: task.id, revision: task.revision, action: "advance" })}>{task.status === "todo" ? t.start : t.finish}</Button>}
        {manage && <><Button disabled={busy} onClick={() => { setEditing(task); setDraft({ title: task.title, due: task.due.slice(0,10), assigneeId: task.assigneeId, priority: task.priority }); }}>{t.edit}</Button>
          <Button disabled={busy} onClick={() => setRemoving(task)}>{t.remove}</Button></>}
        <Button onClick={() => showHistory(task.id)}>{t.history}</Button>
      </Card>;
    })}
    {history && <Card title={history.title}><ol>{history.events.map(e => <li key={e.revision}>{new Date(e.createdAt).toLocaleString(locale)} · {e.actorName} · {t[e.action]}</li>)}</ol></Card>}
    <ConfirmModal isOpen={Boolean(removing)} title={t.confirm} message={removing?.title ?? ""} confirmLabel={t.remove} cancelLabel={t.cancel}
      onConfirm={async () => { if (removing) await submit("PATCH", { id: removing.id, revision: removing.revision, action: "remove" }); setRemoving(null); }} onCancel={() => setRemoving(null)} />
  </>;
}

export default function TeamTasks({ organizations, userId }: { organizations: Org[]; userId?: string }) {
  const { locale } = useI18n();
  const t = translations[locale];
  const [selected, setSelected] = useState(organizations[0]?.id);
  const org = organizations.find(o => o.id === selected);
  return <div className="doc-page space-y-4"><h1>{t.title}</h1>
    {!userId ? <Link href="/login?callbackUrl=%2Fmodules%2Ftaches%2Fequipe">{t.login}</Link>
      : !org ? <p>{t.noOrg}</p> : <>
        <Selectbox label={t.organization} options={organizations.map(o => ({ value: o.id, label: o.name }))} value={org.id} onChange={v => setSelected(v ?? undefined)} />
        <Board key={org.id} org={org} userId={userId} />
      </>}
  </div>;
}
