"use client";

import React, { useState, useMemo } from "react";
import {
  Title,
  Caption,
  Metric,
  Button,
  Panel,
  Message,
  Table,
  Tabs,
  Input,
  Selectbox,
  Progress,
  Badge,
  Card,
  Divider,
  LineChart,
  BarChart,
  Grid,
  Chip,
  Stepper,
  Expander,
  StatusBox,
  Tooltip,
  EmptyState,
} from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { getDemoStrings, statusLabel } from "./strings";

// ——— Données cohérentes pour toute la démo ———

const COMMERCIAUX = [
  { id: "m", nom: "Marie L.", objectif: 120, realise: 98 },
  { id: "t", nom: "Thomas B.", objectif: 100, realise: 112 },
  { id: "s", nom: "Sophie M.", objectif: 80, realise: 76 },
];

const CLIENTS = [
  { id: "1", client: "Acme Corp", contact: "Jean Dupont", ca: 42.5, statut: "Actif" },
  { id: "2", client: "TechStart", contact: "Anne Martin", ca: 28.0, statut: "Actif" },
  { id: "3", client: "GlobalSoft", contact: "Pierre Bernard", ca: 15.2, statut: "En attente" },
  { id: "4", client: "DataLab", contact: "Marie Curie", ca: 56.8, statut: "Actif" },
  { id: "5", client: "BuildCo", contact: "Luc Ferry", ca: 0, statut: "Prospect" },
];

const COMMANDES = [
  { id: "c1", ref: "CMD-2024-001", client: "Acme Corp", montant: 12_400, date: "15/01/2024", statut: "Livrée" },
  { id: "c2", ref: "CMD-2024-002", client: "TechStart", montant: 8_200, date: "22/01/2024", statut: "En préparation" },
  { id: "c3", ref: "CMD-2024-003", client: "DataLab", montant: 24_100, date: "28/01/2024", statut: "Validée" },
  { id: "c4", ref: "CMD-2024-004", client: "GlobalSoft", montant: 5_600, date: "02/02/2024", statut: "En attente" },
];

const PRODUITS = [
  { id: "p1", nom: "Offre Starter", prix: "499 €", stock: "Illimité", type: "Abonnement" },
  { id: "p2", nom: "Offre Pro", prix: "1 299 €", stock: "Illimité", type: "Abonnement" },
  { id: "p3", nom: "Formation sur mesure", prix: "2 500 €", stock: "—", type: "Service" },
  { id: "p4", nom: "Support premium", prix: "800 €/an", stock: "—", type: "Service" },
];

const CA_MENSUEL = [
  { x: "Sep", y: 98 },
  { x: "Oct", y: 112 },
  { x: "Nov", y: 105 },
  { x: "Déc", y: 128 },
  { x: "Jan", y: 142 },
  { x: "Fév", y: 118 },
];

const CA_PAR_COMMERCIAL = COMMERCIAUX.map((c) => ({ x: c.nom.split(" ")[0], y: c.realise }));

// ——— Composant page ———

