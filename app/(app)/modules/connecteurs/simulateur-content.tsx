"use client";

import { useMemo, useState } from "react";
import {
  ActivityFeed,
  type ActivityItem,
  Badge,
  Button,
  ConfirmModal,
  Input,
  Metric,
  MetricRow,
  Panel,
  Selectbox,
  Table,
  useToast,
} from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type ConnecteursStrings } from "./strings";

type ConnecteurType = "API REST" | "SFTP" | "PostgreSQL" | "MySQL";
type ConnecteurStatut = "connected" | "error" | "paused";
type Lang = "fr" | "en";

/** Chaîne bilingue résolue au render selon la locale courante. */
type L = { fr: string; en: string };

/** Construit une chaîne bilingue à partir du dictionnaire de chaque langue. */
const bi = (f: (s: ConnecteursStrings, lang: Lang) => string): L => ({
  fr: f(STR.fr, "fr"),
  en: f(STR.en, "en"),
});

/** Chaîne identique dans les deux langues (noms propres, valeurs techniques). */
const same = (value: string): L => ({ fr: value, en: value });

interface Connecteur {
  id: string;
  nom: L;
  type: ConnecteurType;
  hote: string;
  identifiant: string;
  statut: ConnecteurStatut;
  planification: L;
  derniereSynchro: L;
  lignes24h: number;
  synchros24h: number;
  /** false tant que les identifiants sont invalides (test/synchro échouent). */
  authValide: boolean;
}

/** Entrée de journal stockée dans les deux langues, résolue au render. */
interface JournalEntry {
  id: string;
  actor: L;
  action: L;
  target: L;
  timestamp: string;
  color: NonNullable<ActivityItem["color"]>;
}

const TYPE_OPTIONS: { value: ConnecteurType; label: string }[] = [
  { value: "API REST", label: "API REST" },
  { value: "SFTP", label: "SFTP" },
  { value: "PostgreSQL", label: "PostgreSQL" },
  { value: "MySQL", label: "MySQL" },
];

/** Delta de lignes plausible par type lors d'une synchronisation manuelle. */
const SYNC_DELTA: Record<ConnecteurType, number> = {
  "API REST": 520,
  SFTP: 35,
  PostgreSQL: 1240,
  MySQL: 880,
};

/**
 * Jeu de démonstration déterministe : libellés relatifs figés, aucune
 * date calculée au render (rendu identique serveur/client).
 */
const INITIAL_CONNECTEURS: Connecteur[] = [
  {
    id: "con-1",
    nom: same("ERP Sage — API REST"),
    type: "API REST",
    hote: "https://api.sage.acme.fr/v3",
    identifiant: "svc-bpm-sage",
    statut: "connected",
    planification: bi((s) => s.schedHourly),
    derniereSynchro: bi((s) => s.last25min),
    lignes24h: 12400,
    synchros24h: 24,
    authValide: true,
  },
  {
    id: "con-2",
    nom: bi((s) => s.seedNameBnp),
    type: "SFTP",
    hote: "sftp.bnpparibas.com:22/releves",
    identifiant: "acme-treso",
    statut: "connected",
    planification: bi((s) => s.schedDaily6),
    derniereSynchro: bi((s) => s.lastMorning6),
    lignes24h: 310,
    synchros24h: 1,
    authValide: true,
  },
  {
    id: "con-3",
    nom: same("Datawarehouse — PostgreSQL"),
    type: "PostgreSQL",
    hote: "dwh.acme.internal:5432/analytics",
    identifiant: "bpm_reader",
    statut: "error",
    planification: bi((s) => s.schedEvery6h),
    derniereSynchro: bi((s) => s.last3days),
    lignes24h: 0,
    synchros24h: 0,
    authValide: false,
  },
  {
    id: "con-4",
    nom: same("CRM HubSpot — API REST"),
    type: "API REST",
    hote: "https://api.hubapi.com/crm/v3",
    identifiant: "svc-bpm-hubspot",
    statut: "paused",
    planification: bi((s) => s.schedEvery4hPaused),
    derniereSynchro: bi((s) => s.last5days),
    lignes24h: 0,
    synchros24h: 0,
    authValide: true,
  },
];

