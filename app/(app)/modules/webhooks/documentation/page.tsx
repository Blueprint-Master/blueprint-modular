"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function WebhooksDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/webhooks">Webhooks</Link> → Documentation
        </nav>
        <h1>Documentation — Webhooks</h1>
        <p className="doc-description">
          Émission d&apos;événements métier vers des URLs externes : modèle de données, signature
          HMAC, politique de retries et points d&apos;intégration.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle de données
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Un webhook associe un événement déclencheur à une URL de destination (HTTPS obligatoire) et
        à un secret de signature. Le statut permet de suspendre sans supprimer ; le taux de succès
        et le dernier envoi sont recalculés à chaque livraison.
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
        Signature HMAC
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Chaque livraison est signée avec le secret du webhook (<code>whsec_…</code>) : l&apos;en-tête{" "}
        <code>X-Webhook-Signature</code> contient le HMAC-SHA256 de{" "}
        <code>timestamp.corps_json</code>. Le destinataire recalcule la signature et rejette toute
        requête dont l&apos;horodatage a plus de 5 minutes (protection anti-rejeu).
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
        Politique de retries
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Succès</strong> — toute réponse 2xx en moins de 10 secondes ; la livraison est journalisée (code, durée).</li>
        <li><strong>Échec</strong> — réponse 4xx/5xx ou timeout : nouvelle tentative avec backoff exponentiel (1 min, 5 min, 30 min, 2 h, 12 h).</li>
        <li><strong>Statut « Erreur »</strong> — après 5 échecs consécutifs, le webhook passe en erreur et une alerte est émise ; les tentatives continuent.</li>
        <li><strong>Suspension automatique</strong> — après 72 h d&apos;échecs ininterrompus, le webhook est mis en pause pour protéger le destinataire.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration en production
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur fonctionne en local (état React seedé). Pour brancher un vrai backend :
        persister les webhooks (table <code>webhooks</code>) et les livraisons (table{" "}
        <code>webhook_deliveries</code>, l&apos;équivalent du « Journal des livraisons »), publier
        les événements métier sur un bus interne, puis déléguer l&apos;envoi HTTP à un worker qui
        signe chaque requête, applique les retries et met à jour le taux de succès. La rotation du
        secret se fait sans coupure : deux secrets actifs pendant la fenêtre de migration.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/webhooks/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
