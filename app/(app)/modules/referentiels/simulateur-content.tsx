"use client";

import { useMemo, useState } from "react";
import { ActivityFeed, Badge, Button, Card, ConfirmModal, Input, Metric, MetricRow, Modal, Selectbox, Table, type ActivityItem, useToast } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import { STR, type LText, type Strings } from "./strings";

type ChampType = "text" | "number" | "choice";

interface ChampDef {
  key: string;
  label: LText;
  type: ChampType;
  placeholder?: string;
  align?: "left" | "center" | "right";
  options?: { value: string; label: LText }[];
  /** Formatage d'affichage (colonnes du tableau et export CSV). */
  format?: (value: string | number, locale: Locale) => string;
}

interface RefDef {
  id: string;
  nom: LText;
  /** Segment du nom de fichier CSV, par locale. */
  slug: LText;
  description: LText;
  codeRegex: RegExp;
  codeHint: LText;
  codePlaceholder: string;
  champs: ChampDef[];
}

interface RefEntry {
  id: string;
  code: string;
  libelle: LText;
  actif: boolean;
  /** Nombre d'enregistrements applicatifs qui référencent cette entrée — bloque la suppression. */
  utilisations: number;
  champs: Record<string, string | number>;
}

const REFERENTIELS: RefDef[] = [
  {
    id: "devises",
    nom: { fr: "Devises", en: "Currencies" },
    slug: { fr: "devises", en: "currencies" },
    description: {
      fr: "Devises acceptées dans les documents commerciaux (ISO 4217).",
      en: "Currencies accepted in commercial documents (ISO 4217).",
    },
    codeRegex: /^[A-Z]{3}$/,
    codeHint: {
      fr: "3 lettres majuscules (ISO 4217)",
      en: "3 uppercase letters, ISO 4217",
    },
    codePlaceholder: "EUR",
    champs: [
      {
        key: "symbole",
        label: { fr: "Symbole", en: "Symbol" },
        type: "text",
        placeholder: "€",
      },
      {
        key: "decimales",
        label: { fr: "Décimales", en: "Decimals" },
        type: "number",
        placeholder: "2",
        align: "right",
      },
    ],
  },
  {
    id: "pays",
    nom: { fr: "Pays", en: "Countries" },
    slug: { fr: "pays", en: "countries" },
    description: {
      fr: "Pays de facturation et de livraison (ISO 3166-1 alpha-2).",
      en: "Billing and shipping countries (ISO 3166-1 alpha-2).",
    },
    codeRegex: /^[A-Z]{2}$/,
    codeHint: {
      fr: "2 lettres majuscules (ISO 3166-1)",
      en: "2 uppercase letters, ISO 3166-1",
    },
    codePlaceholder: "FR",
    champs: [
      {
        key: "ue",
        label: { fr: "Union européenne", en: "European Union" },
        type: "choice",
        options: [
          { value: "oui", label: { fr: "UE", en: "EU" } },
          { value: "non", label: { fr: "Hors UE", en: "Non-EU" } },
        ],
      },
    ],
  },
  {
    id: "tva",
    nom: { fr: "Taux de TVA", en: "VAT rates" },
    slug: { fr: "tva", en: "vat-rates" },
    description: {
      fr: "Taux de TVA applicables sur les lignes de facture.",
      en: "VAT rates applicable to invoice lines.",
    },
    codeRegex: /^[A-Z0-9_]{2,10}$/,
    codeHint: {
      fr: "2 à 10 caractères (majuscules, chiffres, _)",
      en: "2 to 10 characters (uppercase letters, digits, _)",
    },
    codePlaceholder: "TVA20",
    champs: [
      {
        key: "taux",
        label: { fr: "Taux (%)", en: "Rate (%)" },
        type: "number",
        placeholder: "20",
        align: "right",
        format: (v, locale) =>
          locale === "fr" ? `${String(v).replace(".", ",")} %` : `${String(v)} %`,
      },
    ],
  },
  {
    id: "unites",
    nom: { fr: "Unités de mesure", en: "Units of measure" },
    slug: { fr: "unites", en: "units" },
    description: {
      fr: "Unités utilisées sur les articles et les lignes de commande.",
      en: "Units used on items and order lines.",
    },
    codeRegex: /^[A-Z0-9]{1,6}$/,
    codeHint: {
      fr: "1 à 6 caractères (majuscules, chiffres)",
      en: "1 to 6 characters, uppercase letters and digits",
    },
    codePlaceholder: "KG",
    champs: [
      {
        key: "famille",
        label: { fr: "Famille", en: "Family" },
        type: "choice",
        options: [
          { value: "Masse", label: { fr: "Masse", en: "Mass" } },
          { value: "Longueur", label: { fr: "Longueur", en: "Length" } },
          { value: "Volume", label: { fr: "Volume", en: "Volume" } },
          { value: "Quantité", label: { fr: "Quantité", en: "Quantity" } },
          { value: "Temps", label: { fr: "Temps", en: "Time" } },
        ],
      },
    ],
  },
];

