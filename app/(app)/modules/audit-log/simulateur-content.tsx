"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  type BadgeVariant,
  Button,
  Chip,
  Drawer,
  Input,
  JsonViewer,
  Metric,
  MetricRow,
  Pagination,
  Panel,
  Selectbox,
  Table,
  useToast,
} from "@/components/bpm";

type ActionType = "creation" | "modification" | "suppression" | "connexion";

interface AuditEvent {
  id: string;
  /** Horodatage ISO figé (jamais dérivé de l'horloge — rendu déterministe). */
  timestamp: string;
  acteur: string;
  acteurId: string;
  action: ActionType;
  entite: string;
  detail: string;
  ip: string;
  source: string;
}

const ACTION_META: Record<ActionType, { label: string; variant: BadgeVariant }> = {
  creation: { label: "Création", variant: "success" },
  modification: { label: "Modification", variant: "primary" },
  suppression: { label: "Suppression", variant: "error" },
  connexion: { label: "Connexion", variant: "default" },
};

/**
 * Jeu de démonstration : 32 événements littéraux, timestamps ISO figés répartis
 * sur 10 jours (3 → 12 juin 2026), triés du plus récent au plus ancien.
 * Aucune horloge n'est consultée au render : tout est déterministe.
 */
const EVENTS: AuditEvent[] = [
  { id: "EVT-1032", timestamp: "2026-06-12T17:40:00", acteur: "Alice Martin", acteurId: "a.martin", action: "modification", entite: "Devis DV-2026-104", detail: "statut : brouillon → validé", ip: "10.20.4.18", source: "Interface web" },
  { id: "EVT-1031", timestamp: "2026-06-12T16:55:00", acteur: "Service API", acteurId: "svc-api", action: "creation", entite: "Facture F-2026-0291", detail: "facture générée depuis le devis DV-2026-104", ip: "10.0.8.3", source: "API" },
  { id: "EVT-1030", timestamp: "2026-06-12T14:32:00", acteur: "Bob Durand", acteurId: "b.durand", action: "suppression", entite: "Article wiki « Ancien process achats »", detail: "archive conservée 30 jours avant purge définitive", ip: "10.20.4.27", source: "Interface web" },
  { id: "EVT-1029", timestamp: "2026-06-12T09:05:00", acteur: "Claire Petit", acteurId: "c.petit", action: "connexion", entite: "Session utilisateur c.petit", detail: "authentification SSO réussie (2 facteurs)", ip: "92.154.18.40", source: "Interface web" },
  { id: "EVT-1028", timestamp: "2026-06-12T08:58:00", acteur: "Alice Martin", acteurId: "a.martin", action: "connexion", entite: "Session utilisateur a.martin", detail: "authentification par mot de passe réussie", ip: "10.20.4.18", source: "Interface web" },
  { id: "EVT-1027", timestamp: "2026-06-11T18:20:00", acteur: "Système", acteurId: "system", action: "modification", entite: "Export « Ventes hebdo »", detail: "prochaine exécution recalculée : lundi 08:00", ip: "127.0.0.1", source: "Tâche planifiée" },
  { id: "EVT-1026", timestamp: "2026-06-11T17:02:00", acteur: "Claire Petit", acteurId: "c.petit", action: "modification", entite: "Contrat C-2024-018", detail: "date de fin : 31/12/2026 → 30/06/2027", ip: "92.154.18.40", source: "Interface web" },
  { id: "EVT-1025", timestamp: "2026-06-11T15:44:00", acteur: "Bob Durand", acteurId: "b.durand", action: "creation", entite: "Article wiki « Onboarding »", detail: "première version publiée (v1)", ip: "10.20.4.27", source: "Interface web" },
  { id: "EVT-1024", timestamp: "2026-06-11T11:12:00", acteur: "Service API", acteurId: "svc-api", action: "modification", entite: "Client ACME SAS", detail: "adresse de facturation synchronisée depuis le CRM", ip: "10.0.8.3", source: "API" },
  { id: "EVT-1023", timestamp: "2026-06-11T08:47:00", acteur: "Bob Durand", acteurId: "b.durand", action: "connexion", entite: "Session utilisateur b.durand", detail: "authentification SSO réussie", ip: "10.20.4.27", source: "Interface web" },
  { id: "EVT-1022", timestamp: "2026-06-10T19:30:00", acteur: "Système", acteurId: "system", action: "suppression", entite: "Export « Stocks (obsolète) »", detail: "purge automatique : planification inactive depuis 90 jours", ip: "127.0.0.1", source: "Tâche planifiée" },
  { id: "EVT-1021", timestamp: "2026-06-10T16:21:00", acteur: "Alice Martin", acteurId: "a.martin", action: "modification", entite: "Utilisateur j.dupont", detail: "rôle : Lecture seule → Comptabilité", ip: "10.20.4.18", source: "Interface web" },
  { id: "EVT-1020", timestamp: "2026-06-10T14:05:00", acteur: "Claire Petit", acteurId: "c.petit", action: "creation", entite: "Devis DV-2026-104", detail: "devis créé pour ACME SAS (12 400 € HT)", ip: "92.154.18.40", source: "Interface web" },
  { id: "EVT-1019", timestamp: "2026-06-10T10:38:00", acteur: "Service API", acteurId: "svc-api", action: "connexion", entite: "Jeton API « integration-erp »", detail: "jeton renouvelé, validité 24 h", ip: "10.0.8.3", source: "API" },
  { id: "EVT-1018", timestamp: "2026-06-10T08:51:00", acteur: "Claire Petit", acteurId: "c.petit", action: "connexion", entite: "Session utilisateur c.petit", detail: "authentification SSO réussie", ip: "92.154.18.40", source: "Interface web" },
  { id: "EVT-1017", timestamp: "2026-06-09T17:58:00", acteur: "Bob Durand", acteurId: "b.durand", action: "modification", entite: "Article wiki « Onboarding »", detail: "section « Premier jour » réécrite (v2)", ip: "10.20.4.27", source: "Interface web" },
  { id: "EVT-1016", timestamp: "2026-06-09T15:13:00", acteur: "Alice Martin", acteurId: "a.martin", action: "suppression", entite: "Devis DV-2026-099", detail: "doublon du devis DV-2026-101", ip: "10.20.4.18", source: "Interface web" },
  { id: "EVT-1015", timestamp: "2026-06-09T11:47:00", acteur: "Système", acteurId: "system", action: "creation", entite: "Export « Ventes hebdo »", detail: "exécution planifiée : rapport généré et envoyé à 2 destinataires", ip: "127.0.0.1", source: "Tâche planifiée" },
  { id: "EVT-1014", timestamp: "2026-06-09T09:02:00", acteur: "Alice Martin", acteurId: "a.martin", action: "connexion", entite: "Session utilisateur a.martin", detail: "authentification par mot de passe réussie", ip: "10.20.4.18", source: "Interface web" },
  { id: "EVT-1013", timestamp: "2026-06-08T16:34:00", acteur: "Claire Petit", acteurId: "c.petit", action: "modification", entite: "Contrat C-2024-018", detail: "clause de révision tarifaire ajoutée (article 7)", ip: "92.154.18.40", source: "Interface web" },
  { id: "EVT-1012", timestamp: "2026-06-08T14:19:00", acteur: "Service API", acteurId: "svc-api", action: "creation", entite: "Client Nordtech SARL", detail: "fiche client importée depuis le CRM", ip: "10.0.8.3", source: "API" },
  { id: "EVT-1011", timestamp: "2026-06-08T10:55:00", acteur: "Bob Durand", acteurId: "b.durand", action: "modification", entite: "Modèle d'e-mail « Relance facture »", detail: "objet : « Rappel » → « Relance aimable »", ip: "10.20.4.27", source: "Interface web" },
  { id: "EVT-1010", timestamp: "2026-06-08T08:43:00", acteur: "Bob Durand", acteurId: "b.durand", action: "connexion", entite: "Session utilisateur b.durand", detail: "authentification SSO réussie", ip: "10.20.4.27", source: "Interface web" },
  { id: "EVT-1009", timestamp: "2026-06-06T18:09:00", acteur: "Système", acteurId: "system", action: "modification", entite: "Utilisateur s.bernard", detail: "compte désactivé : 90 jours sans connexion", ip: "127.0.0.1", source: "Tâche planifiée" },
  { id: "EVT-1008", timestamp: "2026-06-06T15:27:00", acteur: "Alice Martin", acteurId: "a.martin", action: "creation", entite: "Utilisateur j.dupont", detail: "compte créé, invitation envoyée par e-mail", ip: "10.20.4.18", source: "Interface web" },
  { id: "EVT-1007", timestamp: "2026-06-06T11:50:00", acteur: "Claire Petit", acteurId: "c.petit", action: "suppression", entite: "Modèle d'e-mail « Relance (ancien) »", detail: "remplacé par le modèle « Relance facture »", ip: "92.154.18.40", source: "Interface web" },
  { id: "EVT-1006", timestamp: "2026-06-05T16:42:00", acteur: "Bob Durand", acteurId: "b.durand", action: "creation", entite: "Article wiki « Télétravail »", detail: "brouillon initial enregistré", ip: "10.20.4.27", source: "Interface web" },
  { id: "EVT-1005", timestamp: "2026-06-05T13:08:00", acteur: "Service API", acteurId: "svc-api", action: "modification", entite: "Facture F-2026-0289", detail: "statut : envoyée → payée (webhook bancaire)", ip: "10.0.8.3", source: "API" },
  { id: "EVT-1004", timestamp: "2026-06-05T09:14:00", acteur: "Claire Petit", acteurId: "c.petit", action: "connexion", entite: "Session utilisateur c.petit", detail: "authentification SSO réussie", ip: "92.154.18.40", source: "Interface web" },
  { id: "EVT-1003", timestamp: "2026-06-04T17:25:00", acteur: "Alice Martin", acteurId: "a.martin", action: "creation", entite: "Devis DV-2026-101", detail: "devis créé pour Nordtech SARL (5 980 € HT)", ip: "10.20.4.18", source: "Interface web" },
  { id: "EVT-1002", timestamp: "2026-06-04T10:31:00", acteur: "Système", acteurId: "system", action: "connexion", entite: "Jeton de service « backup-nuit »", detail: "rotation automatique du jeton de service", ip: "127.0.0.1", source: "Tâche planifiée" },
  { id: "EVT-1001", timestamp: "2026-06-03T15:46:00", acteur: "Claire Petit", acteurId: "c.petit", action: "modification", entite: "Client ACME SAS", detail: "contact principal : p.leroy → m.dubois", ip: "92.154.18.40", source: "Interface web" },
];

