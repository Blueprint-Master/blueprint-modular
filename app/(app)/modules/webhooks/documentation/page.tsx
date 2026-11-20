"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function WebhooksDocumentationPage() {
  const { locale } = useI18n();
  const S = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/webhooks">{S.moduleTitle}</Link> → {S.docBreadcrumb}
        </nav>
        <h1>{S.docTitle}</h1>
        <p className="doc-description">{S.docDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.dataModelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {S.dataModelBody}
      </p>
      <CodeBlock
        code={`{
  "evenement": "commande.creee",   // commande.creee | commande.expediee | stock.seuil_atteint | facture.payee | client.cree
  "url": "https://hooks.slack.com/services/T024/B11/xxx",
  "statut": "active",              // active | error | paused
  "secret": "whsec_8fK2mQ9pL4xT7vB1",
  "tauxSucces": 99,
  "dernierEnvoi": "2026-06-12T09:41:23Z"
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.hmacTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {S.hmacP1}
        <code>whsec_…</code>
        {S.hmacP2}
        <code>X-Webhook-Signature</code>
        {S.hmacP3}
        <code>timestamp.corps_json</code>
        {S.hmacP4}
      </p>
      <CodeBlock
        code={`from bpm.webhooks import verify
import time

valid = verify(active_secrets, headers["X-Webhook-Timestamp"], raw_body,
               headers["X-Webhook-Signature"], int(time.time()))
# For a valid message, commit its unique event ID with the business update.`}
        language="python"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.retriesTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {S.retryItems.map((item) => (
          <li key={item.label}>
            <strong>{item.label}</strong>
            {item.text}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.productionTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {locale === "fr"
          ? "Installez le paquet Python depuis cette version du dépôt (pip install .). Le worker utilise une base SQLite sur un disque persistant. Configurez BPM_HOOK_ERP_URL et BPM_HOOK_ERP_SECRET pour l’intégration ERP. Le destinataire doit accepter le JSON du module et un secret partagé d’au moins 32 octets."
          : "Install the Python package from this repository version (pip install .). The worker uses SQLite on a persistent disk. Set BPM_HOOK_ERP_URL and BPM_HOOK_ERP_SECRET for the ERP integration. The recipient must accept this module’s JSON format and a shared secret of at least 32 bytes."}
      </p>
      <CodeBlock language="bash" code={`python -m bpm.webhooks --db /var/lib/modular/events.sqlite subscribe ERP commande.creee
python -m bpm.webhooks --db /var/lib/modular/events.sqlite publish commande-42 commande.creee < commande.json
python -m bpm.webhooks --db /var/lib/modular/events.sqlite tick
python -m bpm.webhooks --db /var/lib/modular/events.sqlite history`} />
      <p className="mt-3 text-sm">
        {locale === "fr"
          ? "Exécutez tick chaque minute. La commande alerts affiche les incidents persistants. Utilisez pause, resume ou delete avec le nom de l’intégration. Une nouvelle tentative transmet le même identifiant d’événement. Le destinataire enregistre cet identifiant avec l’opération métier pour éviter les doublons, y compris si la réponse se perd après traitement. Pendant une rotation, activez les deux clés côté réception avant de remplacer le secret de l’émetteur."
          : "Run tick every minute. The alerts command lists persistent delivery incidents. Use pause, resume or delete with the integration name. Retries carry the same event ID. Commit that ID with the receiving business operation to prevent duplicates, including when an acknowledgement is lost. For key rotation, accept both keys at the receiver before replacing the sender’s secret."}
      </p>

      <p className="mt-3 text-sm">{locale === "fr"
        ? "Dans le serveur Next, pointez BPM_WEBHOOKS_DB vers la même base. Les administrateurs consultent les tentatives HTTP et suspendent ou reprennent les abonnements dans l’onglet Opérations."
        : "Set BPM_WEBHOOKS_DB on the Next server to the same database. Administrators can inspect HTTP attempts and pause or resume subscriptions in the Operations tab."}</p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/webhooks/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {S.openSimulator}
        </Link>
      </p>
    </div>
  );
}
