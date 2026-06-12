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

type Statut = "À faire" | "En cours" | "Terminé";
type Priorite = "haute" | "normale" | "basse";

interface Tache {
  id: string;
  titre: string;
  description: string;
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

const PRIORITE_OPTIONS: { value: Priorite; label: string }[] = [
  { value: "haute", label: "Haute" },
  { value: "normale", label: "Normale" },
  { value: "basse", label: "Basse" },
];

const PRIORITE_BADGE: Record<Priorite, { variant: "error" | "primary" | "default"; label: string }> = {
  haute: { variant: "error", label: "Haute" },
  normale: { variant: "primary", label: "Normale" },
  basse: { variant: "default", label: "Basse" },
};

const STATUT_BADGE: Record<Statut, "default" | "warning" | "success"> = {
  "À faire": "default",
  "En cours": "warning",
  "Terminé": "success",
};

/** Sprint 24 — équipe produit. Jeu de démonstration déterministe. */
const INITIAL_TACHES: Tache[] = [
  {
    id: "t-1",
    titre: "Rédiger la doc API",
    description: "Endpoints publics v2 : authentification, pagination, exemples curl.",
    assigne: "Alice Martin",
    echeance: "2026-06-13",
    priorite: "haute",
    statut: "En cours",
  },
  {
    id: "t-2",
    titre: "Tests e2e paiement",
    description: "Parcours carte + SEPA sur staging, y compris 3-D Secure.",
    assigne: "Bob Durand",
    echeance: "2026-06-10",
    priorite: "haute",
    statut: "En cours",
  },
  {
    id: "t-3",
    titre: "Migration Postgres 16",
    description: "Plan de bascule, répétition sur réplique, fenêtre de maintenance.",
    assigne: "Claire Petit",
    echeance: "2026-06-09",
    priorite: "haute",
    statut: "À faire",
  },
  {
    id: "t-4",
    titre: "Maquettes onboarding mobile",
    description: "Trois écrans Figma : bienvenue, permissions, premier projet.",
    assigne: "Emma Leroy",
    echeance: "2026-06-16",
    priorite: "normale",
    statut: "À faire",
  },
  {
    id: "t-5",
    titre: "Corriger le test CI instable",
    description: "Timeout aléatoire sur la suite notifications (websocket).",
    assigne: "David Cohen",
    echeance: "2026-06-11",
    priorite: "normale",
    statut: "Terminé",
  },
  {
    id: "t-6",
    titre: "Revue de sécurité OAuth",
    description: "Audit des scopes et rotation des secrets clients.",
    assigne: "David Cohen",
    echeance: "2026-06-18",
    priorite: "haute",
    statut: "À faire",
  },
  {
    id: "t-7",
    titre: "Nettoyer les feature flags obsolètes",
    description: "Supprimer les flags livrés depuis plus de deux sprints.",
    assigne: "Bob Durand",
    echeance: "2026-06-25",
    priorite: "basse",
    statut: "À faire",
  },
  {
    id: "t-8",
    titre: "Préparer la démo sprint 24",
    description: "Scénario de démo + données de présentation pour la revue.",
    assigne: "Alice Martin",
    echeance: "2026-06-20",
    priorite: "normale",
    statut: "En cours",
  },
];

/** Comparaison lexicographique valide sur des dates ISO AAAA-MM-JJ. */
function estEnRetard(t: Tache): boolean {
  return t.echeance < AUJOURDHUI && t.statut !== "Terminé";
}

/** "2026-06-09" → "09/06/2026" (purement textuel, donc déterministe). */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
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

  const metriques = useMemo(
    () => ({
      aFaire: taches.filter((t) => t.statut === "À faire").length,
      enCours: taches.filter((t) => t.statut === "En cours").length,
      enRetard: taches.filter(estEnRetard).length,
    }),
    [taches]
  );

