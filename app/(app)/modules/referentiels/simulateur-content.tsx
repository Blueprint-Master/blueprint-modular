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
  Modal,
  Panel,
  Selectbox,
  Table,
  useToast,
} from "@/components/bpm";

type ChampType = "text" | "number" | "choice";

interface ChampDef {
  key: string;
  label: string;
  type: ChampType;
  placeholder?: string;
  align?: "left" | "center" | "right";
  options?: { value: string; label: string }[];
  /** Formatage d'affichage (colonnes du tableau et export CSV). */
  format?: (value: string | number) => string;
}

interface RefDef {
  id: string;
  nom: string;
  description: string;
  codeRegex: RegExp;
  codeHint: string;
  codePlaceholder: string;
  champs: ChampDef[];
}

interface RefEntry {
  id: string;
  code: string;
  libelle: string;
  actif: boolean;
  /** Nombre d'enregistrements applicatifs qui référencent cette entrée — bloque la suppression. */
  utilisations: number;
  champs: Record<string, string | number>;
}

const REFERENTIELS: RefDef[] = [
  {
    id: "devises",
    nom: "Devises",
    description: "Devises acceptées dans les documents commerciaux (ISO 4217).",
    codeRegex: /^[A-Z]{3}$/,
    codeHint: "3 lettres majuscules (ISO 4217)",
    codePlaceholder: "EUR",
    champs: [
      { key: "symbole", label: "Symbole", type: "text", placeholder: "€" },
      {
        key: "decimales",
        label: "Décimales",
        type: "number",
        placeholder: "2",
        align: "right",
      },
    ],
  },
  {
    id: "pays",
    nom: "Pays",
    description: "Pays de facturation et de livraison (ISO 3166-1 alpha-2).",
    codeRegex: /^[A-Z]{2}$/,
    codeHint: "2 lettres majuscules (ISO 3166-1)",
    codePlaceholder: "FR",
    champs: [
      {
        key: "ue",
        label: "Union européenne",
        type: "choice",
        options: [
          { value: "oui", label: "UE" },
          { value: "non", label: "Hors UE" },
        ],
      },
    ],
  },
  {
    id: "tva",
    nom: "Taux de TVA",
    description: "Taux de TVA applicables sur les lignes de facture.",
    codeRegex: /^[A-Z0-9_]{2,10}$/,
    codeHint: "2 à 10 caractères (majuscules, chiffres, _)",
    codePlaceholder: "TVA20",
    champs: [
      {
        key: "taux",
        label: "Taux (%)",
        type: "number",
        placeholder: "20",
        align: "right",
        format: (v) => `${String(v).replace(".", ",")} %`,
      },
    ],
  },
  {
    id: "unites",
    nom: "Unités de mesure",
    description: "Unités utilisées sur les articles et les lignes de commande.",
    codeRegex: /^[A-Z0-9]{1,6}$/,
    codeHint: "1 à 6 caractères (majuscules, chiffres)",
    codePlaceholder: "KG",
    champs: [
      {
        key: "famille",
        label: "Famille",
        type: "choice",
        options: [
          { value: "Masse", label: "Masse" },
          { value: "Longueur", label: "Longueur" },
          { value: "Volume", label: "Volume" },
          { value: "Quantité", label: "Quantité" },
          { value: "Temps", label: "Temps" },
        ],
      },
    ],
  },
];

