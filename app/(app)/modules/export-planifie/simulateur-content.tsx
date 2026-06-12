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

type Frequence = "daily" | "weekly" | "monthly";
type Format = "PDF" | "CSV";

interface PlannedExport {
  id: string;
  rapport: string;
  format: Format;
  frequence: Frequence;
  heure: string;
  destinataires: string[];
  actif: boolean;
  dernierEnvoi: string;
  prochainEnvoi: string;
  envois30j: number;
}

const RAPPORT_OPTIONS = [
  { value: "Ventes — synthèse hebdomadaire", label: "Ventes — synthèse hebdomadaire" },
  { value: "Trésorerie — position quotidienne", label: "Trésorerie — position quotidienne" },
  { value: "Stocks — ruptures et alertes", label: "Stocks — ruptures et alertes" },
  { value: "RH — absences du mois", label: "RH — absences du mois" },
  { value: "Qualité — non-conformités", label: "Qualité — non-conformités" },
];

const FREQ_OPTIONS: { value: Frequence; label: string }[] = [
  { value: "daily", label: "Quotidien (jours ouvrés)" },
  { value: "weekly", label: "Hebdomadaire (lundi)" },
  { value: "monthly", label: "Mensuel (le 1ᵉʳ)" },
];

const FREQ_LABEL: Record<Frequence, string> = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
};

const HEURE_OPTIONS = ["06:30", "07:00", "08:00", "12:00", "18:00"].map((h) => ({ value: h, label: h }));

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: "PDF", label: "PDF" },
  { value: "CSV", label: "CSV" },
];

/**
 * Jeu de démonstration déterministe (libellés relatifs figés : pas de Date.now()
 * au render, donc rendu identique serveur/client).
 */
const INITIAL_EXPORTS: PlannedExport[] = [
  {
    id: "exp-1",
    rapport: "Ventes — synthèse hebdomadaire",
    format: "PDF",
    frequence: "weekly",
    heure: "08:00",
    destinataires: ["dir.commerciale@acme.fr", "ventes@acme.fr"],
    actif: true,
    dernierEnvoi: "lundi 08:00",
    prochainEnvoi: "lundi prochain 08:00",
    envois30j: 4,
  },
  {
    id: "exp-2",
    rapport: "Trésorerie — position quotidienne",
    format: "CSV",
    frequence: "daily",
    heure: "06:30",
    destinataires: ["daf@acme.fr"],
    actif: true,
    dernierEnvoi: "ce matin 06:30",
    prochainEnvoi: "demain 06:30",
    envois30j: 22,
  },
  {
    id: "exp-3",
    rapport: "Stocks — ruptures et alertes",
    format: "PDF",
    frequence: "daily",
    heure: "07:00",
    destinataires: ["logistique@acme.fr", "achats@acme.fr", "supply@acme.fr"],
    actif: true,
    dernierEnvoi: "ce matin 07:00",
    prochainEnvoi: "demain 07:00",
    envois30j: 22,
  },
  {
    id: "exp-4",
    rapport: "RH — absences du mois",
    format: "CSV",
    frequence: "monthly",
    heure: "08:00",
    destinataires: ["rh@acme.fr", "paie@acme.fr"],
    actif: false,
    dernierEnvoi: "le 1ᵉʳ du mois 08:00",
    prochainEnvoi: "—",
    envois30j: 1,
  },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: "h1", actor: "Planificateur", action: "a envoyé", target: "Trésorerie — position quotidienne (CSV) à 1 destinataire", timestamp: "2026-06-12T06:30:00", color: "success" as const },
  { id: "h2", actor: "Planificateur", action: "a envoyé", target: "Stocks — ruptures et alertes (PDF) à 3 destinataires", timestamp: "2026-06-12T07:00:00", color: "success" as const },
  { id: "h3", actor: "Planificateur", action: "a envoyé", target: "Ventes — synthèse hebdomadaire (PDF) à 2 destinataires", timestamp: "2026-06-08T08:00:00", color: "success" as const },
  { id: "h4", actor: "Planificateur", action: "a suspendu", target: "RH — absences du mois (demande de la paie)", timestamp: "2026-06-02T09:14:00", color: "warning" as const },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Prochaine occurrence calculée côté client (appelé uniquement dans un handler). */
