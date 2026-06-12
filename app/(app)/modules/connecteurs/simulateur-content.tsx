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

type ConnecteurType = "API REST" | "SFTP" | "PostgreSQL" | "MySQL";
type ConnecteurStatut = "connected" | "error" | "paused";

interface Connecteur {
  id: string;
  nom: string;
  type: ConnecteurType;
  hote: string;
  identifiant: string;
  statut: ConnecteurStatut;
  planification: string;
  derniereSynchro: string;
  lignes24h: number;
  synchros24h: number;
  /** false tant que les identifiants sont invalides (test/synchro échouent). */
  authValide: boolean;
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

const STATUT_LABEL: Record<ConnecteurStatut, string> = {
  connected: "Connecté",
  error: "Erreur",
  paused: "En pause",
};

/**
 * Jeu de démonstration déterministe : libellés relatifs figés, aucune
 * date calculée au render (rendu identique serveur/client).
 */
const INITIAL_CONNECTEURS: Connecteur[] = [
  {
    id: "con-1",
    nom: "ERP Sage — API REST",
    type: "API REST",
    hote: "https://api.sage.acme.fr/v3",
    identifiant: "svc-bpm-sage",
    statut: "connected",
    planification: "Toutes les heures",
    derniereSynchro: "il y a 25 min",
    lignes24h: 12400,
    synchros24h: 24,
    authValide: true,
  },
  {
    id: "con-2",
    nom: "Banque BNP — SFTP relevés",
    type: "SFTP",
    hote: "sftp.bnpparibas.com:22/releves",
    identifiant: "acme-treso",
    statut: "connected",
    planification: "Quotidien à 06:00",
    derniereSynchro: "ce matin 06:00",
    lignes24h: 310,
    synchros24h: 1,
    authValide: true,
  },
  {
    id: "con-3",
    nom: "Datawarehouse — PostgreSQL",
    type: "PostgreSQL",
    hote: "dwh.acme.internal:5432/analytics",
    identifiant: "bpm_reader",
    statut: "error",
    planification: "Toutes les 6 h",
    derniereSynchro: "il y a 3 j",
    lignes24h: 0,
    synchros24h: 0,
    authValide: false,
  },
  {
    id: "con-4",
    nom: "CRM HubSpot — API REST",
    type: "API REST",
    hote: "https://api.hubapi.com/crm/v3",
    identifiant: "svc-bpm-hubspot",
    statut: "paused",
    planification: "Toutes les 4 h (suspendu)",
    derniereSynchro: "il y a 5 j",
    lignes24h: 0,
    synchros24h: 0,
    authValide: true,
  },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: "j1", actor: "Planificateur", action: "a synchronisé", target: "ERP Sage — API REST (518 lignes importées)", timestamp: "2026-06-12T09:00:00", color: "success" as const },
  { id: "j2", actor: "Planificateur", action: "a synchronisé", target: "Banque BNP — SFTP relevés (310 lignes importées)", timestamp: "2026-06-12T06:00:00", color: "success" as const },
  { id: "j3", actor: "Planificateur", action: "a échoué sur", target: "Datawarehouse — PostgreSQL (authentification refusée)", timestamp: "2026-06-09T08:00:00", color: "error" as const },
  { id: "j4", actor: "Admin", action: "a mis en pause", target: "CRM HubSpot — API REST (migration en cours côté CRM)", timestamp: "2026-06-07T11:32:00", color: "warning" as const },
];

/** Hôte/URL plausible : URL http(s)/sftp, ou hôte (avec port/chemin optionnels). */
const HOTE_RE = /^((https?|sftp):\/\/)?[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}(:\d{1,5})?(\/\S*)?$/i;

