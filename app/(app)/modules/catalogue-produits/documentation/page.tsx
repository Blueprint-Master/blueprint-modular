"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

const DATA_MODEL_JSON = {
  fr: `{
  "ref": "P-1001",
  "nom": "Chaise Oslo",
  "categorie": "Mobilier",        // Mobilier | Éclairage | Accessoires | Tech
  "prix": 149.0,                  // EUR
  "stock": 24,                    // statut dérivé : 0 = rupture, ≤ 5 = stock faible
  "ean": "3761234010018",         // EAN-13, clé de contrôle GS1 valide
  "description": "Chaise de bureau ergonomique…",
  "variantes": [
    { "ref": "P-1001-GR", "libelle": "Coloris gris",  "prix": 149.0, "stock": 10 },
    { "ref": "P-1001-NO", "libelle": "Coloris noir",  "prix": 149.0, "stock": 9 },
    { "ref": "P-1001-BE", "libelle": "Coloris beige", "prix": 159.0, "stock": 5 }
  ]
}`,
  en: `{
  "ref": "P-1001",
  "nom": "Oslo chair",
  "categorie": "Mobilier",        // Furniture | Lighting | Accessories | Tech
  "prix": 149.0,                  // EUR
  "stock": 24,                    // derived status: 0 = out of stock, ≤ 5 = low stock
  "ean": "3761234010018",         // EAN-13, valid GS1 check digit
  "description": "Ergonomic office chair…",
  "variantes": [
    { "ref": "P-1001-GR", "libelle": "Grey finish",  "prix": 149.0, "stock": 10 },
    { "ref": "P-1001-NO", "libelle": "Black finish", "prix": 149.0, "stock": 9 },
    { "ref": "P-1001-BE", "libelle": "Beige finish", "prix": 159.0, "stock": 5 }
  ]
}`,
} as const;

