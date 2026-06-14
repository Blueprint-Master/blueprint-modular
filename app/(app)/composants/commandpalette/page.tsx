"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CommandPalette, CodeBlock } from "@/components/bpm";
import type { Command } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type CommandDef = { id: string; label: string; description?: string; icon?: string; shortcut?: string; category?: string };

const fr = {
  breadcrumb: "Composants",
  description:
    "Palette de commandes modale : recherche floue, navigation clavier (↑ ↓ Entrée, Échap) et ouverture par raccourci Cmd/Ctrl+K. Les commandes sont regroupées par catégorie.",
  category: "Navigation",
  openButton: "Ouvrir la palette (⌘K)",
  lastBefore: "Dernière commande exécutée : « ",
  lastAfter: " »",
  noneExecuted: "Aucune commande exécutée pour l’instant.",
  defaultPlaceholder: "Rechercher une action...",
  tryLabel: "Essayez dans la preview",
  tryText:
    "Cliquez sur « Ouvrir la palette (⌘K) » ou pressez Cmd/Ctrl+K, tapez « devis » ou « client », naviguez avec ↑ ↓ puis validez avec Entrée : la commande choisie s’affiche sous le bouton.",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  commandsDesc1: "Liste des commandes. ",
  commandsDesc2: " est exécutée à la sélection ; ",
  commandsDesc3: " groupe visuellement ; ",
  commandsDesc4: " est affiché à droite (indicatif).",
  isOpenDesc1: "Mode contrôlé : état d'ouverture. Si omis, la palette gère son ouverture seule via Cmd/Ctrl+K.",
  onCloseDesc: "Callback de fermeture (Échap, clic sur le fond, ou après exécution d'une commande).",
  onRequestOpenDesc1: "Appelé sur Cmd/Ctrl+K en mode contrôlé (quand ",
  onRequestOpenDesc2: " est fourni).",
  placeholderDesc: "Texte d'aide du champ de recherche.",
  classNameDesc: "Classes CSS additionnelles.",
  examples: "Exemples",
  commandDefs: [
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
  ] as CommandDef[],
};

const en: typeof fr = {
  breadcrumb: "Components",
  description:
    "Modal command palette: fuzzy search, keyboard navigation (↑ ↓ Enter, Esc) and opening via the Cmd/Ctrl+K shortcut. Commands are grouped by category.",
  category: "Navigation",
  openButton: "Open palette (⌘K)",
  lastBefore: "Last command executed: “",
  lastAfter: "”",
  noneExecuted: "No command executed yet.",
  defaultPlaceholder: "Search for an action...",
  tryLabel: "Try it in the preview",
  tryText:
    "Click “Open palette (⌘K)” or press Cmd/Ctrl+K, type “quote” or “customer”, navigate with ↑ ↓ then confirm with Enter: the chosen command appears below the button.",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  commandsDesc1: "List of commands. ",
  commandsDesc2: " runs on selection; ",
  commandsDesc3: " groups commands visually; ",
  commandsDesc4: " is displayed on the right (informational).",
  isOpenDesc1: "Controlled mode: open state. If omitted, the palette handles its own opening via Cmd/Ctrl+K.",
  onCloseDesc: "Close callback (Esc, backdrop click, or after a command runs).",
  onRequestOpenDesc1: "Called on Cmd/Ctrl+K in controlled mode (when ",
  onRequestOpenDesc2: " is provided).",
  placeholderDesc: "Help text for the search field.",
  classNameDesc: "Additional CSS classes.",
  examples: "Examples",
  commandDefs: [
    { id: "devis", label: "Create a quote", description: "New customer quote", icon: "request_quote", shortcut: "⌘D", category: "Sales" },
    { id: "facture", label: "Create an invoice", description: "Invoice a delivered order", icon: "receipt_long", category: "Sales" },
    { id: "client", label: "Search for a customer", description: "Customer record, outstanding balance, history", icon: "person_search", shortcut: "⌘F", category: "Sales" },
    { id: "dashboard", label: "Go to dashboard", icon: "dashboard", shortcut: "G D", category: "Navigation" },
    { id: "rapports", label: "Open reports", description: "Revenue, margin, top products", icon: "monitoring", category: "Navigation" },
    { id: "article", label: "Add an item", description: "Create a catalog reference", icon: "add_box", category: "Inventory" },
    { id: "inventaire", label: "Start a stock count", description: "Main warehouse count", icon: "inventory", category: "Inventory" },
    { id: "inviter", label: "Invite a teammate", icon: "person_add", category: "Settings" },
    { id: "theme", label: "Switch theme", description: "Toggle light / dark", icon: "dark_mode", category: "Settings" },
    { id: "export", label: "Export data", description: "CSV export for the period", icon: "download", shortcut: "⌘E", category: "Settings" },
  ] as CommandDef[],
};

const L = { fr, en } as const;

export default function DocCommandPalettePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [open, setOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const COMMAND_DEFS = t.commandDefs;
  const effectivePlaceholder = placeholder ?? t.defaultPlaceholder;

  const commands: Command[] = useMemo(
    () => COMMAND_DEFS.map((c) => ({ ...c, action: () => setLastAction(c.label) })),
    [COMMAND_DEFS]
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
  if (effectivePlaceholder.trim() && effectivePlaceholder.trim() !== t.defaultPlaceholder) {
    args.push(`placeholder="${effectivePlaceholder.trim().replace(/"/g, '\\"')}"`);
  }
  const pythonCode = `commands = [\n${pyCommands}\n]\nbpm.commandPalette(${args.join(", ")})`;
  const { prev, next } = getPrevNext("commandpalette");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.commandPalette
        </div>
        <h1>bpm.commandPalette</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
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
              {t.openButton}
            </button>
            <p className="text-sm" aria-live="polite">
              {lastAction
                ? `${t.lastBefore}${lastAction}${t.lastAfter}`
                : t.noneExecuted}
            </p>
            <CommandPalette
              commands={commands}
              isOpen={open}
              onClose={() => setOpen(false)}
              onRequestOpen={() => setOpen(true)}
              placeholder={effectivePlaceholder || t.defaultPlaceholder}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input
              type="text"
              value={effectivePlaceholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder={t.defaultPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>{t.tryLabel}</label>
            <p className="text-sm">{t.tryText}</p>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>{t.thDescription}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>commands</code></td><td><code>&#123; id, label, description?, icon?, shortcut?, category?, action &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.commandsDesc1}<code>action</code>{t.commandsDesc2}<code>category</code>{t.commandsDesc3}<code>shortcut</code>{t.commandsDesc4}</td></tr>
          <tr><td><code>isOpen</code></td><td><code>boolean</code></td><td>—</td><td>{t.no}</td><td>{t.isOpenDesc1}</td></tr>
          <tr><td><code>onClose</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.onCloseDesc}</td></tr>
          <tr><td><code>onRequestOpen</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.onRequestOpenDesc1}<code>isOpen</code>{t.onRequestOpenDesc2}</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>&quot;Rechercher une action...&quot;</td><td>{t.no}</td><td>{t.placeholderDesc}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.classNameDesc}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
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
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
