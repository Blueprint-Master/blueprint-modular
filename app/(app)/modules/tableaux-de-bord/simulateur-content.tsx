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
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import { STR, type ModuleStrings } from "./strings";

/* ------------------------------------------------------------------ */
/* Données seedées (100 % déterministes — aucun Date.now() au render) */
/* ------------------------------------------------------------------ */

/** Valeurs mensuelles (k€) ; les libellés de mois sont résolus selon la locale. */
const VENTES_12_MOIS_Y = [96.4, 88.1, 104.7, 112.3, 121.8, 138.6, 109.2, 115.4, 124.9, 128.3, 135.7, 142.5];

// Les régions françaises restent telles quelles dans les deux langues.
const CA_PAR_REGION = [
  { x: "Île-de-France", y: 48.2 },
  { x: "Auvergne-Rhône-Alpes", y: 27.6 },
  { x: "Occitanie", y: 19.4 },
  { x: "Nouvelle-Aquitaine", y: 17.8 },
  { x: "Hauts-de-France", y: 16.1 },
  { x: "Grand Est", y: 13.4 },
];

// Les noms de produits restent tels quels dans les deux langues.
const TOP_PRODUITS = [
  { ref: "PRD-1042", nom: "Pompe centrifuge X200", ca: 18450 },
  { ref: "PRD-0871", nom: "Vanne motorisée V35", ca: 15920 },
  { ref: "PRD-1133", nom: "Capteur de pression P8", ca: 12340 },
  { ref: "PRD-0654", nom: "Filtre haute capacité F12", ca: 9870 },
  { ref: "PRD-0998", nom: "Kit de maintenance M3", ca: 8210 },
];

/** Format monétaire via Intl, selon la locale courante. */
function formatCurrency(value: number, locale: Locale, decimals = 0): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

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

/**
 * Ids et tailles par défaut du catalogue — stables quelle que soit la locale
 * (la disposition persistée dans localStorage référence ces ids).
 */
const WIDGET_DEFAULT_SIZES: Record<WidgetId, WidgetSize> = {
  "metric-ca": 1,
  "metric-commandes": 1,
  "metric-panier": 1,
  "line-ventes": 2,
  "bar-regions": 1,
  "table-top-produits": 1,
  "ring-objectif": 1,
  "feed-commandes": 2,
};

const WIDGET_IDS = Object.keys(WIDGET_DEFAULT_SIZES) as WidgetId[];
const KNOWN_WIDGET_IDS = new Set<string>(WIDGET_IDS);

