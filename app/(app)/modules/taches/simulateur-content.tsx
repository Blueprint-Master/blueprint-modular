"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  ConfirmModal,
  Input,
  Metric,
  MetricRow,
  Modal,
  Panel,
  Selectbox,
  Table,
  useToast,
} from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type Priorite, type Statut } from "./strings";

/** Texte bilingue résolu au render selon la locale active. */
type Texte = { fr: string; en: string };

interface Tache {
  id: string;
  titre: Texte;
  description: Texte;
  assigne: string;
  echeance: string; // ISO "AAAA-MM-JJ"
  priorite: Priorite;
  statut: Statut;
}

/**
 * Référence temporelle déterministe du simulateur (pas de new Date() au render :
 * rendu identique serveur/client). Une tâche est « en retard » si son échéance
 * est strictement antérieure à AUJOURDHUI et qu'elle n'est pas terminée.
 */
const AUJOURDHUI = "2026-06-12";

const PERSONNES = ["Alice Martin", "Bob Durand", "Claire Petit", "David Cohen", "Emma Leroy"];

const ASSIGNE_OPTIONS = PERSONNES.map((p) => ({ value: p, label: p }));

const PRIORITES: Priorite[] = ["haute", "normale", "basse"];

const PRIORITE_VARIANT: Record<Priorite, "error" | "primary" | "default"> = {
  haute: "error",
  normale: "primary",
  basse: "default",
};

const STATUT_BADGE: Record<Statut, "default" | "warning" | "success"> = {
  "À faire": "default",
  "En cours": "warning",
  "Terminé": "success",
};

/** Sprint 24 — équipe produit. Jeu de démonstration déterministe et bilingue. */
const INITIAL_TACHES: Tache[] = [
  {
    id: "t-1",
    titre: { fr: "Rédiger la doc API", en: "Write the API docs" },
    description: {
      fr: "Endpoints publics v2 : authentification, pagination, exemples curl.",
      en: "Public v2 endpoints: authentication, pagination, curl examples.",
    },
    assigne: "Alice Martin",
    echeance: "2026-06-13",
    priorite: "haute",
    statut: "En cours",
  },
  {
    id: "t-2",
    titre: { fr: "Tests e2e paiement", en: "Payment e2e tests" },
    description: {
      fr: "Parcours carte + SEPA sur staging, y compris 3-D Secure.",
      en: "Card + SEPA flows on staging, including 3-D Secure.",
    },
    assigne: "Bob Durand",
    echeance: "2026-06-10",
    priorite: "haute",
    statut: "En cours",
  },
  {
    id: "t-3",
    titre: { fr: "Migration Postgres 16", en: "Postgres 16 migration" },
    description: {
      fr: "Plan de bascule, répétition sur réplique, fenêtre de maintenance.",
      en: "Cutover plan, rehearsal on a replica, maintenance window.",
    },
    assigne: "Claire Petit",
    echeance: "2026-06-09",
    priorite: "haute",
    statut: "À faire",
  },
  {
    id: "t-4",
    titre: { fr: "Maquettes onboarding mobile", en: "Mobile onboarding mockups" },
    description: {
      fr: "Trois écrans Figma : bienvenue, permissions, premier projet.",
      en: "Three Figma screens: welcome, permissions, first project.",
    },
    assigne: "Emma Leroy",
    echeance: "2026-06-16",
    priorite: "normale",
    statut: "À faire",
  },
  {
    id: "t-5",
    titre: { fr: "Corriger le test CI instable", en: "Fix the flaky CI test" },
    description: {
      fr: "Timeout aléatoire sur la suite notifications (websocket).",
      en: "Random timeout in the notifications suite (websocket).",
    },
    assigne: "David Cohen",
    echeance: "2026-06-11",
    priorite: "normale",
    statut: "Terminé",
  },
  {
    id: "t-6",
    titre: { fr: "Revue de sécurité OAuth", en: "OAuth security review" },
    description: {
      fr: "Audit des scopes et rotation des secrets clients.",
      en: "Scope audit and client secret rotation.",
    },
    assigne: "David Cohen",
    echeance: "2026-06-18",
    priorite: "haute",
    statut: "À faire",
  },
  {
    id: "t-7",
    titre: { fr: "Nettoyer les feature flags obsolètes", en: "Clean up stale feature flags" },
    description: {
      fr: "Supprimer les flags livrés depuis plus de deux sprints.",
      en: "Remove flags shipped more than two sprints ago.",
    },
    assigne: "Bob Durand",
    echeance: "2026-06-25",
    priorite: "basse",
    statut: "À faire",
  },
  {
    id: "t-8",
    titre: { fr: "Préparer la démo sprint 24", en: "Prepare the sprint 24 demo" },
    description: {
      fr: "Scénario de démo + données de présentation pour la revue.",
      en: "Demo script + presentation data for the review.",
    },
    assigne: "Alice Martin",
    echeance: "2026-06-20",
    priorite: "normale",
    statut: "En cours",
  },
];