  /** Tâches filtrées par assigné + recherche (base des compteurs de statut). */
  const baseFiltree = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return taches.filter((t) => {
      if (filtreAssigne && filtreAssigne !== "all" && t.assigne !== filtreAssigne) return false;
      if (q && !t.titre.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [taches, filtreAssigne, recherche]);

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
    setForm({ titre: t.titre, assigne: t.assigne, echeance: t.echeance, priorite: t.priorite });
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
      setFormError("Le titre est requis.");
      return;
    }
    if (!form.assigne) {
      setFormError("Choisissez un assigné.");
      return;
    }
    if (!form.echeance) {
      setFormError("Indiquez une date d'échéance.");
      return;
    }
    const priorite = (form.priorite ?? "normale") as Priorite;
    setFormError(null);

    if (editionId) {
      setTaches((prev) =>
        prev.map((t) =>
          t.id === editionId
            ? { ...t, titre, assigne: form.assigne as string, echeance: form.echeance, priorite }
            : t
        )
      );
      showToast(`« ${titre} » mise à jour (${form.assigne}, échéance ${formatDate(form.echeance)}).`, "success", 4000, "Tâche modifiée", "Tâches", null);
    } else {
      const nouvelle: Tache = {
        id: `t-${Date.now()}`,
        titre,
        description: "",
        assigne: form.assigne,
        echeance: form.echeance,
        priorite,
        statut: "À faire",
      };
      setTaches((prev) => [nouvelle, ...prev]);
      showToast(`« ${titre} » assignée à ${form.assigne} pour le ${formatDate(form.echeance)}.`, "success", 4000, "Tâche créée", "Tâches", null);
    }
    setModalOuverte(false);
  };

  const avancer = (t: Tache) => {
    const suivant: Statut = t.statut === "À faire" ? "En cours" : "Terminé";
    setTaches((prev) => prev.map((x) => (x.id === t.id ? { ...x, statut: suivant } : x)));
    showToast(
      suivant === "En cours"
        ? `« ${t.titre} » est passée en cours (${t.assigne}).`
        : `« ${t.titre} » est terminée. Bravo ${t.assigne} !`,
      suivant === "En cours" ? "info" : "success",
      4000,
      suivant === "En cours" ? "Tâche démarrée" : "Tâche terminée",
      "Tâches",
      null
    );
  };

  const confirmerSuppression = () => {
    if (!aSupprimer) return;
    setTaches((prev) => prev.filter((t) => t.id !== aSupprimer.id));
    showToast(`« ${aSupprimer.titre} » supprimée de la liste.`, "info", 4000, "Tâche supprimée", "Tâches", null);
    setASupprimer(null);
  };

  const opacite = (row: Record<string, unknown>): number =>
    (row.statut as Statut) === "Terminé" ? 0.55 : 1;