/** Jeu de démonstration déterministe (aucun Date.now() au render). */
const INITIAL_DATA: Record<string, RefEntry[]> = {
  devises: [
    { id: "dev-1", code: "EUR", libelle: { fr: "Euro", en: "Euro" }, actif: true, utilisations: 42, champs: { symbole: "€", decimales: 2 } },
    { id: "dev-2", code: "USD", libelle: { fr: "Dollar américain", en: "US Dollar" }, actif: true, utilisations: 18, champs: { symbole: "$", decimales: 2 } },
    { id: "dev-3", code: "GBP", libelle: { fr: "Livre sterling", en: "Pound sterling" }, actif: true, utilisations: 7, champs: { symbole: "£", decimales: 2 } },
    { id: "dev-4", code: "CHF", libelle: { fr: "Franc suisse", en: "Swiss franc" }, actif: true, utilisations: 3, champs: { symbole: "CHF", decimales: 2 } },
    { id: "dev-5", code: "JPY", libelle: { fr: "Yen japonais", en: "Japanese yen" }, actif: true, utilisations: 0, champs: { symbole: "¥", decimales: 0 } },
    { id: "dev-6", code: "CAD", libelle: { fr: "Dollar canadien", en: "Canadian dollar" }, actif: false, utilisations: 0, champs: { symbole: "$ CA", decimales: 2 } },
  ],
  pays: [
    { id: "pay-1", code: "FR", libelle: { fr: "France", en: "France" }, actif: true, utilisations: 35, champs: { ue: "oui" } },
    { id: "pay-2", code: "DE", libelle: { fr: "Allemagne", en: "Germany" }, actif: true, utilisations: 21, champs: { ue: "oui" } },
    { id: "pay-3", code: "IT", libelle: { fr: "Italie", en: "Italy" }, actif: true, utilisations: 9, champs: { ue: "oui" } },
    { id: "pay-4", code: "ES", libelle: { fr: "Espagne", en: "Spain" }, actif: true, utilisations: 6, champs: { ue: "oui" } },
    { id: "pay-5", code: "BE", libelle: { fr: "Belgique", en: "Belgium" }, actif: true, utilisations: 11, champs: { ue: "oui" } },
    { id: "pay-6", code: "CH", libelle: { fr: "Suisse", en: "Switzerland" }, actif: true, utilisations: 4, champs: { ue: "non" } },
    { id: "pay-7", code: "GB", libelle: { fr: "Royaume-Uni", en: "United Kingdom" }, actif: true, utilisations: 8, champs: { ue: "non" } },
    { id: "pay-8", code: "US", libelle: { fr: "États-Unis", en: "United States" }, actif: true, utilisations: 0, champs: { ue: "non" } },
  ],
  tva: [
    { id: "tva-1", code: "TVA20", libelle: { fr: "Taux normal", en: "Standard rate" }, actif: true, utilisations: 28, champs: { taux: 20 } },
    { id: "tva-2", code: "TVA10", libelle: { fr: "Taux intermédiaire", en: "Intermediate rate" }, actif: true, utilisations: 12, champs: { taux: 10 } },
    { id: "tva-3", code: "TVA055", libelle: { fr: "Taux réduit", en: "Reduced rate" }, actif: true, utilisations: 9, champs: { taux: 5.5 } },
    { id: "tva-4", code: "TVA196", libelle: { fr: "Ancien taux normal", en: "Former standard rate" }, actif: false, utilisations: 0, champs: { taux: 19.6 } },
  ],
  unites: [
    { id: "uni-1", code: "KG", libelle: { fr: "Kilogramme", en: "Kilogram" }, actif: true, utilisations: 12, champs: { famille: "Masse" } },
    { id: "uni-2", code: "G", libelle: { fr: "Gramme", en: "Gram" }, actif: true, utilisations: 5, champs: { famille: "Masse" } },
    { id: "uni-3", code: "M", libelle: { fr: "Mètre", en: "Metre" }, actif: true, utilisations: 8, champs: { famille: "Longueur" } },
    { id: "uni-4", code: "L", libelle: { fr: "Litre", en: "Litre" }, actif: true, utilisations: 6, champs: { famille: "Volume" } },
    { id: "uni-5", code: "U", libelle: { fr: "Unité", en: "Unit" }, actif: true, utilisations: 14, champs: { famille: "Quantité" } },
    { id: "uni-6", code: "FT", libelle: { fr: "Pied", en: "Foot" }, actif: false, utilisations: 0, champs: { famille: "Longueur" } },
  ],
};

