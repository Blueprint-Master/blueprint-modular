"use client";

import { useMemo, useState } from "react";
import { ActivityFeed, Badge, Button, Card, Checkbox, ConfirmModal, Input, Message, Metric, MetricRow, Selectbox, Table, type ActivityItem, useToast } from "@/components/bpm";
import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import { getNotificationLevel } from "@/lib/notificationLevels";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  CANAUX,
  EVENT_CODES,
  STR,
  TEAM_KEYS,
  type Canal,
  type EventCode,
  type LText,
  type TeamKey,
} from "./strings";

interface Regle {
  id: string;
  nom: LText; // nom bilingue, résolu au render selon la locale
  evenement: string; // code technique, jamais traduit (matching)
  condition: string; // texte lisible, vide si aucune condition
  destinataires: TeamKey; // clé stable d'équipe / rôle (libellé résolu au render)
  canaux: Canal[];
  actif: boolean;
  declenchements7j: number;
}

/** Entrée structurée du journal : résolue au render selon la locale. */
interface JournalEntry {
  id: string;
  nom: LText;
  destinataires: TeamKey;
  canaux: Canal[];
  montant: number | null;
  timestamp: string;
  color: ActivityItem["color"];
}

/** Nom bilingue d'une règle seedée. */
const seedNom = (key: keyof typeof STR.fr.seedRules): LText => ({
  fr: STR.fr.seedRules[key],
  en: STR.en.seedRules[key],
});

/** Jeu de démonstration 100 % déterministe (aucun Date.now() au render). */
const INITIAL_REGLES: Regle[] = [
  {
    id: "r-1",
    nom: seedNom("r1"),
    evenement: "document.valide",
    condition: "",
    destinataires: "Auteur du document",
    canaux: ["in-app"],
    actif: true,
    declenchements7j: 12,
  },
  {
    id: "r-2",
    nom: seedNom("r2"),
    evenement: "devis.cree",
    condition: "montant > 10 000",
    destinataires: "Direction commerciale",
    canaux: ["e-mail", "in-app"],
    actif: true,
    declenchements7j: 4,
  },
  {
    id: "r-3",
    nom: seedNom("r3"),
    evenement: "ticket.critique",
    condition: "",
    destinataires: "Astreinte technique",
    canaux: ["SMS"],
    actif: true,
    declenchements7j: 2,
  },
  {
    id: "r-4",
    nom: seedNom("r4"),
    evenement: "contrat.echeance_30j",
    condition: "",
    destinataires: "Service juridique",
    canaux: ["e-mail"],
    actif: false,
    declenchements7j: 0,
  },
  {
    id: "r-5",
    nom: seedNom("r5"),
    evenement: "stock.rupture",
    condition: "",
    destinataires: "Équipe achats",
    canaux: ["in-app"],
    actif: true,
    declenchements7j: 5,
  },
];

const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: "j-1",
    nom: seedNom("r1"),
    destinataires: "Auteur du document",
    canaux: ["in-app"],
    montant: null,
    timestamp: "2026-06-12T08:42:00",
    color: "success",
  },
  {
    id: "j-2",
    nom: seedNom("r2"),
    destinataires: "Direction commerciale",
    canaux: ["e-mail", "in-app"],
    montant: 18400,
    timestamp: "2026-06-11T17:05:00",
    color: "info",
  },
  {
    id: "j-3",
    nom: seedNom("r3"),
    destinataires: "Astreinte technique",
    canaux: ["SMS"],
    montant: null,
    timestamp: "2026-06-10T03:21:00",
    color: "warning",
  },
];

/** Résultat du banc d'essai, stocké structuré et résolu au render selon la locale. */
type SimResultat =
  | { kind: "no-event" }
  | { kind: "bad-amount"; raw: string }
  | { kind: "none"; evenement: string; montant: number | null; detail: "condition" | "paused" | null }
  | { kind: "triggered"; count: number; total: number; noms: LText[] };

type FormErrorKey = keyof typeof STR.fr.errors;

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
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="flex flex-wrap gap-1">
      {canaux.map((c) => (
        <Badge key={c} variant={CANAL_BADGE_VARIANT[c]} size="sm">
          {s.channels[c]}
        </Badge>
      ))}
    </div>
  );
}