/** Jeu de démonstration déterministe (aucun Date.now() au render). */
const INITIAL_DATA: Record<string, RefEntry[]> = {
  devises: [
    { id: "dev-1", code: "EUR", libelle: "Euro", actif: true, utilisations: 42, champs: { symbole: "€", decimales: 2 } },
    { id: "dev-2", code: "USD", libelle: "Dollar américain", actif: true, utilisations: 18, champs: { symbole: "$", decimales: 2 } },
    { id: "dev-3", code: "GBP", libelle: "Livre sterling", actif: true, utilisations: 7, champs: { symbole: "£", decimales: 2 } },
    { id: "dev-4", code: "CHF", libelle: "Franc suisse", actif: true, utilisations: 3, champs: { symbole: "CHF", decimales: 2 } },
    { id: "dev-5", code: "JPY", libelle: "Yen japonais", actif: true, utilisations: 0, champs: { symbole: "¥", decimales: 0 } },
    { id: "dev-6", code: "CAD", libelle: "Dollar canadien", actif: false, utilisations: 0, champs: { symbole: "$ CA", decimales: 2 } },
  ],
  pays: [
    { id: "pay-1", code: "FR", libelle: "France", actif: true, utilisations: 35, champs: { ue: "oui" } },
    { id: "pay-2", code: "DE", libelle: "Allemagne", actif: true, utilisations: 21, champs: { ue: "oui" } },
    { id: "pay-3", code: "IT", libelle: "Italie", actif: true, utilisations: 9, champs: { ue: "oui" } },
    { id: "pay-4", code: "ES", libelle: "Espagne", actif: true, utilisations: 6, champs: { ue: "oui" } },
    { id: "pay-5", code: "BE", libelle: "Belgique", actif: true, utilisations: 11, champs: { ue: "oui" } },
    { id: "pay-6", code: "CH", libelle: "Suisse", actif: true, utilisations: 4, champs: { ue: "non" } },
    { id: "pay-7", code: "GB", libelle: "Royaume-Uni", actif: true, utilisations: 8, champs: { ue: "non" } },
    { id: "pay-8", code: "US", libelle: "États-Unis", actif: true, utilisations: 0, champs: { ue: "non" } },
  ],
  tva: [
    { id: "tva-1", code: "TVA20", libelle: "Taux normal", actif: true, utilisations: 28, champs: { taux: 20 } },
    { id: "tva-2", code: "TVA10", libelle: "Taux intermédiaire", actif: true, utilisations: 12, champs: { taux: 10 } },
    { id: "tva-3", code: "TVA055", libelle: "Taux réduit", actif: true, utilisations: 9, champs: { taux: 5.5 } },
    { id: "tva-4", code: "TVA196", libelle: "Ancien taux normal", actif: false, utilisations: 0, champs: { taux: 19.6 } },
  ],
  unites: [
    { id: "uni-1", code: "KG", libelle: "Kilogramme", actif: true, utilisations: 12, champs: { famille: "Masse" } },
    { id: "uni-2", code: "G", libelle: "Gramme", actif: true, utilisations: 5, champs: { famille: "Masse" } },
    { id: "uni-3", code: "M", libelle: "Mètre", actif: true, utilisations: 8, champs: { famille: "Longueur" } },
    { id: "uni-4", code: "L", libelle: "Litre", actif: true, utilisations: 6, champs: { famille: "Volume" } },
    { id: "uni-5", code: "U", libelle: "Unité", actif: true, utilisations: 14, champs: { famille: "Quantité" } },
    { id: "uni-6", code: "FT", libelle: "Pied", actif: false, utilisations: 0, champs: { famille: "Longueur" } },
  ],
};

const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: "h1",
    actor: "Marie Lefèvre",
    action: "a ajouté",
    target: "CHF à Devises",
    timestamp: "2026-06-10T09:12:00",
    color: "success",
  },
  {
    id: "h2",
    actor: "Karim Benali",
    action: "a désactivé",
    target: "TVA196 dans Taux de TVA",
    timestamp: "2026-06-08T14:30:00",
    color: "warning",
  },
  {
    id: "h3",
    actor: "Sophie Marchand",
    action: "a modifié",
    target: "GB dans Pays (libellé)",
    timestamp: "2026-06-05T11:05:00",
    color: "info",
  },
];

const REF_OPTIONS = REFERENTIELS.map((r) => ({ value: r.id, label: r.nom }));

function champDisplay(champ: ChampDef, value: string | number): string {
  if (champ.type === "choice") {
    const opt = champ.options?.find((o) => o.value === String(value));
    return opt ? opt.label : String(value);
  }
  if (champ.format) return champ.format(value);
  return String(value);
}

function emptyForm(def: RefDef): Record<string, string> {
  const form: Record<string, string> = { code: "", libelle: "" };
  def.champs.forEach((c) => {
    form[c.key] = "";
  });
  return form;
}

