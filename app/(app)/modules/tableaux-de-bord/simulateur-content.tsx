"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityFeed,
  type ActivityItem,
  BarChart,
  Button,
  ConfirmModal,
  LineChart,
  Metric,
  Panel,
  ProgressRing,
  Table,
  type TableColumn,
  useToast,
} from "@/components/bpm";

/* ------------------------------------------------------------------ */
/* Données seedées (100 % déterministes — aucun Date.now() au render) */
/* ------------------------------------------------------------------ */

const VENTES_12_MOIS = [
  { x: "Juil.", y: 96.4 },
  { x: "Août", y: 88.1 },
  { x: "Sept.", y: 104.7 },
  { x: "Oct.", y: 112.3 },
  { x: "Nov.", y: 121.8 },
  { x: "Déc.", y: 138.6 },
  { x: "Janv.", y: 109.2 },
  { x: "Févr.", y: 115.4 },
  { x: "Mars", y: 124.9 },
  { x: "Avr.", y: 128.3 },
  { x: "Mai", y: 135.7 },
  { x: "Juin", y: 142.5 },
];

const CA_PAR_REGION = [
  { x: "Île-de-France", y: 48.2 },
  { x: "Auvergne-Rhône-Alpes", y: 27.6 },
  { x: "Occitanie", y: 19.4 },
  { x: "Nouvelle-Aquitaine", y: 17.8 },
  { x: "Hauts-de-France", y: 16.1 },
  { x: "Grand Est", y: 13.4 },
];

const TOP_PRODUITS = [
  { ref: "PRD-1042", nom: "Pompe centrifuge X200", ca: 18450 },
  { ref: "PRD-0871", nom: "Vanne motorisée V35", ca: 15920 },
  { ref: "PRD-1133", nom: "Capteur de pression P8", ca: 12340 },
  { ref: "PRD-0654", nom: "Filtre haute capacité F12", ca: 9870 },
  { ref: "PRD-0998", nom: "Kit de maintenance M3", ca: 8210 },
];

const TOP_PRODUITS_COLUMNS: TableColumn[] = [
  { key: "ref", label: "Réf.", noWrap: true },
  { key: "nom", label: "Produit" },
  {
    key: "ca",
    label: "CA",
    align: "right",
    render: (value) => `${Number(value).toLocaleString("fr-FR")} €`,
  },
];

const DERNIERES_COMMANDES: ActivityItem[] = [
  { id: "c1", actor: "Boutique Lyon", action: "a passé la commande", target: "CMD-2026-1847 — 2 340 €", timestamp: "2026-06-12T09:42:00", color: "success" },
  { id: "c2", actor: "Atelier Nantes", action: "a passé la commande", target: "CMD-2026-1846 — 1 120 €", timestamp: "2026-06-12T08:15:00", color: "success" },
  { id: "c3", actor: "Distrib. Lille", action: "a modifié la commande", target: "CMD-2026-1839 — quantités révisées", timestamp: "2026-06-11T17:28:00", color: "info" },
  { id: "c4", actor: "Garage Toulouse", action: "a annulé la commande", target: "CMD-2026-1833 — 480 €", timestamp: "2026-06-11T14:03:00", color: "warning" },
];

/* ------------------------------------------------------------------ */
/* Catalogue de widgets                                                */
/* ------------------------------------------------------------------ */

type WidgetId =
  | "metric-ca"
  | "metric-commandes"
  | "metric-panier"
  | "line-ventes"
  | "bar-regions"
  | "table-top-produits"
  | "ring-objectif"
  | "feed-commandes";

type WidgetSize = 1 | 2;

interface WidgetDef {
  id: WidgetId;
  title: string;
  description: string;
  defaultSize: WidgetSize;
  render: () => ReactNode;
}