export default function NotificationsCibleesSimulateur() {
  const { showToast } = useToast();
  const { addNotification } = useNotificationHistory();
  const { locale } = useI18n();
  const s = STR[locale];

  const [regles, setRegles] = useState<Regle[]>(INITIAL_REGLES);
  const [journal, setJournal] = useState<JournalEntry[]>(INITIAL_JOURNAL);
  const [toDelete, setToDelete] = useState<Regle | null>(null);

  // Formulaire de création
  const [evenement, setEvenement] = useState<string | null>(null);
  const [condition, setCondition] = useState("");
  const [equipe, setEquipe] = useState<string | null>(null);
  const [canauxChoisis, setCanauxChoisis] = useState<Canal[]>(["in-app"]);
  const [formError, setFormError] = useState<FormErrorKey | null>(null);

  // Banc d'essai
  const [simEvenement, setSimEvenement] = useState<string | null>("devis.cree");
  const [simMontant, setSimMontant] = useState("");
  const [simResultat, setSimResultat] = useState<SimResultat | null>(null);

  const eventOptions = useMemo(
    () => EVENT_CODES.map((code) => ({ value: code, label: `${code} — ${s.events[code]}` })),
    [s]
  );
  const equipeOptions = useMemo(
    () => TEAM_KEYS.map((key) => ({ value: key, label: s.teams[key] })),
    [s]
  );

  const stats = useMemo(() => {
    const actives = regles.filter((r) => r.actif).length;
    const declenchements = regles.reduce((sum, r) => sum + r.declenchements7j, 0);
    const canaux = new Set(regles.flatMap((r) => r.canaux)).size;
    return { actives, declenchements, canaux };
  }, [regles]);

  const pushJournal = (
    entry: Omit<JournalEntry, "id" | "timestamp">
  ) => {
    setJournal((prev) => [
      {
        ...entry,
        id: `j-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  /** Le journal est stocké structuré ; on le résout ici selon la locale active. */
  const journalItems = useMemo<ActivityItem[]>(
    () =>
      journal.map((e) => ({
        id: e.id,
        actor: s.journalActor,
        action: s.journalAction,
        target: `${e.nom[locale]} · ${s.teams[e.destinataires]} · ${e.canaux
          .map((c) => s.channels[c])
          .join(", ")}${e.montant !== null ? s.amountNote(e.montant) : ""}`,
        timestamp: e.timestamp,
        color: e.color,
      })),
    [journal, locale, s]
  );

  const toggleCanal = (canal: Canal, checked: boolean) => {
    setCanauxChoisis((prev) => (checked ? [...prev, canal] : prev.filter((c) => c !== canal)));
  };

  const toggleActif = (regle: Regle) => {
    const actif = !regle.actif;
    setRegles((prev) => prev.map((r) => (r.id === regle.id ? { ...r, actif } : r)));
    showToast(
      actif ? s.toastRuleEnabled(regle.nom[locale]) : s.toastRuleSuspended(regle.nom[locale]),
      actif ? "success" : "warning",
      4000,
      actif ? s.toastRuleEnabledTitle : s.toastRuleSuspendedTitle,
      s.toastSource,
      null
    );
  };

  const dupliquer = (regle: Regle) => {
    const copie: Regle = {
      ...regle,
      id: `r-${Date.now()}`,
      nom: {
        fr: `${regle.nom.fr}${STR.fr.copySuffix}`,
        en: `${regle.nom.en}${STR.en.copySuffix}`,
      },
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
      s.toastDuplicated(copie.nom[locale]),
      "info",
      4000,
      s.toastDuplicatedTitle,
      s.toastSource,
      null
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setRegles((prev) => prev.filter((r) => r.id !== toDelete.id));
    showToast(
      s.toastDeleted(toDelete.nom[locale]),
      "info",
      4000,
      s.toastDeletedTitle,
      s.toastSource,
      null
    );
    setToDelete(null);
  };

  const handleCreate = () => {
    if (!evenement) {
      setFormError("event");
      return;
    }
    if (!equipe) {
      setFormError("team");
      return;
    }
    if (canauxChoisis.length === 0) {
      setFormError("channels");
      return;
    }
    setFormError(null);
    const evtCode = evenement as EventCode;
    const teamKey = equipe as TeamKey;
    const nouvelle: Regle = {
      id: `r-${Date.now()}`,
      nom: {
        fr: `${STR.fr.events[evtCode]} → ${STR.fr.teams[teamKey].toLowerCase()}`,
        en: `${STR.en.events[evtCode]} → ${STR.en.teams[teamKey].toLowerCase()}`,
      },
      evenement,
      condition: condition.trim(),
      destinataires: teamKey,
      canaux: CANAUX.filter((c) => canauxChoisis.includes(c)),
      actif: true,
      declenchements7j: 0,
    };
    setRegles((prev) => [nouvelle, ...prev]);
    showToast(
      s.toastCreated(
        evenement,
        nouvelle.condition,
        s.teams[teamKey],
        nouvelle.canaux.map((c) => s.channels[c]).join(", ")
      ),
      "success",
      6000,
      s.toastCreatedTitle,
      s.toastSource,
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
      setSimResultat({ kind: "no-event" });
      return;
    }
    const montantBrut = simMontant.replace(/[\s€.]/g, "").replace(",", ".");
    const montant = simMontant.trim() === "" ? null : Number(montantBrut);
    if (montant !== null && Number.isNaN(montant)) {
      setSimResultat({ kind: "bad-amount", raw: simMontant });
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
      setSimResultat({
        kind: "none",
        evenement: simEvenement,
        montant,
        detail: condNonRemplie ? "condition" : enPause ? "paused" : null,
      });
      return;
    }

    const totalNotifications = declenchees.reduce((sum, r) => sum + r.canaux.length, 0);
    const ids = new Set(declenchees.map((r) => r.id));
    setRegles((prev) =>
      prev.map((r) => (ids.has(r.id) ? { ...r, declenchements7j: r.declenchements7j + 1 } : r))
    );

    declenchees.forEach((r) => {
      pushJournal({
        nom: r.nom,
        destinataires: r.destinataires,
        canaux: r.canaux,
        montant,
        color: "success",
      });
      // Canal in-app : vraie notification dans la cloche du header (module Notification),
      // rédigée dans la locale active au moment du déclenchement.
      if (r.canaux.includes("in-app")) {
        const payload = {
          message: s.bellMessage(r.nom[locale], s.teams[r.destinataires], r.evenement, montant),
          type: "info" as const,
          title: s.bellTitle,
          pageName: s.toastSource,
        };
        addNotification({ ...payload, level: getNotificationLevel(payload) });
      }
    });

    setSimResultat({
      kind: "triggered",
      count: declenchees.length,
      total: totalNotifications,
      noms: declenchees.map((r) => r.nom),
    });
    showToast(
      s.toastEmitted(declenchees.length, totalNotifications),
      "success",
      6000,
      s.toastEmittedTitle,
      s.toastSource,
      null
    );
  };

  /** Résout le résultat du banc d'essai dans la locale active. */
  const simMessage = useMemo<{ type: "success" | "warning"; texte: string } | null>(() => {
    if (!simResultat) return null;
    switch (simResultat.kind) {
      case "no-event":
        return { type: "warning", texte: s.simNoEvent };
      case "bad-amount":
        return { type: "warning", texte: s.simBadAmount(simResultat.raw) };
      case "none": {
        let detail = "";
        if (simResultat.detail === "condition") detail = s.simNoneDetailCondition;
        else if (simResultat.detail === "paused") detail = s.simNoneDetailPaused;
        return {
          type: "warning",
          texte: `${s.simNone(
            simResultat.evenement,
            simResultat.montant !== null ? s.amountNote(simResultat.montant) : ""
          )}${detail}`,
        };
      }
      case "triggered":
        return {
          type: "success",
          texte: s.simTriggered(
            simResultat.count,
            simResultat.total,
            simResultat.noms.map((n) => n[locale]).join(s.namesSeparator)
          ),
        };
    }
  }, [simResultat, s, locale]);

  const columns = [
    {
      key: "nom",
      label: s.colRule,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>
            {(value as LText)[locale]}
          </div>
          <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            <code>{String(row.evenement)}</code>
            {String(row.condition) ? s.conditionNote(String(row.condition)) : ""}
          </div>
        </div>
      ),
    },
    {
      key: "destinataires",
      label: s.colRecipients,
      render: (value: unknown) => <span>{s.teams[value as TeamKey]}</span>,
    },
    {
      key: "canaux",
      label: s.colChannels,
      render: (value: unknown) => <CanauxBadges canaux={value as Canal[]} />,
    },
    {
      key: "declenchements7j",
      label: s.colTriggers,
      align: "right" as const,
      render: (value: unknown) => <span>{String(value)}</span>,
    },
    {
      key: "actif",
      label: s.colStatus,
      render: (value: unknown) =>
        value ? (
          <Badge variant="success">{s.statusActive}</Badge>
        ) : (
          <Badge variant="default">{s.statusPaused}</Badge>
        ),
    },
    {
      key: "id",
      label: s.colActions,
      render: (_: unknown, row: Record<string, unknown>) => {
        const regle = row as unknown as Regle;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={() => toggleActif(regle)}>
              {regle.actif ? s.actionSuspend : s.actionEnable}
            </Button>
            <Button size="small" variant="secondary" onClick={() => dupliquer(regle)}>
              {s.actionDuplicate}
            </Button>
            <Button size="small" variant="destructive" onClick={() => setToDelete(regle)}>
              {s.actionDelete}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={s.metricActiveRules} value={String(stats.actives)} />
        <Metric label={s.metricTriggers7d} value={String(stats.declenchements)} />
        <Metric label={s.metricChannels} value={String(stats.canaux)} />
      </MetricRow>

      <Card variant="outlined" title={s.panelRules}>
        <Table columns={columns} data={regles as unknown as Record<string, unknown>[]} striped hover />
      </Card>

      <Card variant="outlined" title={s.panelCreate}>
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox
            label={s.formEventLabel}
            options={eventOptions}
            value={evenement}
            onChange={setEvenement}
            placeholder={s.formEventPlaceholder}
          />
          <Input
            label={s.formConditionLabel}
            placeholder={s.formConditionPlaceholder}
            value={condition}
            onChange={setCondition}
          />
          <Selectbox
            label={s.formTeamLabel}
            options={equipeOptions}
            value={equipe}
            onChange={setEquipe}
            placeholder={s.formTeamPlaceholder}
          />
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: "var(--bpm-text-primary)" }}>
              {s.formChannelsLabel}
            </div>
            <div className="flex flex-wrap gap-4">
              {CANAUX.map((canal) => (
                <Checkbox
                  key={canal}
                  label={s.channels[canal]}
                  checked={canauxChoisis.includes(canal)}
                  onChange={(checked) => toggleCanal(canal, checked)}
                />
              ))}
            </div>
          </div>
        </div>
        {formError && (
          <p className="mt-3 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
            {s.errors[formError]}
          </p>
        )}
        <Button className="mt-4" onClick={handleCreate}>
          {s.formSubmit}
        </Button>
      </Card>

      <Card variant="outlined" title={s.panelBench}>
        <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          {s.benchIntro}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox
            label={s.benchEventLabel}
            options={eventOptions}
            value={simEvenement}
            onChange={setSimEvenement}
            placeholder={s.formEventPlaceholder}
          />
          <Input
            label={s.benchAmountLabel}
            placeholder={s.benchAmountPlaceholder}
            value={simMontant}
            onChange={setSimMontant}
          />
        </div>
        <Button className="mt-4" onClick={emettreEvenement}>
          {s.benchSubmit}
        </Button>
        {simMessage && (
          <Message type={simMessage.type} className="mt-4">
            {simMessage.texte}
          </Message>
        )}
      </Card>

      <Card variant="outlined" title={s.panelJournal}>
        <ActivityFeed activities={journalItems} maxItems={8} compact />
      </Card>

      <ConfirmModal
        isOpen={toDelete !== null}
        title={s.deleteTitle}
        message={
          toDelete
            ? s.deleteMessage(toDelete.nom[locale], toDelete.evenement, s.teams[toDelete.destinataires])
            : ""
        }
        confirmLabel={s.deleteConfirm}
        cancelLabel={s.deleteCancel}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
