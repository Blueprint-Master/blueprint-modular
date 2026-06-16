"use client";

/**
 * Rendu live des composants bpm.* suggérés par suggest_composition.
 *
 * Chaque entrée mappe un slug de composant (clé normalisée, minuscule, sans préfixe bpm.)
 * vers un aperçu réel du composant du barrel @blueprint-modular/core, alimenté par des
 * données thématiques « suivi de commandes ». Données figées (pas de Date.now / Math.random)
 * pour un rendu stable côté serveur et client.
 *
 * Les composants sans aperçu ici (palette de commandes, formulaire assistant…) sont rendus
 * par la page sous forme de fiche catalogue vérifiée — jamais d'écran cassé.
 */
import type { ReactNode } from "react";
import {
  ActivityFeed,
  AnomalyAlert,
  ApprovalFlow,
  Avatar,
  Badge,
  Button,
  Caption,
  Card,
  Chip,
  CodeBlock,
  EmptyState,
  Input,
  LineChart,
  LiveGauge,
  Message,
  Metric,
  Pagination,
  Panel,
  Progress,
  Selectbox,
  StatusTracker,
  Stepper,
  Table,
  Tabs,
  Timeline,
} from "@/components/bpm";

const noop = () => {};

/** Aperçus live indexés par slug normalisé. */
export const PREVIEWS: Record<string, () => ReactNode> = {
  statustracker: () => (
    <StatusTracker
      compact
      direction="horizontal"
      stages={[
        { label: "Créée", status: "completed" },
        { label: "Préparation", status: "completed" },
        { label: "Expédiée", status: "current" },
        { label: "Livrée", status: "pending" },
      ]}
    />
  ),

  stepper: () => (
    <Stepper
      size="sm"
      currentStep={2}
      steps={[
        { label: "Panier" },
        { label: "Livraison" },
        { label: "Paiement" },
        { label: "Confirmation" },
      ]}
    />
  ),

  metric: () => (
    <Metric label="Commandes du jour" value={128} delta="+12%" deltaType="normal" />
  ),

  badge: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge variant="success">Livrée</Badge>
      <Badge variant="primary">Préparation</Badge>
      <Badge variant="warning">En attente</Badge>
      <Badge variant="error">Retard</Badge>
    </div>
  ),

  timeline: () => (
    <Timeline
      events={[
        { date: "2026-06-15T09:12:00.000Z", title: "Commande créée", actor: "Client", color: "info" },
        { date: "2026-06-15T11:40:00.000Z", title: "Préparée en entrepôt", actor: "Logistique", color: "default" },
        { date: "2026-06-15T16:05:00.000Z", title: "Expédiée", actor: "Transporteur", color: "success" },
      ]}
    />
  ),

  progress: () => (
    <Progress value={74} max={100} label="Objectif mensuel d'expéditions" showValue />
  ),

  table: () => (
    <Table
      striped
      hover
      columns={[
        { key: "ref", label: "Commande" },
        { key: "client", label: "Client" },
        { key: "montant", label: "Montant", align: "right" },
        { key: "statut", label: "Statut" },
      ]}
      data={[
        { ref: "CMD-1042", client: "Atelier Nord", montant: "1 280 €", statut: "Expédiée" },
        { ref: "CMD-1043", client: "Studio Lyon", montant: "640 €", statut: "Préparation" },
        { ref: "CMD-1044", client: "Garage Ouest", montant: "2 110 €", statut: "Livrée" },
      ]}
    />
  ),

  card: () => (
    <Card title="Commande CMD-1042" subtitle="Atelier Nord — 1 280 €">
      Expédiée le 15 juin, livraison estimée le 17 juin.
    </Card>
  ),

  panel: () => (
    <Panel title="Suivi logistique">
      <Metric label="En transit" value={37} delta="+4" deltaType="normal" />
    </Panel>
  ),

  button: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button>Suivre la commande</Button>
      <Button variant="secondary">Exporter</Button>
    </div>
  ),

  input: () => (
    <Input label="Rechercher une commande" value="" onChange={noop} placeholder="N° ou client…" type="search" />
  ),

  selectbox: () => (
    <Selectbox
      label="Statut"
      options={["Toutes", "Préparation", "Expédiée", "Livrée"]}
      value="Toutes"
      onChange={noop}
    />
  ),

  avatar: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Avatar initials="ML" size="medium" />
      <span style={{ color: "var(--bpm-text)" }}>Marie Lemoine — Logistique</span>
    </div>
  ),

  tabs: () => (
    <Tabs
      defaultTab={0}
      tabs={[
        { label: "Aperçu", content: <Metric label="Commandes" value={128} delta="+12%" deltaType="normal" /> },
        { label: "Articles", content: <Caption>3 références, 12 unités</Caption> },
      ]}
    />
  ),

  activityfeed: () => (
    <ActivityFeed
      compact
      activities={[
        {
          id: "1",
          actor: "Logistique",
          action: "a expédié",
          target: "la commande CMD-1042",
          timestamp: "2026-06-15T16:05:00.000Z",
          color: "success",
        },
        {
          id: "2",
          actor: "Client",
          action: "a créé",
          target: "la commande CMD-1045",
          timestamp: "2026-06-15T17:20:00.000Z",
          color: "info",
        },
      ]}
    />
  ),

  anomalyalert: () => (
    <AnomalyAlert
      title="Délai de préparation"
      expected="< 2 h"
      actual="5 h 20"
      severity="warning"
    />
  ),

  linechart: () => (
    <LineChart
      height={120}
      data={[
        { x: 0, y: 92 },
        { x: 1, y: 104 },
        { x: 2, y: 98 },
        { x: 3, y: 121 },
        { x: 4, y: 128 },
      ]}
    />
  ),

  livegauge: () => (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <LiveGauge value={76} min={0} max={100} warningAbove={70} criticalAbove={90} label="Taux de service" size="sm" />
    </div>
  ),

  approvalflow: () => (
    <ApprovalFlow
      direction="vertical"
      steps={[
        { id: "1", approver: "Marie", role: "Préparation", status: "approved" },
        { id: "2", approver: "Jean", role: "Expédition", status: "pending" },
      ]}
    />
  ),

  message: () => (
    <Message type="success">Commande CMD-1044 livrée et confirmée par le client.</Message>
  ),

  caption: () => <Caption>Mis à jour il y a 2 minutes · source : suivi temps réel</Caption>,

  chip: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Chip label="Prioritaire" variant="primary" />
      <Chip label="Express" variant="outline" />
      <Chip label="International" />
    </div>
  ),

  pagination: () => (
    <Pagination page={2} totalPages={8} onPageChange={noop} pageSize={20} totalItems={156} />
  ),

  emptystate: () => (
    <EmptyState
      title="Aucune commande en retard"
      description="Toutes les commandes sont dans les délais."
      action={<Button>Voir le tableau</Button>}
    />
  ),

  codeblock: () => (
    <CodeBlock
      language="python"
      code={`bpm.status_tracker(stages=[\n  ("Créée", "completed"),\n  ("Expédiée", "current"),\n  ("Livrée", "pending"),\n])`}
    />
  ),
};

/** Indique si un composant (par slug) dispose d'un aperçu live. */
export function hasPreview(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(PREVIEWS, slug);
}
