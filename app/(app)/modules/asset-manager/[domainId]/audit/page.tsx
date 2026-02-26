"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Spinner, Selectbox, Button } from "@/components/bpm";

type AuditEntry = {
  id: string;
  domainId: string | null;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  beforeState: string | null;
  afterState: string | null;
  changedFields: string[];
  timestamp: string;
};

const ACTION_LABELS: Record<string, string> = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  login: "Connexion",
  export: "Export",
};
const RESOURCE_LABELS: Record<string, string> = {
  asset: "Actif",
  ticket: "Ticket",
  change: "Changement",
  contract: "Contrat",
  assignment: "MAD",
};

export default function AssetManagerAuditPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    if (!domainId) return;
    setLoading(true);
    const sp = new URLSearchParams({ domainId, limit: "100" });
    if (filterType) sp.set("resourceType", filterType);
    if (filterAction) sp.set("action", filterAction);
    fetch(`/api/asset-manager/audit-log?${sp}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [domainId, filterType, filterAction]);

  const typeOptions = [
    { value: "", label: "Tous les types" },
    ...Object.entries(RESOURCE_LABELS).map(([id, label]) => ({ value: id, label })),
  ];
  const actionOptions = [
    { value: "", label: "Toutes actions" },
    ...Object.entries(ACTION_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  if (!domainId) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Domaine requis" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> → Journal d&apos;audit
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Journal d&apos;audit
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Historique des actions sur les actifs, tickets, contrats et changements.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Selectbox
          label="Type de ressource"
          value={filterType}
          onChange={(v) => setFilterType(String(v))}
          options={typeOptions}
        />
        <Selectbox
          label="Action"
          value={filterAction}
          onChange={(v) => setFilterAction(String(v))}
          options={actionOptions}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : (
        <Panel variant="info" title={`${logs.length} entrée(s)`}>
          {logs.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune entrée d&apos;audit pour ce domaine.</p>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-wrap items-center gap-3 py-2 px-3 rounded border text-sm"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
                >
                  <span className="text-xs tabular-nums" style={{ color: "var(--bpm-text-secondary)", minWidth: "140px" }}>
                    {new Date(log.timestamp).toLocaleString("fr-FR")}
                  </span>
                  <span className="font-medium">{log.userId}</span>
                  <span className="rounded px-2 py-0.5 text-xs" style={{ background: "var(--bpm-bg)", color: "var(--bpm-text-primary)" }}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                  <span style={{ color: "var(--bpm-text-secondary)" }}>{RESOURCE_LABELS[log.resourceType] ?? log.resourceType}</span>
                  {log.resourceId && (
                    <Link
                      href={
                        log.resourceType === "asset"
                          ? `/modules/asset-manager/${domainId}/assets/${log.resourceId}`
                          : log.resourceType === "ticket"
                            ? `/modules/asset-manager/${domainId}/tickets/${log.resourceId}`
                            : log.resourceType === "change"
                              ? `/modules/asset-manager/${domainId}/changes/${log.resourceId}`
                              : "#"
                      }
                      className="hover:underline"
                      style={{ color: "var(--bpm-accent-cyan)" }}
                    >
                      {log.resourceId.slice(0, 12)}…
                    </Link>
                  )}
                  {log.changedFields?.length > 0 && (
                    <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                      Champs : {log.changedFields.join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Tableau de bord</Link>
      </nav>
    </div>
  );
}