const ACTEURS = ["Alice Martin", "Bob Durand", "Claire Petit", "Service API", "Système"];

const ACTEUR_OPTIONS = [
  { value: "all", label: "Tous les acteurs" },
  ...ACTEURS.map((a) => ({ value: a, label: a })),
];

const ACTION_OPTIONS = [
  { value: "all", label: "Toutes les actions" },
  ...(Object.keys(ACTION_META) as ActionType[]).map((a) => ({ value: a, label: ACTION_META[a].label })),
];

const PERIODE_OPTIONS = [
  { value: "24h", label: "24 h" },
  { value: "7d", label: "7 jours" },
  { value: "all", label: "10 jours (tout)" },
];

const PERIODE_LABEL: Record<string, string> = { "24h": "24 h", "7d": "7 jours", all: "10 jours" };

/** Timestamp le plus récent du jeu de données : sert de référence aux périodes (pas d'horloge). */
const MAX_TS = EVENTS.reduce((max, e) => (e.timestamp > max ? e.timestamp : max), EVENTS[0].timestamp);

/**
 * Recule un ISO figé de N jours par simple arithmétique sur le jour du mois
 * (valide ici : toutes les dates du jeu restent dans le même mois).
 */
function minusDays(iso: string, days: number): string {
  const day = Number(iso.slice(8, 10)) - days;
  return `${iso.slice(0, 8)}${String(day).padStart(2, "0")}${iso.slice(10)}`;
}

