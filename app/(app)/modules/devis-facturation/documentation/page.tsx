"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function DevisFacturationDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/devis-facturation">Devis / Facturation</Link> → Documentation
        </nav>
        <h1>Documentation — Devis / Facturation</h1>
        <p className="doc-description">
          Modèle de données devis / ligne, règles de calcul (remises, TVA 20 %), cycle de statuts
          et numérotation des documents.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle de données
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Un devis porte l&apos;en-tête commerciale (numéro, client, objet, dates) et son statut ;
        les montants ne sont jamais stockés : ils sont dérivés des lignes. Une ligne décrit une
        prestation avec sa quantité, son prix unitaire HT et une remise en pourcentage optionnelle.
      </p>
      <CodeBlock
        code={`{
  "numero": "DV-2026-104",
  "client": "ACME Industries",
  "objet": "Refonte site vitrine",
  "statut": "brouillon",          // brouillon | envoye | paye
  "dateCreation": "2026-06-09",
  "dateEnvoi": null,               // renseignée au passage en "envoye"
  "datePaiement": null,            // renseignée au passage en "paye"
  "lignes": [
    {
      "designation": "Maquettes UI (5 gabarits desktop + mobile)",
      "quantite": 5,
      "prixUnitaire": 480.0,       // HT, en euros
      "remisePct": 0               // 0–100, optionnelle (0 = aucune)
    }
  ]
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Calculs et TVA
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        La remise s&apos;applique ligne par ligne, avant la TVA. Le taux unique de 20 % correspond
        aux prestations de services standard ; il suffit de paramétrer <code>TVA_RATE</code> pour
        un autre taux (ou un taux par ligne si votre activité mélange les régimes).
      </p>
      <CodeBlock
        code={`total_ligne_ht = quantite * prix_unitaire * (1 - remise_pct / 100)
total_ht       = somme(total_ligne_ht)
tva            = total_ht * 0.20          # TVA 20 %
total_ttc      = total_ht + tva`}
        language="python"
      />
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Les totaux sont recalculés à chaque ajout, édition ou suppression de ligne (mémoïsation
        côté interface) — aucun risque d&apos;écart entre les lignes et le pied de document.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Cycle de statuts
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>Brouillon</strong> — état initial à la création. Lignes librement éditables ;
          l&apos;envoi est bloqué tant que le devis est vide.
        </li>
        <li>
          <strong>Envoyé</strong> — action « Envoyer au client » : <code>dateEnvoi</code> est
          renseignée et le montant TTC entre dans l&apos;encours « en attente ». Les lignes restent
          modifiables (avenant avant acceptation).
        </li>
        <li>
          <strong>Payé</strong> — action « Marquer payé » : <code>datePaiement</code> est
          renseignée, le montant bascule dans « Encaissé » et le document devient en lecture seule
          (valeur probante : on ne modifie pas un document réglé, on en émet un nouveau).
        </li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Les transitions sont strictement séquentielles (brouillon → envoyé → payé) ; il n&apos;y a
        pas de retour en arrière. Pour annuler un devis envoyé, on le laisse expirer (validité
        30 jours) ou on émet un devis correctif.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Numérotation
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Format <code>DV-AAAA-NNN</code> : préfixe document (<code>DV</code> pour devis,{" "}
        <code>FA</code> pour la facture émise à l&apos;acceptation), année d&apos;émission, puis
        compteur séquentiel sans trou ni réutilisation — exigence comptable. Dans le simulateur, le
        compteur reprend après le dernier numéro seedé (<code>DV-2026-104</code> → le prochain
        devis créé reçoit <code>DV-2026-105</code>). En production, le numéro est attribué par la
        base (séquence) au moment de la création, jamais côté client.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Impression et intégration
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        L&apos;aperçu met en forme l&apos;en-tête société, le client, les lignes et les totaux,
        puis s&apos;appuie sur <code>window.print()</code> (seule la zone du devis est imprimée).
        Pour aller plus loin : persister devis et lignes en base, déclencher l&apos;envoi
        d&apos;e-mail au passage en « envoyé », et générer le PDF côté serveur si vous devez
        archiver les documents émis.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/devis-facturation/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
