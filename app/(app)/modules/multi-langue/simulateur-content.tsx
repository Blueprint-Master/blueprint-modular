"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Input,
  Message,
  Metric,
  MetricRow,
  Modal,
  Panel,
  Progress,
  Table,
  useToast,
} from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

type Locale = "fr" | "en" | "es";

const REFERENCE_LOCALE: Locale = "fr";
const STORAGE_KEY = "bpm-multi-langue-locale";

const LOCALES: { code: Locale; label: string; intl: string }[] = [
  { code: "fr", label: "Français", intl: "fr-FR" },
  { code: "en", label: "English", intl: "en-US" },
  { code: "es", label: "Español", intl: "es-ES" },
];

const INTL_BY_LOCALE: Record<Locale, string> = { fr: "fr-FR", en: "en-US", es: "es-ES" };

/**
 * Dictionnaires seedés. Convention :
 * - interpolation : {prenom}
 * - pluriel : "forme one|forme other" (résolu via Intl.PluralRules)
 * Le français est la langue de référence (complète). L'espagnol est
 * volontairement incomplet (3 clés manquantes) pour démontrer le repli.
 */
const DICT_FR: Record<string, string> = {
  "app.titre": "Suivi des commandes",
  "message.bienvenue": "Bonjour, {prenom}",
  "nav.commandes": "Commandes",
  "nav.clients": "Clients",
  "commandes.nombre": "{count} commande|{count} commandes",
  "commandes.colonne.reference": "Référence",
  "commandes.colonne.client": "Client",
  "commandes.colonne.statut": "Statut",
  "commandes.colonne.montant": "Montant",
  "commandes.statut.expediee": "Expédiée",
  "commandes.statut.en_preparation": "En préparation",
  "commandes.statut.livree": "Livrée",
  "commandes.total": "Total des commandes",
  "commandes.maj": "Dernière mise à jour",
  "action.valider": "Valider la commande",
  "clients.description": "Liste des clients actifs et de leur encours.",
};

const DICT_EN: Record<string, string> = {
  "app.titre": "Order tracking",
  "message.bienvenue": "Welcome, {prenom}",
  "nav.commandes": "Orders",
  "nav.clients": "Customers",
  "commandes.nombre": "{count} order|{count} orders",
  "commandes.colonne.reference": "Reference",
  "commandes.colonne.client": "Customer",
  "commandes.colonne.statut": "Status",
  "commandes.colonne.montant": "Amount",
  "commandes.statut.expediee": "Shipped",
  "commandes.statut.en_preparation": "In preparation",
  "commandes.statut.livree": "Delivered",
  "commandes.total": "Order total",
  "commandes.maj": "Last updated",
  "action.valider": "Confirm order",
  "clients.description": "List of active customers and their outstanding balance.",
};

/** Incomplet : message.bienvenue, commandes.statut.expediee et commandes.nombre manquent. */
const DICT_ES: Record<string, string> = {
  "app.titre": "Seguimiento de pedidos",
  "nav.commandes": "Pedidos",
  "nav.clients": "Clientes",
  "commandes.colonne.reference": "Referencia",
  "commandes.colonne.client": "Cliente",
  "commandes.colonne.statut": "Estado",
  "commandes.colonne.montant": "Importe",
  "commandes.statut.en_preparation": "En preparación",
  "commandes.statut.livree": "Entregado",
  "commandes.total": "Total de pedidos",
  "commandes.maj": "Última actualización",
  "action.valider": "Confirmar pedido",
  "clients.description": "Lista de clientes activos y de su saldo pendiente.",
};

/** Suggestions proposées en placeholder dans l'éditeur de traduction. */
const ES_SUGGESTIONS: Record<string, string> = {
  "message.bienvenue": "Hola, {prenom}",
  "commandes.statut.expediee": "Enviado",
  "commandes.nombre": "{count} pedido|{count} pedidos",
};

const ALL_KEYS = Object.keys(DICT_FR);

/** Données de la mini-application (déterministes : dates ISO littérales). */
interface Commande {
  id: string;
  reference: string;
  client: string;
  statutKey: string;
  montant: number;
}