type HistKind =
  | "added"
  | "edited"
  | "edited-label"
  | "enabled"
  | "disabled"
  | "deleted"
  | "exported";

/**
 * Entrée d'historique stockée sous forme structurée (acteur, action, référentiel, code) :
 * le texte affiché est résolu au render dans la locale active, y compris pour les
 * entrées créées dynamiquement par l'utilisateur.
 */
interface HistEntry {
  id: string;
  /** `null` = utilisateur courant (« Vous » / "You"). */
  actor: string | null;
  kind: HistKind;
  refId: string;
  code?: string;
  count?: number;
  timestamp: string;
  color: "default" | "info" | "success" | "warning" | "error";
}

const INITIAL_ACTIVITY: HistEntry[] = [
  {
    id: "h1",
    actor: "Marie Lefèvre",
    kind: "added",
    refId: "devises",
    code: "CHF",
    timestamp: "2026-06-10T09:12:00",
    color: "success",
  },
  {
    id: "h2",
    actor: "Karim Benali",
    kind: "disabled",
    refId: "tva",
    code: "TVA196",
    timestamp: "2026-06-08T14:30:00",
    color: "warning",
  },
  {
    id: "h3",
    actor: "Sophie Marchand",
    kind: "edited-label",
    refId: "pays",
    code: "GB",
    timestamp: "2026-06-05T11:05:00",
    color: "info",
  },
];

function refName(refId: string, locale: Locale): string {
  return REFERENTIELS.find((r) => r.id === refId)?.nom[locale] ?? refId;
}

/** Résout une entrée d'historique structurée en item ActivityFeed dans la locale active. */
function resolveActivity(h: HistEntry, locale: Locale, s: Strings): ActivityItem {
  const name = refName(h.refId, locale);
  const code = h.code ?? "";
  let action: string;
  let target: string;
  switch (h.kind) {
    case "added":
      action = s.actAdded;
      target = s.targetAdded(code, name);
      break;
    case "edited":
      action = s.actEdited;
      target = s.targetIn(code, name);
      break;
    case "edited-label":
      action = s.actEdited;
      target = s.targetEditedLabel(code, name);
      break;
    case "enabled":
      action = s.actEnabled;
      target = s.targetIn(code, name);
      break;
    case "disabled":
      action = s.actDisabled;
      target = s.targetIn(code, name);
      break;
    case "deleted":
      action = s.actDeleted;
      target = s.targetDeleted(code, name);
      break;
    case "exported":
      action = s.actExported;
      target = s.targetExported(name, h.count ?? 0);
      break;
  }
  return {
    id: h.id,
    actor: h.actor ?? s.you,
    action,
    target,
    timestamp: h.timestamp,
    color: h.color,
  };
}

