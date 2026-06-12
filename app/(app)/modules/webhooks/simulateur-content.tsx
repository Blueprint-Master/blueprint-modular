"use client";

import { useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  ConfirmModal,
  Input,
  Metric,
  MetricRow,
  Panel,
  Selectbox,
  Table,
  useToast,
} from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type ModuleStrings } from "./strings";

type WebhookStatus = "active" | "error" | "paused";

/**
 * Dernier envoi stocké sous forme structurée (et non en texte) pour être
 * rendu dans la locale courante. Les codes HTTP restent dans `info`.
 */
type LastSent =
  | { kind: "minutes"; value: number; info: string }
  | { kind: "hours"; value: number; info: string }
  | { kind: "yesterday"; time: string; info: string }
  | { kind: "now"; info: string };

interface Webhook {
  id: string;
  evenement: string;
  url: string;
  statut: WebhookStatus;
  dernierEnvoi: LastSent;
  tauxSucces: number;
  secret: string;
  livraisons24h: number;
}

interface Delivery {
  id: string;
  evenement: string;
  url: string;
  code: number;
  duree: number;
  horodatage: string;
}

const EVENT_CODES = [
  "commande.creee",
  "commande.expediee",
  "stock.seuil_atteint",
  "facture.payee",
  "client.cree",
] as const;

const STATUS_VARIANT: Record<WebhookStatus, "success" | "error" | "default"> = {
  active: "success",
  error: "error",
  paused: "default",
};

/**
 * Seeds 100 % déterministes : libellés relatifs figés et horodatages ISO
 * littéraux (aucun Date.now()/Math.random() au render — rendu identique
 * serveur/client). URLs, secrets et codes HTTP inchangés.
 */
const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: "wh-1",
    evenement: "commande.creee",
    url: "https://hooks.slack.com/services/T024/B11/xxx",
    statut: "active",
    dernierEnvoi: { kind: "minutes", value: 4, info: "HTTP 200" },
    tauxSucces: 99,
    secret: "whsec_8fK2mQ9pL4xT7vB1",
    livraisons24h: 142,
  },
  {
    id: "wh-2",
    evenement: "stock.seuil_atteint",
    url: "https://erp.acme.fr/webhooks/stock",
    statut: "active",
    dernierEnvoi: { kind: "hours", value: 1, info: "HTTP 200" },
    tauxSucces: 97,
    secret: "whsec_4nD7rW2sJ9kP5mC3",
    livraisons24h: 36,
  },
  {
    id: "wh-3",
    evenement: "facture.payee",
    url: "https://compta.acme.fr/api/events",
    statut: "error",
    dernierEnvoi: { kind: "minutes", value: 23, info: "HTTP 500" },
    tauxSucces: 62,
    secret: "whsec_6tG3yH8uK1lM4qZ9",
    livraisons24h: 18,
  },
  {
    id: "wh-4",
    evenement: "client.cree",
    url: "https://crm.acme.fr/hooks",
    statut: "paused",
    dernierEnvoi: { kind: "yesterday", time: "17:42", info: "HTTP 200" },
    tauxSucces: 100,
    secret: "whsec_2bV5cX1zN6aS8dF4",
    livraisons24h: 0,
  },
];

const INITIAL_DELIVERIES: Delivery[] = [
  { id: "liv-1", evenement: "commande.creee", url: "https://hooks.slack.com/services/T024/B11/xxx", code: 200, duree: 184, horodatage: "2026-06-12T09:41:23" },
  { id: "liv-2", evenement: "stock.seuil_atteint", url: "https://erp.acme.fr/webhooks/stock", code: 200, duree: 312, horodatage: "2026-06-12T09:12:05" },
  { id: "liv-3", evenement: "facture.payee", url: "https://compta.acme.fr/api/events", code: 500, duree: 1043, horodatage: "2026-06-12T08:54:47" },
  { id: "liv-4", evenement: "commande.creee", url: "https://hooks.slack.com/services/T024/B11/xxx", code: 200, duree: 167, horodatage: "2026-06-12T08:30:12" },
  { id: "liv-5", evenement: "facture.payee", url: "https://compta.acme.fr/api/events", code: 500, duree: 998, horodatage: "2026-06-12T07:58:31" },
];

/** Durée plausible dérivée de l'URL (déterministe, pas de Math.random). */
function plausibleDuration(url: string, penalite: boolean): number {
  const base = 90 + ((url.length * 37) % 420);
  return penalite ? base + 740 : base;
}