/** Construit le catalogue avec les libellés et formats de la locale courante. */
function buildCatalog(s: ModuleStrings, locale: Locale): WidgetDef[] {
  const ventes12Mois = VENTES_12_MOIS_Y.map((y, i) => ({ x: s.months[i], y }));

  const topProduitsColumns: TableColumn[] = [
    { key: "ref", label: s.tableColRef, noWrap: true },
    { key: "nom", label: s.tableColProduct },
    {
      key: "ca",
      label: s.tableColRevenue,
      align: "right",
      render: (value) => formatCurrency(Number(value), locale),
    },
  ];

  const dernieresCommandes: ActivityItem[] = [
    { id: "c1", actor: "Boutique Lyon", action: s.orderPlaced, target: `CMD-2026-1847 — ${formatCurrency(2340, locale)}`, timestamp: "2026-06-12T09:42:00", color: "success" },
    { id: "c2", actor: "Atelier Nantes", action: s.orderPlaced, target: `CMD-2026-1846 — ${formatCurrency(1120, locale)}`, timestamp: "2026-06-12T08:15:00", color: "success" },
    { id: "c3", actor: "Distrib. Lille", action: s.orderModified, target: `CMD-2026-1839 — ${s.quantitiesRevised}`, timestamp: "2026-06-11T17:28:00", color: "info" },
    { id: "c4", actor: "Garage Toulouse", action: s.orderCancelled, target: `CMD-2026-1833 — ${formatCurrency(480, locale)}`, timestamp: "2026-06-11T14:03:00", color: "warning" },
  ];

  const renderers: Record<WidgetId, () => ReactNode> = {
    "metric-ca": () => (
      <Metric label={s.widgets["metric-ca"].title} value={s.metricCaValue} delta={s.metricCaDelta} subtext={s.vsLastMonth} />
    ),
    "metric-commandes": () => (
      <Metric label={s.widgets["metric-commandes"].title} value={1248} valueLocale={s.numberLocale} delta={s.metricCommandesDelta} subtext={s.vsLastMonth} />
    ),
    "metric-panier": () => (
      <Metric label={s.widgets["metric-panier"].title} value={formatCurrency(114.2, locale, 2)} delta={s.metricPanierDelta} subtext={s.vsLastMonth} />
    ),
    "line-ventes": () => <LineChart data={ventes12Mois} height={220} />,
    "bar-regions": () => <BarChart data={CA_PAR_REGION} height={220} />,
    "table-top-produits": () => (
      <Table columns={topProduitsColumns} data={TOP_PRODUITS} keyColumn="ref" density="compact" />
    ),
    "ring-objectif": () => (
      <div className="flex items-center gap-4">
        <ProgressRing value={78} max={100} size={110} />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
            {s.ringPercentLabel}
          </p>
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.ringDetail}
          </p>
        </div>
      </div>
    ),
    "feed-commandes": () => <ActivityFeed activities={dernieresCommandes} compact />,
  };

  return WIDGET_IDS.map((id) => ({
    id,
    title: s.widgets[id].title,
    description: s.widgets[id].description,
    defaultSize: WIDGET_DEFAULT_SIZES[id],
    render: renderers[id],
  }));
}

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
      if (typeof id !== "string" || !KNOWN_WIDGET_IDS.has(id) || seen.has(id)) return null;
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
  const { locale } = useI18n();
  const s = STR[locale];
  const { showToast } = useToast();
  const [layout, setLayout] = useState<PlacedWidget[]>(DEFAULT_LAYOUT);
  const [editing, setEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  /** Devient true après lecture de localStorage : on ne persiste qu'à partir de là. */
  const [hydrated, setHydrated] = useState(false);

  const catalog = useMemo(() => buildCatalog(s, locale), [s, locale]);
  const widgetById = useMemo(() => new Map(catalog.map((w) => [w.id, w])), [catalog]);

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
    return catalog.filter((w) => !placed.has(w.id));
  }, [layout, catalog]);

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
    const def = widgetById.get(id);
    showToast(
      s.widgetHiddenMsg(def?.title ?? id),
      "info",
      4000,
      s.widgetHiddenTitle,
      s.toastSource,
      null
    );
  };

  const addWidget = (id: WidgetId) => {
    const def = widgetById.get(id);
    if (!def) return;
    setLayout((prev) =>
      prev.some((w) => w.id === id) ? prev : [...prev, { id, size: def.defaultSize }]
    );
    showToast(
      s.widgetAddedMsg(def.title),
      "success",
      4000,
      s.widgetAddedTitle,
      s.toastSource,
      null
    );
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    setConfirmReset(false);
    window.localStorage.removeItem(STORAGE_KEY);
    showToast(
      s.resetToastMsg,
      "success",
      4000,
      s.resetToastTitle,
      s.toastSource,
      null
    );
  };

  return (
    <div>
      {/* Barre d'actions globale */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
          {s.statusLine(layout.length, hiddenWidgets.length)}
          {editing ? s.editingSuffix : ""}
        </p>
        <div className="flex items-center gap-2">
          {editing && (
            <Button variant="ghost" size="small" onClick={() => setConfirmReset(true)}>
              {s.resetLayout}
            </Button>
          )}
          {editing ? (
            <Button variant="primary" size="small" onClick={() => setEditing(false)}>
              {s.done}
            </Button>
          ) : (
            <Button variant="outline" size="small" onClick={() => setEditing(true)}>
              {s.customize}
            </Button>
          )}
        </div>
      </div>

      {/* Grille de widgets */}
      {layout.length === 0 ? (
        <Panel variant="info" title={s.emptyTitle}>
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.emptyAllHidden} {editing ? s.emptyEditingHint : s.emptyIdleHint}
          </p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {layout.map((placed, index) => {
            const def = widgetById.get(placed.id);
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
                    <div className="flex items-center gap-1" role="toolbar" aria-label={s.toolbarLabel(def.title)}>
                      <Button
                        variant="ghost"
                        size="small"
                        disabled={index === 0}
                        onClick={() => moveWidget(index, -1)}
                        aria-label={s.moveUpLabel(def.title)}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        disabled={index === layout.length - 1}
                        onClick={() => moveWidget(index, 1)}
                        aria-label={s.moveDownLabel(def.title)}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => toggleSize(placed.id)}
                        aria-label={
                          placed.size === 1 ? s.enlargeLabel(def.title) : s.shrinkLabel(def.title)
                        }
                      >
                        ⤢ {placed.size === 1 ? s.twoColsShort : s.oneColShort}
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => hideWidget(placed.id)}>
                        {s.hide}
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
          <Panel title={s.libraryTitle} icon={false}>
            {hiddenWidgets.length === 0 ? (
              <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
                {s.libraryAllShown}
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
                        {def.description} {s.libraryDefaultSize(def.defaultSize)}
                      </p>
                    </div>
                    <Button variant="secondary" size="small" onClick={() => addWidget(def.id)}>
                      {s.add}
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
        title={s.confirmResetTitle}
        message={s.confirmResetMessage}
        confirmLabel={s.confirmResetLabel}
        cancelLabel={s.cancelLabel}
        variant="warning"
      />
    </div>
  );
}