const INITIAL_ACTIVITY: JournalEntry[] = [
  {
    id: "j1",
    actor: bi((s) => s.actorScheduler),
    action: bi((s) => s.actSynced),
    target: bi((s) => `ERP Sage — API REST (${s.linesImported(518)})`),
    timestamp: "2026-06-12T09:00:00",
    color: "success",
  },
  {
    id: "j2",
    actor: bi((s) => s.actorScheduler),
    action: bi((s) => s.actSynced),
    target: bi((s) => `${s.seedNameBnp} (${s.linesImported(310)})`),
    timestamp: "2026-06-12T06:00:00",
    color: "success",
  },
  {
    id: "j3",
    actor: bi((s) => s.actorScheduler),
    action: bi((s) => s.actFailedOn),
    target: bi((s) => `Datawarehouse — PostgreSQL (${s.authRefused})`),
    timestamp: "2026-06-09T08:00:00",
    color: "error",
  },
  {
    id: "j4",
    actor: bi((s) => s.actorAdmin),
    action: bi((s) => s.actPausedConnector),
    target: bi((s) => `CRM HubSpot — API REST (${s.crmMigration})`),
    timestamp: "2026-06-07T11:32:00",
    color: "warning",
  },
];

/** Hôte/URL plausible : URL http(s)/sftp, ou hôte (avec port/chemin optionnels). */
const HOTE_RE = /^((https?|sftp):\/\/)?[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}(:\d{1,5})?(\/\S*)?$/i;