/** Secret déterministe dérivé d'un compteur. */
function makeSecret(n: number): string {
  const pool = "K4mQ9pL7xT2vB8fJ3nD6rW1sC5yH0uZ";
  let s = "";
  for (let i = 0; i < 16; i += 1) {
    s += pool[(n * 7 + i * 11) % pool.length];
  }
  return `whsec_${s}`;
}

function maskSecret(secret: string): string {
  return `${secret.slice(0, 6)}••••${secret.slice(-4)}`;
}

/** Rend le « dernier envoi » dans la locale courante. */
function formatLastSent(last: LastSent, S: ModuleStrings): string {
  let rel: string;
  switch (last.kind) {
    case "minutes":
      rel = S.lastSentMinutes(last.value);
      break;
    case "hours":
      rel = S.lastSentHours(last.value);
      break;
    case "yesterday":
      rel = S.lastSentYesterday(last.time);
      break;
    default:
      rel = S.lastSentNow;
  }
  return `${rel} · ${last.info}`;
}

export default function WebhooksSimulateur() {
  const { showToast } = useToast();
  const { locale } = useI18n();
  const S = STR[locale];
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
  const [deliveries, setDeliveries] = useState<Delivery[]>(INITIAL_DELIVERIES);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Webhook | null>(null);

  const [evenement, setEvenement] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const nextId = useRef(5);

  const eventOptions = useMemo(
    () =>
      EVENT_CODES.map((code) => ({
        value: code,
        label: `${code} — ${S.eventDescriptions[code]}`,
      })),
    [S]
  );

  const stats = useMemo(() => {
    const actifs = webhooks.filter((w) => w.statut === "active").length;
    const livraisons = webhooks.reduce((sum, w) => sum + w.livraisons24h, 0);
    const taux =
      webhooks.length > 0
        ? webhooks.reduce((sum, w) => sum + w.tauxSucces, 0) / webhooks.length
        : 0;
    return { actifs, livraisons, taux };
  }, [webhooks]);

  const pushDelivery = (evt: string, cible: string, code: number, duree: number) => {
    const id = `liv-${nextId.current}`;
    nextId.current += 1;
    setDeliveries((prev) => [
      { id, evenement: evt, url: cible, code, duree, horodatage: new Date().toISOString() },
      ...prev,
    ]);
  };

  const testWebhook = (wh: Webhook) => {
    if (testingId) return;
    setTestingId(wh.id);
    const fails = wh.statut === "error";
    const code = fails ? 500 : 200;
    const duree = plausibleDuration(wh.url, fails);
    setTimeout(() => {
      pushDelivery(wh.evenement, wh.url, code, duree);
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === wh.id
            ? {
                ...w,
                dernierEnvoi: { kind: "now", info: `HTTP ${code}` },
                livraisons24h: w.livraisons24h + 1,
              }
            : w
        )
      );
      setTestingId(null);
      if (fails) {
        showToast(
          S.toastFailMsg(wh.url, duree),
          "error",
          6000,
          S.toastFailTitle,
          S.toastSource,
          null
        );
      } else {
        showToast(
          S.toastOkMsg(wh.url, duree),
          "success",
          5000,
          S.toastOkTitle,
          S.toastSource,
          null
        );
      }
    }, 600);
  };

  const toggleStatus = (wh: Webhook) => {
    const actif = wh.statut !== "active";
    setWebhooks((prev) =>
      prev.map((w) => (w.id === wh.id ? { ...w, statut: actif ? "active" : "paused" } : w))
    );
    showToast(
      actif ? S.toastResumedMsg(wh.evenement) : S.toastSuspendedMsg(wh.evenement),
      actif ? "success" : "warning",
      4000,
      actif ? S.toastResumedTitle : S.toastSuspendedTitle,
      S.toastSource,
      null
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setWebhooks((prev) => prev.filter((w) => w.id !== toDelete.id));
    showToast(
      S.toastDeletedMsg(toDelete.evenement, toDelete.url),
      "info",
      4000,
      S.toastDeletedTitle,
      S.toastSource,
      null
    );
    setToDelete(null);
  };

  const handleCreate = () => {
    if (!evenement) {
      setFormError(S.errorChooseEvent);
      return;
    }
    const cible = url.trim();
    if (!cible.startsWith("https://")) {
      setFormError(S.errorUrlHttps);
      return;
    }
    if (cible.length < 12 || !cible.slice(8).includes(".")) {
      setFormError(S.errorUrlComplete);
      return;
    }
    setFormError(null);
    const n = nextId.current;
    nextId.current += 1;
    const secret = makeSecret(n);
    const duree = plausibleDuration(cible, false);
    setWebhooks((prev) => [
      {
        id: `wh-${n}`,
        evenement,
        url: cible,
        statut: "active",
        dernierEnvoi: { kind: "now", info: "ping HTTP 200" },
        tauxSucces: 100,
        secret,
        livraisons24h: 1,
      },
      ...prev,
    ]);
    pushDelivery(evenement, cible, 200, duree);
    showToast(
      S.toastCreatedMsg(evenement, cible, maskSecret(secret)),
      "success",
      6000,
      S.toastCreatedTitle,
      S.toastSource,
      null
    );
    setEvenement(null);
    setUrl("");
  };

  const webhookColumns = [
    {
      key: "evenement",
      label: S.colWebhook,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>
            <code>{String(value)}</code>
          </div>
          <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            {String(row.url)}
          </div>
        </div>
      ),
    },
    {
      key: "statut",
      label: S.colStatus,
      render: (value: unknown) => {
        const s = value as WebhookStatus;
        return <Badge variant={STATUS_VARIANT[s]}>{S.statusLabels[s]}</Badge>;
      },
    },
    {
      key: "dernierEnvoi",
      label: S.colLastSent,
      render: (value: unknown) => <span>{formatLastSent(value as LastSent, S)}</span>,
    },
    {
      key: "tauxSucces",
      label: S.colSuccess,
      align: "right" as const,
      render: (value: unknown) => <span>{S.fmtPercent(Number(value))}</span>,
    },
    {
      key: "secret",
      label: S.colSecret,
      render: (value: unknown) => (
        <code className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
          {maskSecret(String(value))}
        </code>
      ),
    },
    {
      key: "id",
      label: S.colActions,
      render: (_: unknown, row: Record<string, unknown>) => {
        const wh = row as unknown as Webhook;
        const sending = testingId === wh.id;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" disabled={testingId !== null} onClick={() => testWebhook(wh)}>
              {sending ? S.btnSending : S.btnTest}
            </Button>
            <Button size="small" variant="secondary" onClick={() => toggleStatus(wh)}>
              {wh.statut === "active" ? S.btnSuspend : S.btnResume}
            </Button>
            <Button size="small" variant="destructive" onClick={() => setToDelete(wh)}>
              {S.btnDelete}
            </Button>
          </div>
        );
      },
    },
  ];

  const deliveryColumns = [
    {
      key: "evenement",
      label: S.colEvent,
      render: (value: unknown) => <code>{String(value)}</code>,
    },
    { key: "url", label: S.colTargetUrl },
    {
      key: "code",
      label: S.colHttpCode,
      render: (value: unknown) => (
        <Badge variant={Number(value) < 400 ? "success" : "error"}>{String(value)}</Badge>
      ),
    },
    {
      key: "duree",
      label: S.colDuration,
      align: "right" as const,
      render: (value: unknown) => <span>{S.fmtDuration(Number(value))}</span>,
    },
    {
      key: "horodatage",
      label: S.colTimestamp,
      render: (value: unknown) => (
        <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
          {S.fmtTimestamp(String(value))}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={S.metricActive} value={String(stats.actifs)} />
        <Metric label={S.metricDeliveries} value={String(stats.livraisons)} />
        <Metric label={S.metricSuccessRate} value={S.fmtRate(stats.taux)} />
      </MetricRow>

      <Panel variant="info" title={S.panelConfigured}>
        <Table columns={webhookColumns} data={webhooks as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      <Panel variant="info" title={S.panelAdd}>
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox
            label={S.selectLabel}
            options={eventOptions}
            value={evenement}
            onChange={setEvenement}
            placeholder={S.selectPlaceholder}
          />
          <Input
            label={S.inputLabel}
            placeholder={S.inputPlaceholder}
            value={url}
            onChange={setUrl}
          />
        </div>
        {formError && (
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
            {formError}
          </p>
        )}
        <Button className="mt-4" onClick={handleCreate}>
          {S.createButton}
        </Button>
      </Panel>

      <Panel variant="info" title={S.panelLog}>
        <Table columns={deliveryColumns} data={deliveries as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      <ConfirmModal
        isOpen={toDelete !== null}
        title={S.confirmDeleteTitle}
        message={toDelete ? S.confirmDeleteMsg(toDelete.evenement, toDelete.url) : ""}
        confirmLabel={S.btnDelete}
        cancelLabel={S.cancelLabel}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
