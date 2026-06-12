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

export default function ThemesSimulateur() {
  const { showToast } = useToast();
  const [themes, setThemes] = useState<Theme[]>(INITIAL_THEMES);
  const [defaultId, setDefaultId] = useState<string>("theme-blueprint");
  const [selectedId, setSelectedId] = useState<string>("theme-blueprint");
  const [draft, setDraft] = useState<Draft>(draftFrom(INITIAL_THEMES[0]));
  const [nouveauNom, setNouveauNom] = useState("");
  const [nomError, setNomError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Theme | null>(null);
  // Libellé figé au premier rendu (déterministe), puis « à l'instant » après action.
  const [derniereModif, setDerniereModif] = useState("il y a 3 jours");

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
      setNomError("Indiquez un nom pour le nouveau thème.");
      return;
    }
    if (themes.some((t) => t.nom.toLowerCase() === nom.toLowerCase())) {
      setNomError(`Un thème nommé « ${nom} » existe déjà.`);
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
    setDerniereModif("à l'instant");
    showToast(
      `Thème « ${nom} » enregistré (${themes.length + 1} thèmes disponibles).`,
      "success",
      5000,
      "Thème enregistré",
      "Thèmes",
      null
    );
  };

  const handleSetDefault = () => {
    if (selected.id === defaultId) {
      showToast(
        `« ${selected.nom} » est déjà le thème par défaut.`,
        "info",
        4000,
        "Aucun changement",
        "Thèmes",
        null
      );
      return;
    }
    setDefaultId(selected.id);
    setDerniereModif("à l'instant");
    showToast(
      `« ${selected.nom} » est désormais appliqué par défaut aux nouvelles instances.`,
      "success",
      5000,
      "Thème par défaut",
      "Thèmes",
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
    setDerniereModif("à l'instant");
    showToast(
      `Thème « ${supprime.nom} » supprimé. Les instances qui l'utilisaient repassent sur « ${defaultTheme.nom} ».`,
      "info",
      5000,
      "Thème supprimé",
      "Thèmes",
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
      `« ${apercu.nom} » exporté dans ${fichier}.`,
      "success",
      5000,
      "Export JSON",
      "Thèmes",
      null
    );
  };

  const contrastAccent = texteSurAccent(apercu.accent);
  const bordure = `${apercu.texte}26`; // texte à ~15 % d'opacité (hex 8 chiffres)
  const radius = `${apercu.rayon}px`;

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Thèmes disponibles" value={String(themes.length)} />
        <Metric label="Thème par défaut" value={defaultTheme.nom} />
        <Metric label="Dernière modification" value={derniereModif} />
      </MetricRow>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Panel variant="info" title="Thèmes">
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
                        {theme.nom}
                      </span>
                      <span className="block text-xs truncate" style={{ color: "var(--bpm-text-secondary)" }}>
                        {theme.couleurApp} · accent {theme.accent} · rayon {theme.rayon}px
                      </span>
                    </span>
                    {theme.id === defaultId && <Badge variant="primary">Par défaut</Badge>}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleSetDefault}>
                Définir par défaut
              </Button>
              <Button variant="outline" onClick={handleExport}>
                Exporter JSON
              </Button>
              <Button
                variant="destructive"
                disabled={selected.id === defaultId}
                onClick={() => setToDelete(selected)}
              >
                Supprimer
              </Button>
            </div>
            {selected.id === defaultId && (
              <p className="mt-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                Le thème par défaut ne peut pas être supprimé : définissez d&apos;abord un autre
                thème par défaut.
              </p>
            )}
          </Panel>

          <Panel variant="info" title="Personnaliser">
            <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              Base : <strong style={{ color: "var(--bpm-text-primary)" }}>{selected.nom}</strong>.
              Chaque changement se reflète immédiatement dans l&apos;aperçu.
            </p>
            <div className="space-y-4">
              <Input
                label="Nom de l'app (affiché dans la barre)"
                placeholder="Blueprint Modular"
                value={draft.couleurApp}
                onChange={(value: string) => setDraft((d) => ({ ...d, couleurApp: value }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorPicker
                  label="Couleur d'accent"
                  value={draft.accent}
                  onChange={(value: string) => setDraft((d) => ({ ...d, accent: value }))}
                />
                <ColorPicker
                  label="Couleur de fond"
                  value={draft.fond}
                  onChange={(value: string) => setDraft((d) => ({ ...d, fond: value }))}
                />
              </div>
              <Slider
                label="Rayon de bordure (px)"
                value={draft.rayon}
                min={0}
                max={16}
                step={1}
                onChange={(value: number) => setDraft((d) => ({ ...d, rayon: value }))}
              />
            </div>
            {estModifie && (
              <p className="mt-3 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                Modifications non enregistrées — visibles dans l&apos;aperçu. Enregistrez-les comme
                nouveau thème pour les conserver.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <Input
                  label="Nom du nouveau thème"
                  placeholder="ACME Corp — sombre"
                  value={nouveauNom}
                  onChange={(value: string) => {
                    setNouveauNom(value);
                    if (nomError) setNomError(null);
                  }}
                />
              </div>
              <Button onClick={handleSaveAsNew}>Enregistrer comme nouveau thème</Button>
            </div>
            {nomError && (
              <p className="mt-2 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
                {nomError}
              </p>
            )}
          </Panel>
        </div>

        <Panel variant="info" title="Aperçu">
          <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Rendu scopé au conteneur ci-dessous : les variables du thème ne touchent jamais le
            reste de l&apos;application.
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
                  {apercu.couleurApp.trim() || "Sans nom"}
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
                Production
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
                  Commandes du mois
                </div>
                <div className="text-xl font-bold tabular-nums" style={{ color: apercu.texte }}>
                  1 284
                </div>
                <div className="text-xs font-medium" style={{ color: apercu.accent }}>
                  +12 % vs mai
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
                  Taux de service
                </div>
                <div className="text-xl font-bold tabular-nums" style={{ color: apercu.texte }}>
                  98,2 %
                </div>
                <div className="text-xs font-medium" style={{ color: apercu.accent }}>
                  objectif atteint
                </div>
              </div>
            </div>

            {/* Champ + bouton primaire */}
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                readOnly
                value=""
                placeholder="Rechercher une commande…"
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
                    `Action de démonstration dans l'aperçu « ${apercu.couleurApp.trim() || apercu.nom} ».`,
                    "info",
                    3000,
                    "Aperçu",
                    "Thèmes",
                    null
                  )
                }
              >
                Nouvelle commande
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Supprimer le thème"
        message={
          toDelete
            ? `Le thème « ${toDelete.nom} » sera retiré de la bibliothèque. Les instances qui l'utilisent repasseront sur le thème par défaut (« ${defaultTheme.nom} »).`
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
