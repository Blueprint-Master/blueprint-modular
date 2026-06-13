"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  ColorPicker,
  ConfirmModal,
  Input,
  Metric,
  MetricRow,
  Panel,
  Slider,
  useToast,
} from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

interface Theme {
  id: string;
  /** Nom du thème (affiché dans la liste). */
  nom: string;
  /** Nom d'application affiché dans la barre d'app (white-label). */
  couleurApp: string;
  accent: string;
  fond: string;
  surface: string;
  texte: string;
  /** Rayon de bordure en px (0–16). */
  rayon: number;
}

/** Jeu de thèmes seedé, 100 % déterministe (littéraux uniquement). */
const INITIAL_THEMES: Theme[] = [
  {
    id: "theme-blueprint",
    nom: "Blueprint (défaut)",
    couleurApp: "Blueprint Modular",
    accent: "#06b6d4",
    fond: "#f8fafc",
    surface: "#ffffff",
    texte: "#0f172a",
    rayon: 8,
  },
  {
    id: "theme-acme",
    nom: "ACME Corp",
    couleurApp: "ACME Portail",
    accent: "#e11d48",
    fond: "#faf6f6",
    surface: "#ffffff",
    texte: "#1c1917",
    rayon: 4,
  },
  {
    id: "theme-nordis",
    nom: "Nordis Énergie",
    couleurApp: "Nordis Ops",
    accent: "#16a34a",
    fond: "#f2faf4",
    surface: "#ffffff",
    texte: "#14281c",
    rayon: 12,
  },
  {
    id: "theme-contraste",
    nom: "Contraste élevé",
    couleurApp: "Blueprint Modular",
    accent: "#facc15",
    fond: "#000000",
    surface: "#161616",
    texte: "#ffffff",
    rayon: 2,
  },
];

interface Draft {
  couleurApp: string;
  accent: string;
  fond: string;
  rayon: number;
}

function draftFrom(theme: Theme): Draft {
  return {
    couleurApp: theme.couleurApp,
    accent: theme.accent,
    fond: theme.fond,
    rayon: theme.rayon,
  };
}

/** Initiales du nom d'app pour le logo (déterministe). */
function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  if (mots.length === 0) return "·";
  return mots
    .slice(0, 2)
    .map((m) => m.charAt(0).toUpperCase())
    .join("");
}

/** Couleur de texte lisible sur l'accent (luminance simple). */
function texteSurAccent(hex: string): string {
  const h = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#000000";
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#111111" : "#ffffff";
}

function slug(nom: string): string {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "theme";
}

/** Clé de la mention « dernière modification » (résolue selon la locale au rendu). */
type LastModifiedKey = "timeThreeDaysAgo" | "timeJustNow";

