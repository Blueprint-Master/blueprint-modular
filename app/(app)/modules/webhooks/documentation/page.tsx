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
        code={`import hashlib
import hmac

def verifier_signature(secret: str, timestamp: str, corps: bytes, signature: str) -> bool:
    message = f"{timestamp}.".encode() + corps
    attendu = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(attendu, signature)`}
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
        {S.prodP1}
        <code>webhooks</code>
        {S.prodP2}
        <code>webhook_deliveries</code>
        {S.prodP3}
      </p>

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