export default function DemoPage() {
  const { locale } = useI18n();
  const S = getDemoStrings(locale);
  const [activeTab, setActiveTab] = useState(0);
  const [searchClient, setSearchClient] = useState("");
  const [filterStatut, setFilterStatut] = useState<string | null>(null);
  const [stepperCommande, setStepperCommande] = useState(1);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const clientsFiltres = useMemo(() => {
    let list = [...CLIENTS];
    if (searchClient.trim()) {
      const q = searchClient.trim().toLowerCase();
      list = list.filter((r) => (r.client + " " + r.contact).toLowerCase().includes(q));
    }
    if (filterStatut) list = list.filter((r) => r.statut === filterStatut);
    return list;
  }, [searchClient, filterStatut]);

  const tabs: { label: string; content: React.ReactNode }[] = [
    {
      label: S.tabDashboard,
      content: (
        <div className="space-y-6">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            <Metric label={S.metricRevenue} value={142} delta={8.2} />
            <Metric label={S.metricOrders} value={24} delta={2} />
            <Metric label={S.metricConversion} value="3,4 %" />
            <Metric label={S.metricQuarterGoal} value="85 %" />
          </div>
          {showSyncSuccess && (
            <Message type="success">
              {S.syncSuccess}{" "}
              <button
                type="button"
                onClick={() => setShowSyncSuccess(false)}
                className="underline ml-1"
                style={{ color: "inherit" }}
              >
                {S.hide}
              </button>
            </Message>
          )}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            <Card title={S.cardRevenueTrend} variant="outlined">
              <LineChart data={CA_MENSUEL} width={320} height={200} />
            </Card>
            <Card title={S.cardRevenuePerRep} variant="outlined">
              <BarChart data={CA_PAR_COMMERCIAL} width={320} height={200} />
            </Card>
          </div>
          <Panel variant="info" title={S.panelQuarterGoal}>
            <Progress value={72} max={100} label={S.progressTeam} showValue />
          </Panel>
          <StatusBox label={S.statusCrmSync} state="complete" defaultExpanded>
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              {S.lastSync}
            </p>
            <Button variant="secondary" className="mt-2" onClick={() => setShowSyncSuccess(true)}>
              {S.forceSync}
            </Button>
          </StatusBox>
        </div>
      ),
    },
    {
      label: S.tabClients,
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              label={S.search}
              placeholder={S.searchPlaceholder}
              value={searchClient}
              onChange={(value) => setSearchClient(value)}
            />
            <Selectbox
              label={S.status}
              options={[
                { value: "", label: S.statusAll },
                { value: "Actif", label: S.statusActive },
                { value: "Prospect", label: S.statusProspect },
                { value: "En attente", label: S.statusPending },
              ]}
              value={filterStatut ?? ""}
              onChange={(v) => setFilterStatut(v === "" ? null : v)}
              placeholder={S.status}
            />
            {(searchClient || filterStatut) && (
              <Chip
                label={S.clearFilters}
                variant="primary"
                onClick={() => {
                  setSearchClient("");
                  setFilterStatut(null);
                }}
              />
            )}
          </div>
          <div className="overflow-x-auto">
            {clientsFiltres.length > 0 ? (
              <Table
                columns={[
                  { key: "client", label: S.colClient },
                  { key: "contact", label: S.colContact },
                  { key: "ca", label: S.colRevenue, align: "right" },
                  {
                    key: "statut",
                    label: S.colStatus,
                    render: (_, row) => (
                      <Badge variant={row.statut === "Actif" ? "primary" : "default"}>
                        {statusLabel(S, String(row.statut))}
                      </Badge>
                    ),
                  },
                ]}
                data={clientsFiltres}
                striped
                hover
              />
            ) : (
              <EmptyState title={S.emptyClientsTitle} description={S.emptyClientsDesc} />
            )}
          </div>
        </div>
      ),
    },
    {
      label: S.tabOrders,
      content: (
        <div className="space-y-6">
          <Caption>{S.latestOrders}</Caption>
          <Table
            columns={[
              { key: "ref", label: S.colRef },
              { key: "client", label: S.colClient },
              { key: "montant", label: S.colAmount, align: "right" },
              { key: "date", label: S.colDate },
              {
                key: "statut",
                label: S.colStatus,
                render: (_, row) => {
                  const s = String(row.statut);
                  const v = s === "Livrée" ? "primary" : "default";
                  return <Badge variant={v}>{statusLabel(S, s)}</Badge>;
                },
              },
            ]}
            data={COMMANDES}
            striped
            hover
          />
          <Divider />
          <Expander title={S.orderTrackingTitle} defaultExpanded>
            <Stepper
              steps={[
                { id: "1", label: S.stepValidation },
                { id: "2", label: S.stepPreparation },
                { id: "3", label: S.stepDelivery },
              ]}
              currentStep={stepperCommande}
              onStepClick={setStepperCommande}
            />
            <div className="mt-4">
              <Progress
                value={stepperCommande === 0 ? 0 : stepperCommande === 1 ? 50 : 100}
                max={100}
                label={S.orderProgress}
                showValue
              />
            </div>
          </Expander>
        </div>
      ),
    },
    {
      label: S.tabProducts,
      content: (
        <div className="space-y-4">
          <Panel variant="info" title={S.catalog}>
            {S.catalogDesc}
          </Panel>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {PRODUITS.map((p) => (
              <Card key={p.id} title={p.nom} variant="outlined">
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="default">{p.type}</Badge>
                  {p.stock !== "—" && (
                    <Tooltip text={S.stockAvailable}>
                      <span>
                        <Chip label={p.stock} />
                      </span>
                    </Tooltip>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
                  {p.prix}
                </p>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: S.tabTeam,
      content: (
        <div className="space-y-6">
          <Caption>{S.teamPerformance}</Caption>
          <BarChart data={CA_PAR_COMMERCIAL} width={400} height={220} />
          <Table
            columns={[
              { key: "nom", label: S.colRep },
              { key: "objectif", label: S.colGoal, align: "right" },
              { key: "realise", label: S.colDone, align: "right" },
              {
                key: "pct",
                label: "%",
                align: "right",
                render: (_, row) => {
                  const o = Number(row.objectif);
                  const r = Number(row.realise);
                  const pct = o ? Math.round((r / o) * 100) : 0;
                  return (
                    <Badge variant={pct >= 100 ? "primary" : "default"}>
                      {pct} %
                    </Badge>
                  );
                },
              },
            ]}
            data={COMMERCIAUX}
            striped
            hover
          />
        </div>
      ),
    },
  ];

  return (
    <div className="doc-page" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Title level={1}>{S.pageTitle}</Title>
      <p className="doc-description" style={{ marginTop: 8, marginBottom: 24 }}>
        {S.pageDescription}
      </p>

      <Divider />

      <Tabs tabs={tabs} defaultTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
