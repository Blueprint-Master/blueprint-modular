"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function MultiLangueDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/multi-langue">Multi-langue</Link> → Documentation
        </nav>
        <h1>Documentation — Multi-langue</h1>
        <p className="doc-description">
          Structure des dictionnaires, interpolation de variables, pluriels, formats de dates et de
          nombres par locale, et stratégie de repli sur la langue de référence.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Structure des dictionnaires
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Un dictionnaire par langue, à clés plates et hiérarchiques (<code>domaine.section.cle</code>).
        Le français est la <strong>langue de référence</strong> : il doit être complet ; les autres
        langues peuvent être partielles, le repli comble les trous. Les clés couvrent l&apos;UI
        (titres, navigation, colonnes), les statuts métier, les actions et les messages.
      </p>
      <CodeBlock
        code={`{
  "fr": {
    "app.titre": "Suivi des commandes",
    "nav.commandes": "Commandes",
    "commandes.statut.expediee": "Expédiée",
    "commandes.total": "Total des commandes",
    "action.valider": "Valider la commande",
    "message.bienvenue": "Bonjour, {prenom}",
    "commandes.nombre": "{count} commande|{count} commandes"
  },
  "en": { "app.titre": "Order tracking", "...": "..." },
  "es": { "app.titre": "Seguimiento de pedidos", "...": "..." }
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Interpolation
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Les valeurs peuvent contenir des variables entre accolades, remplacées au rendu :{" "}
        <code>t(&quot;message.bienvenue&quot;, {"{ prenom: \"Camille\" }"})</code> donne « Bonjour,
        Camille » en FR et « Welcome, Camille » en EN. Les variables doivent être conservées telles
        quelles dans chaque langue (l&apos;ordre des mots peut changer, pas le nom de la variable).
      </p>
      <CodeBlock
        code={`function applyVars(raw: string, vars: Record<string, string>): string {
  let out = raw;
  for (const [name, value] of Object.entries(vars)) {
    out = out.split(\`{\${name}}\`).join(value);
  }
  return out;
}`}
        language="typescript"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Pluriels
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Les clés plurielles stockent les formes <code>one|other</code> séparées par « | ». La forme
        est choisie par <code>Intl.PluralRules(locale).select(count)</code> — ce qui gère
        correctement les règles de chaque langue (en français, 0 et 1 sont au singulier ; en anglais
        et en espagnol, seul 1 l&apos;est). <code>{"{count}"}</code> est ensuite formaté avec{" "}
        <code>Intl.NumberFormat</code>.
      </p>
      <CodeBlock
        code={`// "commandes.nombre": "{count} commande|{count} commandes"
const rule = new Intl.PluralRules("fr-FR").select(3); // "other"
const [one, other] = raw.split("|");
const text = (rule === "one" ? one : other).replace("{count}", "3");
// → "3 commandes" (FR) / "3 orders" (EN) / "3 pedidos" (ES)`}
        language="typescript"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Formats de dates et de nombres par locale
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Les montants et les dates ne sont jamais traduits : ils sont <strong>formatés</strong> par
        les API <code>Intl</code> avec la locale active. Le même montant 1234.56 € et la même date
        ISO donnent :
      </p>
      <CodeBlock
        code={`new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(1234.56)
// → "1 234,56 €"
new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(1234.56)
// → "€1,234.56"
new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(1234.56)
// → "1234,56 €"

const d = new Date("2026-06-10T09:30:00"); // littéral ISO figé → déterministe
new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d) // "10 juin 2026"
new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(d) // "June 10, 2026"
new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(d) // "10 de junio de 2026"`}
        language="typescript"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Repli (fallback) sur la langue de référence
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>Résolution</strong> — la clé est cherchée dans la langue active ; si absente, la
          valeur française est utilisée ; si la clé n&apos;existe nulle part, la clé brute est
          affichée (jamais de texte vide).
        </li>
        <li>
          <strong>Signalement</strong> — les valeurs repliées sont soulignées en pointillé dans
          l&apos;aperçu et listées dans le panneau « Couverture des traductions » avec une barre de
          progression par langue.
        </li>
        <li>
          <strong>Correction</strong> — chaque clé manquante propose un bouton « Traduire » qui
          ouvre l&apos;éditeur ; la traduction ajoutée est immédiatement visible dans
          l&apos;aperçu et fait monter la couverture.
        </li>
        <li>
          <strong>Persistance</strong> — le choix de langue est mémorisé en localStorage et relu au
          montage (rendu initial en français pour rester compatible SSR).
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration en production
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur fonctionne en local (dictionnaires seedés, état React). En production :
        stocker les dictionnaires en base ou en fichiers JSON par locale, exposer la couverture par
        langue dans un back-office de traduction, et négocier la langue initiale via{" "}
        <code>Accept-Language</code> ou le profil utilisateur — en conservant la même résolution
        clé → langue active → langue de référence.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/multi-langue/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