const COMMANDES: Commande[] = [
  { id: "c1", reference: "CMD-1042", client: "Atelier Brun", statutKey: "commandes.statut.expediee", montant: 482.1 },
  { id: "c2", reference: "CMD-1043", client: "Mobilier Roca", statutKey: "commandes.statut.en_preparation", montant: 318.06 },
  { id: "c3", reference: "CMD-1044", client: "Maison Lebel", statutKey: "commandes.statut.livree", montant: 434.4 },
];

const TOTAL_COMMANDES = COMMANDES.reduce((sum, c) => sum + c.montant, 0); // 1234.56
const DATE_MAJ_ISO = "2026-06-10T09:30:00"; // littéral figé → rendu déterministe

const CLIENTS = [
  { id: "k1", nom: "Atelier Brun", encours: 482.1 },
  { id: "k2", nom: "Mobilier Roca", encours: 318.06 },
  { id: "k3", nom: "Maison Lebel", encours: 0 },
];

interface Resolution {
  text: string;
  fallback: boolean;
}

function applyVars(raw: string, vars?: Record<string, string>): string {
  if (!vars) return raw;
  let out = raw;
  for (const [name, val] of Object.entries(vars)) {
    out = out.split(`{${name}}`).join(val);
  }
  return out;
}

function applyPlural(raw: string, count: number, intl: string): string {
  const parts = raw.split("|");
  let form = parts[0];
  if (parts.length > 1) {
    const rule = new Intl.PluralRules(intl).select(count);
    form = rule === "one" ? parts[0] : parts[parts.length - 1];
  }
  return form.split("{count}").join(new Intl.NumberFormat(intl).format(count));
}