function computeNextRun(frequence: Frequence, heure: string): string {
  const now = new Date();
  const next = new Date(now);
  const [h, m] = heure.split(":").map(Number);
  next.setHours(h, m, 0, 0);
  if (frequence === "daily") {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequence === "weekly") {
    const delta = (8 - next.getDay()) % 7 || 7;
    next.setDate(next.getDate() + delta);
  } else {
    next.setMonth(next.getMonth() + 1, 1);
  }
  return `${next.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" })} ${heure}`;
}

export default function ExportPlanifieSimulateur() {
  const { showToast } = useToast();
  const [exports, setExports] = useState<PlannedExport[]>(INITIAL_EXPORTS);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [toDelete, setToDelete] = useState<PlannedExport | null>(null);

  const [rapport, setRapport] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>("PDF");
  const [frequence, setFrequence] = useState<string | null>("weekly");
  const [heure, setHeure] = useState<string | null>("08:00");
  const [emails, setEmails] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const actifs = exports.filter((e) => e.actif).length;
    const envois = exports.reduce((sum, e) => sum + e.envois30j, 0);
    const uniques = new Set(exports.flatMap((e) => e.destinataires)).size;
    return { actifs, envois, uniques };
  }, [exports]);

  const pushActivity = (action: string, target: string, color: "success" | "warning" | "info" | "error") => {
    setActivity((prev) => [
      { id: `h${Date.now()}`, actor: "Planificateur", action, target, timestamp: new Date().toISOString(), color },
      ...prev,
    ]);
  };

  const sendNow = (exp: PlannedExport) => {
    setExports((prev) =>
      prev.map((e) => (e.id === exp.id ? { ...e, dernierEnvoi: "à l'instant", envois30j: e.envois30j + 1 } : e))
    );
    pushActivity("a envoyé (manuel)", `${exp.rapport} (${exp.format}) à ${exp.destinataires.length} destinataire(s)`, "info");
    showToast(
      `« ${exp.rapport} » envoyé à ${exp.destinataires.join(", ")}.`,
      "success",
      5000,
      "Export envoyé",
      "Export planifié",
      null
    );
  };

  const toggleActive = (exp: PlannedExport) => {
    const actif = !exp.actif;
    setExports((prev) =>
      prev.map((e) =>
        e.id === exp.id
          ? { ...e, actif, prochainEnvoi: actif ? computeNextRun(e.frequence, e.heure) : "—" }
          : e
      )
    );
    pushActivity(actif ? "a réactivé" : "a suspendu", exp.rapport, actif ? "success" : "warning");
    showToast(
      actif ? `Planification « ${exp.rapport} » réactivée.` : `Planification « ${exp.rapport} » suspendue.`,
      actif ? "success" : "warning",
      4000,
      actif ? "Export réactivé" : "Export suspendu",
      "Export planifié",
      null
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setExports((prev) => prev.filter((e) => e.id !== toDelete.id));
    pushActivity("a supprimé la planification", toDelete.rapport, "error");
    showToast(`Planification « ${toDelete.rapport} » supprimée.`, "info", 4000, "Export supprimé", "Export planifié", null);
    setToDelete(null);
  };

  const handleCreate = () => {
    if (!rapport || !frequence || !heure || !format) {
      setFormError("Choisissez un rapport, une fréquence, une heure et un format.");
      return;
    }
    const list = emails
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setFormError("Indiquez au moins un destinataire.");
      return;
    }
    const invalid = list.filter((e) => !EMAIL_RE.test(e));
    if (invalid.length > 0) {
      setFormError(`Adresse(s) invalide(s) : ${invalid.join(", ")}`);
      return;
    }
    setFormError(null);
    const freq = frequence as Frequence;
    const next = computeNextRun(freq, heure);
    setExports((prev) => [
      {
        id: `exp-${Date.now()}`,
        rapport,
        format: format as Format,
        frequence: freq,
        heure,
        destinataires: list,
        actif: true,
        dernierEnvoi: "jamais",
        prochainEnvoi: next,
        envois30j: 0,
      },
      ...prev,
    ]);
    pushActivity("a planifié", `${rapport} (${format}, ${FREQ_LABEL[freq].toLowerCase()} à ${heure})`, "success");
    showToast(
      `« ${rapport} » sera envoyé ${FREQ_LABEL[freq].toLowerCase()} à ${heure} (prochain envoi : ${next}).`,
      "success",
      6000,
      "Export planifié",
      "Export planifié",
      null
    );
    setRapport(null);
    setEmails("");
  };

  const columns = [
    {
      key: "rapport",
      label: "Rapport",
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{String(value)}</div>
          <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            {(row.destinataires as string[]).join(", ")}
          </div>
        </div>
      ),
    },
    {
      key: "format",
      label: "Format",
      render: (value: unknown) => <Badge variant="default">{String(value)}</Badge>,
    },
    {
      key: "frequence",
      label: "Fréquence",
      render: (value: unknown, row: Record<string, unknown>) => (
        <span>
          {FREQ_LABEL[value as Frequence]} · {String(row.heure)}
        </span>
      ),
    },
    { key: "prochainEnvoi", label: "Prochain envoi" },
    { key: "dernierEnvoi", label: "Dernier envoi" },
    {
      key: "actif",
      label: "Statut",
      render: (value: unknown) =>
        value ? <Badge variant="success">Actif</Badge> : <Badge variant="default">En pause</Badge>,
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const exp = row as unknown as PlannedExport;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={() => sendNow(exp)}>
              Envoyer
            </Button>
            <Button size="small" variant="secondary" onClick={() => toggleActive(exp)}>
              {exp.actif ? "Suspendre" : "Reprendre"}
            </Button>
            <Button size="small" variant="destructive" onClick={() => setToDelete(exp)}>
              Supprimer
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Exports actifs" value={String(stats.actifs)} />
        <Metric label="Envois — 30 derniers jours" value={String(stats.envois)} />
        <Metric label="Destinataires uniques" value={String(stats.uniques)} />
      </MetricRow>

      <Panel variant="info" title="Exports planifiés">
        <Table columns={columns} data={exports as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      <Panel variant="info" title="Planifier un nouvel export">
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox label="Rapport" options={RAPPORT_OPTIONS} value={rapport} onChange={setRapport} placeholder="Choisir un rapport" />
          <Selectbox label="Format" options={FORMAT_OPTIONS} value={format} onChange={setFormat} placeholder="Format" />
          <Selectbox label="Fréquence" options={FREQ_OPTIONS} value={frequence} onChange={setFrequence} placeholder="Fréquence" />
          <Selectbox label="Heure d'envoi" options={HEURE_OPTIONS} value={heure} onChange={setHeure} placeholder="Heure" />
        </div>
        <div className="mt-3">
          <Input
            label="Destinataires (séparés par des virgules)"
            placeholder="daf@acme.fr, direction@acme.fr"
            value={emails}
            onChange={setEmails}
          />
        </div>
        {formError && (
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
            {formError}
          </p>
        )}
        <Button className="mt-4" onClick={handleCreate}>
          Planifier l&apos;export
        </Button>
      </Panel>

      <Panel variant="info" title="Derniers envois">
        <ActivityFeed activities={activity} maxItems={6} compact />
      </Panel>

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Supprimer la planification"
        message={
          toDelete
            ? `« ${toDelete.rapport} » ne sera plus envoyé à ${toDelete.destinataires.length} destinataire(s). Cette action est immédiate.`
            : ""
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
