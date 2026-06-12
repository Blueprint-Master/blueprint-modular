"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CommandPalette, CodeBlock } from "@/components/bpm";
import type { Command } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const COMMAND_DEFS: { id: string; label: string; description?: string; icon?: string; shortcut?: string; category?: string }[] = [
  { id: "devis", label: "Créer un devis", description: "Nouveau devis client", icon: "request_quote", shortcut: "⌘D", category: "Ventes" },
  { id: "facture", label: "Créer une facture", description: "Facturer une commande livrée", icon: "receipt_long", category: "Ventes" },
  { id: "client", label: "Rechercher un client", description: "Fiche client, encours, historique", icon: "person_search", shortcut: "⌘F", category: "Ventes" },
  { id: "dashboard", label: "Aller au tableau de bord", icon: "dashboard", shortcut: "G D", category: "Navigation" },
  { id: "rapports", label: "Ouvrir les rapports", description: "CA, marge, top produits", icon: "monitoring", category: "Navigation" },
  { id: "article", label: "Ajouter un article", description: "Créer une référence au catalogue", icon: "add_box", category: "Stock" },
  { id: "inventaire", label: "Lancer un inventaire", description: "Comptage du dépôt principal", icon: "inventory", category: "Stock" },
  { id: "inviter", label: "Inviter un collaborateur", icon: "person_add", category: "Paramètres" },
  { id: "theme", label: "Changer de thème", description: "Basculer clair / sombre", icon: "dark_mode", category: "Paramètres" },
  { id: "export", label: "Exporter les données", description: "Export CSV de la période", icon: "download", shortcut: "⌘E", category: "Paramètres" },
];

const DEFAULT_PLACEHOLDER = "Rechercher une action...";

export default function DocCommandPalettePage() {
  const [open, setOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const commands: Command[] = useMemo(
    () => COMMAND_DEFS.map((c) => ({ ...c, action: () => setLastAction(c.label) })),
    []
  );

  const pyCommands = COMMAND_DEFS.map((c) => {
    const fields = [`"id": "${c.id}"`, `"label": "${c.label}"`];
    if (c.description) fields.push(`"description": "${c.description}"`);
    if (c.icon) fields.push(`"icon": "${c.icon}"`);
    if (c.shortcut) fields.push(`"shortcut": "${c.shortcut}"`);
    if (c.category) fields.push(`"category": "${c.category}"`);
    fields.push(`"action": run_${c.id}`);
    return `    {${fields.join(", ")}},`;
  }).join("\n");
  const args: string[] = ["commands=commands", "on_close=fermer_palette"];
  if (placeholder.trim() && placeholder.trim() !== DEFAULT_PLACEHOLDER) {
    args.push(`placeholder="${placeholder.trim().replace(/"/g, '\\"')}"`);
  }
  const pythonCode = `commands = [\n${pyCommands}\n]\nbpm.commandPalette(${args.join(", ")})`;
  const { prev, next } = getPrevNext("commandpalette");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.commandPalette
        </div>
        <h1>bpm.commandPalette</h1>
        <p className="doc-description">
          Palette de commandes modale : recherche floue, navigation clavier (↑ ↓ Entrée, Échap) et
          ouverture par raccourci Cmd/Ctrl+K. Les commandes sont regroupées par catégorie.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Navigation</span>
          <span className="doc-reading-time">⏱ 3 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded border text-sm font-medium cursor-pointer"
              onClick={() => setOpen(true)}
            >
              Ouvrir la palette (⌘K)
            </button>
            <p className="text-sm" aria-live="polite">
              {lastAction
                ? `Dernière commande exécutée : « ${lastAction} »`
                : "Aucune commande exécutée pour l’instant."}
            </p>
            <CommandPalette
              commands={commands}
              isOpen={open}
              onClose={() => setOpen(false)}
              onRequestOpen={() => setOpen(true)}
              placeholder={placeholder || DEFAULT_PLACEHOLDER}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder={DEFAULT_PLACEHOLDER}
            />
          </div>
          <div className="sandbox-control-group">
            <label>Essayez dans la preview</label>
            <p className="text-sm">
              Cliquez sur « Ouvrir la palette (⌘K) » ou pressez Cmd/Ctrl+K, tapez « devis » ou
              « client », naviguez avec ↑ ↓ puis validez avec Entrée : la commande choisie
              s&apos;affiche sous le bouton.
            </p>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>commands</code></td><td><code>&#123; id, label, description?, icon?, shortcut?, category?, action &#125;[]</code></td><td>—</td><td>Oui</td><td>Liste des commandes. <code>action</code> est exécutée à la sélection ; <code>category</code> groupe visuellement ; <code>shortcut</code> est affiché à droite (indicatif).</td></tr>
          <tr><td><code>isOpen</code></td><td><code>boolean</code></td><td>—</td><td>Non</td><td>Mode contrôlé : état d&apos;ouverture. Si omis, la palette gère son ouverture seule via Cmd/Ctrl+K.</td></tr>
          <tr><td><code>onClose</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback de fermeture (Échap, clic sur le fond, ou après exécution d&apos;une commande).</td></tr>
          <tr><td><code>onRequestOpen</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Non</td><td>Appelé sur Cmd/Ctrl+K en mode contrôlé (quand <code>isOpen</code> est fourni).</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>&quot;Rechercher une action...&quot;</td><td>Non</td><td>Texte d&apos;aide du champ de recherche.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={'bpm.commandPalette(commands=[{"id": "save", "label": "Enregistrer", "action": save}], on_close=fermer)'}
        language="python"
      />
      <CodeBlock
        code={'bpm.commandPalette(\n    commands=[\n        {"id": "devis", "label": "Créer un devis", "category": "Ventes", "shortcut": "⌘D", "action": creer_devis},\n        {"id": "client", "label": "Rechercher un client", "category": "Ventes", "action": chercher_client},\n    ],\n    is_open=palette_ouverte,\n    on_close=fermer_palette,\n    on_request_open=ouvrir_palette,\n)'}
        language="python"
      />
      <CodeBlock
        code={'bpm.commandPalette(commands=commands, on_close=fermer, placeholder="Que voulez-vous faire ?")'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