function csvEscape(value: string): string {
  return /[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export default function ReferentielsSimulateur() {
  const { showToast } = useToast();
  const [data, setData] = useState<Record<string, RefEntry[]>>(INITIAL_DATA);
  const [refId, setRefId] = useState<string>("devises");
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);

  const def = REFERENTIELS.find((r) => r.id === refId) ?? REFERENTIELS[0];
  const entries = data[def.id] ?? [];

  const [addForm, setAddForm] = useState<Record<string, string>>(() => emptyForm(REFERENTIELS[0]));
  const [addError, setAddError] = useState<string | null>(null);

  const [editing, setEditing] = useState<RefEntry | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editError, setEditError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<RefEntry | null>(null);

  const stats = useMemo(() => {
    const all = Object.values(data).flat();
    return {
      referentiels: REFERENTIELS.length,
      total: all.length,
      inactives: all.filter((e) => !e.actif).length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.code.toLowerCase().includes(q) || e.libelle.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const pushActivity = (
    action: string,
    target: string,
    color: "success" | "warning" | "info" | "error"
  ) => {
    setActivity((prev) => [
      {
        id: `h${Date.now()}-${prev.length}`,
        actor: "Vous",
        action,
        target,
        timestamp: new Date().toISOString(),
        color,
      },
      ...prev,
    ]);
  };

  const selectRef = (id: string) => {
    const nextDef = REFERENTIELS.find((r) => r.id === id);
    if (!nextDef) return;
    setRefId(id);
    setSearch("");
    setAddForm(emptyForm(nextDef));
    setAddError(null);
  };

  /** Valide un formulaire (ajout ou édition) et renvoie l'entrée normalisée ou une erreur. */
  const validateForm = (
    form: Record<string, string>,
    excludeId: string | null
  ): { error: string } | { code: string; libelle: string; champs: Record<string, string | number> } => {
    const code = (form.code ?? "").trim().toUpperCase();
    if (!code) return { error: "Le code est requis." };
    if (!def.codeRegex.test(code)) {
      return { error: `Format de code invalide — attendu : ${def.codeHint}.` };
    }
    if (entries.some((e) => e.id !== excludeId && e.code === code)) {
      return { error: `Le code ${code} existe déjà dans « ${def.nom} ».` };
    }
    const libelle = (form.libelle ?? "").trim();
    if (!libelle) return { error: "Le libellé est requis." };
    const champs: Record<string, string | number> = {};
    for (const champ of def.champs) {
      const raw = (form[champ.key] ?? "").trim();
      if (!raw) return { error: `Le champ « ${champ.label} » est requis.` };
      if (champ.type === "number") {
        const n = Number(raw.replace(",", "."));
        if (Number.isNaN(n) || n < 0) {
          return { error: `« ${champ.label} » doit être un nombre positif.` };
        }
        champs[champ.key] = n;
      } else {
        champs[champ.key] = raw;
      }
    }
    return { code, libelle, champs };
  };

  const handleAdd = () => {
    const result = validateForm(addForm, null);
    if ("error" in result) {
      setAddError(result.error);
      return;
    }
    setAddError(null);
    const entry: RefEntry = {
      id: `${def.id}-${Date.now()}`,
      code: result.code,
      libelle: result.libelle,
      actif: true,
      utilisations: 0,
      champs: result.champs,
    };
    setData((prev) => ({ ...prev, [def.id]: [...(prev[def.id] ?? []), entry] }));
    pushActivity("a ajouté", `${result.code} à ${def.nom}`, "success");
    showToast(
      `${result.code} — ${result.libelle} ajouté au référentiel « ${def.nom} ».`,
      "success",
      4000,
      "Entrée ajoutée",
      "Référentiels",
      null
    );
    setAddForm(emptyForm(def));
  };

  const openEdit = (entry: RefEntry) => {
    const form: Record<string, string> = { code: entry.code, libelle: entry.libelle };
    def.champs.forEach((c) => {
      form[c.key] = String(entry.champs[c.key] ?? "");
    });
    setEditForm(form);
    setEditError(null);
    setEditing(entry);
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const result = validateForm(editForm, editing.id);
    if ("error" in result) {
      setEditError(result.error);
      return;
    }
    setData((prev) => ({
      ...prev,
      [def.id]: (prev[def.id] ?? []).map((e) =>
        e.id === editing.id
          ? { ...e, code: result.code, libelle: result.libelle, champs: result.champs }
          : e
      ),
    }));
    pushActivity("a modifié", `${result.code} dans ${def.nom}`, "info");
    showToast(
      `${result.code} — ${result.libelle} mis à jour dans « ${def.nom} ».`,
      "success",
      4000,
      "Entrée modifiée",
      "Référentiels",
      null
    );
    setEditing(null);
  };

  const toggleActive = (entry: RefEntry) => {
    const actif = !entry.actif;
    setData((prev) => ({
      ...prev,
      [def.id]: (prev[def.id] ?? []).map((e) => (e.id === entry.id ? { ...e, actif } : e)),
    }));
    pushActivity(actif ? "a activé" : "a désactivé", `${entry.code} dans ${def.nom}`, actif ? "success" : "warning");
    showToast(
      actif
        ? `${entry.code} est de nouveau proposé dans les formulaires.`
        : `${entry.code} n'est plus proposé dans les formulaires (les données existantes sont conservées).`,
      actif ? "success" : "warning",
      4000,
      actif ? "Entrée activée" : "Entrée désactivée",
      "Référentiels",
      null
    );
  };

  const requestDelete = (entry: RefEntry) => {
    if (entry.utilisations > 0) {
      showToast(
        `${entry.code} est référencé par ${entry.utilisations} enregistrement(s). Désactivez l'entrée plutôt que de la supprimer.`,
        "error",
        6000,
        "Suppression refusée",
        "Référentiels",
        null
      );
      return;
    }
    setToDelete(entry);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setData((prev) => ({
      ...prev,
      [def.id]: (prev[def.id] ?? []).filter((e) => e.id !== toDelete.id),
    }));
    pushActivity("a supprimé", `${toDelete.code} de ${def.nom}`, "error");
    showToast(
      `${toDelete.code} — ${toDelete.libelle} supprimé du référentiel « ${def.nom} ».`,
      "info",
      4000,
      "Entrée supprimée",
      "Référentiels",
      null
    );
    setToDelete(null);
  };

  const exportCsv = () => {
    const headers = ["code", "libelle", ...def.champs.map((c) => c.label), "actif", "utilisations"];
    const lines = [
      headers.map(csvEscape).join(";"),
      ...entries.map((e) =>
        [
          e.code,
          e.libelle,
          ...def.champs.map((c) => champDisplay(c, e.champs[c.key] ?? "")),
          e.actif ? "oui" : "non",
          String(e.utilisations),
        ]
          .map(csvEscape)
          .join(";")
      ),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referentiel-${def.id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushActivity("a exporté", `${def.nom} (${entries.length} entrées, CSV)`, "info");
    showToast(
      `referentiel-${def.id}.csv téléchargé (${entries.length} entrées).`,
      "success",
      4000,
      "Export CSV",
      "Référentiels",
      null
    );
  };

  /** Champ de formulaire adapté au type de colonne (texte, nombre, liste de choix). */
  const renderChampInput = (
    champ: ChampDef,
    form: Record<string, string>,
    setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    if (champ.type === "choice") {
      return (
        <Selectbox
          key={champ.key}
          label={champ.label}
          options={champ.options ?? []}
          value={form[champ.key] || null}
          onChange={(v) => setForm((prev) => ({ ...prev, [champ.key]: v }))}
          placeholder="Choisir"
        />
      );
    }
    return (
      <Input
        key={champ.key}
        label={champ.label}
        value={form[champ.key] ?? ""}
        onChange={(v) => setForm((prev) => ({ ...prev, [champ.key]: v }))}
        placeholder={champ.placeholder}
      />
    );
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (value: unknown) => (
        <span style={{ color: "var(--bpm-text-primary)", fontWeight: 600, fontFamily: "var(--bpm-font-mono, monospace)" }}>
          {String(value)}
        </span>
      ),
    },
    { key: "libelle", label: "Libellé" },
    ...def.champs.map((champ) => ({
      key: champ.key,
      label: champ.label,
      align: champ.align,
      render: (value: unknown) => <span>{champDisplay(champ, value as string | number)}</span>,
    })),
    {
      key: "utilisations",
      label: "Utilisations",
      align: "right" as const,
      render: (value: unknown) => {
        const n = Number(value);
        return n > 0 ? <span>{n}</span> : <span style={{ color: "var(--bpm-text-secondary)" }}>—</span>;
      },
    },
    {
      key: "actif",
      label: "Statut",
      render: (value: unknown) =>
        value ? <Badge variant="success">Actif</Badge> : <Badge variant="default">Inactif</Badge>,
    },
    {
      key: "id",
      label: "Actions",
      render: (value: unknown) => {
        const entry = entries.find((e) => e.id === value);
        if (!entry) return null;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={() => openEdit(entry)}>
              Modifier
            </Button>
            <Button size="small" variant="secondary" onClick={() => toggleActive(entry)}>
              {entry.actif ? "Désactiver" : "Activer"}
            </Button>
            <Button size="small" variant="destructive" onClick={() => requestDelete(entry)}>
              Supprimer
            </Button>
          </div>
        );
      },
    },
  ];

  const tableData = filtered.map((e) => ({
    ...e.champs,
    id: e.id,
    code: e.code,
    libelle: e.libelle,
    actif: e.actif,
    utilisations: e.utilisations,
  })) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Référentiels" value={String(stats.referentiels)} />
        <Metric label="Entrées totales" value={String(stats.total)} />
        <Metric label="Entrées inactives" value={String(stats.inactives)} />
      </MetricRow>

      <Panel variant="info" title={`Référentiel « ${def.nom} » — ${entries.length} entrée(s)`}>
        <div className="grid gap-3 md:grid-cols-3">
          <Selectbox
            label="Référentiel"
            options={REF_OPTIONS}
            value={refId}
            onChange={selectRef}
            placeholder="Choisir un référentiel"
          />
          <Input
            label="Recherche (code ou libellé)"
            value={search}
            onChange={setSearch}
            placeholder="ex. EUR, Euro…"
            type="search"
          />
          <div className="flex items-end">
            <Button variant="outline" onClick={exportCsv}>
              Exporter en CSV
            </Button>
          </div>
        </div>
        <p className="mt-2 mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {def.description}
        </p>
        <Table columns={columns} data={tableData} striped hover />
        {filtered.length === 0 && (
          <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Aucune entrée ne correspond à « {search} ».
          </p>
        )}
      </Panel>

      <Panel variant="info" title={`Ajouter une entrée à « ${def.nom} »`}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label={`Code — ${def.codeHint}`}
            value={addForm.code ?? ""}
            onChange={(v) => setAddForm((prev) => ({ ...prev, code: v }))}
            placeholder={def.codePlaceholder}
          />
          <Input
            label="Libellé"
            value={addForm.libelle ?? ""}
            onChange={(v) => setAddForm((prev) => ({ ...prev, libelle: v }))}
            placeholder="Libellé affiché dans les formulaires"
          />
          {def.champs.map((champ) => renderChampInput(champ, addForm, setAddForm))}
        </div>
        {addError && (
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-error, #dc2626)" }}>
            {addError}
          </p>
        )}
        <Button className="mt-4" onClick={handleAdd}>
          Ajouter l&apos;entrée
        </Button>
      </Panel>

      <Panel variant="info" title="Historique des modifications">
        <ActivityFeed activities={activity} maxItems={6} compact />
      </Panel>

      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          title={`Modifier ${editing.code} — ${def.nom}`}
          size="medium"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label={`Code — ${def.codeHint}`}
              value={editForm.code ?? ""}
              onChange={(v) => setEditForm((prev) => ({ ...prev, code: v }))}
              placeholder={def.codePlaceholder}
            />
            <Input
              label="Libellé"
              value={editForm.libelle ?? ""}
              onChange={(v) => setEditForm((prev) => ({ ...prev, libelle: v }))}
            />
            {def.champs.map((champ) => renderChampInput(champ, editForm, setEditForm))}
          </div>
          {editError && (
            <p className="mt-2 text-sm" style={{ color: "var(--bpm-error, #dc2626)" }}>
              {editError}
            </p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit}>Enregistrer</Button>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Supprimer l'entrée"
        message={
          toDelete
            ? `${toDelete.code} — ${toDelete.libelle} sera retiré du référentiel « ${def.nom} ». Cette entrée n'est utilisée par aucun enregistrement.`
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
