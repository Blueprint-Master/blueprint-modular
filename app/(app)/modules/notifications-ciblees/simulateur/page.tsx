"use client";

import Link from "next/link";
import NotificationsCibleesSimulateur from "../simulateur-content";

export default function NotificationsCibleesSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/notifications-ciblees">Notifications ciblées</Link> → Simulateur
        </div>
        <h1>Simulateur — Notifications ciblées</h1>
        <p className="doc-description">
          Cinq règles déjà configurées (validation, gros devis, ticket critique, échéance contrat,
          rupture de stock). Créez une règle, suspendez, dupliquez, supprimez — puis émettez un
          événement dans le banc d&apos;essai : le moteur évalue les règles, alimente le journal et
          pousse les notifications in-app dans la cloche du header.
        </p>
      </div>
      <NotificationsCibleesSimulateur />
    </div>
  );
}
