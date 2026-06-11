#!/usr/bin/env python3
"""
Insère les axes de relation manquants (@parent / @associated / @forbidden) dans
le bloc JSDoc riche (celui qui porte @example/@param) de chaque composant.

- N'ajoute QUE les axes absents (idempotent — relances sûres).
- Contenu authoré ci-dessous, fidèle au rôle réel de chaque composant.
- Insertion juste avant la fermeture du bloc JSDoc contenant @example
  (à défaut, le bloc JSDoc précédant l'export principal).
Usage: python3 scripts/_add_relations.py
"""
import re
from pathlib import Path

REPO = Path(__file__).parent.parent
COMP = REPO / "components" / "bpm"

# bpm_key -> (parent, associated, forbidden)
REL = {
    "avatar": ("bpm.sidebar, bpm.topNav, bpm.card", "bpm.badge, bpm.menu", "aucun"),
    "highlightBox": ("bpm.grid, bpm.column, bpm.container", "bpm.metric, bpm.card", "Donnée chiffrée temps réel — utiliser bpm.metric"),
    "column": ("bpm.page, bpm.container", "bpm.grid, bpm.card", "Layout pleine largeur d'un seul bloc — inutile"),
    "empty": ("bpm.card, bpm.table, bpm.container", "bpm.emptyState, bpm.button", "aucun"),
    "popover": ("bpm.button, bpm.topNav, bpm.table", "bpm.tooltip, bpm.menu", "Contenu long ou formulaire — utiliser bpm.modal ou bpm.drawer"),
    "button": ("bpm.modal, bpm.card, bpm.panel, bpm.topNav", "bpm.fab, bpm.buttonGroup", "Navigation entre pages — utiliser un lien"),
    "theme": ("bpm.topNav, bpm.sidebar", "bpm.button", "aucun"),
    "numberInput": ("bpm.modal, bpm.card, bpm.wizardForm", "bpm.input, bpm.slider", "Valeur non numérique — utiliser bpm.input"),
    "radioGroup": ("bpm.modal, bpm.card, bpm.wizardForm", "bpm.checkbox, bpm.selectbox", "Plus de ~6 options — utiliser bpm.selectbox"),
    "dateInput": ("bpm.modal, bpm.card, bpm.filterPanel", "bpm.dateRangePicker, bpm.timeInput", "Plage de dates — utiliser bpm.dateRangePicker"),
    "dateRangePicker": ("bpm.filterPanel, bpm.card, bpm.modal", "bpm.dateInput, bpm.calendar", "Date unique — utiliser bpm.dateInput"),
    "timeInput": ("bpm.modal, bpm.card, bpm.wizardForm", "bpm.dateInput", "aucun"),
    "rating": ("bpm.card, bpm.table, bpm.commentThread", "bpm.badge, bpm.metric", "Mesure continue à juger — utiliser bpm.metric avec context"),
    "fileUploader": ("bpm.modal, bpm.card, bpm.wizardForm", "bpm.filePreview, bpm.progress", "aucun"),
    "colorPicker": ("bpm.modal, bpm.card, bpm.panel", "bpm.input", "aucun"),
    "chip": ("bpm.filterPanel, bpm.card, bpm.autocomplete", "bpm.badge, bpm.tag", "Statut court figé — utiliser bpm.badge"),
    "breadcrumb": ("bpm.page, bpm.pageLayout, bpm.topNav", "bpm.topNav, bpm.tabs", "aucun"),
    "stepper": ("bpm.wizardForm, bpm.card, bpm.page", "bpm.statusTracker, bpm.button", "Suivi d'état d'un objet — utiliser bpm.statusTracker"),
    "audio": ("bpm.card, bpm.container, bpm.modal", "bpm.video", "aucun"),
    "video": ("bpm.card, bpm.container, bpm.modal", "bpm.audio", "aucun"),
    "html": ("bpm.card, bpm.container", "bpm.markdown", "Contenu non sanitisé — risque XSS ; préférer bpm.markdown"),
    "lineChart": ("bpm.card, bpm.grid, bpm.tableauxDeBord", "bpm.areaChart, bpm.barChart, bpm.metric", "Catégories discrètes — utiliser bpm.barChart"),
    "barChart": ("bpm.card, bpm.grid, bpm.tableauxDeBord", "bpm.lineChart, bpm.areaChart, bpm.metric", "Série temporelle continue — utiliser bpm.lineChart"),
    "areaChart": ("bpm.card, bpm.grid, bpm.tableauxDeBord", "bpm.lineChart, bpm.barChart", "Comparaison de catégories — utiliser bpm.barChart"),
    "scatterChart": ("bpm.card, bpm.grid", "bpm.lineChart, bpm.heatmap", "Évolution temporelle — utiliser bpm.lineChart"),
    "topNav": ("bpm.page, bpm.pageLayout", "bpm.breadcrumb, bpm.avatar, bpm.theme", "Navigation latérale dense — utiliser bpm.sidebar"),
    "fab": ("bpm.page, bpm.pageLayout", "bpm.button", "Plus d'une action principale — utiliser bpm.button dans une barre"),
    "treeview": ("bpm.card, bpm.drawer, bpm.masterDetail", "bpm.orgChart, bpm.list", "Hiérarchie d'organisation — utiliser bpm.orgChart"),
    "flowDiagram": ("bpm.card, bpm.container", "bpm.decisionTree, bpm.statusTracker", "Étapes linéaires — utiliser bpm.stepper"),
    "activityFeed": ("bpm.card, bpm.drawer, bpm.dashboard", "bpm.timeline, bpm.notificationCenter", "Chronologie datée structurée — utiliser bpm.timeline"),
    "commandPalette": ("bpm.page, bpm.pageLayout", "bpm.autocomplete, bpm.modal", "Navigation permanente — utiliser bpm.topNav ou bpm.sidebar"),
    "image": ("bpm.card, bpm.grid, bpm.container", "bpm.avatar, bpm.filePreview", "Contenu HTML/vidéo — utiliser bpm.html / bpm.video"),
    "pdfViewer": ("bpm.card, bpm.modal, bpm.drawer", "bpm.filePreview, bpm.fileUploader", "Image simple — utiliser bpm.image"),
    "autocomplete": ("bpm.modal, bpm.card, bpm.filterPanel", "bpm.input, bpm.selectbox, bpm.chip", "Liste figée courte — utiliser bpm.selectbox"),
    "map": ("bpm.card, bpm.container, bpm.modal", "bpm.gps, bpm.geofence", "aucun"),
    "altairChart": ("bpm.card, bpm.grid", "bpm.plotlyChart, bpm.lineChart", "Graphique simple — utiliser bpm.lineChart/barChart"),
    "barcode": ("bpm.card, bpm.table, bpm.filePreview", "bpm.qrCode, bpm.nfcBadge", "URL ou vCard — utiliser bpm.qrCode"),
    "qrCode": ("bpm.card, bpm.modal, bpm.filePreview", "bpm.barcode, bpm.nfcBadge", "Code produit numérique court — utiliser bpm.barcode"),
    "nfcBadge": ("bpm.card, bpm.table", "bpm.barcode, bpm.qrCode", "aucun"),
    "drawer": ("bpm.page, bpm.pageLayout", "bpm.modal, bpm.masterDetail, bpm.filterPanel", "Confirmation courte — utiliser bpm.modal/confirmModal"),
    "pagination": ("bpm.table, bpm.dataExplorer, bpm.card", "bpm.table, bpm.selectbox", "Liste défilante infinie — utiliser le scroll"),
    "filterPanel": ("bpm.drawer, bpm.card, bpm.dataExplorer", "bpm.dateRangePicker, bpm.selectbox, bpm.chip", "aucun"),
    "confirmModal": ("bpm.page, bpm.card", "bpm.modal, bpm.button", "Information non bloquante — utiliser bpm.toast"),
    "toast": ("bpm.page, bpm.pageLayout", "bpm.message, bpm.notificationCenter", "Action requise / confirmation — utiliser bpm.confirmModal"),
    "pageLayout": ("bpm.page", "bpm.sidebar, bpm.topNav, bpm.breadcrumb", "aucun"),
    "scrollContainer": ("bpm.card, bpm.drawer, bpm.modal", "bpm.table, bpm.list", "Toute la page défile déjà — inutile"),
    "labelValue": ("bpm.card, bpm.grid, bpm.masterDetail", "bpm.metric, bpm.badge", "Valeur chiffrée à juger — utiliser bpm.metric"),
    "spinnerDot": ("bpm.button, bpm.card, bpm.panel", "bpm.spinner, bpm.skeleton", "Chargement de zone de contenu — utiliser bpm.skeleton"),
    "timeline": ("bpm.card, bpm.drawer, bpm.page", "bpm.activityFeed, bpm.statusTracker", "Flux non daté en continu — utiliser bpm.activityFeed"),
    "statusTracker": ("bpm.card, bpm.masterDetail, bpm.page", "bpm.stepper, bpm.timeline, bpm.badge", "Saisie multi-étapes — utiliser bpm.stepper/wizardForm"),
    "orgChart": ("bpm.card, bpm.container, bpm.page", "bpm.treeview, bpm.flowDiagram", "Arbre de données/fichiers — utiliser bpm.treeview"),
    "masterDetail": ("bpm.page, bpm.pageLayout", "bpm.table, bpm.drawer, bpm.filterPanel", "Détail ponctuel — utiliser bpm.modal/drawer"),
    "wizardForm": ("bpm.modal, bpm.page, bpm.card", "bpm.stepper, bpm.input, bpm.button", "Formulaire court d'un seul tenant — utiliser bpm.modal"),
    "notificationCenter": ("bpm.topNav, bpm.drawer, bpm.page", "bpm.activityFeed, bpm.toast, bpm.badge", "Message éphémère unique — utiliser bpm.toast"),
    "filePreview": ("bpm.card, bpm.modal, bpm.masterDetail", "bpm.fileUploader, bpm.pdfViewer, bpm.image", "aucun"),
    "codeEditor": ("bpm.card, bpm.modal, bpm.tabs", "bpm.codeBlock, bpm.diffViewer", "Affichage en lecture seule — utiliser bpm.codeBlock"),
    "crud": ("bpm.page, bpm.pageLayout", "bpm.table, bpm.modal, bpm.filterPanel", "aucun"),
    "gps": ("bpm.card, bpm.modal, bpm.container", "bpm.map, bpm.geofence", "aucun"),
    "jsonEditor": ("bpm.card, bpm.modal, bpm.drawer", "bpm.jsonViewer, bpm.codeEditor", "Affichage non éditable — utiliser bpm.jsonViewer"),
    "dataExplorer": ("bpm.page, bpm.pageLayout, bpm.card", "bpm.table, bpm.filterPanel, bpm.pagination", "Petite liste statique — utiliser bpm.table"),
    "chatInterface": ("bpm.page, bpm.card, bpm.drawer", "bpm.promptInput, bpm.streamingText, bpm.markdown", "aucun"),
    "promptInput": ("bpm.chatInterface, bpm.card, bpm.modal", "bpm.textarea, bpm.button", "Saisie d'une ligne simple — utiliser bpm.input"),
    "streamingText": ("bpm.chatInterface, bpm.card", "bpm.markdown, bpm.promptInput", "Texte statique — utiliser bpm.markdown/text"),
    "diffViewer": ("bpm.card, bpm.modal, bpm.tabs", "bpm.codeBlock, bpm.codeEditor", "Code sans comparaison — utiliser bpm.codeBlock"),
    "modelSelector": ("bpm.promptInput, bpm.chatInterface, bpm.card", "bpm.selectbox", "Sélection générique — utiliser bpm.selectbox"),
    "table": ("bpm.card, bpm.page, bpm.dataExplorer", "bpm.pagination, bpm.filterPanel, bpm.badge", "Une seule paire clé/valeur — utiliser bpm.labelValue"),
}

