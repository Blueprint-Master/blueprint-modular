"use client";

import { useMemo, useState } from "react";
import {
  ActivityFeed,
  type ActivityItem,
  Badge,
  Button,
  Checkbox,
  ConfirmModal,
  Input,
  Message,
  Metric,
  MetricRow,
  Panel,
  Selectbox,
  Table,
  useToast,
} from "@/components/bpm";
import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";

type Canal = "in-app" | "e-mail" | "SMS";

interface Regle {
  id: string;
  nom: string;
  evenement: string;
  condition: string; // texte lisible, vide si aucune condition
  destinataires: string; // rôle / équipe
  canaux: Canal[];
  actif: boolean;
  declenchements7j: number;
}

const EVENEMENT_OPTIONS = [
  { value: "document.valide", label: "document.valide — Document validé" },
  { value: "devis.cree", label: "devis.cree — Devis créé" },
  { value: "ticket.critique", label: "ticket.critique — Ticket critique ouvert" },
  { value: "contrat.echeance_30j", label: "contrat.echeance_30j — Contrat à échéance (30 j)" },
  { value: "stock.rupture", label: "stock.rupture — Rupture de stock" },
  { value: "facture.impayee", label: "facture.impayee — Facture impayée" },
];

const EQUIPE_OPTIONS = [
  { value: "Auteur du document", label: "Auteur du document" },
  { value: "Direction commerciale", label: "Direction commerciale" },
  { value: "Astreinte technique", label: "Astreinte technique" },
  { value: "Service juridique", label: "Service juridique" },
  { value: "Équipe achats", label: "Équipe achats" },
];

const CANAUX: Canal[] = ["in-app", "e-mail", "SMS"];

/** Jeu de démonstration 100 % déterministe (aucun Date.now() au render). */
const INITIAL_REGLES: Regle[] = [
  {
    id: "r-1",
    nom: "Document validé → auteur",
    evenement: "document.valide",
    condition: "",
    destinataires: "Auteur du document",
    canaux: ["in-app"],
    actif: true,
    declenchements7j: 12,
  },
  {
    id: "r-2",
    nom: "Gros devis → direction commerciale",
    evenement: "devis.cree",
    condition: "montant > 10 000",
    destinataires: "Direction commerciale",
    canaux: ["e-mail", "in-app"],
    actif: true,
    declenchements7j: 4,
  },
  {
    id: "r-3",
    nom: "Ticket critique → astreinte",
    evenement: "ticket.critique",
    condition: "",
    destinataires: "Astreinte technique",
    canaux: ["SMS"],
    actif: true,
    declenchements7j: 2,
  },
  {
    id: "r-4",
    nom: "Échéance contrat → juridique",
    evenement: "contrat.echeance_30j",
    condition: "",
    destinataires: "Service juridique",
    canaux: ["e-mail"],
    actif: false,
    declenchements7j: 0,
  },
  {
    id: "r-5",
    nom: "Rupture de stock → achats",
    evenement: "stock.rupture",
    condition: "",
    destinataires: "Équipe achats",
    canaux: ["in-app"],
    actif: true,
    declenchements7j: 5,
  },
];

const INITIAL_JOURNAL: ActivityItem[] = [
  {
    id: "j-1",
    actor: "Moteur de règles",
    action: "a déclenché",
    target: "Document validé → auteur · Auteur du document · in-app",
    timestamp: "2026-06-12T08:42:00",
    color: "success",
  },
  {
    id: "j-2",
    actor: "Moteur de règles",
    action: "a déclenché",
    target: "Gros devis → direction commerciale · Direction commerciale · e-mail, in-app (montant : 18 400 €)",
    timestamp: "2026-06-11T17:05:00",
    color: "info",
  },
  {
    id: "j-3",
    actor: "Moteur de règles",
    action: "a déclenché",
    target: "Ticket critique → astreinte · Astreinte technique · SMS",
    timestamp: "2026-06-10T03:21:00",
    color: "warning",
  },
];

/** Extrait une condition de montant (« montant > 10 000 ») si présente. */
function parseConditionMontant(condition: string): { op: ">" | ">=" | "<" | "<=" ; seuil: number } | null {
  const m = condition.match(/montant\s*(>=|<=|>|<)\s*([\d\s.,]+)/i);
  if (!m) return null;
  const seuil = Number(m[2].replace(/[\s.]/g, "").replace(",", "."));
  if (Number.isNaN(seuil)) return null;
  return { op: m[1] as ">" | ">=" | "<" | "<=", seuil };
}