/** Comparaison lexicographique valide sur des dates ISO AAAA-MM-JJ. */
function estEnRetard(t: Pick<Tache, "echeance" | "statut">): boolean {
  return t.echeance < AUJOURDHUI && t.statut !== "Terminé";
}

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

type FiltreStatut = "all" | Statut;

interface FormState {
  titre: string;
  assigne: string | null;
  echeance: string;
  priorite: string | null;
}

const FORM_VIDE: FormState = { titre: "", assigne: null, echeance: "2026-06-19", priorite: "normale" };

export default function TachesSimulateur() {
  const { showToast } = useToast();
  const { locale } = useI18n();
  const s = STR[locale];
  const [taches, setTaches] = useState<Tache[]>(INITIAL_TACHES);

  // Filtres combinés
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>("all");
  const [filtreAssigne, setFiltreAssigne] = useState<string | null>("all");
  const [recherche, setRecherche] = useState("");

  // Modale création / édition
  const [modalOuverte, setModalOuverte] = useState(false);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VIDE);
  const [formError, setFormError] = useState<string | null>(null);

  // Suppression
  const [aSupprimer, setASupprimer] = useState<Tache | null>(null);

  const prioriteOptions = useMemo(
    () => PRIORITES.map((p) => ({ value: p, label: s.priorite[p] })),
    [s]
  );

  const metriques = useMemo(
    () => ({
      aFaire: taches.filter((t) => t.statut === "À faire").length,
      enCours: taches.filter((t) => t.statut === "En cours").length,
      enRetard: taches.filter(estEnRetard).length,
    }),
    [taches]
  );

  /** Tâches filtrées par assigné + recherche dans la locale active (base des compteurs de statut). */
  const baseFiltree = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return taches.filter((t) => {
      if (filtreAssigne && filtreAssigne !== "all" && t.assigne !== filtreAssigne) return false;
      if (q && !t.titre[locale].toLowerCase().includes(q) && !t.description[locale].toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [taches, filtreAssigne, recherche, locale]);

  const compteurs = useMemo(
    () => ({
      all: baseFiltree.length,
      "À faire": baseFiltree.filter((t) => t.statut === "À faire").length,
      "En cours": baseFiltree.filter((t) => t.statut === "En cours").length,
      "Terminé": baseFiltree.filter((t) => t.statut === "Terminé").length,
    }),
    [baseFiltree]
  );

  const tachesFiltrees = useMemo(
    () => (filtreStatut === "all" ? baseFiltree : baseFiltree.filter((t) => t.statut === filtreStatut)),
    [baseFiltree, filtreStatut]
  );

  const ouvrirCreation = () => {
    setEditionId(null);
    setForm(FORM_VIDE);
    setFormError(null);
    setModalOuverte(true);
  };

  const ouvrirEdition = (t: Tache) => {
    setEditionId(t.id);
    setForm({ titre: t.titre[locale], assigne: t.assigne, echeance: t.echeance, priorite: t.priorite });
    setFormError(null);
    setModalOuverte(true);
  };

  const fermerModal = () => {
    setModalOuverte(false);
    setFormError(null);
  };

  const enregistrer = () => {
    const titre = form.titre.trim();
    if (!titre) {
      setFormError(s.sim.errorTitleRequired);
      return;
    }
    if (!form.assigne) {
      setFormError(s.sim.errorAssigneeRequired);
      return;
    }
    if (!form.echeance) {
      setFormError(s.sim.errorDueRequired);
      return;
    }
    const priorite = (form.priorite ?? "normale") as Priorite;
    setFormError(null);

    if (editionId) {
      setTaches((prev) =>
        prev.map((t) =>
          t.id === editionId
            ? {
                ...t,
                // Titre inchangé → on conserve la version bilingue d'origine.
                titre: t.titre[locale] === titre ? t.titre : { fr: titre, en: titre },
                assigne: form.assigne as string,
                echeance: form.echeance,
                priorite,
              }
            : t
        )
      );
      showToast(
        s.sim.toastUpdated(titre, form.assigne, s.formatDate(form.echeance)),
        "success",
        4000,
        s.sim.toastUpdatedTitle,
        s.sim.toastSource,
        null
      );
    } else {
      const nouvelle: Tache = {
        id: `t-${Date.now()}`,
        titre: { fr: titre, en: titre },
        description: { fr: "", en: "" },
        assigne: form.assigne,
        echeance: form.echeance,
        priorite,
        statut: "À faire",
      };
      setTaches((prev) => [nouvelle, ...prev]);
      showToast(
        s.sim.toastCreated(titre, form.assigne, s.formatDate(form.echeance)),
        "success",
        4000,
        s.sim.toastCreatedTitle,
        s.sim.toastSource,
        null
      );
    }
    setModalOuverte(false);
  };

  const avancer = (t: Tache) => {
    const suivant: Statut = t.statut === "À faire" ? "En cours" : "Terminé";
    setTaches((prev) => prev.map((x) => (x.id === t.id ? { ...x, statut: suivant } : x)));
    showToast(
      suivant === "En cours"
        ? s.sim.toastStarted(t.titre[locale], t.assigne)
        : s.sim.toastCompleted(t.titre[locale], t.assigne),
      suivant === "En cours" ? "info" : "success",
      4000,
      suivant === "En cours" ? s.sim.toastStartedTitle : s.sim.toastCompletedTitle,
      s.sim.toastSource,
      null
    );
  };

  const confirmerSuppression = () => {
    if (!aSupprimer) return;
    setTaches((prev) => prev.filter((t) => t.id !== aSupprimer.id));
    showToast(s.sim.toastDeleted(aSupprimer.titre[locale]), "info", 4000, s.sim.toastDeletedTitle, s.sim.toastSource, null);
    setASupprimer(null);
  };

  const opacite = (row: Record<string, unknown>): number =>
    (row.statut as Statut) === "Terminé" ? 0.55 : 1;

  const columns = [
    {
      key: "titre",
      label: s.sim.colTask,
      render: (_: unknown, row: Record<string, unknown>) => {
        const t = row as unknown as Tache;
        return (
          <div style={{ opacity: opacite(row) }}>
            <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{t.titre[locale]}</div>
            {t.description[locale] ? (
              <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                {t.description[locale]}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "assigne",
      label: s.sim.colAssignee,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-2" style={{ opacity: opacite(row) }}>
          <span
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)", border: "1px solid var(--bpm-border)" }}
            title={String(value)}
          >
            {initiales(String(value))}
          </span>
          <span>{String(value)}</span>
        </div>
      ),
    },
    {
      key: "echeance",
      label: s.sim.colDue,
      render: (value: unknown, row: Record<string, unknown>) => {
        const retard = estEnRetard(row as unknown as Tache);
        return (
          <div className="flex items-center gap-2" style={{ opacity: opacite(row) }}>
            <span style={retard ? { color: "var(--bpm-error)", fontWeight: 600 } : undefined}>
              {s.formatDate(String(value))}
            </span>
            {retard && <Badge variant="error">{s.overdue}</Badge>}
          </div>
        );
      },
    },
    {
      key: "priorite",
      label: s.sim.colPriority,
      render: (value: unknown, row: Record<string, unknown>) => {
        const p = value as Priorite;
        return (
          <span style={{ opacity: opacite(row) }}>
            <Badge variant={PRIORITE_VARIANT[p]}>{s.priorite[p]}</Badge>
          </span>
        );
      },
    },
    {
      key: "statut",
      label: s.sim.colStatus,
      render: (value: unknown, row: Record<string, unknown>) => (
        <span style={{ opacity: opacite(row) }}>
          <Badge variant={STATUT_BADGE[value as Statut]}>{s.statut[value as Statut]}</Badge>
        </span>
      ),
    },
    {
      key: "id",
      label: s.sim.colActions,
      render: (_: unknown, row: Record<string, unknown>) => {
        const t = row as unknown as Tache;
        return (
          <div className="flex flex-wrap gap-2">
            {t.statut !== "Terminé" && (
              <Button size="small" variant="primary" onClick={() => avancer(t)}>
                {t.statut === "À faire" ? s.sim.actionStart : s.sim.actionComplete}
              </Button>
            )}
            <Button size="small" variant="secondary" onClick={() => ouvrirEdition(t)}>
              {s.sim.actionEdit}
            </Button>
            <Button size="small" variant="destructive" onClick={() => setASupprimer(t)}>
              {s.sim.actionDelete}
            </Button>
          </div>
        );
      },
    },
  ];

  const statutsBoutons: { value: FiltreStatut; label: string }[] = [
    { value: "all", label: s.sim.filterAll },
    { value: "À faire", label: s.statut["À faire"] },
    { value: "En cours", label: s.statut["En cours"] },
    { value: "Terminé", label: s.statut["Terminé"] },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={s.statut["À faire"]} value={String(metriques.aFaire)} />
        <Metric label={s.statut["En cours"]} value={String(metriques.enCours)} />
        <Metric label={s.overdue} value={String(metriques.enRetard)} />
      </MetricRow>

      <Panel variant="info" title={s.sim.panelTitle(s.formatDate(AUJOURDHUI))}>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap gap-2">
            {statutsBoutons.map((b) => (
              <Button
                key={b.value}
                size="small"
                variant={filtreStatut === b.value ? "primary" : "secondary"}
                onClick={() => setFiltreStatut(b.value)}
              >
                {b.label} ({compteurs[b.value]})
              </Button>
            ))}
          </div>
          <div className="min-w-[200px]">
            <Selectbox
              label={s.sim.assigneeLabel}
              options={[{ value: "all", label: s.sim.assigneeAll }, ...ASSIGNE_OPTIONS]}
              value={filtreAssigne}
              onChange={setFiltreAssigne}
              placeholder={s.sim.assigneeAll}
            />
          </div>
          <div className="min-w-[220px] grow md:grow-0">
            <Input
              label={s.sim.searchLabel}
              type="search"
              placeholder={s.sim.searchPlaceholder}
              value={recherche}
              onChange={setRecherche}
            />
          </div>
          <div className="ml-auto">
            <Button onClick={ouvrirCreation}>{s.sim.newTask}</Button>
          </div>
        </div>

        {tachesFiltrees.length > 0 ? (
          <Table columns={columns} data={tachesFiltrees as unknown as Record<string, unknown>[]} striped hover />
        ) : (
          <p className="py-6 text-center text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.sim.emptyState}
          </p>
        )}
      </Panel>

      {modalOuverte && (
        <Modal
          isOpen={modalOuverte}
          onClose={fermerModal}
          title={editionId ? s.sim.modalEditTitle : s.sim.modalCreateTitle}
          size="medium"
        >
          <div className="space-y-3">
            <Input
              label={s.sim.fieldTitle}
              placeholder={s.sim.fieldTitlePlaceholder}
              value={form.titre}
              onChange={(v) => setForm((f) => ({ ...f, titre: v }))}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Selectbox
                label={s.sim.fieldAssignee}
                options={ASSIGNE_OPTIONS}
                value={form.assigne}
                onChange={(v) => setForm((f) => ({ ...f, assigne: v }))}
                placeholder={s.sim.fieldAssigneePlaceholder}
              />
              <Input
                label={s.sim.fieldDue}
                type="date"
                value={form.echeance}
                onChange={(v) => setForm((f) => ({ ...f, echeance: v }))}
              />
            </div>
            <Selectbox
              label={s.sim.fieldPriority}
              options={prioriteOptions}
              value={form.priorite}
              onChange={(v) => setForm((f) => ({ ...f, priorite: v }))}
              placeholder={s.sim.fieldPriorityPlaceholder}
            />
            {formError && (
              <p className="text-sm" style={{ color: "var(--bpm-error)" }}>
                {formError}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={fermerModal}>
                {s.sim.cancel}
              </Button>
              <Button onClick={enregistrer}>{editionId ? s.sim.save : s.sim.create}</Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={aSupprimer !== null}
        title={s.sim.confirmTitle}
        message={
          aSupprimer
            ? s.sim.confirmMessage(aSupprimer.titre[locale], aSupprimer.assigne, s.formatDate(aSupprimer.echeance))
            : ""
        }
        confirmLabel={s.sim.confirmLabel}
        cancelLabel={s.sim.cancel}
        variant="danger"
        onConfirm={confirmerSuppression}
        onCancel={() => setASupprimer(null)}
      />
    </div>
  );
}