export default function ConnecteursSimulateur() {
  const { showToast } = useToast();
  const [connecteurs, setConnecteurs] = useState<Connecteur[]>(INITIAL_CONNECTEURS);
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
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

  const pushActivity = (
    actor: string,
    action: string,
    target: string,
    color: "default" | "info" | "success" | "warning" | "error"
  ) => {
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
        pushActivity("Admin", "a testé (échec)", `${con.nom} — authentification refusée`, "error");
        showToast(
          `Connexion à « ${con.nom} » refusée : authentification refusée (identifiant « ${con.identifiant} » invalide). Corrigez l'identifiant puis relancez le test.`,
          "error",
          6000,
          "Test échoué",
          "Connecteurs",
          null
        );
        return;
      }
      setConnecteurs((prev) => prev.map((c) => (c.id === con.id ? { ...c, statut: "connected" } : c)));
      pushActivity("Admin", "a testé avec succès", `${con.nom} (${con.type} — ${con.hote})`, "success");
      showToast(
        `Connexion à « ${con.nom} » établie en 0,6 s. Statut : Connecté.`,
        "success",
        5000,
        "Test réussi",
        "Connecteurs",
        null
      );
    }, 600);
  };

  const synchroniser = (con: Connecteur) => {
    if (!con.authValide) {
      pushActivity("Admin", "a échoué sur", `${con.nom} — synchronisation refusée (authentification refusée)`, "error");
      showToast(
        `Synchronisation de « ${con.nom} » impossible : authentification refusée. Corrigez l'identifiant via « Corriger ».`,
        "error",
        6000,
        "Synchronisation échouée",
        "Connecteurs",
        null
      );
      return;
    }
    const delta = SYNC_DELTA[con.type];
    setConnecteurs((prev) =>
      prev.map((c) =>
        c.id === con.id
          ? { ...c, derniereSynchro: "à l'instant", lignes24h: c.lignes24h + delta, synchros24h: c.synchros24h + 1, statut: "connected" }
          : c
      )
    );
    pushActivity("Admin", "a synchronisé (manuel)", `${con.nom} (${delta.toLocaleString("fr-FR")} lignes importées)`, "info");
    showToast(
      `« ${con.nom} » synchronisé : ${delta.toLocaleString("fr-FR")} lignes importées.`,
      "success",
      5000,
      "Synchronisation terminée",
      "Connecteurs",
      null
    );
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
      setFixError("L'identifiant ne peut pas être vide.");
      return;
    }
    if (value === fixing.identifiant) {
      setFixError("Saisissez un identifiant différent de l'identifiant refusé.");
      return;
    }
    setConnecteurs((prev) =>
      prev.map((c) => (c.id === fixing.id ? { ...c, identifiant: value, authValide: true } : c))
    );
    pushActivity("Admin", "a corrigé l'identifiant de", `${fixing.nom} (nouvel identifiant : ${value})`, "info");
    showToast(
      `Identifiant de « ${fixing.nom} » mis à jour. Lancez « Tester » pour rétablir la connexion.`,
      "info",
      5000,
      "Identifiant corrigé",
      "Connecteurs",
      null
    );
    setFixing(null);
    setFixIdentifiant("");
    setFixError(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setConnecteurs((prev) => prev.filter((c) => c.id !== toDelete.id));
    pushActivity("Admin", "a supprimé le connecteur", `${toDelete.nom} (${toDelete.type})`, "error");
    showToast(`Connecteur « ${toDelete.nom} » supprimé.`, "info", 4000, "Connecteur supprimé", "Connecteurs", null);
    setToDelete(null);
  };

  const handleCreate = () => {
    if (creating) return;
    const nomTrim = nom.trim();
    const hoteTrim = hote.trim();
    const idTrim = identifiant.trim();
    if (!nomTrim) {
      setFormError("Indiquez un nom de connecteur.");
      return;
    }
    if (!type) {
      setFormError("Choisissez un type de connecteur.");
      return;
    }
    if (!hoteTrim) {
      setFormError("Indiquez l'hôte ou l'URL de la source.");
      return;
    }
    if (!HOTE_RE.test(hoteTrim)) {
      setFormError("Hôte/URL invalide. Exemples : https://api.exemple.fr/v1, sftp.exemple.fr:22, db.exemple.fr:5432/base");
      return;
    }
    if (!idTrim) {
      setFormError("Indiquez l'identifiant de connexion (compte de service).");
      return;
    }
    setFormError(null);
    setCreating(true);
    const newCon: Connecteur = {
      id: `con-${Date.now()}`,
      nom: nomTrim,
      type: type as ConnecteurType,
      hote: hoteTrim,
      identifiant: idTrim,
      statut: "connected",
      planification: "Manuelle (à planifier)",
      derniereSynchro: "jamais",
      lignes24h: 0,
      synchros24h: 0,
      authValide: true,
    };
    setTimeout(() => {
      setCreating(false);
      setConnecteurs((prev) => [newCon, ...prev]);
      pushActivity("Admin", "a créé et testé", `${newCon.nom} (${newCon.type} — ${newCon.hote})`, "success");
      showToast(
        `Connecteur « ${newCon.nom} » créé. Test de connexion réussi : statut Connecté.`,
        "success",
        6000,
        "Connecteur créé",
        "Connecteurs",
        null
      );
      setNom("");
      setType(null);
      setHote("");
      setIdentifiant("");
    }, 600);
  };

  const columns = [
    {
      key: "nom",
      label: "Connecteur",
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{String(value)}</div>
          <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            {String(row.hote)} · {String(row.planification)}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: unknown) => <Badge variant="default">{String(value)}</Badge>,
    },
    {
      key: "statut",
      label: "Statut",
      render: (value: unknown) => {
        const statut = value as ConnecteurStatut;
        const variant = statut === "connected" ? "success" : statut === "error" ? "error" : "default";
        return <Badge variant={variant}>{STATUT_LABEL[statut]}</Badge>;
      },
    },
    { key: "derniereSynchro", label: "Dernière synchro" },
    {
      key: "lignes24h",
      label: "Volumétrie (24 h)",
      align: "right" as const,
      render: (value: unknown) => <span>{Number(value).toLocaleString("fr-FR")} lignes</span>,
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const con = row as unknown as Connecteur;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" disabled={testingId !== null} onClick={() => tester(con)}>
              {testingId === con.id ? "Test…" : "Tester"}
            </Button>
            <Button size="small" variant="secondary" onClick={() => synchroniser(con)}>
              Synchroniser
            </Button>
            {!con.authValide && (
              <Button size="small" variant="outline" onClick={() => openFix(con)}>
                Corriger
              </Button>
            )}
            <Button size="small" variant="destructive" onClick={() => setToDelete(con)}>
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
        <Metric label="Connecteurs actifs" value={String(stats.actifs)} />
        <Metric label="Synchros 24 h" value={String(stats.synchros)} />
        <Metric label="Lignes importées (24 h)" value={stats.lignes.toLocaleString("fr-FR")} />
      </MetricRow>

      <Panel variant="info" title="Connecteurs de données">
        <Table columns={columns} data={connecteurs as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      {fixing && (
        <Panel variant="info" title={`Corriger l'identifiant — ${fixing.nom}`}>
          <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            La dernière tentative a été refusée avec l&apos;identifiant « {fixing.identifiant} ».
            Saisissez un identifiant valide puis relancez « Tester ».
          </p>
          <Input
            label="Identifiant de connexion"
            placeholder="ex. bpm_reader_v2"
            value={fixIdentifiant}
            onChange={setFixIdentifiant}
          />
          {fixError && (
            <p className="mt-2 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
              {fixError}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={saveFix}>Enregistrer l&apos;identifiant</Button>
            <Button variant="ghost" onClick={() => { setFixing(null); setFixError(null); }}>
              Annuler
            </Button>
          </div>
        </Panel>
      )}

      <Panel variant="info" title="Ajouter un connecteur">
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Nom" placeholder="ex. Paie Silae — API REST" value={nom} onChange={setNom} />
          <Selectbox label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} placeholder="Choisir un type" />
          <Input
            label="Hôte / URL"
            placeholder="https://api.exemple.fr/v1 ou db.exemple.fr:5432/base"
            value={hote}
            onChange={setHote}
          />
          <Input label="Identifiant" placeholder="compte de service, ex. svc-bpm-paie" value={identifiant} onChange={setIdentifiant} />
        </div>
        {formError && (
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
            {formError}
          </p>
        )}
        <Button className="mt-4" disabled={creating} onClick={handleCreate}>
          {creating ? "Test de connexion…" : "Créer et tester"}
        </Button>
      </Panel>

      <Panel variant="info" title="Journal de synchronisation">
        <ActivityFeed activities={activity} maxItems={8} compact />
      </Panel>

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Supprimer le connecteur"
        message={
          toDelete
            ? `« ${toDelete.nom} » (${toDelete.type}) ne sera plus synchronisé. Les données déjà importées sont conservées. Cette action est immédiate.`
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