export default function ConnecteursSimulateur() {
  const { showToast } = useToast();
  const { locale } = useI18n();
  const S = STR[locale];
  const [connecteurs, setConnecteurs] = useState<Connecteur[]>(INITIAL_CONNECTEURS);
  const [activity, setActivity] = useState<JournalEntry[]>(INITIAL_ACTIVITY);
  const [toDelete, setToDelete] = useState<Connecteur | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Mini-form « Corriger » (identifiant d'un connecteur en erreur)
  const [fixing, setFixing] = useState<Connecteur | null>(null);
  const [fixIdentifiant, setFixIdentifiant] = useState("");
  const [fixError, setFixError] = useState<string | null>(null);

  // Form « Ajouter un connecteur »
  const [nom, setNom] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [hote, setHote] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const stats = useMemo(() => {
    const actifs = connecteurs.filter((c) => c.statut === "connected").length;
    const synchros = connecteurs.reduce((sum, c) => sum + c.synchros24h, 0);
    const lignes = connecteurs.reduce((sum, c) => sum + c.lignes24h, 0);
    return { actifs, synchros, lignes };
  }, [connecteurs]);

  const statutLabel: Record<ConnecteurStatut, string> = {
    connected: S.statusConnected,
    error: S.statusError,
    paused: S.statusPaused,
  };

  const pushActivity = (actor: L, action: L, target: L, color: JournalEntry["color"]) => {
    setActivity((prev) => [
      { id: `j${Date.now()}`, actor, action, target, timestamp: new Date().toISOString(), color },
      ...prev,
    ]);
  };

  const tester = (con: Connecteur) => {
    if (testingId) return;
    setTestingId(con.id);
    setTimeout(() => {
      setTestingId(null);
      if (!con.authValide) {
        setConnecteurs((prev) => prev.map((c) => (c.id === con.id ? { ...c, statut: "error" } : c)));
        pushActivity(
          bi((s) => s.actorAdmin),
          bi((s) => s.actTestedFail),
          bi((s, lang) => `${con.nom[lang]} — ${s.authRefused}`),
          "error"
        );
        showToast(
          S.toastTestFail(con.nom[locale], con.identifiant),
          "error",
          6000,
          S.toastTestFailTitle,
          S.pageTitle,
          null
        );
        return;
      }
      setConnecteurs((prev) => prev.map((c) => (c.id === con.id ? { ...c, statut: "connected" } : c)));
      pushActivity(
        bi((s) => s.actorAdmin),
        bi((s) => s.actTestedOk),
        bi((_, lang) => `${con.nom[lang]} (${con.type} — ${con.hote})`),
        "success"
      );
      showToast(S.toastTestOk(con.nom[locale]), "success", 5000, S.toastTestOkTitle, S.pageTitle, null);
    }, 600);
  };

  const synchroniser = (con: Connecteur) => {
    if (!con.authValide) {
      pushActivity(
        bi((s) => s.actorAdmin),
        bi((s) => s.actFailedOn),
        bi((s, lang) => `${con.nom[lang]} — ${s.syncRefused}`),
        "error"
      );
      showToast(S.toastSyncFail(con.nom[locale]), "error", 6000, S.toastSyncFailTitle, S.pageTitle, null);
      return;
    }
    const delta = SYNC_DELTA[con.type];
    setConnecteurs((prev) =>
      prev.map((c) =>
        c.id === con.id
          ? {
              ...c,
              derniereSynchro: bi((s) => s.justNow),
              lignes24h: c.lignes24h + delta,
              synchros24h: c.synchros24h + 1,
              statut: "connected",
            }
          : c
      )
    );
    pushActivity(
      bi((s) => s.actorAdmin),
      bi((s) => s.actSyncedManual),
      bi((s, lang) => `${con.nom[lang]} (${s.linesImported(delta)})`),
      "info"
    );
    showToast(S.toastSyncOk(con.nom[locale], delta), "success", 5000, S.toastSyncOkTitle, S.pageTitle, null);
  };

  const openFix = (con: Connecteur) => {
    setFixing(con);
    setFixIdentifiant(con.identifiant);
    setFixError(null);
  };

  const saveFix = () => {
    if (!fixing) return;
    const value = fixIdentifiant.trim();
    if (!value) {
      setFixError(S.errFixEmpty);
      return;
    }
    if (value === fixing.identifiant) {
      setFixError(S.errFixSame);
      return;
    }
    setConnecteurs((prev) =>
      prev.map((c) => (c.id === fixing.id ? { ...c, identifiant: value, authValide: true } : c))
    );
    pushActivity(
      bi((s) => s.actorAdmin),
      bi((s) => s.actFixedId),
      bi((s, lang) => `${fixing.nom[lang]} (${s.newUsername(value)})`),
      "info"
    );
    showToast(S.toastFix(fixing.nom[locale]), "info", 5000, S.toastFixTitle, S.pageTitle, null);
    setFixing(null);
    setFixIdentifiant("");
    setFixError(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setConnecteurs((prev) => prev.filter((c) => c.id !== toDelete.id));
    pushActivity(
      bi((s) => s.actorAdmin),
      bi((s) => s.actDeleted),
      bi((_, lang) => `${toDelete.nom[lang]} (${toDelete.type})`),
      "error"
    );
    showToast(S.toastDelete(toDelete.nom[locale]), "info", 4000, S.toastDeleteTitle, S.pageTitle, null);
    setToDelete(null);
  };

  const handleCreate = () => {
    if (creating) return;
    const nomTrim = nom.trim();
    const hoteTrim = hote.trim();
    const idTrim = identifiant.trim();
    if (!nomTrim) {
      setFormError(S.errName);
      return;
    }
    if (!type) {
      setFormError(S.errType);
      return;
    }
    if (!hoteTrim) {
      setFormError(S.errHost);
      return;
    }
    if (!HOTE_RE.test(hoteTrim)) {
      setFormError(S.errHostInvalid);
      return;
    }
    if (!idTrim) {
      setFormError(S.errId);
      return;
    }
    setFormError(null);
    setCreating(true);
    const newCon: Connecteur = {
      id: `con-${Date.now()}`,
      nom: same(nomTrim),
      type: type as ConnecteurType,
      hote: hoteTrim,
      identifiant: idTrim,
      statut: "connected",
      planification: bi((s) => s.schedManual),
      derniereSynchro: bi((s) => s.never),
      lignes24h: 0,
      synchros24h: 0,
      authValide: true,
    };
    setTimeout(() => {
      setCreating(false);
      setConnecteurs((prev) => [newCon, ...prev]);
      pushActivity(
        bi((s) => s.actorAdmin),
        bi((s) => s.actCreated),
        bi((_, lang) => `${newCon.nom[lang]} (${newCon.type} — ${newCon.hote})`),
        "success"
      );
      showToast(S.toastCreate(newCon.nom[locale]), "success", 6000, S.toastCreateTitle, S.pageTitle, null);
      setNom("");
      setType(null);
      setHote("");
      setIdentifiant("");
    }, 600);
  };

  const columns = [
    {
      key: "nom",
      label: S.colConnector,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{(value as L)[locale]}</div>
          <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            {String(row.hote)} · {(row.planification as L)[locale]}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: S.colType,
      render: (value: unknown) => <Badge variant="default">{String(value)}</Badge>,
    },
    {
      key: "statut",
      label: S.colStatus,
      render: (value: unknown) => {
        const statut = value as ConnecteurStatut;
        const variant = statut === "connected" ? "success" : statut === "error" ? "error" : "default";
        return <Badge variant={variant}>{statutLabel[statut]}</Badge>;
      },
    },
    {
      key: "derniereSynchro",
      label: S.colLastSync,
      render: (value: unknown) => <span>{(value as L)[locale]}</span>,
    },
    {
      key: "lignes24h",
      label: S.colVolume,
      align: "right" as const,
      render: (value: unknown) => <span>{S.rowsCell(Number(value))}</span>,
    },
    {
      key: "id",
      label: S.colActions,
      render: (_: unknown, row: Record<string, unknown>) => {
        const con = row as unknown as Connecteur;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" disabled={testingId !== null} onClick={() => tester(con)}>
              {testingId === con.id ? S.btnTesting : S.btnTest}
            </Button>
            <Button size="small" variant="secondary" onClick={() => synchroniser(con)}>
              {S.btnSync}
            </Button>
            {!con.authValide && (
              <Button size="small" variant="outline" onClick={() => openFix(con)}>
                {S.btnFix}
              </Button>
            )}
            <Button size="small" variant="destructive" onClick={() => setToDelete(con)}>
              {S.btnDelete}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={S.metricActive} value={String(stats.actifs)} />
        <Metric label={S.metricSyncs} value={String(stats.synchros)} />
        <Metric label={S.metricRows} value={S.num(stats.lignes)} />
      </MetricRow>

      <Panel variant="info" title={S.panelConnectors}>
        <Table columns={columns} data={connecteurs as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      {fixing && (
        <Panel variant="info" title={S.fixTitle(fixing.nom[locale])}>
          <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {S.fixIntro(fixing.identifiant)}
          </p>
          <Input
            label={S.fixLabel}
            placeholder={S.fixPlaceholder}
            value={fixIdentifiant}
            onChange={setFixIdentifiant}
          />
          {fixError && (
            <p className="mt-2 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
              {fixError}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={saveFix}>{S.btnSaveId}</Button>
            <Button variant="ghost" onClick={() => { setFixing(null); setFixError(null); }}>
              {S.btnCancel}
            </Button>
          </div>
        </Panel>
      )}

      <Panel variant="info" title={S.panelAdd}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={S.formNameLabel} placeholder={S.formNamePlaceholder} value={nom} onChange={setNom} />
          <Selectbox
            label={S.formTypeLabel}
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
            placeholder={S.formTypePlaceholder}
          />
          <Input
            label={S.formHostLabel}
            placeholder={S.formHostPlaceholder}
            value={hote}
            onChange={setHote}
          />
          <Input label={S.formIdLabel} placeholder={S.formIdPlaceholder} value={identifiant} onChange={setIdentifiant} />
        </div>
        {formError && (
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
            {formError}
          </p>
        )}
        <Button className="mt-4" disabled={creating} onClick={handleCreate}>
          {creating ? S.btnCreating : S.btnCreate}
        </Button>
      </Panel>

      <Panel variant="info" title={S.panelJournal}>
        <ActivityFeed
          activities={activity.map((entry) => ({
            id: entry.id,
            actor: entry.actor[locale],
            action: entry.action[locale],
            target: entry.target[locale],
            timestamp: entry.timestamp,
            color: entry.color,
          }))}
          maxItems={8}
          compact
        />
      </Panel>

      <ConfirmModal
        isOpen={toDelete !== null}
        title={S.confirmDeleteTitle}
        message={toDelete ? S.confirmDeleteMessage(toDelete.nom[locale], toDelete.type) : ""}
        confirmLabel={S.btnDelete}
        cancelLabel={S.btnCancel}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
