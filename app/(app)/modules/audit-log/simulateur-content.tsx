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
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import { getAuditLogStrings } from "./strings";

type ActionType = "creation" | "modification" | "suppression" | "connexion";

/** Texte résolu au render selon la locale active (structure {fr, en}). */
type LocalizedText = { fr: string; en: string };

interface AuditEvent {
  id: string;
  /** Horodatage ISO figé (jamais dérivé de l'horloge — rendu déterministe). */
  timestamp: string;
  acteur: LocalizedText;
  acteurId: string;
  action: ActionType;
  entite: LocalizedText;
  detail: LocalizedText;
  ip: string;
  source: LocalizedText;
}

/** Événement « aplati » dans la locale active (table, drawer, JSON, CSV). */
interface ResolvedAuditEvent {
  id: string;
  timestamp: string;
  acteur: string;
  acteurId: string;
  action: ActionType;
  entite: string;
  detail: string;
  ip: string;
  source: string;
}

const ACTION_VARIANT: Record<ActionType, BadgeVariant> = {
  creation: "success",
  modification: "primary",
  suppression: "error",
  connexion: "default",
};

/** Même libellé dans les deux langues (noms propres, identifiants…). */
const same = (s: string): LocalizedText => ({ fr: s, en: s });

// Acteurs : les noms propres restent, les acteurs techniques sont traduits.
const ALICE = same("Alice Martin");
const BOB = same("Bob Durand");
const CLAIRE = same("Claire Petit");
const SVC_API: LocalizedText = { fr: "Service API", en: "API Service" };
const SYSTEM: LocalizedText = { fr: "Système", en: "System" };

// Sources d'événements.
const SRC_WEB: LocalizedText = { fr: "Interface web", en: "Web interface" };
const SRC_API = same("API");
const SRC_CRON: LocalizedText = { fr: "Tâche planifiée", en: "Scheduled task" };

// Détails récurrents.
const SSO_OK: LocalizedText = { fr: "authentification SSO réussie", en: "successful SSO authentication" };
const PWD_OK: LocalizedText = {
  fr: "authentification par mot de passe réussie",
  en: "successful password authentication",
};
const session = (userId: string): LocalizedText => ({
  fr: `Session utilisateur ${userId}`,
  en: `User session ${userId}`,
});

/**
 * Jeu de démonstration : 32 événements littéraux, timestamps ISO figés répartis
 * sur 10 jours (3 → 12 juin 2026), triés du plus récent au plus ancien.
 * Aucune horloge n'est consultée au render : tout est déterministe. Les libellés
 * d'entités et de détails sont bilingues et résolus au render selon la locale.
 */