# Composants dont le nom de fichier diffère de la clé
FILE = {"crud": "CrudPage", "gps": "Geofence"}


def file_for(key: str) -> Path | None:
    if key in FILE:
        p = COMP / f"{FILE[key]}.tsx"
        return p if p.exists() else None
    p = COMP / f"{key[0].upper()}{key[1:]}.tsx"
    if p.exists():
        return p
    # index insensible à la casse
    idx = {q.stem.lower(): q for q in COMP.glob("*.tsx")}
    return idx.get(key.lower())


def has_axis(src, axis):
    pats = {
        "parent": r"@parent\b|PARENT\s*:",
        "associated": r"@associated\b|ASSOCI(?:E|É|ATED)\s*:",
        "forbidden": r"@forbidden\b|INTERDIT\s*:|FORBIDDEN\s*:",
    }
    return bool(re.search(pats[axis], src))


def find_rich_block_end(src):
    """Indice de la fermeture '*/' du bloc JSDoc contenant @example (sinon dernier bloc avant export)."""
    best = None
    for m in re.finditer(r"/\*\*(.*?)\*/", src, re.DOTALL):
        body = m.group(1)
        if "@example" in body or "@param" in body or "@props" in body:
            best = m
    if best is None:
        # dernier bloc JSDoc tout court
        blocks = list(re.finditer(r"/\*\*(.*?)\*/", src, re.DOTALL))
        best = blocks[-1] if blocks else None
    return best


def main():
    changed = 0
    for key, (parent, assoc, forb) in REL.items():
        path = file_for(key)
        if not path:
            print(f"  SKIP {key}: fichier introuvable")
            continue
        src = path.read_text(encoding="utf-8")
        block = find_rich_block_end(src)
        if not block:
            print(f"  SKIP {key}: pas de bloc JSDoc")
            continue
        add = []
        if not has_axis(src, "parent"):
            add.append(f" * @parent {parent}")
        if not has_axis(src, "associated"):
            add.append(f" * @associated {assoc}")
        if not has_axis(src, "forbidden"):
            add.append(f" * @forbidden {forb}")
        if not add:
            continue
        # Position d'insertion : juste avant la ligne de fermeture ' */' du bloc
        close = src.rfind("*/", block.start(), block.end() + 2)
        # remonter au début de la ligne ' */'
        line_start = src.rfind("\n", 0, close) + 1
        insertion = "\n".join(add) + "\n"
        new = src[:line_start] + insertion + src[line_start:]
        path.write_text(new, encoding="utf-8")
        changed += 1
        print(f"  + {key}: {len(add)} axe(s)")
    print(f"\n{changed} fichiers modifiés")


if __name__ == "__main__":
    main()