/**
 * Évalue la condition d'une règle contre le contexte de l'événement.
 * - Pas de condition → toujours vrai.
 * - Condition de montant → nécessite un montant dans le contexte.
 * - Autre texte libre → considéré documentaire (toujours vrai).
 */
function conditionSatisfaite(regle: Regle, montant: number | null): boolean {
  if (!regle.condition.trim()) return true;
  const cond = parseConditionMontant(regle.condition);
  if (!cond) return true;
  if (montant === null) return false;
  switch (cond.op) {
    case ">":
      return montant > cond.seuil;
    case ">=":
      return montant >= cond.seuil;
    case "<":
      return montant < cond.seuil;
    case "<=":
      return montant <= cond.seuil;
  }
}

const CANAL_BADGE_VARIANT: Record<Canal, "primary" | "default" | "warning"> = {
  "in-app": "primary",
  "e-mail": "default",
  SMS: "warning",
};

function CanauxBadges({ canaux }: { canaux: Canal[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {canaux.map((c) => (
        <Badge key={c} variant={CANAL_BADGE_VARIANT[c]} size="sm">
          {c}
        </Badge>
      ))}
    </div>
  );
}

export default function NotificationsCibleesSimulateur() {
  const { showToast } = useToast();
  const { addNotification } = useNotificationHistory();

  const [regles, setRegles] = useState<Regle[]>(INITIAL_REGLES);
  const [journal, setJournal] = useState<ActivityItem[]>(INITIAL_JOURNAL);
  const [toDelete, setToDelete] = useState<Regle | null>(null);

  // Formulaire de création
  const [evenement, setEvenement] = useState<string | null>(null);
  const [condition, setCondition] = useState("");
  const [equipe, setEquipe] = useState<string | null>(null);
  const [canauxChoisis, setCanauxChoisis] = useState<Canal[]>(["in-app"]);
  const [formError, setFormError] = useState<string | null>(null);

  // Banc d'essai
  const [simEvenement, setSimEvenement] = useState<string | null>("devis.cree");
  const [simMontant, setSimMontant] = useState("");
  const [simResultat, setSimResultat] = useState<{ type: "success" | "warning"; texte: string } | null>(null);

  const stats = useMemo(() => {
    const actives = regles.filter((r) => r.actif).length;
    const declenchements = regles.reduce((sum, r) => sum + r.declenchements7j, 0);
    const canaux = new Set(regles.flatMap((r) => r.canaux)).size;
    return { actives, declenchements, canaux };
  }, [regles]);

  const pushJournal = (target: string, color: ActivityItem["color"], action = "a déclenché") => {
    setJournal((prev) => [
      {
        id: `j-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        actor: "Moteur de règles",
        action,
        target,
        timestamp: new Date().toISOString(),
        color,
      },
      ...prev,
    ]);
  };

  const toggleCanal = (canal: Canal, checked: boolean) => {
    setCanauxChoisis((prev) => (checked ? [...prev, canal] : prev.filter((c) => c !== canal)));
  };

  const toggleActif = (regle: Regle) => {
    const actif = !regle.actif;
    setRegles((prev) => prev.map((r) => (r.id === regle.id ? { ...r, actif } : r)));
    showToast(
      actif
        ? `La règle « ${regle.nom} » est de nouveau active.`
        : `La règle « ${regle.nom} » est suspendue : elle ne sera plus évaluée.`,
      actif ? "success" : "warning",
      4000,
      actif ? "Règle activée" : "Règle suspendue",
      "Notifications ciblées",
      null
    );
  };

  const dupliquer = (regle: Regle) => {
    const copie: Regle = {
      ...regle,
      id: `r-${Date.now()}`,
      nom: `${regle.nom} (copie)`,
      actif: false,
      declenchements7j: 0,
    };
    setRegles((prev) => {
      const idx = prev.findIndex((r) => r.id === regle.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copie);
      return next;
    });
    showToast(
      `« ${copie.nom} » créée en pause : ajustez-la puis activez-la.`,
      "info",
      4000,
      "Règle dupliquée",
      "Notifications ciblées",
      null
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setRegles((prev) => prev.filter((r) => r.id !== toDelete.id));
    showToast(
      `Règle « ${toDelete.nom} » supprimée.`,
      "info",
      4000,
      "Règle supprimée",
      "Notifications ciblées",
      null
    );
    setToDelete(null);
  };

  const handleCreate = () => {
    if (!evenement) {
      setFormError("Choisissez l'événement déclencheur.");
      return;
    }
    if (!equipe) {
      setFormError("Choisissez les destinataires (équipe ou rôle).");
      return;
    }
    if (canauxChoisis.length === 0) {
      setFormError("Sélectionnez au moins un canal (in-app, e-mail ou SMS).");
      return;
    }
    setFormError(null);
    const evtLabel = EVENEMENT_OPTIONS.find((o) => o.value === evenement)?.label.split(" — ")[1] ?? evenement;
    const nouvelle: Regle = {
      id: `r-${Date.now()}`,
      nom: `${evtLabel} → ${equipe.toLowerCase()}`,
      evenement,
      condition: condition.trim(),
      destinataires: equipe,
      canaux: CANAUX.filter((c) => canauxChoisis.includes(c)),
      actif: true,
      declenchements7j: 0,
    };
    setRegles((prev) => [nouvelle, ...prev]);
    showToast(
      `Sur « ${evenement} »${nouvelle.condition ? ` (si ${nouvelle.condition})` : ""}, ${equipe} sera notifié via ${nouvelle.canaux.join(", ")}.`,
      "success",
      6000,
      "Règle créée",
      "Notifications ciblées",
      null
    );
    setEvenement(null);
    setCondition("");
    setEquipe(null);
    setCanauxChoisis(["in-app"]);
  };

  /** BANC D'ESSAI : émet un événement et évalue réellement les règles actives. */
  const emettreEvenement = () => {
    if (!simEvenement) {
      setSimResultat({ type: "warning", texte: "Choisissez un événement à émettre." });
      return;
    }
    const montantBrut = simMontant.replace(/[\s€.]/g, "").replace(",", ".");
    const montant = simMontant.trim() === "" ? null : Number(montantBrut);
    if (montant !== null && Number.isNaN(montant)) {
      setSimResultat({ type: "warning", texte: `Contexte « ${simMontant} » illisible : indiquez un montant numérique (ex. 12500).` });
      return;
    }

    const declenchees = regles.filter(
      (r) => r.actif && r.evenement === simEvenement && conditionSatisfaite(r, montant)
    );

    if (declenchees.length === 0) {
      const enPause = regles.some((r) => !r.actif && r.evenement === simEvenement);
      const condNonRemplie = regles.some(
        (r) => r.actif && r.evenement === simEvenement && !conditionSatisfaite(r, montant)
      );
      let detail = "";
      if (condNonRemplie) detail = " Une règle correspond à l'événement mais sa condition de montant n'est pas remplie.";
      else if (enPause) detail = " Une règle correspond à l'événement mais elle est en pause.";
      setSimResultat({
        type: "warning",
        texte: `Aucune règle déclenchée pour « ${simEvenement} »${montant !== null ? ` (montant : ${montant.toLocaleString("fr-FR")} €)` : ""}.${detail}`,
      });
      return;
    }

    const totalNotifications = declenchees.reduce((sum, r) => sum + r.canaux.length, 0);
    const ids = new Set(declenchees.map((r) => r.id));
    setRegles((prev) =>
      prev.map((r) => (ids.has(r.id) ? { ...r, declenchements7j: r.declenchements7j + 1 } : r))
    );

    declenchees.forEach((r) => {
      pushJournal(
        `${r.nom} · ${r.destinataires} · ${r.canaux.join(", ")}${montant !== null ? ` (montant : ${montant.toLocaleString("fr-FR")} €)` : ""}`,
        "success"
      );
      // Canal in-app : vraie notification dans la cloche du header (module Notification).
      if (r.canaux.includes("in-app")) {
        const payload = {
          message: `Règle « ${r.nom} » : ${r.destinataires} notifié (événement ${r.evenement}${montant !== null ? `, montant ${montant.toLocaleString("fr-FR")} €` : ""}).`,
          type: "info" as const,
          title: "Notification ciblée",
          pageName: "Notifications ciblées",
        };
        addNotification({ ...payload, level: getNotificationLevel(payload) });
      }
    });

    setSimResultat({
      type: "success",
      texte: `${declenchees.length} règle${declenchees.length > 1 ? "s" : ""} déclenchée${declenchees.length > 1 ? "s" : ""} → ${totalNotifications} notification${totalNotifications > 1 ? "s" : ""} (${declenchees.map((r) => r.nom).join(" ; ")}).`,
    });
    showToast(
      `${declenchees.length} règle${declenchees.length > 1 ? "s" : ""} déclenchée${declenchees.length > 1 ? "s" : ""} → ${totalNotifications} notification${totalNotifications > 1 ? "s" : ""}. Les envois in-app sont visibles dans la cloche du header.`,
      "success",
      6000,
      "Événement émis",
      "Notifications ciblées",
      null
    );
  };

  const columns = [
    {
      key: "nom",
      label: "Règle",
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{String(value)}</div>
          <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            <code>{String(row.evenement)}</code>
            {String(row.condition) ? ` · si ${String(row.condition)}` : ""}
          </div>
        </div>
      ),
    },
    { key: "destinataires", label: "Destinataires" },
    {
      key: "canaux",
      label: "Canaux",
      render: (value: unknown) => <CanauxBadges canaux={value as Canal[]} />,
    },
    {
      key: "declenchements7j",
      label: "Déclenchements (7 j)",
      align: "right" as const,
      render: (value: unknown) => <span>{String(value)}</span>,
    },
    {
      key: "actif",
      label: "Statut",
      render: (value: unknown) =>
        value ? <Badge variant="success">Active</Badge> : <Badge variant="default">En pause</Badge>,
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const regle = row as unknown as Regle;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={() => toggleActif(regle)}>
              {regle.actif ? "Suspendre" : "Activer"}
            </Button>
            <Button size="small" variant="secondary" onClick={() => dupliquer(regle)}>
              Dupliquer
            </Button>
            <Button size="small" variant="destructive" onClick={() => setToDelete(regle)}>
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
        <Metric label="Règles actives" value={String(stats.actives)} />
        <Metric label="Déclenchements (7 j)" value={String(stats.declenchements)} />
        <Metric label="Canaux configurés" value={String(stats.canaux)} />
      </MetricRow>

      <Panel variant="info" title="Règles de notification">
        <Table columns={columns} data={regles as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      <Panel variant="info" title="Créer une règle">
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox
            label="Événement déclencheur"
            options={EVENEMENT_OPTIONS}
            value={evenement}
            onChange={setEvenement}
            placeholder="Choisir un événement"
          />
          <Input
            label="Condition (optionnelle)"
            placeholder="ex. montant > 10 000"
            value={condition}
            onChange={setCondition}
          />
          <Selectbox
            label="Destinataires (équipe ou rôle)"
            options={EQUIPE_OPTIONS}
            value={equipe}
            onChange={setEquipe}
            placeholder="Choisir une équipe"
          />
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: "var(--bpm-text-primary)" }}>
              Canaux (au moins un)
            </div>
            <div className="flex flex-wrap gap-4">
              {CANAUX.map((canal) => (
                <Checkbox
                  key={canal}
                  label={canal}
                  checked={canauxChoisis.includes(canal)}
                  onChange={(checked) => toggleCanal(canal, checked)}
                />
              ))}
            </div>
          </div>
        </div>
        {formError && (
          <p className="mt-3 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
            {formError}
          </p>
        )}
        <Button className="mt-4" onClick={handleCreate}>
          Créer la règle
        </Button>
      </Panel>

      <Panel variant="info" title="Banc d'essai — simuler un événement">
        <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Émettez un événement métier : le moteur évalue les règles actives (événement + condition de
          montant le cas échéant), journalise chaque déclenchement et pousse les notifications in-app
          dans la cloche du header.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox
            label="Événement à émettre"
            options={EVENEMENT_OPTIONS}
            value={simEvenement}
            onChange={setSimEvenement}
            placeholder="Choisir un événement"
          />
          <Input
            label="Contexte — montant en € (optionnel)"
            placeholder="ex. 12500"
            value={simMontant}
            onChange={setSimMontant}
          />
        </div>
        <Button className="mt-4" onClick={emettreEvenement}>
          Émettre l&apos;événement
        </Button>
        {simResultat && (
          <Message type={simResultat.type} className="mt-4">
            {simResultat.texte}
          </Message>
        )}
      </Panel>

      <Panel variant="info" title="Journal des déclenchements">
        <ActivityFeed activities={journal} maxItems={8} compact />
      </Panel>

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Supprimer la règle"
        message={
          toDelete
            ? `« ${toDelete.nom} » (${toDelete.evenement}) ne notifiera plus ${toDelete.destinataires}. Cette action est immédiate.`
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