function champDisplay(champ: ChampDef, value: string | number, locale: Locale): string {
  if (champ.type === "choice") {
    const opt = champ.options?.find((o) => o.value === String(value));
    return opt ? opt.label[locale] : String(value);
  }
  if (champ.format) return champ.format(value, locale);
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
  const { locale } = useI18n();
  const s = STR[locale];
  const [data, setData] = useState<Record<string, RefEntry[]>>(INITIAL_DATA);
  const [refId, setRefId] = useState<string>("devises");
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState<HistEntry[]>(INITIAL_ACTIVITY);

  const def = REFERENTIELS.find((r) => r.id === refId) ?? REFERENTIELS[0];
  const defNom = def.nom[locale];
  const entries = data[def.id] ?? [];

  const [addForm, setAddForm] = useState<Record<string, string>>(() => emptyForm(REFERENTIELS[0]));
  const [addError, setAddError] = useState<string | null>(null);

  const [editing, setEditing] = useState<RefEntry | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editError, setEditError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<RefEntry | null>(null);

  const refOptions = useMemo(
    () => REFERENTIELS.map((r) => ({ value: r.id, label: r.nom[locale] })),
    [locale]
  );

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
      (e) => e.code.toLowerCase().includes(q) || e.libelle[locale].toLowerCase().includes(q)
    );
  }, [entries, search, locale]);

  const pushActivity = (
    kind: HistKind,
    detail: { code?: string; count?: number },
    color: "success" | "warning" | "info" | "error"
  ) => {
    setActivity((prev) => [
      {
        id: `h${Date.now()}-${prev.length}`,
        actor: null,
        kind,
        refId: def.id,
        code: detail.code,
        count: detail.count,
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
    if (!code) return { error: s.errCodeRequired };
    if (!def.codeRegex.test(code)) {
      return { error: s.errCodeFormat(def.codeHint[locale]) };
    }
    if (entries.some((e) => e.id !== excludeId && e.code === code)) {
      return { error: s.errCodeExists(code, defNom) };
    }
    const libelle = (form.libelle ?? "").trim();
    if (!libelle) return { error: s.errLabelRequired };
    const champs: Record<string, string | number> = {};
    for (const champ of def.champs) {
      const raw = (form[champ.key] ?? "").trim();
      if (!raw) return { error: s.errFieldRequired(champ.label[locale]) };
      if (champ.type === "number") {
        const n = Number(raw.replace(",", "."));
        if (Number.isNaN(n) || n < 0) {
          return { error: s.errFieldPositiveNumber(champ.label[locale]) };
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
      // Le libellé saisi vaut pour les deux locales tant qu'il n'est pas différencié.
      libelle: { fr: result.libelle, en: result.libelle },
      actif: true,
      utilisations: 0,
      champs: result.champs,
    };
    setData((prev) => ({ ...prev, [def.id]: [...(prev[def.id] ?? []), entry] }));
    pushActivity("added", { code: result.code }, "success");
    showToast(
      s.toastAdded(result.code, result.libelle, defNom),
      "success",
      4000,
      s.toastAddedTitle,
      s.moduleName,
      null
    );
    setAddForm(emptyForm(def));
  };

  const openEdit = (entry: RefEntry) => {
    const form: Record<string, string> = { code: entry.code, libelle: entry.libelle[locale] };
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
    // Met à jour le libellé dans la locale active ; l'autre locale suit tant
    // qu'elle n'avait pas été différenciée (entrées créées par l'utilisateur).
    const old = editing.libelle;
    const libelle: LText =
      locale === "fr"
        ? { fr: result.libelle, en: old.en === old.fr ? result.libelle : old.en }
        : { en: result.libelle, fr: old.fr === old.en ? result.libelle : old.fr };
    setData((prev) => ({
      ...prev,
      [def.id]: (prev[def.id] ?? []).map((e) =>
        e.id === editing.id
          ? { ...e, code: result.code, libelle, champs: result.champs }
          : e
      ),
    }));
    pushActivity("edited", { code: result.code }, "info");
    showToast(
      s.toastEdited(result.code, result.libelle, defNom),
      "success",
      4000,
      s.toastEditedTitle,
      s.moduleName,
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
    pushActivity(actif ? "enabled" : "disabled", { code: entry.code }, actif ? "success" : "warning");
    showToast(
      actif ? s.toastEnabled(entry.code) : s.toastDisabled(entry.code),
      actif ? "success" : "warning",
      4000,
      actif ? s.toastEnabledTitle : s.toastDisabledTitle,
      s.moduleName,
      null
    );
  };

  const requestDelete = (entry: RefEntry) => {
    if (entry.utilisations > 0) {
      showToast(
        s.toastDeleteRefused(entry.code, entry.utilisations),
        "error",
        6000,
        s.toastDeleteRefusedTitle,
        s.moduleName,
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
    pushActivity("deleted", { code: toDelete.code }, "error");
    showToast(
      s.toastDeleted(toDelete.code, toDelete.libelle[locale], defNom),
      "info",
      4000,
      s.toastDeletedTitle,
      s.moduleName,
      null
    );
    setToDelete(null);
  };

  const exportCsv = () => {
    // Entêtes et valeurs traduites au moment de l'export, dans la locale active.
    const headers = [
      s.csvHeaderCode,
      s.csvHeaderLabel,
      ...def.champs.map((c) => c.label[locale]),
      s.csvHeaderActive,
      s.csvHeaderUses,
    ];
    const lines = [
      headers.map(csvEscape).join(";"),
      ...entries.map((e) =>
        [
          e.code,
          e.libelle[locale],
          ...def.champs.map((c) => champDisplay(c, e.champs[c.key] ?? "", locale)),
          e.actif ? s.csvYes : s.csvNo,
          String(e.utilisations),
        ]
          .map(csvEscape)
          .join(";")
      ),
    ];
    const fileName = s.csvFileName(def.slug[locale]);
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushActivity("exported", { count: entries.length }, "info");
    showToast(
      s.toastExport(fileName, entries.length),
      "success",
      4000,
      s.toastExportTitle,
      s.moduleName,
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
          label={champ.label[locale]}
          options={(champ.options ?? []).map((o) => ({ value: o.value, label: o.label[locale] }))}
          value={form[champ.key] || null}
          onChange={(v) => setForm((prev) => ({ ...prev, [champ.key]: v }))}
          placeholder={s.choosePlaceholder}
        />
      );
    }
    return (
      <Input
        key={champ.key}
        label={champ.label[locale]}
        value={form[champ.key] ?? ""}
        onChange={(v) => setForm((prev) => ({ ...prev, [champ.key]: v }))}
        placeholder={champ.placeholder}
      />
    );
  };

  const columns = [
    {
      key: "code",
      label: s.colCode,
      render: (value: unknown) => (
        <span style={{ color: "var(--bpm-text-primary)", fontWeight: 600, fontFamily: "var(--bpm-font-mono, monospace)" }}>
          {String(value)}
        </span>
      ),
    },
    { key: "libelle", label: s.colLabel },
    ...def.champs.map((champ) => ({
      key: champ.key,
      label: champ.label[locale],
      align: champ.align,
      render: (value: unknown) => (
        <span>{champDisplay(champ, value as string | number, locale)}</span>
      ),
    })),
    {
      key: "utilisations",
      label: s.colUses,
      align: "right" as const,
      render: (value: unknown) => {
        const n = Number(value);
        return n > 0 ? <span>{n}</span> : <span style={{ color: "var(--bpm-text-secondary)" }}>—</span>;
      },
    },
    {
      key: "actif",
      label: s.colStatus,
      render: (value: unknown) =>
        value ? <Badge variant="success">{s.badgeActive}</Badge> : <Badge variant="default">{s.badgeInactive}</Badge>,
    },
    {
      key: "id",
      label: s.colActions,
      render: (value: unknown) => {
        const entry = entries.find((e) => e.id === value);
        if (!entry) return null;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={() => openEdit(entry)}>
              {s.actionEdit}
            </Button>
            <Button size="small" variant="secondary" onClick={() => toggleActive(entry)}>
              {entry.actif ? s.actionDisable : s.actionEnable}
            </Button>
            <Button size="small" variant="destructive" onClick={() => requestDelete(entry)}>
              {s.actionDelete}
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
    libelle: e.libelle[locale],
    actif: e.actif,
    utilisations: e.utilisations,
  })) as Record<string, unknown>[];

  const activityItems = activity.map((h) => resolveActivity(h, locale, s));

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={s.metricReferentiels} value={String(stats.referentiels)} />
        <Metric label={s.metricTotalEntries} value={String(stats.total)} />
        <Metric label={s.metricInactiveEntries} value={String(stats.inactives)} />
      </MetricRow>

      <Card variant="outlined" title={s.refPanelTitle(defNom, entries.length)}>
        <div className="grid gap-3 md:grid-cols-3">
          <Selectbox
            label={s.selectorLabel}
            options={refOptions}
            value={refId}
            onChange={selectRef}
            placeholder={s.selectorPlaceholder}
          />
          <Input
            label={s.searchLabel}
            value={search}
            onChange={setSearch}
            placeholder={s.searchPlaceholder}
            type="search"
          />
          <div className="flex items-end">
            <Button variant="outline" onClick={exportCsv}>
              {s.exportCsv}
            </Button>
          </div>
        </div>
        <p className="mt-2 mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {def.description[locale]}
        </p>
        <Table columns={columns} data={tableData} striped hover />
        {filtered.length === 0 && (
          <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.noSearchMatch(search)}
          </p>
        )}
      </Card>

      <Card variant="outlined" title={s.addPanelTitle(defNom)}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label={s.codeFieldLabel(def.codeHint[locale])}
            value={addForm.code ?? ""}
            onChange={(v) => setAddForm((prev) => ({ ...prev, code: v }))}
            placeholder={def.codePlaceholder}
          />
          <Input
            label={s.labelFieldLabel}
            value={addForm.libelle ?? ""}
            onChange={(v) => setAddForm((prev) => ({ ...prev, libelle: v }))}
            placeholder={s.labelFieldPlaceholder}
          />
          {def.champs.map((champ) => renderChampInput(champ, addForm, setAddForm))}
        </div>
        {addError && (
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-error, #dc2626)" }}>
            {addError}
          </p>
        )}
        <Button className="mt-4" onClick={handleAdd}>
          {s.addEntryButton}
        </Button>
      </Card>

      <Card variant="outlined" title={s.historyTitle}>
        <ActivityFeed activities={activityItems} maxItems={6} compact />
      </Card>

      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          title={s.editModalTitle(editing.code, defNom)}
          size="medium"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label={s.codeFieldLabel(def.codeHint[locale])}
              value={editForm.code ?? ""}
              onChange={(v) => setEditForm((prev) => ({ ...prev, code: v }))}
              placeholder={def.codePlaceholder}
            />
            <Input
              label={s.labelFieldLabel}
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
              {s.cancel}
            </Button>
            <Button onClick={handleSaveEdit}>{s.save}</Button>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={toDelete !== null}
        title={s.deleteModalTitle}
        message={
          toDelete
            ? s.deleteModalMessage(toDelete.code, toDelete.libelle[locale], defNom)
            : ""
        }
        confirmLabel={s.actionDelete}
        cancelLabel={s.cancel}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
