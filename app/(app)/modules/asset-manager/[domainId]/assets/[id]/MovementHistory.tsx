"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, EmptyState, Input, Metric, Selectbox, Spinner } from "@/components/bpm";
import { FicheSectionCard } from "@/components/fiche";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../../strings";
import { readResponse } from "../../../lib/read-response";

type Movement = {
  id: string; revision: number; movementType: string; date: string; reason?: string; notes?: string;
  fromLocationId?: string; toLocationId?: string;
};
function draft(row?: Movement) {
  return { movementType: row?.movementType ?? "deployment", date: row?.date.slice(0, 10) ?? new Date().toLocaleDateString("sv-SE"),
    fromLocationId: row?.fromLocationId ?? "", toLocationId: row?.toLocationId ?? "", reason: row?.reason ?? "", notes: row?.notes ?? "" };
}
function edits(row: Movement, values: ReturnType<typeof draft>) {
  const original = draft(row);
  return Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== original[key]));
}
type Props = { assetId: string; domainId: string; onAssetChange: (asset: Awaited<ReturnType<typeof readResponse>>) => void };

export function MovementHistory({ assetId, domainId, onAssetChange }: Props) {
  const { locale } = useI18n();
  const t = STR[locale];
  const ta = t.assets;
  const endpoint = "/api/asset-manager/movements";
  const [rows, setRows] = useState<Movement[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<{ row?: Movement; key: string } | null>(null);
  const [values, setValues] = useState(() => draft());
  const [conflict, setConflict] = useState(false);
  const load = useCallback(async () => {
    const url = endpoint + "?" + new URLSearchParams({ assetId, domainId });
    const response = await fetch(url);
    const data = await readResponse(response);
    setRows(data); setCanEdit(response.headers.get("X-Can-Edit") === "true");
  }, [assetId, domainId]);
  useEffect(() => { load().catch(err => setError(err.message)).finally(() => setLoading(false)); }, [load]);
  const refresh = async () => {
    await load();
    onAssetChange(await fetch("/api/asset-manager/assets/" + assetId).then(readResponse));
  };
  function open(row?: Movement) {
    setEditor({ row, key: crypto.randomUUID() }); setValues(draft(row)); setError(""); setConflict(false);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editor || busy || conflict) return;
    setBusy(true); setError("");
    try {
      const { row, key } = editor;
      const patch = row ? edits(row, values) : values;
      if (row && Object.keys(patch).length === 0) { setEditor(null); return; }
      const response = await fetch(row ? endpoint + "/" + row.id : endpoint, {
        method: row ? "PUT" : "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({ ...patch, assetId, revision: row?.revision }),
      });
      if (row && response.status === 409) { setConflict(true); await load(); }
      await readResponse(response);
      setEditor(null); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }
  async function remove(row: Movement) {
    if (busy || !window.confirm(locale === "fr" ? "Supprimer ce mouvement ?" : "Delete this movement?")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint + "/" + row.id + "?revision=" + row.revision, { method: "DELETE" });
      if (response.status === 409) await load();
      await readResponse(response); setEditor(null); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }
  const latest = editor?.row && rows.find(row => row.id === editor.row.id);
  return <FicheSectionCard title={ta.sectionMovements} className="mt-4">
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <Metric label={ta.metricMovements} value={rows.length} border={false} />
      {canEdit && <Button size="small" variant="outline" disabled={busy} onClick={() => editor ? setEditor(null) : open()}>{editor ? ta.cancel : ta.addMovement}</Button>}
    </div>
    {error && <p role="alert">{error}</p>}
    {editor && <Card variant="outlined" className="mb-4"><div className="bpm-card-body p-4">
      <h4 className="text-sm font-semibold mb-3">{editor.row ? t.common.edit : ta.newMovement}</h4>
      <form onSubmit={save}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Selectbox label={ta.fieldType} value={values.movementType} onChange={v => setValues({ ...values, movementType: String(v) })}
            options={Object.entries(ta.movementTypes).map(([value, label]) => ({ value, label }))} />
          <Input label={ta.fieldDate} type="date" value={values.date} onChange={date => setValues({ ...values, date })} required />
          <Input label={locale === "fr" ? "Lieu de départ" : "From location"} value={values.fromLocationId} onChange={fromLocationId => setValues({ ...values, fromLocationId })} />
          <Input label={locale === "fr" ? "Lieu d’arrivée" : "To location"} value={values.toLocationId} onChange={toLocationId => setValues({ ...values, toLocationId })} />
        </div>
        <Input label={ta.fieldReasonOptional} value={values.reason} onChange={reason => setValues({ ...values, reason })} placeholder={ta.placeholderReason} />
        <label className="block mt-3">{ta.fieldNotesOptional}<textarea rows={2} className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
          value={values.notes} onChange={e => setValues({ ...values, notes: e.target.value })} placeholder={ta.placeholderComment} /></label>
        {conflict && latest && <Button type="button" variant="outline" onClick={() => {
          setValues({ ...draft(latest), ...edits(editor.row, values) });
          setEditor({ ...editor, row: latest }); setConflict(false); setError("");
        }}>{locale === "fr" ? "Reprendre ma saisie" : "Keep my draft"}</Button>}
        <div className="mt-6"><Button type="submit" size="medium" disabled={busy || conflict}>{busy ? ta.saving : ta.saveMovement}</Button></div>
      </form>
    </div></Card>}
    {loading ? <Spinner size="small" /> : rows.length === 0 ? <EmptyState title={ta.emptyMovementsTitle} description={ta.emptyMovementsDescription}
      action={canEdit && <Button size="small" variant="outline" onClick={() => open()}>{ta.addMovement}</Button>} /> :
      <ul className="space-y-2">{rows.map(row => <li key={row.id} className="flex flex-wrap items-baseline gap-2 py-2 border-b border-[var(--bpm-border)] last:border-0 text-sm">
        <span className="font-medium">{new Date(row.date).toLocaleDateString(dateLocale(locale), { timeZone: "UTC" })}</span>
        <Badge variant="primary">{ta.movementTypes[row.movementType] ?? row.movementType}</Badge>
        {(row.fromLocationId || row.toLocationId) && <span>{row.fromLocationId || "—"} → {row.toLocationId || "—"}</span>}
        {row.reason && <span>{row.reason}</span>}{row.notes && <span>{row.notes}</span>}
        {canEdit && <><Button size="small" variant="outline" disabled={busy} onClick={() => open(row)}>{t.common.edit}</Button>
          <Button size="small" variant="outline" disabled={busy} onClick={() => remove(row)}>{t.common.delete}</Button></>}
      </li>)}</ul>}
  </FicheSectionCard>;
}