export default function ThemesSimulateur() {
  const { showToast } = useToast();
  const { locale } = useI18n();
  const s = STR[locale];
  const [themes, setThemes] = useState<Theme[]>(INITIAL_THEMES);
  const [defaultId, setDefaultId] = useState<string>("theme-blueprint");
  const [selectedId, setSelectedId] = useState<string>("theme-blueprint");
  const [draft, setDraft] = useState<Draft>(draftFrom(INITIAL_THEMES[0]));
  const [nouveauNom, setNouveauNom] = useState("");
  const [nomError, setNomError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Theme | null>(null);
  // Libellé figé au premier rendu (déterministe), puis « à l'instant » après action.
  const [derniereModif, setDerniereModif] = useState<LastModifiedKey>("timeThreeDaysAgo");

  /** Nom affiché : les thèmes seedés sont localisés, les autres gardent leur nom saisi. */
  const themeName = (theme: Theme): string => s.seedNames[theme.id] ?? theme.nom;

  const selected = useMemo(
    () => themes.find((t) => t.id === selectedId) ?? themes[0],
    [themes, selectedId]
  );

  const defaultTheme = useMemo(
    () => themes.find((t) => t.id === defaultId) ?? themes[0],
    [themes, defaultId]
  );

  /** Thème effectif rendu dans l'aperçu = base sélectionnée + personnalisations. */
  const apercu: Theme = useMemo(
    () => ({ ...selected, ...draft }),
    [selected, draft]
  );

  const estModifie =
    draft.couleurApp !== selected.couleurApp ||
    draft.accent !== selected.accent ||
    draft.fond !== selected.fond ||
    draft.rayon !== selected.rayon;

  const selectTheme = (theme: Theme) => {
    setSelectedId(theme.id);
    setDraft(draftFrom(theme));
    setNomError(null);
  };

  const handleSaveAsNew = () => {
    const nom = nouveauNom.trim();
    if (!nom) {
      setNomError(s.errNameRequired);
      return;
    }
    if (themes.some((t) => t.nom.toLowerCase() === nom.toLowerCase())) {
      setNomError(s.errNameExists(nom));
      return;
    }
    setNomError(null);
    const nouveau: Theme = {
      id: `theme-${Date.now()}`,
      nom,
      couleurApp: draft.couleurApp.trim() || selected.couleurApp,
      accent: draft.accent,
      fond: draft.fond,
      surface: selected.surface,
      texte: selected.texte,
      rayon: draft.rayon,
    };
    setThemes((prev) => [...prev, nouveau]);
    setSelectedId(nouveau.id);
    setDraft(draftFrom(nouveau));
    setNouveauNom("");
    setDerniereModif("timeJustNow");
    showToast(
      s.toastSavedMsg(nom, themes.length + 1),
      "success",
      5000,
      s.toastSavedTitle,
      s.toastSource,
      null
    );
  };

  const handleSetDefault = () => {
    if (selected.id === defaultId) {
      showToast(
        s.toastNoChangeMsg(themeName(selected)),
        "info",
        4000,
        s.toastNoChangeTitle,
        s.toastSource,
        null
      );
      return;
    }
    setDefaultId(selected.id);
    setDerniereModif("timeJustNow");
    showToast(
      s.toastDefaultMsg(themeName(selected)),
      "success",
      5000,
      s.toastDefaultTitle,
      s.toastSource,
      null
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const supprime = toDelete;
    setThemes((prev) => {
      const reste = prev.filter((t) => t.id !== supprime.id);
      if (supprime.id === selectedId) {
        const repli = reste.find((t) => t.id === defaultId) ?? reste[0];
        setSelectedId(repli.id);
        setDraft(draftFrom(repli));
      }
      return reste;
    });
    setToDelete(null);
    setDerniereModif("timeJustNow");
    showToast(
      s.toastDeletedMsg(themeName(supprime), themeName(defaultTheme)),
      "info",
      5000,
      s.toastDeletedTitle,
      s.toastSource,
      null
    );
  };

  const handleExport = () => {
    const exportable = {
      id: apercu.id,
      nom: apercu.nom,
      couleurApp: apercu.couleurApp,
      accent: apercu.accent,
      fond: apercu.fond,
      surface: apercu.surface,
      texte: apercu.texte,
      rayon: apercu.rayon,
      exporteLe: new Date().toISOString(),
    };
    const fichier = `theme-${slug(apercu.nom)}.json`;
    const blob = new Blob([JSON.stringify(exportable, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fichier;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(
      s.toastExportMsg(themeName(apercu), fichier),
      "success",
      5000,
      s.toastExportTitle,
      s.toastSource,
      null
    );
  };

  const contrastAccent = texteSurAccent(apercu.accent);
  const bordure = `${apercu.texte}26`; // texte à ~15 % d'opacité (hex 8 chiffres)
  const radius = `${apercu.rayon}px`;

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={s.metricAvailable} value={String(themes.length)} />
        <Metric label={s.metricDefault} value={themeName(defaultTheme)} />
        <Metric label={s.metricLastModified} value={s[derniereModif]} />
      </MetricRow>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Panel variant="info" title={s.panelThemes}>
            <div className="space-y-2">
              {themes.map((theme) => {
                const actif = theme.id === selectedId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => selectTheme(theme)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded transition-colors"
                    style={{
                      border: `1px solid ${actif ? "var(--bpm-accent)" : "var(--bpm-border)"}`,
                      background: actif ? "var(--bpm-bg-secondary)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span className="flex shrink-0" aria-hidden>
                      <span
                        className="inline-block w-4 h-4 rounded-l"
                        style={{ background: theme.accent }}
                      />
                      <span
                        className="inline-block w-4 h-4"
                        style={{ background: theme.fond, border: "1px solid var(--bpm-border)" }}
                      />
                      <span
                        className="inline-block w-4 h-4 rounded-r"
                        style={{ background: theme.texte }}
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate" style={{ color: "var(--bpm-text-primary)" }}>
                        {themeName(theme)}
                      </span>
                      <span className="block text-xs truncate" style={{ color: "var(--bpm-text-secondary)" }}>
                        {s.themeMeta(theme.couleurApp, theme.accent, theme.rayon)}
                      </span>
                    </span>
                    {theme.id === defaultId && <Badge variant="primary">{s.badgeDefault}</Badge>}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleSetDefault}>
                {s.btnSetDefault}
              </Button>
              <Button variant="outline" onClick={handleExport}>
                {s.btnExportJson}
              </Button>
              <Button
                variant="destructive"
                disabled={selected.id === defaultId}
                onClick={() => setToDelete(selected)}
              >
                {s.btnDelete}
              </Button>
            </div>
            {selected.id === defaultId && (
              <p className="mt-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                {s.cannotDeleteDefault}
              </p>
            )}
          </Panel>

          <Panel variant="info" title={s.panelCustomize}>
            <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              {s.customizeBasePrefix}
              <strong style={{ color: "var(--bpm-text-primary)" }}>{themeName(selected)}</strong>
              {s.customizeBaseSuffix}
            </p>
            <div className="space-y-4">
              <Input
                label={s.labelAppName}
                placeholder={s.placeholderAppName}
                value={draft.couleurApp}
                onChange={(value: string) => setDraft((d) => ({ ...d, couleurApp: value }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorPicker
                  label={s.labelAccentColor}
                  value={draft.accent}
                  onChange={(value: string) => setDraft((d) => ({ ...d, accent: value }))}
                />
                <ColorPicker
                  label={s.labelBackgroundColor}
                  value={draft.fond}
                  onChange={(value: string) => setDraft((d) => ({ ...d, fond: value }))}
                />
              </div>
              <Slider
                label={s.labelBorderRadius}
                value={draft.rayon}
                min={0}
                max={16}
                step={1}
                onChange={(value: number) => setDraft((d) => ({ ...d, rayon: value }))}
              />
            </div>
            {estModifie && (
              <p className="mt-3 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                {s.unsavedChanges}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <Input
                  label={s.labelNewThemeName}
                  placeholder={s.placeholderNewThemeName}
                  value={nouveauNom}
                  onChange={(value: string) => {
                    setNouveauNom(value);
                    if (nomError) setNomError(null);
                  }}
                />
              </div>
              <Button onClick={handleSaveAsNew}>{s.btnSaveAsNew}</Button>
            </div>
            {nomError && (
              <p className="mt-2 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
                {nomError}
              </p>
            )}
          </Panel>
        </div>

        <Panel variant="info" title={s.panelPreview}>
          <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.previewIntro}
          </p>
          {/* Conteneur scopé : tout le style provient du thème sélectionné + personnalisations. */}
          <div
            className="p-4"
            style={{
              background: apercu.fond,
              color: apercu.texte,
              border: `1px solid ${bordure}`,
              borderRadius: radius,
            }}
          >
            {/* Barre d'app */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{
                background: apercu.surface,
                border: `1px solid ${bordure}`,
                borderRadius: radius,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="flex items-center justify-center w-8 h-8 text-xs font-bold shrink-0"
                  style={{
                    background: apercu.accent,
                    color: contrastAccent,
                    borderRadius: radius,
                  }}
                >
                  {initiales(apercu.couleurApp)}
                </span>
                <span className="text-sm font-semibold truncate" style={{ color: apercu.texte }}>
                  {apercu.couleurApp.trim() || s.previewUntitled}
                </span>
              </div>
              <span
                className="text-xs font-medium px-2 py-0.5 shrink-0"
                style={{
                  background: apercu.accent,
                  color: contrastAccent,
                  borderRadius: radius,
                }}
              >
                {s.previewEnvBadge}
              </span>
            </div>

            {/* Cartes KPI */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div
                className="p-3"
                style={{
                  background: apercu.surface,
                  border: `1px solid ${bordure}`,
                  borderRadius: radius,
                }}
              >
                <div className="text-xs" style={{ color: apercu.texte, opacity: 0.65 }}>
                  {s.kpiOrdersLabel}
                </div>
                <div className="text-xl font-bold tabular-nums" style={{ color: apercu.texte }}>
                  {s.kpiOrdersValue}
                </div>
                <div className="text-xs font-medium" style={{ color: apercu.accent }}>
                  {s.kpiOrdersDelta}
                </div>
              </div>
              <div
                className="p-3"
                style={{
                  background: apercu.surface,
                  border: `1px solid ${bordure}`,
                  borderRadius: radius,
                }}
              >
                <div className="text-xs" style={{ color: apercu.texte, opacity: 0.65 }}>
                  {s.kpiServiceLabel}
                </div>
                <div className="text-xl font-bold tabular-nums" style={{ color: apercu.texte }}>
                  {s.kpiServiceValue}
                </div>
                <div className="text-xs font-medium" style={{ color: apercu.accent }}>
                  {s.kpiServiceDelta}
                </div>
              </div>
            </div>

            {/* Champ + bouton primaire */}
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                readOnly
                value=""
                placeholder={s.previewSearchPlaceholder}
                className="flex-1 min-w-0 px-3 py-2 text-sm outline-none"
                style={{
                  background: apercu.surface,
                  color: apercu.texte,
                  border: `1px solid ${bordure}`,
                  borderRadius: radius,
                }}
              />
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold shrink-0"
                style={{
                  background: apercu.accent,
                  color: contrastAccent,
                  border: "none",
                  borderRadius: radius,
                  cursor: "pointer",
                }}
                onClick={() =>
                  showToast(
                    s.toastPreviewMsg(apercu.couleurApp.trim() || themeName(apercu)),
                    "info",
                    3000,
                    s.toastPreviewTitle,
                    s.toastSource,
                    null
                  )
                }
              >
                {s.previewPrimaryAction}
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <ConfirmModal
        isOpen={toDelete !== null}
        title={s.modalDeleteTitle}
        message={toDelete ? s.modalDeleteMsg(themeName(toDelete), themeName(defaultTheme)) : ""}
        confirmLabel={s.modalConfirm}
        cancelLabel={s.modalCancel}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
