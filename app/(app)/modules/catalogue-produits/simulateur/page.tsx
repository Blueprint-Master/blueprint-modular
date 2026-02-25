"use client";

import Link from "next/link";
import { Panel, Table, Button } from "@/components/bpm";

const prodData = [{ ref: "P001", nom: "Produit A", prix: "12.50", stock: "42" }];

export default function CatalogueProduitsSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/catalogue-produits">Catalogue produits</Link> → Simulateur</div>
        <h1>Simulateur — Catalogue produits</h1>
        <p className="doc-description">Liste produits (démo).</p>
      </div>
      <Panel variant="info" title="Catalogue">
        <Table columns={[{ key: "ref", label: "Réf" }, { key: "nom", label: "Nom" }, { key: "prix", label: "Prix" }, { key: "stock", label: "Stock" }]} data={prodData} striped hover />
        <Button size="small" className="mt-4">Ajouter</Button>
      </Panel>
    </div>
  );
}
