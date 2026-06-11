#!/usr/bin/env python3
"""Ajoute @example + @props (authorés depuis l'interface réelle) au bloc JSDoc riche.
Idempotent : ne fait rien si @example est déjà présent dans le fichier."""
from pathlib import Path

REPO = Path(__file__).parent.parent
COMP = REPO / "components" / "bpm"

# fichier -> (ligne d'ancre @parent à repérer, bloc de lignes à insérer avant)
DATA = {
    "Stepper.tsx": (
        " * @parent bpm.wizardForm",
        [
            ' * @example',
            ' * bpm.stepper({ steps: [{ label: "Panier" }, { label: "Livraison" }, { label: "Paiement" }], currentStep: 1 })',
            ' * @props',
            ' * - steps (StepperStep[], optionnel) — Étapes { label, description?, icon?, optional? }.',
            ' * - currentStep (number, optionnel) — Index de l’étape courante (0-based). Default: 0.',
            ' * - direction ("horizontal"|"vertical", optionnel) — Orientation. Default: "horizontal".',
            ' * - onStepClick (function, optionnel) — Callback (stepIndex) au clic sur une étape.',
            ' * - size ("sm"|"md"|"lg", optionnel) — Taille des pastilles. Default: "md".',
            ' * - className (string, optionnel) — Classes CSS additionnelles.',
        ],
    ),
    "Timeline.tsx": (
        " * @parent bpm.card, bpm.drawer, bpm.page",
        [
            ' * @example',
            ' * bpm.timeline({ events: [{ date: "2026-06-01", title: "Création", description: "Dossier ouvert" }] })',
            ' * @props',
            ' * - events (TimelineEvent[], optionnel) — Événements { date, title, description?, icon? } (API recommandée).',
            ' * - items (TimelineItem[], optionnel) — Ancienne API, conservée pour compatibilité.',
            ' * - maxItems (number, optionnel) — Limite d’éléments affichés.',
            ' * - sortOrder ("asc"|"desc", optionnel) — Ordre chronologique. Default: "desc".',
            ' * - groupByDate (boolean, optionnel) — Regroupe les événements par date.',
            ' * - className (string, optionnel) — Classes CSS additionnelles.',
        ],
    ),
    "StatusTracker.tsx": (
        " * @parent bpm.card, bpm.masterDetail, bpm.page",
        [
            ' * @example',
            ' * bpm.statusTracker({ stages: [{ label: "Reçu", state: "completed" }, { label: "En cours", state: "current" }, { label: "Livré", state: "pending" }] })',
            ' * @props',
            ' * - stages (StatusTrackerStage[], obligatoire) — Étapes { label, state: completed|current|pending|error }.',
            ' * - direction ("horizontal"|"vertical", optionnel) — Orientation. Default: "horizontal".',
            ' * - compact (boolean, optionnel) — Affichage condensé. Default: false.',
            ' * - className (string, optionnel) — Classes CSS additionnelles.',
        ],
    ),
    "OrgChart.tsx": (
        " * @parent bpm.card, bpm.container, bpm.page",
        [
            ' * @example',
            ' * bpm.orgChart({ nodes: [{ id: "1", label: "CEO" }, { id: "2", label: "CTO", parentId: "1" }], expandable: true })',
            ' * @props',
            ' * - nodes (OrgChartNode[], obligatoire) — Nœuds { id, label, parentId?, ... }.',
            ' * - direction ("vertical"|"horizontal", optionnel) — Sens de l’arbre. Default: "vertical".',
            ' * - onNodeClick (function, optionnel) — Callback (node) au clic sur un nœud.',
            ' * - expandable (boolean, optionnel) — Nœuds repliables. Default: false.',
            ' * - rootId (string, optionnel) — Id du nœud racine.',
            ' * - className (string, optionnel) — Classes CSS additionnelles.',
        ],
    ),
    "MasterDetail.tsx": (
        " * @parent bpm.page, bpm.pageLayout",
        [
            ' * @example',
            ' * bpm.masterDetail({ items, columns: [{ key: "name", label: "Nom" }], renderDetail: (it) => <div>{it.name}</div>, onSelect: setSel })',
            ' * @props',
            ' * - items (T[], obligatoire) — Données de la liste.',
            ' * - columns (MasterDetailColumn[], obligatoire) — Colonnes de la liste de gauche.',
            ' * - renderDetail (function, obligatoire) — (item) => ReactElement, panneau de détail.',
            ' * - onSelect (function, obligatoire) — Callback (item) à la sélection.',
            ' * - selectedId (string, optionnel) — Id sélectionné (mode contrôlé).',
            ' * - idKey (string, optionnel) — Clé d’identité des items. Default: "id".',
            ' * - searchable (boolean, optionnel) — Active la barre de recherche.',
            ' * - emptyDetailMessage (string, optionnel) — Message quand rien n’est sélectionné.',
            ' * - splitRatio (number, optionnel) — Ratio largeur liste/détail.',
            ' * - className (string, optionnel) — Classes CSS additionnelles.',
        ],
    ),
    "WizardForm.tsx": (
        " * @parent bpm.modal, bpm.page, bpm.card",
        [
            ' * @example',
            ' * bpm.wizardForm({ steps: [{ title: "Profil", content: <>…</> }], onComplete: handleDone })',
            ' * @props',
            ' * - steps (WizardStep[], obligatoire) — Étapes { title, content, validate? }.',
            ' * - onComplete (function, obligatoire) — Callback à la dernière étape validée.',
            ' * - onCancel (function, optionnel) — Callback d’annulation.',
            ' * - submitLabel (string, optionnel) — Libellé du bouton final. Default: "Terminer".',
            ' * - showSummary (boolean, optionnel) — Affiche un récapitulatif final.',
            ' * - className (string, optionnel) — Classes CSS additionnelles.',
        ],
    ),
    "NotificationCenter.tsx": (
        " * @parent bpm.topNav, bpm.drawer, bpm.page",
        [
            ' * @example',
            ' * bpm.notificationCenter({ notifications, onMarkRead: markRead, onDismiss: dismiss })',
            ' * @props',
            ' * - notifications (NotificationItem[], obligatoire) — { id, title, message?, read, date }.',
            ' * - onMarkRead (function, obligatoire) — Callback (id) marque comme lu.',
            ' * - onMarkAllRead (function, optionnel) — Marque toutes les notifications comme lues.',
            ' * - onDismiss (function, optionnel) — Callback (id) supprime une notification.',
            ' * - maxVisible (number, optionnel) — Nombre maximum affiché.',
            ' * - emptyMessage (string, optionnel) — Message liste vide.',
            ' * - className (string, optionnel) — Classes CSS additionnelles.',
        ],
    ),
    "Table.tsx": (
        " * @parent bpm.card, bpm.page, bpm.dataExplorer",
        [
            ' * @example',
            ' * bpm.table({ columns: [{ key: "name", label: "Nom" }, { key: "status", label: "Statut", render: (v) => bpm.badge({ children: v }) }], data })',
            ' * @props',
            ' * - columns (TableColumn[], obligatoire) — Définition des colonnes (key, label, render?).',
            ' * - data (Record<string,unknown>[], obligatoire) — Lignes ; jamais de JSX dans data[] (utiliser render).',
            ' * - striped / hover (boolean, optionnel) — Lignes alternées / surbrillance au survol.',
            ' * - onRowClick (function, optionnel) — Callback (row) au clic sur une ligne.',
            ' * - defaultSortColumn / defaultSortDirection (optionnel) — Tri initial.',
            ' * - keyColumn (string, optionnel) — Colonne servant de clé React.',
            ' * - valueLocale / valueDecimals / valueGrouping (optionnel) — Formatage numérique.',
            ' * - minWidth (number, optionnel) — Largeur minimale (déclenche le scroll horizontal).',
            ' * - className (string, optionnel) — Classes CSS additionnelles.',
        ],
    ),
    "FilePreview.tsx": (
        " * @parent bpm.card, bpm.modal, bpm.masterDetail",
        [
            ' * @example',
            ' * bpm.filePreview({ url: "/docs/rapport.pdf", filename: "rapport.pdf", mimeType: "application/pdf" })',
            ' * @props',
            ' * - url (string, obligatoire) — URL du fichier à prévisualiser.',
            ' * - filename (string, obligatoire) — Nom du fichier affiché.',
            ' * - mimeType (string, optionnel) — Type MIME (déduit de l’extension sinon).',
            ' * - height (string|number, optionnel) — Hauteur de l’aperçu.',
            ' * - showDownload (boolean, optionnel) — Affiche le bouton de téléchargement.',
            ' * - className (string, optionnel) — Classes CSS additionnelles.',
            ' * - file_url / file_name / mime_type / show_download / class_name — Alias snake_case (API Python), normalisés en interne.',
        ],
    ),
}


def main():
    for fname, (anchor, lines) in DATA.items():
        path = COMP / fname
        src = path.read_text(encoding="utf-8")
        if "@example" in src:
            print(f"  skip {fname} (a déjà @example)")
            continue
        idx = src.find(anchor)
        if idx == -1:
            print(f"  WARN {fname}: ancre introuvable")
            continue
        line_start = src.rfind("\n", 0, idx) + 1
        insertion = "\n".join(lines) + "\n"
        new = src[:line_start] + insertion + src[line_start:]
        path.write_text(new, encoding="utf-8")
        print(f"  + {fname}: @example + @props")


if __name__ == "__main__":
    main()
