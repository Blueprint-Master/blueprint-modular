"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type Rich } from "../strings";

// Snippet python : identique dans les deux langues (non traduit).
const PYTHON_CALCULS = `total_ligne_ht = quantite * prix_unitaire * (1 - remise_pct / 100)
total_ht       = somme(total_ligne_ht)
tva            = total_ht * 0.20          # TVA 20 %
total_ttc      = total_ht + tva`;

/** Rend un paragraphe riche (texte / code inline / gras). */
function RichText({ segs }: { segs: Rich }) {
  return (
    <>
      {segs.map((seg, i) =>
        "c" in seg ? (
          <code key={i}>{seg.c}</code>
        ) : "b" in seg ? (
          <strong key={i}>{seg.b}</strong>
        ) : "l" in seg ? (
          <span key={i}>{seg.l}</span>
        ) : (
          <span key={i}>{seg.t}</span>
        )
      )}
    </>
  );
}

export default function DevisFacturationDocumentationPage() {
  const { locale } = useI18n();
  const M = STR[locale].module;
  const D = STR[locale].doc;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/devis-facturation">{M.title}</Link> → {D.breadcrumbDocumentation}
        </nav>
        <h1>{D.title}</h1>
        <p className="doc-description">{D.description}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2">
        {locale === "fr" ? "Utiliser le module dans votre application" : "Use the module in your application"}
      </h2>
      <p className="mb-4 text-sm">
        {locale === "fr"
          ? "Le SDK Python numérote les devis et les factures dans la transaction de l’application. Les montants sont en unités monétaires mineures. Les remises et taux de TVA sont en points de base, avec arrondi commercial par ligne. Une facture conserve les parties, les conditions, les lignes et leur prix. Le règlement est rapproché par référence bancaire. Pour livrer un devis, configurez un adaptateur Webhooks quote.delivery et utilisez request_delivery. quote_details expose séparément l’état de la transmission."
          : "The Python SDK allocates quote and invoice numbers inside the transaction. Use minor units for amounts and basis points for discounts and tax, rounded per line. Invoices retain the parties, terms, lines and prices. Payments are recorded by bank reference. To send a quote, configure a quote.delivery Webhooks adapter and call request_delivery. quote_details exposes the delivery status separately."}
      </p>
      <CodeBlock language="python" code={`from contextlib import closing
from pathlib import Path
from bpm import billing

with closing(billing.open_store("sales.sqlite")) as db:
    lines = [{"label": "Service", "quantity": 2, "unit_minor": 12500, "vat_basis_points": 2000}]
    q = billing.quote(db, {"name": "Seller"}, {"name": "Buyer"}, "EUR", lines,
                      actor="sales", request_id="deal-42", issued="2026-11-19")
    invoice = billing.issue_invoice(db, q, actor="sales", issued="2026-11-20", due="2026-12-20")
    Path("invoice.html").write_text(billing.printable(db, invoice, currency_decimals=2), encoding="utf-8")
    balance = billing.invoice_details(db, invoice)["due_minor"]`} />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.modelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {D.modelBody}
      </p>
      <CodeBlock code={D.modelCode} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.calcTitle}
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        <RichText segs={D.calcBody1} />
      </p>
      <CodeBlock code={PYTHON_CALCULS} language="python" />
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {D.calcBody2}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.cycleTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {D.cycleItems.map((item, i) => (
          <li key={i}>
            <RichText segs={item} />
          </li>
        ))}
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {D.cycleBody}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.numberingTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        <RichText segs={D.numberingBody} />
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.printTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        <RichText segs={D.printBody} />
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/devis-facturation/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {D.openSimulator}
        </Link>
      </p>
    </div>
  );
}
