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

type WebhookStatus = "active" | "error" | "paused";

interface Webhook {
  id: string;
  evenement: string;
  url: string;
  statut: WebhookStatus;
  dernierEnvoi: string;
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

const EVENT_OPTIONS = [
  { value: "commande.creee", label: "commande.creee — nouvelle commande" },
  { value: "commande.expediee", label: "commande.expediee — commande expédiée" },
  { value: "stock.seuil_atteint", label: "stock.seuil_atteint — seuil de stock" },
  { value: "facture.payee", label: "facture.payee — facture encaissée" },
  { value: "client.cree", label: "client.cree — nouveau client" },
];

const STATUS_VARIANT: Record<WebhookStatus, "success" | "error" | "default"> = {
  active: "success",
  error: "error",
  paused: "default",
};

const STATUS_LABEL: Record<WebhookStatus, string> = {
  active: "Actif",
  error: "Erreur",
  paused: "En pause",
};

/**
 * Seeds 100 % déterministes : libellés relatifs figés et horodatages ISO
 * littéraux (aucun Date.now()/Math.random() au render — rendu identique
 * serveur/client).
 */
const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: "wh-1",
    evenement: "commande.creee",
    url: "https://hooks.slack.com/services/T024/B11/xxx",
    statut: "active",
    dernierEnvoi: "il y a 4 min · HTTP 200",
    tauxSucces: 99,
    secret: "whsec_8fK2mQ9pL4xT7vB1",
    livraisons24h: 142,
  },
  {
    id: "wh-2",
    evenement: "stock.seuil_atteint",
    url: "https://erp.acme.fr/webhooks/stock",
    statut: "active",
    dernierEnvoi: "il y a 1 h · HTTP 200",
    tauxSucces: 97,
    secret: "whsec_4nD7rW2sJ9kP5mC3",
    livraisons24h: 36,
  },
  {
    id: "wh-3",
    evenement: "facture.payee",
    url: "https://compta.acme.fr/api/events",
    statut: "error",
    dernierEnvoi: "il y a 23 min · HTTP 500",
    tauxSucces: 62,
    secret: "whsec_6tG3yH8uK1lM4qZ9",
    livraisons24h: 18,
  },
  {
    id: "wh-4",
    evenement: "client.cree",
    url: "https://crm.acme.fr/hooks",
    statut: "paused",
    dernierEnvoi: "hier 17:42 · HTTP 200",
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

export default function WebhooksSimulateur() {
  const { showToast } = useToast();
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
  const [deliveries, setDeliveries] = useState<Delivery[]>(INITIAL_DELIVERIES);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Webhook | null>(null);

  const [evenement, setEvenement] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const nextId = useRef(5);

  const stats = useMemo(() => {
    const actifs = webhooks.filter((w) => w.statut === "active").length;
    const livraisons = webhooks.reduce((sum, w) => sum + w.livraisons24h, 0);
    const taux =
      webhooks.length > 0
        ? webhooks.reduce((sum, w) => sum + w.tauxSucces, 0) / webhooks.length
        : 0;
    return { actifs, livraisons, taux: taux.toFixed(1).replace(".", ",") };
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
            ? { ...w, dernierEnvoi: `à l'instant · HTTP ${code}`, livraisons24h: w.livraisons24h + 1 }
            : w
        )
      );
      setTestingId(null);
      if (fails) {
        showToast(
          `${wh.url} a répondu HTTP 500 en ${duree} ms. La livraison sera retentée automatiquement.`,
          "error",
          6000,
          "Échec de la livraison",
          "Webhooks",
          null
        );
      } else {
        showToast(
          `${wh.url} a répondu HTTP 200 en ${duree} ms.`,
          "success",
          5000,
          "Livraison réussie",
          "Webhooks",
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
      actif
        ? `Le webhook « ${wh.evenement} » est de nouveau actif : les prochains événements seront livrés.`
        : `Le webhook « ${wh.evenement} » est suspendu : aucun événement ne sera envoyé.`,
      actif ? "success" : "warning",
      4000,
      actif ? "Webhook activé" : "Webhook suspendu",
      "Webhooks",
      null
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setWebhooks((prev) => prev.filter((w) => w.id !== toDelete.id));
    showToast(
      `« ${toDelete.evenement} → ${toDelete.url} » a été supprimé. Le secret associé est révoqué.`,
      "info",
      4000,
      "Webhook supprimé",
      "Webhooks",
      null
    );
    setToDelete(null);
  };

  const handleCreate = () => {
    if (!evenement) {
      setFormError("Choisissez un événement déclencheur.");
      return;
    }
    const cible = url.trim();
    if (!cible.startsWith("https://")) {
      setFormError("L'URL doit commencer par https:// (TLS obligatoire pour la signature).");
      return;
    }
    if (cible.length < 12 || !cible.slice(8).includes(".")) {
      setFormError("Indiquez une URL complète, par exemple https://votre-app.fr/webhooks.");
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
        dernierEnvoi: "à l'instant · ping HTTP 200",
        tauxSucces: 100,
        secret,
        livraisons24h: 1,
      },
      ...prev,
    ]);
    pushDelivery(evenement, cible, 200, duree);
    showToast(
      `« ${evenement} » sera livré sur ${cible}. Secret de signature : ${maskSecret(secret)}.`,
      "success",
      6000,
      "Webhook créé",
      "Webhooks",
      null
    );
    setEvenement(null);
    setUrl("");
  };

  const webhookColumns = [
    {
      key: "evenement",
      label: "Webhook",
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
      label: "Statut",
      render: (value: unknown) => {
        const s = value as WebhookStatus;
        return <Badge variant={STATUS_VARIANT[s]}>{STATUS_LABEL[s]}</Badge>;
      },
    },
    { key: "dernierEnvoi", label: "Dernier envoi" },
    {
      key: "tauxSucces",
      label: "Succès",
      align: "right" as const,
      render: (value: unknown) => <span>{String(value)} %</span>,
    },
    {
      key: "secret",
      label: "Secret",
      render: (value: unknown) => (
        <code className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
          {maskSecret(String(value))}
        </code>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const wh = row as unknown as Webhook;
        const sending = testingId === wh.id;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" disabled={testingId !== null} onClick={() => testWebhook(wh)}>
              {sending ? "Envoi…" : "Tester"}
            </Button>
            <Button size="small" variant="secondary" onClick={() => toggleStatus(wh)}>
              {wh.statut === "active" ? "Suspendre" : "Activer"}
            </Button>
            <Button size="small" variant="destructive" onClick={() => setToDelete(wh)}>
              Supprimer
            </Button>
          </div>
        );
      },
    },
  ];

  const deliveryColumns = [
    {
      key: "evenement",
      label: "Événement",
      render: (value: unknown) => <code>{String(value)}</code>,
    },
    { key: "url", label: "URL cible" },
    {
      key: "code",
      label: "Code HTTP",
      render: (value: unknown) => (
        <Badge variant={Number(value) < 400 ? "success" : "error"}>{String(value)}</Badge>
      ),
    },
    {
      key: "duree",
      label: "Durée",
      align: "right" as const,
      render: (value: unknown) => <span>{String(value)} ms</span>,
    },
    {
      key: "horodatage",
      label: "Horodatage",
      render: (value: unknown) => (
        <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
          {String(value).slice(0, 19).replace("T", " ")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Webhooks actifs" value={String(stats.actifs)} />
        <Metric label="Livraisons 24 h" value={String(stats.livraisons)} />
        <Metric label="Taux de succès global" value={`${stats.taux} %`} />
      </MetricRow>

      <Panel variant="info" title="Webhooks configurés">
        <Table columns={webhookColumns} data={webhooks as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      <Panel variant="info" title="Ajouter un webhook">
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox
            label="Événement déclencheur"
            options={EVENT_OPTIONS}
            value={evenement}
            onChange={setEvenement}
            placeholder="Choisir un événement"
          />
          <Input
            label="URL de destination (https obligatoire)"
            placeholder="https://votre-app.fr/webhooks"
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
          Créer le webhook
        </Button>
      </Panel>

      <Panel variant="info" title="Journal des livraisons">
        <Table columns={deliveryColumns} data={deliveries as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Supprimer le webhook"
        message={
          toDelete
            ? `« ${toDelete.evenement} » ne sera plus livré sur ${toDelete.url} et le secret de signature sera révoqué. Cette action est immédiate.`
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