const WIDGET_CATALOG: WidgetDef[] = [
  {
    id: "metric-ca",
    title: "CA du mois",
    description: "Chiffre d'affaires du mois en cours, avec variation vs mois précédent.",
    defaultSize: 1,
    render: () => <Metric label="CA du mois" value="142,5 k€" delta="+12,3 %" subtext="vs mai 2026" />,
  },
  {
    id: "metric-commandes",
    title: "Commandes",
    description: "Nombre de commandes du mois, avec variation vs mois précédent.",
    defaultSize: 1,
    render: () => <Metric label="Commandes" value={1248} valueLocale="fr-FR" delta="+8 %" subtext="vs mai 2026" />,
  },
  {
    id: "metric-panier",
    title: "Panier moyen",
    description: "Montant moyen d'une commande sur le mois en cours.",
    defaultSize: 1,
    render: () => <Metric label="Panier moyen" value="114,20 €" delta="+3,9 %" subtext="vs mai 2026" />,
  },
  {
    id: "line-ventes",
    title: "Ventes — 12 derniers mois",
    description: "Évolution mensuelle du chiffre d'affaires (k€) sur un an glissant.",
    defaultSize: 2,
    render: () => <LineChart data={VENTES_12_MOIS} height={220} />,
  },
  {
    id: "bar-regions",
    title: "CA par région",
    description: "Répartition du chiffre d'affaires (k€) sur les 6 premières régions.",
    defaultSize: 1,
    render: () => <BarChart data={CA_PAR_REGION} height={220} />,
  },
  {
    id: "table-top-produits",
    title: "Top 5 produits",
    description: "Les 5 produits qui génèrent le plus de chiffre d'affaires ce mois-ci.",
    defaultSize: 1,
    render: () => (
      <Table columns={TOP_PRODUITS_COLUMNS} data={TOP_PRODUITS} keyColumn="ref" density="compact" />
    ),
  },
  {
    id: "ring-objectif",
    title: "Objectif trimestre",
    description: "Avancement vers l'objectif de CA du trimestre (T2 2026).",
    defaultSize: 1,
    render: () => (
      <div className="flex items-center gap-4">
        <ProgressRing value={78} max={100} size={110} />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
            78 % de l&apos;objectif T2
          </p>
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            312 k€ réalisés sur 400 k€ — 18 jours restants.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "feed-commandes",
    title: "Dernières commandes",
    description: "Flux des dernières commandes passées, modifiées ou annulées.",
    defaultSize: 2,
    render: () => <ActivityFeed activities={DERNIERES_COMMANDES} compact />,
  },
];

const WIDGET_BY_ID = new Map(WIDGET_CATALOG.map((w) => [w.id, w]));

/* ------------------------------------------------------------------ */
/* Disposition (ordre + taille + visibilité) et persistance            */
/* ------------------------------------------------------------------ */

interface PlacedWidget {
  id: WidgetId;
  size: WidgetSize;
}

const DEFAULT_LAYOUT: PlacedWidget[] = [
  { id: "metric-ca", size: 1 },
  { id: "metric-commandes", size: 1 },
  { id: "line-ventes", size: 2 },
  { id: "bar-regions", size: 1 },
  { id: "table-top-produits", size: 1 },
];

const STORAGE_KEY = "bpm.tableaux-de-bord.layout.v1";

/** Valide une disposition lue depuis localStorage (ids connus, tailles 1|2, sans doublon). */
function parseStoredLayout(raw: string): PlacedWidget[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const seen = new Set<string>();
    const layout: PlacedWidget[] = [];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) return null;
      const { id, size } = item as { id?: unknown; size?: unknown };
      if (typeof id !== "string" || !WIDGET_BY_ID.has(id as WidgetId) || seen.has(id)) return null;
      if (size !== 1 && size !== 2) return null;
      seen.add(id);
      layout.push({ id: id as WidgetId, size });
    }
    return layout;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export default function TableauxDeBordSimulateur() {
  const { showToast } = useToast();
  const [layout, setLayout] = useState<PlacedWidget[]>(DEFAULT_LAYOUT);
  const [editing, setEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  /** Devient true après lecture de localStorage : on ne persiste qu'à partir de là. */
  const [hydrated, setHydrated] = useState(false);

  // Rechargement de la disposition sauvegardée (rendu initial = défaut, SSR-safe).
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = parseStoredLayout(raw);
      if (stored) setLayout(stored);
    }
    setHydrated(true);
  }, []);

  // Sauvegarde à chaque changement (jamais avant l'hydratation, pour ne pas écraser).
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout, hydrated]);

  const hiddenWidgets = useMemo(() => {
    const placed = new Set(layout.map((w) => w.id));
    return WIDGET_CATALOG.filter((w) => !placed.has(w.id));
  }, [layout]);

  const moveWidget = (index: number, direction: -1 | 1) => {
    setLayout((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const toggleSize = (id: WidgetId) => {
    setLayout((prev) =>
      prev.map((w) => (w.id === id ? { ...w, size: w.size === 1 ? 2 : 1 } : w))
    );
  };

  const hideWidget = (id: WidgetId) => {
    setLayout((prev) => prev.filter((w) => w.id !== id));
    const def = WIDGET_BY_ID.get(id);
    showToast(
      `Le widget « ${def?.title ?? id} » a été masqué. Retrouvez-le dans la bibliothèque.`,
      "info",
      4000,
      "Widget masqué",
      "Tableaux de bord",
      null
    );
  };

  const addWidget = (id: WidgetId) => {
    const def = WIDGET_BY_ID.get(id);
    if (!def) return;
    setLayout((prev) =>
      prev.some((w) => w.id === id) ? prev : [...prev, { id, size: def.defaultSize }]
    );
    showToast(
      `Le widget « ${def.title} » a été ajouté en bas du tableau de bord.`,
      "success",
      4000,
      "Widget ajouté",
      "Tableaux de bord",
      null
    );
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    setConfirmReset(false);
    window.localStorage.removeItem(STORAGE_KEY);
    showToast(
      "La disposition par défaut a été restaurée et la sauvegarde locale supprimée.",
      "success",
      4000,
      "Disposition réinitialisée",
      "Tableaux de bord",
      null
    );
  };

  return (
    <div>
      {/* Barre d'actions globale */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
          {layout.length} widget{layout.length > 1 ? "s" : ""} affiché
          {layout.length > 1 ? "s" : ""} · {hiddenWidgets.length} dans la bibliothèque
          {editing ? " — mode personnalisation actif" : ""}
        </p>
        <div className="flex items-center gap-2">
          {editing && (
            <Button variant="ghost" size="small" onClick={() => setConfirmReset(true)}>
              Réinitialiser la disposition
            </Button>
          )}
          {editing ? (
            <Button variant="primary" size="small" onClick={() => setEditing(false)}>
              Terminer
            </Button>
          ) : (
            <Button variant="outline" size="small" onClick={() => setEditing(true)}>
              Personnaliser
            </Button>
          )}
        </div>
      </div>

      {/* Grille de widgets */}
      {layout.length === 0 ? (
        <Panel variant="info" title="Tableau de bord vide">
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            Tous les widgets sont masqués. {editing
              ? "Ajoutez-en depuis la bibliothèque ci-dessous."
              : "Cliquez sur « Personnaliser » puis ajoutez des widgets depuis la bibliothèque."}
          </p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {layout.map((placed, index) => {
            const def = WIDGET_BY_ID.get(placed.id);
            if (!def) return null;
            return (
              <section
                key={placed.id}
                aria-label={def.title}
                className={`rounded-lg p-4 ${placed.size === 2 ? "md:col-span-2" : ""}`}
                style={{
                  background: "var(--bpm-surface)",
                  border: editing ? "2px dashed var(--bpm-border-strong)" : "1px solid var(--bpm-border)",
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-semibold m-0" style={{ color: "var(--bpm-text-primary)" }}>
                    {def.title}
                  </h3>
                  {editing && (
                    <div className="flex items-center gap-1" role="toolbar" aria-label={`Outils — ${def.title}`}>
                      <Button
                        variant="ghost"
                        size="small"
                        disabled={index === 0}
                        onClick={() => moveWidget(index, -1)}
                        aria-label={`Monter « ${def.title} »`}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        disabled={index === layout.length - 1}
                        onClick={() => moveWidget(index, 1)}
                        aria-label={`Descendre « ${def.title} »`}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => toggleSize(placed.id)}
                        aria-label={
                          placed.size === 1
                            ? `Agrandir « ${def.title} » sur 2 colonnes`
                            : `Réduire « ${def.title} » à 1 colonne`
                        }
                      >
                        ⤢ {placed.size === 1 ? "2 col." : "1 col."}
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => hideWidget(placed.id)}>
                        Masquer
                      </Button>
                    </div>
                  )}
                </div>
                {def.render()}
              </section>
            );
          })}
        </div>
      )}

      {/* Bibliothèque de widgets (mode personnalisation) */}
      {editing && (
        <div className="mt-6">
          <Panel title="Bibliothèque de widgets" icon={false}>
            {hiddenWidgets.length === 0 ? (
              <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
                Tous les widgets du catalogue sont déjà affichés sur le tableau de bord.
              </p>
            ) : (
              <ul className="m-0 p-0 list-none space-y-3">
                {hiddenWidgets.map((def) => (
                  <li
                    key={def.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md p-3"
                    style={{ border: "1px solid var(--bpm-border)" }}
                  >
                    <div style={{ maxWidth: "52ch" }}>
                      <p className="text-sm font-medium m-0" style={{ color: "var(--bpm-text-primary)" }}>
                        {def.title}
                      </p>
                      <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
                        {def.description} ({def.defaultSize === 2 ? "2 colonnes" : "1 colonne"} par défaut)
                      </p>
                    </div>
                    <Button variant="secondary" size="small" onClick={() => addWidget(def.id)}>
                      Ajouter
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmReset}
        onConfirm={resetLayout}
        onCancel={() => setConfirmReset(false)}
        title="Réinitialiser la disposition ?"
        message="Le tableau de bord reviendra à sa disposition par défaut (5 widgets) et la sauvegarde locale sera supprimée. Cette action est immédiate."
        confirmLabel="Réinitialiser"
        cancelLabel="Annuler"
        variant="warning"
      />
    </div>
  );
}
