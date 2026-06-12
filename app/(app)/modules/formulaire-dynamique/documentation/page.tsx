"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function FormulaireDynamiqueDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/formulaire-dynamique">Formulaire dynamique</Link> → Documentation
        </nav>
        <h1>Documentation — Formulaire dynamique</h1>
        <p className="doc-description">
          Spécification du schéma de formulaire : types de champs, conditions de visibilité{" "}
          <code>visibleIf</code> et règles de validation appliquées par le renderer générique.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Principe
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Un formulaire n&apos;est jamais codé en dur : il est décrit par un schéma JSON. Le renderer
        parcourt <code>fields</code>, mappe chaque <code>type</code> vers le composant bpm
        correspondant, évalue les conditions <code>visibleIf</code> à chaque saisie et n&apos;exige
        un champ requis que s&apos;il est visible. Ajouter un champ ou une règle métier revient à
        modifier le schéma — pas le code.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Types de champs
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>text</code> — saisie libre (<code>bpm.input</code>).</li>
        <li><code>number</code> — valeur numérique, ex. montant estimé (<code>bpm.input type=&quot;number&quot;</code>).</li>
        <li><code>date</code> — sélecteur de date au format FR (<code>bpm.dateInput</code>).</li>
        <li><code>select</code> — liste déroulante avec <code>options</code> (<code>bpm.selectbox</code>).</li>
        <li><code>radio</code> — choix exclusif court, ex. profil lecture/écriture/admin (<code>bpm.radioGroup</code>).</li>
        <li><code>checkbox</code> — choix binaire, ex. demi-journée (<code>bpm.checkbox</code>).</li>
        <li><code>textarea</code> — texte long : commentaire, justification, motif (<code>bpm.textarea</code>).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Conditions <code>visibleIf</code>
      </h2>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Une condition observe un autre champ du même formulaire et se réévalue à chaque saisie.
        Deux opérateurs sont supportés :
      </p>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <code>equals</code> — égalité stricte. Ex. la justification n&apos;apparaît que si{" "}
          <code>type_conge = &quot;sans_solde&quot;</code> ; motif et durée que si{" "}
          <code>profil = &quot;admin&quot;</code>.
        </li>
        <li>
          <code>greaterThan</code> — comparaison numérique. Ex. la validation directeur apparaît si{" "}
          <code>montant &gt; 1000</code>.
        </li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Les mêmes conditions pilotent les <code>messages</code> : des bandeaux{" "}
        <code>bpm.message</code> (info, warning) affichés en contexte, par exemple
        l&apos;avertissement de seuil d&apos;achat.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Validation
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Requis conditionnel</strong> — <code>required: true</code> ne s&apos;applique que si le champ est visible : un champ masqué n&apos;est jamais bloquant.</li>
        <li><strong>Format numérique</strong> — un champ <code>number</code> doit contenir un nombre positif.</li>
        <li><strong>Contrôle croisé</strong> — <code>dateRange</code> vérifie que la date de fin suit la date de début.</li>
        <li><strong>Restitution</strong> — chaque erreur s&apos;affiche sous le champ concerné ; la soumission n&apos;aboutit qu&apos;à zéro erreur, puis produit un récapitulatif et une entrée dans « Demandes soumises ».</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Exemple complet — schéma « Achat de matériel »
      </h2>
      <CodeBlock
        code={`{
  "id": "achat-materiel",
  "title": "Achat de matériel",
  "fields": [
    {
      "id": "categorie",
      "label": "Catégorie",
      "type": "select",
      "required": true,
      "options": [
        { "value": "informatique", "label": "Informatique" },
        { "value": "mobilier", "label": "Mobilier" },
        { "value": "logiciel", "label": "Logiciel" }
      ]
    },
    {
      "id": "montant",
      "label": "Montant estimé (€ HT)",
      "type": "number",
      "required": true
    },
    {
      "id": "description",
      "label": "Description du besoin",
      "type": "textarea",
      "required": true
    },
    {
      "id": "validation_directeur",
      "label": "Validation directeur (montant > 1 000 €)",
      "type": "select",
      "required": true,
      "options": [
        { "value": "c.moreau", "label": "C. Moreau — Directeur des opérations" },
        { "value": "a.petit", "label": "A. Petit — Directrice financière" }
      ],
      "visibleIf": { "field": "montant", "operator": "greaterThan", "value": 1000 }
    }
  ],
  "messages": [
    {
      "id": "msg-seuil",
      "type": "warning",
      "text": "Montant supérieur à 1 000 € HT : validation directeur obligatoire.",
      "visibleIf": { "field": "montant", "operator": "greaterThan", "value": 1000 }
    }
  ]
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration en production
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur embarque trois schémas seedés en état local. En production, servir les
        schémas depuis une API (table <code>form_schemas</code> versionnée), conserver le même
        renderer côté client, et persister chaque soumission validée (l&apos;équivalent du tableau
        « Demandes soumises ») avec son statut de circuit d&apos;approbation.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/formulaire-dynamique/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