const EVENTS: AuditEvent[] = [
  { id: "EVT-1032", timestamp: "2026-06-12T17:40:00", acteur: ALICE, acteurId: "a.martin", action: "modification", entite: { fr: "Devis DV-2026-104", en: "Quote DV-2026-104" }, detail: { fr: "statut : brouillon → validé", en: "status: draft → validated" }, ip: "10.20.4.18", source: SRC_WEB },
  { id: "EVT-1031", timestamp: "2026-06-12T16:55:00", acteur: SVC_API, acteurId: "svc-api", action: "creation", entite: { fr: "Facture F-2026-0291", en: "Invoice F-2026-0291" }, detail: { fr: "facture générée depuis le devis DV-2026-104", en: "invoice generated from quote DV-2026-104" }, ip: "10.0.8.3", source: SRC_API },
  { id: "EVT-1030", timestamp: "2026-06-12T14:32:00", acteur: BOB, acteurId: "b.durand", action: "suppression", entite: { fr: "Article wiki « Ancien process achats »", en: "Wiki article “Old purchasing process”" }, detail: { fr: "archive conservée 30 jours avant purge définitive", en: "archive kept for 30 days before permanent purge" }, ip: "10.20.4.27", source: SRC_WEB },
  { id: "EVT-1029", timestamp: "2026-06-12T09:05:00", acteur: CLAIRE, acteurId: "c.petit", action: "connexion", entite: session("c.petit"), detail: { fr: "authentification SSO réussie (2 facteurs)", en: "successful SSO authentication (2-factor)" }, ip: "92.154.18.40", source: SRC_WEB },
  { id: "EVT-1028", timestamp: "2026-06-12T08:58:00", acteur: ALICE, acteurId: "a.martin", action: "connexion", entite: session("a.martin"), detail: PWD_OK, ip: "10.20.4.18", source: SRC_WEB },
  { id: "EVT-1027", timestamp: "2026-06-11T18:20:00", acteur: SYSTEM, acteurId: "system", action: "modification", entite: { fr: "Export « Ventes hebdo »", en: "Export “Weekly sales”" }, detail: { fr: "prochaine exécution recalculée : lundi 08:00", en: "next run recalculated: Monday 08:00" }, ip: "127.0.0.1", source: SRC_CRON },
  { id: "EVT-1026", timestamp: "2026-06-11T17:02:00", acteur: CLAIRE, acteurId: "c.petit", action: "modification", entite: { fr: "Contrat C-2024-018", en: "Contract C-2024-018" }, detail: { fr: "date de fin : 31/12/2026 → 30/06/2027", en: "end date: 31 Dec 2026 → 30 Jun 2027" }, ip: "92.154.18.40", source: SRC_WEB },
  { id: "EVT-1025", timestamp: "2026-06-11T15:44:00", acteur: BOB, acteurId: "b.durand", action: "creation", entite: { fr: "Article wiki « Onboarding »", en: "Wiki article “Onboarding”" }, detail: { fr: "première version publiée (v1)", en: "first version published (v1)" }, ip: "10.20.4.27", source: SRC_WEB },
  { id: "EVT-1024", timestamp: "2026-06-11T11:12:00", acteur: SVC_API, acteurId: "svc-api", action: "modification", entite: { fr: "Client ACME SAS", en: "Customer ACME SAS" }, detail: { fr: "adresse de facturation synchronisée depuis le CRM", en: "billing address synced from the CRM" }, ip: "10.0.8.3", source: SRC_API },
  { id: "EVT-1023", timestamp: "2026-06-11T08:47:00", acteur: BOB, acteurId: "b.durand", action: "connexion", entite: session("b.durand"), detail: SSO_OK, ip: "10.20.4.27", source: SRC_WEB },
  { id: "EVT-1022", timestamp: "2026-06-10T19:30:00", acteur: SYSTEM, acteurId: "system", action: "suppression", entite: { fr: "Export « Stocks (obsolète) »", en: "Export “Inventory (obsolete)”" }, detail: { fr: "purge automatique : planification inactive depuis 90 jours", en: "automatic purge: schedule inactive for 90 days" }, ip: "127.0.0.1", source: SRC_CRON },
  { id: "EVT-1021", timestamp: "2026-06-10T16:21:00", acteur: ALICE, acteurId: "a.martin", action: "modification", entite: { fr: "Utilisateur j.dupont", en: "User j.dupont" }, detail: { fr: "rôle : Lecture seule → Comptabilité", en: "role: Read-only → Accounting" }, ip: "10.20.4.18", source: SRC_WEB },
  { id: "EVT-1020", timestamp: "2026-06-10T14:05:00", acteur: CLAIRE, acteurId: "c.petit", action: "creation", entite: { fr: "Devis DV-2026-104", en: "Quote DV-2026-104" }, detail: { fr: "devis créé pour ACME SAS (12 400 € HT)", en: "quote created for ACME SAS (€12,400 excl. VAT)" }, ip: "92.154.18.40", source: SRC_WEB },
  { id: "EVT-1019", timestamp: "2026-06-10T10:38:00", acteur: SVC_API, acteurId: "svc-api", action: "connexion", entite: { fr: "Jeton API « integration-erp »", en: "API token “integration-erp”" }, detail: { fr: "jeton renouvelé, validité 24 h", en: "token renewed, valid for 24 h" }, ip: "10.0.8.3", source: SRC_API },
  { id: "EVT-1018", timestamp: "2026-06-10T08:51:00", acteur: CLAIRE, acteurId: "c.petit", action: "connexion", entite: session("c.petit"), detail: SSO_OK, ip: "92.154.18.40", source: SRC_WEB },
  { id: "EVT-1017", timestamp: "2026-06-09T17:58:00", acteur: BOB, acteurId: "b.durand", action: "modification", entite: { fr: "Article wiki « Onboarding »", en: "Wiki article “Onboarding”" }, detail: { fr: "section « Premier jour » réécrite (v2)", en: "“First day” section rewritten (v2)" }, ip: "10.20.4.27", source: SRC_WEB },
  { id: "EVT-1016", timestamp: "2026-06-09T15:13:00", acteur: ALICE, acteurId: "a.martin", action: "suppression", entite: { fr: "Devis DV-2026-099", en: "Quote DV-2026-099" }, detail: { fr: "doublon du devis DV-2026-101", en: "duplicate of quote DV-2026-101" }, ip: "10.20.4.18", source: SRC_WEB },
  { id: "EVT-1015", timestamp: "2026-06-09T11:47:00", acteur: SYSTEM, acteurId: "system", action: "creation", entite: { fr: "Export « Ventes hebdo »", en: "Export “Weekly sales”" }, detail: { fr: "exécution planifiée : rapport généré et envoyé à 2 destinataires", en: "scheduled run: report generated and sent to 2 recipients" }, ip: "127.0.0.1", source: SRC_CRON },
  { id: "EVT-1014", timestamp: "2026-06-09T09:02:00", acteur: ALICE, acteurId: "a.martin", action: "connexion", entite: session("a.martin"), detail: PWD_OK, ip: "10.20.4.18", source: SRC_WEB },
  { id: "EVT-1013", timestamp: "2026-06-08T16:34:00", acteur: CLAIRE, acteurId: "c.petit", action: "modification", entite: { fr: "Contrat C-2024-018", en: "Contract C-2024-018" }, detail: { fr: "clause de révision tarifaire ajoutée (article 7)", en: "price revision clause added (article 7)" }, ip: "92.154.18.40", source: SRC_WEB },
  { id: "EVT-1012", timestamp: "2026-06-08T14:19:00", acteur: SVC_API, acteurId: "svc-api", action: "creation", entite: { fr: "Client Nordtech SARL", en: "Customer Nordtech SARL" }, detail: { fr: "fiche client importée depuis le CRM", en: "customer record imported from the CRM" }, ip: "10.0.8.3", source: SRC_API },
  { id: "EVT-1011", timestamp: "2026-06-08T10:55:00", acteur: BOB, acteurId: "b.durand", action: "modification", entite: { fr: "Modèle d'e-mail « Relance facture »", en: "Email template “Invoice follow-up”" }, detail: { fr: "objet : « Rappel » → « Relance aimable »", en: "subject: “Reminder” → “Friendly follow-up”" }, ip: "10.20.4.27", source: SRC_WEB },
  { id: "EVT-1010", timestamp: "2026-06-08T08:43:00", acteur: BOB, acteurId: "b.durand", action: "connexion", entite: session("b.durand"), detail: SSO_OK, ip: "10.20.4.27", source: SRC_WEB },
  { id: "EVT-1009", timestamp: "2026-06-06T18:09:00", acteur: SYSTEM, acteurId: "system", action: "modification", entite: { fr: "Utilisateur s.bernard", en: "User s.bernard" }, detail: { fr: "compte désactivé : 90 jours sans connexion", en: "account deactivated: 90 days without login" }, ip: "127.0.0.1", source: SRC_CRON },
  { id: "EVT-1008", timestamp: "2026-06-06T15:27:00", acteur: ALICE, acteurId: "a.martin", action: "creation", entite: { fr: "Utilisateur j.dupont", en: "User j.dupont" }, detail: { fr: "compte créé, invitation envoyée par e-mail", en: "account created, invitation sent by email" }, ip: "10.20.4.18", source: SRC_WEB },
  { id: "EVT-1007", timestamp: "2026-06-06T11:50:00", acteur: CLAIRE, acteurId: "c.petit", action: "suppression", entite: { fr: "Modèle d'e-mail « Relance (ancien) »", en: "Email template “Follow-up (old)”" }, detail: { fr: "remplacé par le modèle « Relance facture »", en: "replaced by the “Invoice follow-up” template" }, ip: "92.154.18.40", source: SRC_WEB },
  { id: "EVT-1006", timestamp: "2026-06-05T16:42:00", acteur: BOB, acteurId: "b.durand", action: "creation", entite: { fr: "Article wiki « Télétravail »", en: "Wiki article “Remote work”" }, detail: { fr: "brouillon initial enregistré", en: "initial draft saved" }, ip: "10.20.4.27", source: SRC_WEB },
  { id: "EVT-1005", timestamp: "2026-06-05T13:08:00", acteur: SVC_API, acteurId: "svc-api", action: "modification", entite: { fr: "Facture F-2026-0289", en: "Invoice F-2026-0289" }, detail: { fr: "statut : envoyée → payée (webhook bancaire)", en: "status: sent → paid (bank webhook)" }, ip: "10.0.8.3", source: SRC_API },
  { id: "EVT-1004", timestamp: "2026-06-05T09:14:00", acteur: CLAIRE, acteurId: "c.petit", action: "connexion", entite: session("c.petit"), detail: SSO_OK, ip: "92.154.18.40", source: SRC_WEB },
  { id: "EVT-1003", timestamp: "2026-06-04T17:25:00", acteur: ALICE, acteurId: "a.martin", action: "creation", entite: { fr: "Devis DV-2026-101", en: "Quote DV-2026-101" }, detail: { fr: "devis créé pour Nordtech SARL (5 980 € HT)", en: "quote created for Nordtech SARL (€5,980 excl. VAT)" }, ip: "10.20.4.18", source: SRC_WEB },
  { id: "EVT-1002", timestamp: "2026-06-04T10:31:00", acteur: SYSTEM, acteurId: "system", action: "connexion", entite: { fr: "Jeton de service « backup-nuit »", en: "Service token “backup-nuit”" }, detail: { fr: "rotation automatique du jeton de service", en: "automatic service token rotation" }, ip: "127.0.0.1", source: SRC_CRON },
  { id: "EVT-1001", timestamp: "2026-06-03T15:46:00", acteur: CLAIRE, acteurId: "c.petit", action: "modification", entite: { fr: "Client ACME SAS", en: "Customer ACME SAS" }, detail: { fr: "contact principal : p.leroy → m.dubois", en: "primary contact: p.leroy → m.dubois" }, ip: "92.154.18.40", source: SRC_WEB },
];

