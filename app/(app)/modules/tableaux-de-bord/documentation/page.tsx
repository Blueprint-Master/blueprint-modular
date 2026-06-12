"use client";

import Link from "next/link";
import { CodeBlock, Table, type TableColumn } from "@/components/bpm";

const CATALOG_COLUMNS: TableColumn[] = [
  { key: "id", label: "Identifiant", noWrap: true, render: (value) => <code>{String(value)}</code> },
  { key: "type", label: "Type", noWrap: true },
  { key: "titre", label: "Widget" },
  { key: "taille", label: "Taille par défaut", align: "center" },
];

const CATALOG_DATA = [
  { id: "metric-ca", type: "Metric", titre: "CA du mois (142,5 k€, +12,3 %)", taille: "1 colonne" },
  { id: "metric-commandes", type: "Metric", titre: "Commandes (1 248, +8 %)", taille: "1 colonne" },
  { id: "metric-panier", type: "Metric", titre: "Panier moyen (114,20 €)", taille: "1 colonne" },
  { id: "line-ventes", type: "LineChart", titre: "Ventes — 12 derniers mois", taille: "2 colonnes" },
  { id: "bar-regions", type: "BarChart", titre: "CA par région (6 régions)", taille: "1 colonne" },
  { id: "table-top-produits", type: "Table", titre: "Top 5 produits (réf. / nom / CA)", taille: "1 colonne" },
  { id: "ring-objectif", type: "ProgressRing", titre: "Objectif trimestre (78 %)", taille: "1 colonne" },
  { id: "feed-commandes", type: "ActivityFeed", titre: "Dernières commandes (4 entrées)", taille: "2 colonnes" },
];

export default function TableauxDeBordDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/tableaux-de-bord">Tableaux de bord</Link> → Documentation
        </nav>
        <h1>Documentation — Tableaux de bord</h1>
        <p className="doc-description">
          Tableau de bord à widgets personnalisable : catalogue de widgets, modèle de configuration
          (ordre, taille, visibilité) et persistance de la disposition.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Catalogue de widgets
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le catalogue définit les widgets disponibles : chaque entrée associe un identifiant stable,
        un titre, une taille par défaut et une fonction de rendu vers un vrai composant{" "}
        <code>bpm.*</code>. Les widgets non placés sur la grille restent disponibles dans la
        bibliothèque (visible en mode personnalisation).
      </p>
      <Table columns={CATALOG_COLUMNS} data={CATALOG_DATA} keyColumn="id" density="compact" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle de configuration
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        La disposition est un tableau ordonné : l&apos;ordre des entrées est l&apos;ordre
        d&apos;affichage dans la grille (<code>md:grid-cols-2</code>), <code>size</code> vaut 1 ou
        2 colonnes, et la visibilité est implicite — un widget absent du tableau est masqué
        (il apparaît alors dans la bibliothèque). Aucune donnée métier n&apos;est stockée : la
        configuration ne référence que des identifiants du catalogue.
      </p>
      <CodeBlock
        code={`[
  { "id": "metric-ca",         "size": 1 },
  { "id": "metric-commandes",  "size": 1 },
  { "id": "line-ventes",       "size": 2 },
  { "id": "bar-regions",       "size": 1 },
  { "id": "table-top-produits","size": 1 }
]`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Opérations de personnalisation
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Réordonner (↑ / ↓)</strong> — permutation de deux entrées adjacentes du tableau ; boutons désactivés aux extrémités.</li>
        <li><strong>Redimensionner (⤢)</strong> — bascule <code>size</code> entre 1 et 2 colonnes.</li>
        <li><strong>Masquer</strong> — retire l&apos;entrée du tableau ; le widget rejoint la bibliothèque.</li>
        <li><strong>Ajouter</strong> — ajoute l&apos;entrée en fin de tableau avec la taille par défaut du catalogue.</li>
        <li><strong>Réinitialiser</strong> — restaure la disposition par défaut et purge la sauvegarde (confirmation via <code>bpm.confirmModal</code>).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Persistance
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Dans le simulateur, la disposition est écrite dans <code>localStorage</code> (clé{" "}
        <code>bpm.tableaux-de-bord.layout.v1</code>) à chaque changement, puis relue au montage via{" "}
        <code>useEffect</code>. Le rendu initial utilise toujours la disposition par défaut pour
        rester identique côté serveur et côté client (SSR-safe) ; la configuration sauvegardée est
        appliquée juste après l&apos;hydratation, après validation (identifiants connus du
        catalogue, tailles 1 ou 2, sans doublon — toute valeur invalide est ignorée).
      </p>
      <CodeBlock
        code={`// Lecture au montage (jamais au render)
useEffect(() => {
  const raw = window.localStorage.getItem("bpm.tableaux-de-bord.layout.v1");
  const stored = raw ? parseStoredLayout(raw) : null; // validation stricte
  if (stored) setLayout(stored);
  setHydrated(true);
}, []);

// Écriture à chaque changement, uniquement après hydratation
useEffect(() => {
  if (!hydrated) return;
  window.localStorage.setItem("bpm.tableaux-de-bord.layout.v1", JSON.stringify(layout));
}, [layout, hydrated]);`}
        language="typescript"
      />
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        En production, remplacer <code>localStorage</code> par un enregistrement par utilisateur
        (table <code>dashboard_layouts</code> : <code>user_id</code>, <code>layout</code> JSON,{" "}
        <code>updated_at</code>) avec la même validation côté serveur ; le suffixe de version de la
        clé (<code>.v1</code>) permet d&apos;invalider proprement les anciennes dispositions quand
        le catalogue évolue.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/tableaux-de-bord/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