  const columns = [
    {
      key: "titre",
      label: "Tâche",
      render: (value: unknown, row: Record<string, unknown>) => (
        <div style={{ opacity: opacite(row) }}>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{String(value)}</div>
          {row.description ? (
            <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
              {String(row.description)}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "assigne",
      label: "Assigné",
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
      label: "Échéance",
      render: (value: unknown, row: Record<string, unknown>) => {
        const retard = estEnRetard(row as unknown as Tache);
        return (
          <div className="flex items-center gap-2" style={{ opacity: opacite(row) }}>
            <span style={retard ? { color: "var(--bpm-error)", fontWeight: 600 } : undefined}>
              {formatDate(String(value))}
            </span>
            {retard && <Badge variant="error">En retard</Badge>}
          </div>
        );
      },
    },
    {
      key: "priorite",
      label: "Priorité",
      render: (value: unknown, row: Record<string, unknown>) => {
        const p = PRIORITE_BADGE[value as Priorite];
        return (
          <span style={{ opacity: opacite(row) }}>
            <Badge variant={p.variant}>{p.label}</Badge>
          </span>
        );
      },
    },
    {
      key: "statut",
      label: "Statut",
      render: (value: unknown, row: Record<string, unknown>) => (
        <span style={{ opacity: opacite(row) }}>
          <Badge variant={STATUT_BADGE[value as Statut]}>{String(value)}</Badge>
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const t = row as unknown as Tache;
        return (
          <div className="flex flex-wrap gap-2">
            {t.statut !== "Terminé" && (
              <Button size="small" variant="primary" onClick={() => avancer(t)}>
                {t.statut === "À faire" ? "Démarrer" : "Terminer"}
              </Button>
            )}
            <Button size="small" variant="secondary" onClick={() => ouvrirEdition(t)}>
              Modifier
            </Button>
            <Button size="small" variant="destructive" onClick={() => setASupprimer(t)}>
              Supprimer
            </Button>
          </div>
        );
      },
    },
  ];

  const statutsBoutons: { value: FiltreStatut; label: string }[] = [
    { value: "all", label: "Toutes" },
    { value: "À faire", label: "À faire" },
    { value: "En cours", label: "En cours" },
    { value: "Terminé", label: "Terminé" },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="À faire" value={String(metriques.aFaire)} />
        <Metric label="En cours" value={String(metriques.enCours)} />
        <Metric label="En retard" value={String(metriques.enRetard)} />
      </MetricRow>

      <Panel variant="info" title={`Tâches de l'équipe — référence : ${formatDate(AUJOURDHUI)}`}>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap gap-2">
            {statutsBoutons.map((s) => (
              <Button
                key={s.value}
                size="small"
                variant={filtreStatut === s.value ? "primary" : "secondary"}
                onClick={() => setFiltreStatut(s.value)}
              >
                {s.label} ({compteurs[s.value]})
              </Button>
            ))}
          </div>
          <div className="min-w-[200px]">
            <Selectbox
              label="Assigné"
              options={[{ value: "all", label: "Tous" }, ...ASSIGNE_OPTIONS]}
              value={filtreAssigne}
              onChange={setFiltreAssigne}
              placeholder="Tous"
            />
          </div>
          <div className="min-w-[220px] grow md:grow-0">
            <Input
              label="Recherche"
              type="search"
              placeholder="Titre ou description…"
              value={recherche}
              onChange={setRecherche}
            />
          </div>
          <div className="ml-auto">
            <Button onClick={ouvrirCreation}>Nouvelle tâche</Button>
          </div>
        </div>

        {tachesFiltrees.length > 0 ? (
          <Table columns={columns} data={tachesFiltrees as unknown as Record<string, unknown>[]} striped hover />
        ) : (
          <p className="py-6 text-center text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Aucune tâche ne correspond à ces filtres.
          </p>
        )}
      </Panel>

      {modalOuverte && (
        <Modal
          isOpen={modalOuverte}
          onClose={fermerModal}
          title={editionId ? "Modifier la tâche" : "Nouvelle tâche"}
          size="medium"
        >
          <div className="space-y-3">
            <Input
              label="Titre *"
              placeholder="Ex. Rédiger les notes de version"
              value={form.titre}
              onChange={(v) => setForm((f) => ({ ...f, titre: v }))}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Selectbox
                label="Assigné *"
                options={ASSIGNE_OPTIONS}
                value={form.assigne}
                onChange={(v) => setForm((f) => ({ ...f, assigne: v }))}
                placeholder="Choisir une personne"
              />
              <Input
                label="Échéance *"
                type="date"
                value={form.echeance}
                onChange={(v) => setForm((f) => ({ ...f, echeance: v }))}
              />
            </div>
            <Selectbox
              label="Priorité"
              options={PRIORITE_OPTIONS}
              value={form.priorite}
              onChange={(v) => setForm((f) => ({ ...f, priorite: v }))}
              placeholder="Priorité"
            />
            {formError && (
              <p className="text-sm" style={{ color: "var(--bpm-error)" }}>
                {formError}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={fermerModal}>
                Annuler
              </Button>
              <Button onClick={enregistrer}>{editionId ? "Enregistrer" : "Créer la tâche"}</Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={aSupprimer !== null}
        title="Supprimer la tâche"
        message={
          aSupprimer
            ? `« ${aSupprimer.titre} » (${aSupprimer.assigne}, échéance ${formatDate(aSupprimer.echeance)}) sera retirée de la liste. Cette action est immédiate.`
            : ""
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmerSuppression}
        onCancel={() => setASupprimer(null)}
      />
    </div>
  );
}