export default function MultiLangueSimulateur() {
  const { showToast } = useToast();
  const { locale: uiLocale } = useI18n();
  const s = STR[uiLocale];

  // Locale de la DÉMO : pilotée par le sélecteur interne FR/EN/ES,
  // indépendante de la locale globale de l'interface (uiLocale).
  const [locale, setLocale] = useState<Locale>("fr");
  const [dicts, setDicts] = useState<Record<Locale, Record<string, string>>>({
    fr: DICT_FR,
    en: DICT_EN,
    es: DICT_ES,
  });
  const [previewNav, setPreviewNav] = useState<"commandes" | "clients">("commandes");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Persistance : lecture au montage (SSR-safe, rendu initial FR).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "en" || saved === "es") {
      setLocale(saved);
    }
  }, []);

  const intl = INTL_BY_LOCALE[locale];

  /** Résout une clé dans la langue courante, avec repli sur le français. */
  const tr = (key: string, vars?: Record<string, string>, count?: number): Resolution => {
    const direct = dicts[locale][key];
    const fallback = direct === undefined;
    const raw = direct ?? dicts[REFERENCE_LOCALE][key] ?? key;
    let text = count !== undefined ? applyPlural(raw, count, intl) : raw;
    text = applyVars(text, vars);
    return { text, fallback };
  };

  /** Rendu d'une clé : soulignement pointillé si la valeur provient du repli FR. */
  const T = ({ k, vars, count }: { k: string; vars?: Record<string, string>; count?: number }) => {
    const r = tr(k, vars, count);
    if (!r.fallback) return <>{r.text}</>;
    return (
      <span
        title={s.fallbackTooltip(k, s.demoLocaleNames[locale])}
        style={{
          textDecorationLine: "underline",
          textDecorationStyle: "dotted",
          textUnderlineOffset: "3px",
          textDecorationColor: "var(--bpm-warning)",
        }}
      >
        {r.text}
      </span>
    );
  };

  const coverage = useMemo(() => {
    const pct = (d: Record<string, string>) =>
      Math.round((ALL_KEYS.filter((k) => d[k] !== undefined).length / ALL_KEYS.length) * 100);
    const missingEs = ALL_KEYS.filter((k) => dicts.es[k] === undefined);
    return { fr: pct(dicts.fr), en: pct(dicts.en), es: pct(dicts.es), missingEs };
  }, [dicts]);

  const fmtMontant = (value: number) =>
    new Intl.NumberFormat(intl, { style: "currency", currency: "EUR" }).format(value);

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(intl, { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));

  const changeLocale = (next: Locale) => {
    setLocale(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    const label = LOCALES.find((l) => l.code === next)?.label ?? next;
    showToast(s.toastLocaleChanged(label), "info", 3000, s.toastLocaleChangedTitle, s.toastSource, null);
  };

  const openEditor = (key: string) => {
    setEditingKey(key);
    setEditValue("");
    setEditError(null);
  };

  const saveTranslation = () => {
    if (!editingKey) return;
    const value = editValue.trim();
    if (value.length === 0) {
      setEditError(s.editorEmptyError);
      return;
    }
    setDicts((prev) => ({ ...prev, es: { ...prev.es, [editingKey]: value } }));
    const remaining = coverage.missingEs.length - 1;
    const newPct = Math.round(((ALL_KEYS.length - remaining) / ALL_KEYS.length) * 100);
    showToast(
      s.toastTranslationAdded(editingKey, value, newPct),
      "success",
      5000,
      s.toastTranslationAddedTitle,
      s.toastSource,
      null
    );
    setEditingKey(null);
    setEditValue("");
    setEditError(null);
  };

  const validerCommande = () => {
    showToast(
      s.toastDemoAction(tr("action.valider").text, intl),
      "success",
      4000,
      s.toastDemoActionTitle,
      s.toastSource,
      null
    );
  };

  const commandeColumns = [
    {
      key: "reference",
      label: <T k="commandes.colonne.reference" />,
      render: (value: unknown) => (
        <span style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{String(value)}</span>
      ),
    },
    { key: "client", label: <T k="commandes.colonne.client" /> },
    {
      key: "statutKey",
      label: <T k="commandes.colonne.statut" />,
      render: (value: unknown) => {
        const key = String(value);
        const variant =
          key === "commandes.statut.livree" ? "success" : key === "commandes.statut.expediee" ? "primary" : "warning";
        return (
          <Badge variant={variant}>
            <T k={key} />
          </Badge>
        );
      },
    },
    {
      key: "montant",
      label: <T k="commandes.colonne.montant" />,
      align: "right" as const,
      render: (value: unknown) => <span>{fmtMontant(Number(value))}</span>,
    },
  ];

  const keyColumns = [
    {
      key: "cle",
      label: s.colKey,
      render: (value: unknown) => <code className="text-xs">{String(value)}</code>,
    },
    { key: "fr", label: s.colFrReference },
    { key: "en", label: s.colEn },
    {
      key: "es",
      label: s.colEs,
      render: (value: unknown, row: Record<string, unknown>) => {
        if (value !== null && value !== undefined) return <span>{String(value)}</span>;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="warning">{s.badgeMissing}</Badge>
            <Button size="small" variant="secondary" onClick={() => openEditor(String(row.cle))}>
              {s.btnTranslate}
            </Button>
          </div>
        );
      },
    },
  ];

  const keyRows = ALL_KEYS.map((k) => ({
    cle: k,
    fr: dicts.fr[k],
    en: dicts.en[k],
    es: dicts.es[k] ?? null,
  }));

  const missingRows = keyRows.filter((r) => r.es === null);

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={s.metricLanguages} value={String(LOCALES.length)} />
        <Metric label={s.metricKeys} value={String(ALL_KEYS.length)} />
        <Metric label={s.metricEsCoverage} value={`${coverage.es} %`} />
      </MetricRow>

      <Panel variant="info" title={s.panelDemoLanguage}>
        <p className="mb-1 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
          {s.demoHelp}
        </p>
        <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {s.panelDemoLanguageBody}
        </p>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((l) => (
            <Button
              key={l.code}
              variant={locale === l.code ? "primary" : "secondary"}
              onClick={() => changeLocale(l.code)}
            >
              {l.code.toUpperCase()} — {l.label}
            </Button>
          ))}
        </div>
        {locale === "es" && coverage.missingEs.length > 0 && (
          <div className="mt-3">
            <Message type="warning">{s.missingEsPreview(coverage.missingEs.length)}</Message>
          </div>
        )}
      </Panel>

      <Panel variant="info" title={s.panelPreview}>
        {/* Barre d'application de la mini-app */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
          style={{ background: "var(--bpm-bg-secondary)", borderColor: "var(--bpm-border)" }}
        >
          <div>
            <div className="text-base font-semibold" style={{ color: "var(--bpm-text-primary)" }}>
              <T k="app.titre" />
            </div>
            <div className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              <T k="message.bienvenue" vars={{ prenom: "Camille" }} />
            </div>
          </div>
          <Badge variant="primary" size="md">
            <T k="commandes.nombre" count={COMMANDES.length} />
          </Badge>
        </div>

        {/* Navigation de la mini-app */}
        <div className="mt-4 flex gap-2">
          <Button
            size="small"
            variant={previewNav === "commandes" ? "primary" : "secondary"}
            onClick={() => setPreviewNav("commandes")}
          >
            <T k="nav.commandes" />
          </Button>
          <Button
            size="small"
            variant={previewNav === "clients" ? "primary" : "secondary"}
            onClick={() => setPreviewNav("clients")}
          >
            <T k="nav.clients" />
          </Button>
        </div>

        {previewNav === "commandes" ? (
          <div className="mt-4">
            <Table
              columns={commandeColumns}
              data={COMMANDES as unknown as Record<string, unknown>[]}
              striped
              hover
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                <T k="commandes.maj" /> : {fmtDate(DATE_MAJ_ISO)}
              </div>
              <div className="text-base font-semibold" style={{ color: "var(--bpm-text-primary)" }}>
                <T k="commandes.total" /> : {fmtMontant(TOTAL_COMMANDES)}
              </div>
            </div>
            <Button className="mt-4" onClick={validerCommande}>
              <T k="action.valider" />
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              <T k="clients.description" />
            </p>
            <ul className="space-y-1 text-sm" style={{ color: "var(--bpm-text-primary)" }}>
              {CLIENTS.map((c) => (
                <li key={c.id} className="flex justify-between gap-4">
                  <span>{c.nom}</span>
                  <span style={{ color: "var(--bpm-text-secondary)" }}>{fmtMontant(c.encours)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <Panel variant="info" title={s.panelCoverage}>
        {coverage.missingEs.length > 0 ? (
          <Message type="warning">{s.coverageWarning(coverage.missingEs.length)}</Message>
        ) : (
          <Message type="success">{s.coverageSuccess}</Message>
        )}
        <div className="mt-4 space-y-3">
          <Progress label={s.progressFr} value={coverage.fr} max={100} showValue />
          <Progress label={s.progressEn} value={coverage.en} max={100} showValue />
          <Progress label={s.progressEs} value={coverage.es} max={100} showValue />
        </div>
        {missingRows.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold" style={{ color: "var(--bpm-text-primary)" }}>
              {s.missingKeysHeading}
            </h4>
            <Table columns={keyColumns} data={missingRows as unknown as Record<string, unknown>[]} striped hover />
          </div>
        )}
      </Panel>

      <Panel variant="info" title={s.panelDictionary}>
        <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {s.dict1}
          <code>{"{prenom}"}</code>
          {s.dict2}
          <code>one|other</code>
          {s.dict3}
        </p>
        <Table columns={keyColumns} data={keyRows as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      {editingKey !== null && (
        <Modal
          isOpen={true}
          onClose={() => setEditingKey(null)}
          title={s.modalTitle(editingKey)}
          size="medium"
        >
          <div className="space-y-3">
            <div className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              <div>
                <strong>{s.colFrReference}</strong> : {dicts.fr[editingKey]}
              </div>
              <div>
                <strong>{s.colEn}</strong> : {dicts.en[editingKey]}
              </div>
            </div>
            <Input
              label={s.inputLabel}
              value={editValue}
              onChange={setEditValue}
              placeholder={ES_SUGGESTIONS[editingKey] ?? s.inputPlaceholder}
            />
            <p className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
              {s.editorHint}
            </p>
            {editError && (
              <p className="text-sm" style={{ color: "var(--bpm-error, #dc2626)" }}>
                {editError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingKey(null)}>
                {s.btnCancel}
              </Button>
              <Button onClick={saveTranslation}>{s.btnAddTranslation}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