export default function CatalogueProduitsDocumentationPage() {
  const { locale } = useI18n();
  const T = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/catalogue-produits">{T.moduleName}</Link> →{" "}
          {T.breadcrumbDocumentation}
        </nav>
        <h1>{T.docPageTitle}</h1>
        <p className="doc-description">{T.docPageDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {T.docDataModelTitle}
      </h2>
      {locale === "fr" ? (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Un produit porte une référence interne unique (<code>P-1001</code>…), une catégorie parmi
          quatre (Mobilier, Éclairage, Accessoires, Tech), un prix de vente, un stock et un EAN-13.
          Le statut n&apos;est jamais stocké : il est <strong>dérivé</strong> du stock (Rupture = 0,
          Stock faible ≤ 5, En stock sinon), ce qui évite toute désynchronisation. Un produit décliné
          (coloris, dimension) embarque ses variantes, chacune avec référence suffixée, prix et stock
          propres.
        </p>
      ) : (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          A product carries a unique internal reference (<code>P-1001</code>…), one of four
          categories (Furniture, Lighting, Accessories, Tech), a selling price, a stock level and an
          EAN-13. The status is never stored: it is <strong>derived</strong> from the stock level
          (Out of stock = 0, Low stock ≤ 5, In stock otherwise), which rules out any
          desynchronization. A product with variations (color, size) embeds its variants, each with
          its own suffixed reference, price and stock.
        </p>
      )}
      <CodeBlock code={DATA_MODEL_JSON[locale]} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {T.docEanTitle}
      </h2>
      {locale === "fr" ? (
        <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Chaque produit reçoit un EAN-13 à la création : préfixe GS1 figé (<code>3761234</code>,
          plage France 376) + compteur sur 5 chiffres + clé de contrôle calculée (somme pondérée
          1/3 des 12 premiers chiffres, complément à 10). La génération est déterministe : un même
          compteur produit toujours le même code. La fiche produit affiche le code-barres
          (<code>bpm.barcode</code>, format <code>EAN13</code>) pour l&apos;étiquetage et un QR code
          (<code>bpm.qrCode</code>) encodant la référence interne pour les scans en entrepôt.
        </p>
      ) : (
        <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Each product receives an EAN-13 at creation: a fixed GS1 prefix (<code>3761234</code>,
          France 376 range) + a 5-digit counter + a computed check digit (1/3-weighted sum of the
          first 12 digits, complement to 10). Generation is deterministic: the same counter always
          yields the same code. The product sheet shows the barcode (<code>bpm.barcode</code>,{" "}
          <code>EAN13</code> format) for labeling and a QR code (<code>bpm.qrCode</code>) encoding
          the internal reference for warehouse scanning.
        </p>
      )}
      <CodeBlock
        code={`def generer_ean13(compteur: int) -> str:
    base = "3761234" + str(compteur).zfill(5)        # 12 chiffres
    somme = sum(int(c) * (1 if i % 2 == 0 else 3) for i, c in enumerate(base))
    return base + str((10 - somme % 10) % 10)        # + clé de contrôle`}
        language="python"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {T.docLifecycleTitle}
      </h2>
      {locale === "fr" ? (
        <ul
          className="mb-4 list-disc pl-5 text-sm space-y-1"
          style={{ color: "var(--bpm-text-secondary)" }}
        >
          <li>
            <strong>Créer</strong> — nom requis, catégorie, prix et stock initial ; référence et
            EAN-13 générés automatiquement, ajout en tête de catalogue.
          </li>
          <li>
            <strong>Consulter</strong> — clic sur une ligne (ou bouton « Fiche ») : description,
            codes, variantes et actions dans un panneau latéral.
          </li>
          <li>
            <strong>Ajuster le stock</strong> — « +1 / −1 stock » depuis la fiche ; le statut, le
            tableau et les métriques (dont la valeur du stock) se recalculent immédiatement.
          </li>
          <li>
            <strong>Supprimer</strong> — confirmation explicite (<code>bpm.confirmModal</code>),
            variantes retirées avec le produit, notification <code>bpm.toast</code>.
          </li>
        </ul>
      ) : (
        <ul
          className="mb-4 list-disc pl-5 text-sm space-y-1"
          style={{ color: "var(--bpm-text-secondary)" }}
        >
          <li>
            <strong>Create</strong> — required name, category, price and initial stock; reference
            and EAN-13 generated automatically, added at the top of the catalog.
          </li>
          <li>
            <strong>View</strong> — click a row (or the &quot;Details&quot; button): description,
            codes, variants and actions in a side panel.
          </li>
          <li>
            <strong>Adjust stock</strong> — &quot;+1 / −1 stock&quot; from the product sheet; the
            status, the table and the metrics (including stock value) recompute immediately.
          </li>
          <li>
            <strong>Delete</strong> — explicit confirmation (<code>bpm.confirmModal</code>),
            variants removed with the product, <code>bpm.toast</code> notification.
          </li>
        </ul>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {T.docIntegrationTitle}
      </h2>
      {locale === "fr" ? (
        <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Le simulateur fonctionne en local (état React seedé, déterministe). Pour brancher un vrai
          backend : persister produits et variantes (tables <code>products</code> /{" "}
          <code>product_variants</code>, contrainte d&apos;unicité sur <code>ref</code> et{" "}
          <code>ean</code>), exposer la recherche et les filtres côté API (paramètres{" "}
          <code>q</code>, <code>category</code>, <code>sort</code>), déléguer les mouvements de stock
          à votre WMS/ERP (journal des mouvements plutôt qu&apos;écrasement de la valeur) et réserver
          la génération d&apos;EAN à votre plage GS1 officielle.
        </p>
      ) : (
        <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          The simulator runs locally (seeded, deterministic React state). To plug in a real backend:
          persist products and variants (<code>products</code> / <code>product_variants</code>{" "}
          tables, uniqueness constraints on <code>ref</code> and <code>ean</code>), expose search
          and filters on the API side (<code>q</code>, <code>category</code>, <code>sort</code>{" "}
          parameters), delegate stock movements to your WMS/ERP (a movement ledger rather than
          overwriting the value) and reserve EAN generation for your official GS1 range.
        </p>
      )}

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/catalogue-produits/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {T.openSimulator}
        </Link>
      </p>
    </div>
  );
}
