"use client";

import { useEffect, useState } from "react";
import { Button, ConfirmModal } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const kinds = ["commentaire", "annotation", "décision", "blocage"] as const;
type Kind = typeof kinds[number];
type Item = { id: string; parentId: string | null; authorId: string; authorName?: string; createdAt: string;
  content: string; kind: Kind; resolved: boolean; deleted: boolean; revision: number };

export function ArticleComments({ slug, userId }: { slug: string; userId?: string }) {
  const { locale } = useI18n();
  const fr = locale === "fr";
  const label = (a: string, b: string) => fr ? a : b;
  const kindName = (k: Kind) => fr ? k : ({ commentaire: "comment", annotation: "annotation", décision: "decision", blocage: "blocker" })[k];
  const [items, setItems] = useState<Item[]>([]);
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<Kind>("commentaire");
  const [parent, setParent] = useState<Item | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [removing, setRemoving] = useState<Item | null>(null);
  const [requestId, setRequestId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const url = "/api/wiki/" + encodeURIComponent(slug) + "/comments";

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    fetch(url, { signal: controller.signal, cache: "no-store" }).then(async r => {
      if (!r.ok) throw Error();
      const rows: Item[] = await r.json();
      if (!controller.signal.aborted) setItems(rows);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [url, counter]);

  function clear() {
    setEditing(null); setParent(null); setDraft(""); setRequestId(""); setKind("commentaire");
  }

  async function mutate(method: string, body: object, clearDraft = false) {
    if (busy) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (response.ok) {
        if (clearDraft) clear();
        setRemoving(null);
      } else if (response.status === 409) {
        setNotice(label("Le commentaire a changé. Relisez sa dernière version avant de reprendre la modification.", "The comment changed. Review its latest version before editing again."));
      } else throw Error();
    } catch {
      setNotice(label("L’opération n’a pas pu être confirmée. Vérifiez le fil puis réessayez.", "The operation could not be confirmed. Check the thread and try again."));
    } finally {
      setCounter(n => n + 1); setBusy(false);
    }
  }
  function submit() {
    if (!draft.trim() || busy) return;
    if (editing) void mutate("PATCH", { id: editing.id, revision: editing.revision, content: draft }, true);
    else {
      const key = requestId || crypto.randomUUID();
      setRequestId(key);
      void mutate("POST", { content: draft, kind, parentId: parent?.id ?? null, requestId: key }, true);
    }
  }
  const authors = new Map(items.map(c => [c.id, c.authorName]));
  const occupied = busy || Boolean(draft || editing || parent);
  return <section className="mt-8">
    <h2 className="text-lg font-semibold mb-2">{label("Commentaires", "Comments")}</h2>
    {notice && <p role="alert">{notice}</p>}
    {loading && <p role="status">{label("Chargement…", "Loading…")}</p>}
    {failed && <p role="alert">{label("Impossible de charger le fil.", "Could not load the thread.")} <Button onClick={() => setCounter(n => n + 1)}>{label("Réessayer", "Retry")}</Button></p>}
    <ul className="space-y-3 mb-4">{items.map(c => <li key={c.id} className="text-sm p-3 rounded border"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
      {c.parentId && <a className="underline" href={"#comment-" + c.parentId}>{label("En réponse à", "In reply to")} {authors.get(c.parentId) || label("Anonyme", "Anonymous")}</a>}
      <p id={"comment-" + c.id} className="m-0 whitespace-pre-wrap">{c.deleted ? label("Commentaire supprimé", "Deleted comment") : c.content}</p>
      <span className="text-xs opacity-70">{c.authorName || label("Anonyme", "Anonymous")} · {new Date(c.createdAt).toLocaleString(locale)} · {kindName(c.kind)} {c.resolved && label("· Résolu", "· Resolved")}</span>
      {userId && !c.deleted && <div className="flex gap-2 flex-wrap mt-2">
        <Button variant="ghost" size="small" disabled={occupied} onClick={() => setParent(c)}>{label("Répondre", "Reply")}</Button>
        {userId === c.authorId && <>
          <Button variant="ghost" size="small" disabled={occupied} onClick={() => { setEditing(c); setDraft(c.content); }}>{label("Modifier", "Edit")}</Button>
          <Button variant="ghost" size="small" disabled={busy} onClick={() => void mutate("PATCH", { id: c.id, revision: c.revision, resolved: !c.resolved })}>
            {c.resolved ? label("Rouvrir", "Reopen") : label("Résoudre", "Resolve")}</Button>
          <Button variant="ghost" size="small" disabled={busy} onClick={() => setRemoving(c)}>{label("Supprimer", "Delete")}</Button>
        </>}
      </div>}
    </li>)}</ul>
    {userId && <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); submit(); }}>
      {parent && <p>{label("Réponse à", "Reply to")} {parent.authorName}</p>}
      {!editing && <label>{label("Type de commentaire", "Comment type")} <select value={kind} disabled={busy} onChange={e => { setKind(e.target.value as Kind); setRequestId(""); }}>
        {kinds.map(k => <option key={k} value={k}>{kindName(k)}</option>)}</select></label>}
      <textarea aria-label={label("Texte du commentaire", "Comment text")} maxLength={10000} required rows={2} disabled={busy} value={draft}
        className="w-full px-3 py-2 rounded border text-sm" style={{ background: "var(--bpm-surface)", borderColor: "var(--bpm-border)" }}
        onChange={e => { setDraft(e.target.value); setRequestId(""); }} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submit(); } }} />
      <div className="flex gap-2">
        <Button type="submit" size="small" disabled={busy || !draft.trim()}>{editing ? label("Enregistrer", "Save") : label("Publier", "Post")}</Button>
        {occupied && <Button variant="ghost" size="small" disabled={busy} onClick={clear}>{label("Annuler", "Cancel")}</Button>}
      </div></form>}
    {removing && <ConfirmModal isOpen title={label("Supprimer ce commentaire ?", "Delete this comment?")} message={removing.content}
      isLoading={busy} onCancel={() => { if (!busy) setRemoving(null); }} onConfirm={() => void mutate("DELETE", { id: removing.id, revision: removing.revision })} />}
  </section>;
}