/** Acteurs filtrables : identifiant stable + nom localisé. */
const ACTEURS: { id: string; name: LocalizedText }[] = [
  { id: "a.martin", name: ALICE },
  { id: "b.durand", name: BOB },
  { id: "c.petit", name: CLAIRE },
  { id: "svc-api", name: SVC_API },
  { id: "system", name: SYSTEM },
];

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

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Formatage explicite par locale, découpage de chaîne, zéro Date au render :
 * fr → "12/06/2026 17:40" ; en → "12 Jun 2026, 17:40".
 */
function formatTs(iso: string, locale: Locale): string {
  const day = iso.slice(8, 10);
  const year = iso.slice(0, 4);
  const time = iso.slice(11, 16);
  if (locale === "en") {
    const month = MONTHS_EN[Number(iso.slice(5, 7)) - 1];
    return `${Number(day)} ${month} ${year}, ${time}`;
  }
  return `${day}/${iso.slice(5, 7)}/${year} ${time}`;
}

function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const STATS = {
  total: EVENTS.length,
  acteurs: new Set(EVENTS.map((e) => e.acteurId)).size,
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
  const { locale } = useI18n();
  const s = getAuditLogStrings(locale);
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [acteur, setActeur] = useState<string | null>("all");
  const [action, setAction] = useState<string | null>("all");
  const [periode, setPeriode] = useState<string | null>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const acteurOptions = useMemo(
    () => [{ value: "all", label: s.sim.allActors }, ...ACTEURS.map((a) => ({ value: a.id, label: a.name[locale] }))],
    [s, locale]
  );

  const actionOptions = useMemo(
    () => [
      { value: "all", label: s.sim.allActions },
      ...(Object.keys(ACTION_VARIANT) as ActionType[]).map((a) => ({ value: a, label: s.actions[a] })),
    ],
    [s]
  );

  const periodeOptions = useMemo(
    () => [
      { value: "24h", label: s.sim.period24h },
      { value: "7d", label: s.sim.period7d },
      { value: "all", label: s.sim.periodAll },
    ],
    [s]
  );

  const periodeChipLabel: Record<string, string> = {
    "24h": s.sim.chipPeriod24h,
    "7d": s.sim.chipPeriod7d,
    all: s.sim.chipPeriodAll,
  };

  /** Événements résolus dans la locale active (recherche, table, CSV, JSON). */
  const resolved = useMemo<ResolvedAuditEvent[]>(
    () =>
      EVENTS.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        acteur: e.acteur[locale],
        acteurId: e.acteurId,
        action: e.action,
        entite: e.entite[locale],
        detail: e.detail[locale],
        ip: e.ip,
        source: e.source[locale],
      })),
    [locale]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cutoff = periode === "24h" ? minusDays(MAX_TS, 1) : periode === "7d" ? minusDays(MAX_TS, 7) : null;
    return resolved.filter((e) => {
      if (cutoff && e.timestamp < cutoff) return false;
      if (acteur && acteur !== "all" && e.acteurId !== acteur) return false;
      if (action && action !== "all" && e.action !== action) return false;
      if (q) {
        // Recherche plein texte dans la locale active.
        const haystack = `${e.acteur} ${e.entite} ${e.detail}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [resolved, search, acteur, action, periode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageEvents = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const selected = selectedId !== null ? resolved.find((e) => e.id === selectedId) ?? null : null;
  const selectedActorName = acteur !== null && acteur !== "all" ? ACTEURS.find((a) => a.id === acteur)?.name[locale] ?? acteur : null;

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
    const header = s.sim.csvHeaders.join(";");
    const lines = filtered.map((e) =>
      [e.id, formatTs(e.timestamp, locale), e.acteur, s.actions[e.action], e.entite, e.detail, e.ip, e.source]
        .map(esc)
        .join(";")
    );
    const csv = "\uFEFF" + [header, ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${s.sim.csvFilePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(
      s.sim.toastExportMessage(filtered.length),
      "success",
      4000,
      s.sim.toastExportTitle,
      s.sim.toastExportSubtitle,
      null
    );
  };

  const columns = [
    {
      key: "timestamp",
      label: s.sim.colTimestamp,
      render: (value: unknown) => (
        <span className="whitespace-nowrap text-sm" style={{ color: "var(--bpm-text-primary)" }}>
          {formatTs(String(value), locale)}
        </span>
      ),
    },
    {
      key: "acteur",
      label: s.sim.colActor,
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
      label: s.sim.colAction,
      render: (value: unknown) => {
        const type = value as ActionType;
        return <Badge variant={ACTION_VARIANT[type]}>{s.actions[type]}</Badge>;
      },
    },
    {
      key: "entite",
      label: s.sim.colEntity,
      render: (value: unknown) => (
        <span className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
          {String(value)}
        </span>
      ),
    },
    {
      key: "detail",
      label: s.sim.colDetail,
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
        <Metric label={s.sim.metricEvents} value={String(STATS.total)} />
        <Metric label={s.sim.metricActors} value={String(STATS.acteurs)} />
        <Metric label={s.sim.metricDeletions} value={String(STATS.suppressions)} />
      </MetricRow>

      <Panel variant="info" title={s.sim.filtersTitle}>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            label={s.sim.searchLabel}
            type="search"
            placeholder={s.sim.searchPlaceholder}
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <Selectbox
            label={s.sim.actorLabel}
            options={acteurOptions}
            value={acteur}
            onChange={(v) => {
              setActeur(v);
              setPage(1);
            }}
            placeholder={s.sim.allActors}
          />
          <Selectbox
            label={s.sim.actionLabel}
            options={actionOptions}
            value={action}
            onChange={(v) => {
              setAction(v);
              setPage(1);
            }}
            placeholder={s.sim.allActions}
          />
          <Selectbox
            label={s.sim.periodLabel}
            options={periodeOptions}
            value={periode}
            onChange={(v) => {
              setPeriode(v);
              setPage(1);
            }}
            placeholder={s.sim.periodLabel}
          />
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {search.trim() !== "" && (
              <Chip
                variant="outline"
                label={s.sim.chipSearch(search.trim())}
                onDelete={() => {
                  setSearch("");
                  setPage(1);
                }}
              />
            )}
            {selectedActorName !== null && (
              <Chip
                variant="outline"
                label={s.sim.chipActor(selectedActorName)}
                onDelete={() => {
                  setActeur("all");
                  setPage(1);
                }}
              />
            )}
            {action !== null && action !== "all" && (
              <Chip
                variant="outline"
                label={s.sim.chipAction(s.actions[action as ActionType])}
                onDelete={() => {
                  setAction("all");
                  setPage(1);
                }}
              />
            )}
            {periode !== null && periode !== "all" && (
              <Chip
                variant="outline"
                label={s.sim.chipPeriod(periodeChipLabel[periode])}
                onDelete={() => {
                  setPeriode("all");
                  setPage(1);
                }}
              />
            )}
            <Button size="small" variant="ghost" onClick={resetFilters}>
              {s.sim.resetFilters}
            </Button>
          </div>
        )}
      </Panel>

      <Panel variant="info" title={s.sim.eventLogTitle}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.sim.counter(filtered.length, EVENTS.length)}
          </span>
          <Button size="small" variant="secondary" onClick={exportCsv} disabled={filtered.length === 0}>
            {s.sim.exportCsv(filtered.length)}
          </Button>
        </div>
        <Table
          columns={columns}
          data={pageEvents as unknown as Record<string, unknown>[]}
          keyColumn="id"
          striped
          hover
          onRowClick={(row) => setSelectedId(String(row.id))}
          emptyMessage={s.sim.emptyMessage}
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
        onClose={() => setSelectedId(null)}
        title={selected ? s.sim.drawerTitle(selected.id) : s.sim.drawerTitleFallback}
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
              <DetailRow label={s.sim.drawerTimestamp}>{formatTs(selected.timestamp, locale)}</DetailRow>
              <DetailRow label={s.sim.drawerAction}>
                <Badge variant={ACTION_VARIANT[selected.action]}>{s.actions[selected.action]}</Badge>
              </DetailRow>
              <DetailRow label={s.sim.drawerIp}>{selected.ip}</DetailRow>
              <DetailRow label={s.sim.drawerSource}>{selected.source}</DetailRow>
            </div>
            <DetailRow label={s.sim.drawerEntity}>{selected.entite}</DetailRow>
            <DetailRow label={s.sim.drawerDetail}>{selected.detail}</DetailRow>
            <div>
              <div className="mb-1 text-xs font-medium uppercase" style={{ color: "var(--bpm-text-secondary)" }}>
                {s.sim.drawerRawJson}
              </div>
              <JsonViewer data={selected} defaultExpandedLevel={2} maxHeight={320} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