/** "2026-06-12T17:40:00" → "12/06/2026 17:40" — découpage de chaîne, zéro Date au render. */
function formatTs(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)} ${iso.slice(11, 16)}`;
}

function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const STATS = {
  total: EVENTS.length,
  acteurs: new Set(EVENTS.map((e) => e.acteur)).size,
  suppressions: EVENTS.filter((e) => e.action === "suppression").length,
};

const PAGE_SIZE = 10;

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase" style={{ color: "var(--bpm-text-secondary)" }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>
        {children}
      </span>
    </div>
  );
}

export default function AuditLogSimulateur() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [acteur, setActeur] = useState<string | null>("all");
  const [action, setAction] = useState<string | null>("all");
  const [periode, setPeriode] = useState<string | null>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cutoff = periode === "24h" ? minusDays(MAX_TS, 1) : periode === "7d" ? minusDays(MAX_TS, 7) : null;
    return EVENTS.filter((e) => {
      if (cutoff && e.timestamp < cutoff) return false;
      if (acteur && acteur !== "all" && e.acteur !== acteur) return false;
      if (action && action !== "all" && e.action !== action) return false;
      if (q) {
        const haystack = `${e.acteur} ${e.entite} ${e.detail}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [search, acteur, action, periode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageEvents = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const hasActiveFilters =
    search.trim() !== "" || (acteur !== null && acteur !== "all") || (action !== null && action !== "all") || (periode !== null && periode !== "all");

  const resetFilters = () => {
    setSearch("");
    setActeur("all");
    setAction("all");
    setPeriode("all");
    setPage(1);
  };

  const exportCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const header = ["Identifiant", "Horodatage", "Acteur", "Action", "Entité", "Détail", "Adresse IP", "Source"].join(";");
    const lines = filtered.map((e) =>
      [e.id, formatTs(e.timestamp), e.acteur, ACTION_META[e.action].label, e.entite, e.detail, e.ip, e.source]
        .map(esc)
        .join(";")
    );
    const csv = "\uFEFF" + [header, ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(
      `${filtered.length} événement(s) exporté(s) au format CSV (séparateur « ; »).`,
      "success",
      4000,
      "Export CSV",
      "Journal d'audit",
      null
    );
  };

  const columns = [
    {
      key: "timestamp",
      label: "Horodatage",
      render: (value: unknown) => (
        <span className="whitespace-nowrap text-sm" style={{ color: "var(--bpm-text-primary)" }}>
          {formatTs(String(value))}
        </span>
      ),
    },
    {
      key: "acteur",
      label: "Acteur",
      render: (value: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-2">
          <Avatar initials={initialsOf(String(value))} size="small" alt={String(value)} />
          <div>
            <div className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--bpm-text-primary)" }}>
              {String(value)}
            </div>
            <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
              {String(row.acteurId)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (value: unknown) => {
        const meta = ACTION_META[value as ActionType];
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      key: "entite",
      label: "Entité",
      render: (value: unknown) => (
        <span className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
          {String(value)}
        </span>
      ),
    },
    {
      key: "detail",
      label: "Détail",
      render: (value: unknown) => (
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "32ch", display: "inline-block" }}>
          {String(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Événements (10 j)" value={String(STATS.total)} />
        <Metric label="Acteurs distincts" value={String(STATS.acteurs)} />
        <Metric label="Suppressions (10 j)" value={String(STATS.suppressions)} />
      </MetricRow>

      <Panel variant="info" title="Filtres">
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            label="Recherche"
            type="search"
            placeholder="Acteur, entité, détail…"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <Selectbox
            label="Acteur"
            options={ACTEUR_OPTIONS}
            value={acteur}
            onChange={(v) => {
              setActeur(v);
              setPage(1);
            }}
            placeholder="Tous les acteurs"
          />
          <Selectbox
            label="Type d'action"
            options={ACTION_OPTIONS}
            value={action}
            onChange={(v) => {
              setAction(v);
              setPage(1);
            }}
            placeholder="Toutes les actions"
          />
          <Selectbox
            label="Période"
            options={PERIODE_OPTIONS}
            value={periode}
            onChange={(v) => {
              setPeriode(v);
              setPage(1);
            }}
            placeholder="Période"
          />
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {search.trim() !== "" && (
              <Chip
                variant="outline"
                label={`Recherche : « ${search.trim()} »`}
                onDelete={() => {
                  setSearch("");
                  setPage(1);
                }}
              />
            )}
            {acteur !== null && acteur !== "all" && (
              <Chip
                variant="outline"
                label={`Acteur : ${acteur}`}
                onDelete={() => {
                  setActeur("all");
                  setPage(1);
                }}
              />
            )}
            {action !== null && action !== "all" && (
              <Chip
                variant="outline"
                label={`Action : ${ACTION_META[action as ActionType].label}`}
                onDelete={() => {
                  setAction("all");
                  setPage(1);
                }}
              />
            )}
            {periode !== null && periode !== "all" && (
              <Chip
                variant="outline"
                label={`Période : ${PERIODE_LABEL[periode]}`}
                onDelete={() => {
                  setPeriode("all");
                  setPage(1);
                }}
              />
            )}
            <Button size="small" variant="ghost" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </Panel>

      <Panel variant="info" title="Journal des événements">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {filtered.length} événement{filtered.length > 1 ? "s" : ""} affiché
            {filtered.length > 1 ? "s" : ""} sur {EVENTS.length} — cliquez sur une ligne pour le détail
          </span>
          <Button size="small" variant="secondary" onClick={exportCsv} disabled={filtered.length === 0}>
            Exporter en CSV ({filtered.length})
          </Button>
        </div>
        <Table
          columns={columns}
          data={pageEvents as unknown as Record<string, unknown>[]}
          keyColumn="id"
          striped
          hover
          onRowClick={(row) => setSelected(row as unknown as AuditEvent)}
          emptyMessage="Aucun événement ne correspond aux filtres."
        />
        {filtered.length > 0 && (
          <div className="mt-3">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={PAGE_SIZE}
              totalItems={filtered.length}
            />
          </div>
        )}
      </Panel>

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Événement ${selected.id}` : "Détail de l'événement"}
        side="right"
        width={460}
      >
        {selected && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-3">
              <Avatar initials={initialsOf(selected.acteur)} size="large" alt={selected.acteur} />
              <div>
                <div className="font-medium" style={{ color: "var(--bpm-text-primary)" }}>
                  {selected.acteur}
                </div>
                <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                  {selected.acteurId} · {selected.source}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Horodatage">{formatTs(selected.timestamp)}</DetailRow>
              <DetailRow label="Action">
                <Badge variant={ACTION_META[selected.action].variant}>{ACTION_META[selected.action].label}</Badge>
              </DetailRow>
              <DetailRow label="Adresse IP">{selected.ip}</DetailRow>
              <DetailRow label="Source">{selected.source}</DetailRow>
            </div>
            <DetailRow label="Entité">{selected.entite}</DetailRow>
            <DetailRow label="Détail">{selected.detail}</DetailRow>
            <div>
              <div className="mb-1 text-xs font-medium uppercase" style={{ color: "var(--bpm-text-secondary)" }}>
                Événement brut (JSON)
              </div>
              <JsonViewer data={selected} defaultExpandedLevel={2} maxHeight={320} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
