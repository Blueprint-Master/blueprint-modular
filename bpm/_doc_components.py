"""
Overlay de CURATION du catalogue BPM (catégorie + description courte).

⚠️ CE FICHIER N'EST PLUS L'AUTORITÉ DU CATALOGUE.
La liste des composants est désormais dérivée du barrel TypeScript
(packages/core/src/bpm.tsx) par scripts/generate-bpm-components-json.py —
exactement comme public/llms.txt. Un composant exporté sur bpm.* apparaît
automatiquement au catalogue, même s'il est absent de ce fichier.

Rôle restant : enrichissement curé, sans pouvoir de filtrage.
  - COMPONENT_DOC    : taxonomie (catégorie parmi les 10 familles) + description
      courte des composants historiques. Conservé verbatim et dans l'ordre
      (définit la navigation prev/next des pages docs).
  - EXTRA_CATEGORIES : catégorie des composants nouvellement exposés par le
      barrel et qui n'ont pas (encore) d'entrée dans COMPONENT_DOC. Leur
      description provient de llms.txt (déjà dérivée du TS). Un composant
      absent des deux reçoit la catégorie de repli "Utilitaires".

La couche sémantique (frame Ω, guidance) reste dans lib/semantics/.
Run : python scripts/generate-bpm-components-json.py
"""
from typing import TypedDict


class ComponentDoc(TypedDict):
    slug: str
    name: str
    description: str
    category: str


# Order defines prev/next navigation in docs. Categories grouped for display.
COMPONENT_DOC: list[ComponentDoc] = [
    # Affichage de données
    {"slug": "metric", "name": "bpm.metric", "description": "Métrique avec valeur, label et delta.", "category": "Affichage de données"},
    {"slug": "table", "name": "bpm.table", "description": "Tableau triable avec lignes alternées.", "category": "Affichage de données"},
    {"slug": "title", "name": "bpm.title", "description": "Titre niveaux 1 à 4.", "category": "Affichage de données"},
    {"slug": "title1", "name": "bpm.title1", "description": "Titre niveau 1.", "category": "Affichage de données"},
    {"slug": "title2", "name": "bpm.title2", "description": "Titre niveau 2.", "category": "Affichage de données"},
    {"slug": "title3", "name": "bpm.title3", "description": "Titre niveau 3.", "category": "Affichage de données"},
    {"slug": "text", "name": "bpm.text", "description": "Texte simple (niveau corps).", "category": "Affichage de données"},
    {"slug": "caption", "name": "bpm.caption", "description": "Légende ou texte secondaire.", "category": "Affichage de données"},
    {"slug": "badge", "name": "bpm.badge", "description": "Badge / étiquette (success, warning, etc.).", "category": "Affichage de données"},
    {"slug": "progress", "name": "bpm.progress", "description": "Barre de progression.", "category": "Affichage de données"},
    {"slug": "skeleton", "name": "bpm.skeleton", "description": "Placeholder de chargement (skeleton).", "category": "Affichage de données"},
    {"slug": "jsonviewer", "name": "bpm.jsonViewer", "description": "Affichage JSON formaté et repliable.", "category": "Affichage de données"},
    {"slug": "avatar", "name": "bpm.avatar", "description": "Avatar utilisateur.", "category": "Affichage de données"},
    # Mise en page
    {"slug": "panel", "name": "bpm.panel", "description": "Panneau informatif (info, success, warning, error).", "category": "Mise en page"},
    {"slug": "tabs", "name": "bpm.tabs", "description": "Onglets pour organiser le contenu.", "category": "Mise en page"},
    {"slug": "expander", "name": "bpm.expander", "description": "Bloc repliable.", "category": "Mise en page"},
    {"slug": "accordion", "name": "bpm.accordion", "description": "Accordéon (sections repliables).", "category": "Mise en page"},
    {"slug": "card", "name": "bpm.card", "description": "Carte avec titre et contenu.", "category": "Mise en page"},
    {"slug": "highlightbox", "name": "bpm.highlightBox", "description": "Carte avec barre latérale (numéro + label) et contenu structuré (titre, moment, RTB, cible).", "category": "Mise en page"},
    {"slug": "divider", "name": "bpm.divider", "description": "Séparateur horizontal.", "category": "Mise en page"},
    {"slug": "grid", "name": "bpm.grid", "description": "Grille responsive.", "category": "Mise en page"},
    {"slug": "column", "name": "bpm.column", "description": "Diviser la page en 1, 2, 3 ou plus colonnes.", "category": "Mise en page"},
    {"slug": "emptystate", "name": "bpm.emptyState", "description": "État vide (aucune donnée).", "category": "Mise en page"},
    {"slug": "container", "name": "bpm.container", "description": "Conteneur avec titre optionnel.", "category": "Mise en page"},
    {"slug": "empty", "name": "bpm.empty", "description": "État vide minimal (icône + message).", "category": "Mise en page"},
    {"slug": "popover", "name": "bpm.popover", "description": "Contenu au clic ou au survol (popover).", "category": "Mise en page"},
    # Interaction
    {"slug": "button", "name": "bpm.button", "description": "Bouton d'action (primary, secondary, outline).", "category": "Interaction"},
    {"slug": "theme", "name": "bpm.theme", "description": "Bascule thème clair / sombre.", "category": "Interaction"},
    {"slug": "selectbox", "name": "bpm.selectbox", "description": "Liste déroulante.", "category": "Interaction"},
    {"slug": "numberinput", "name": "bpm.numberInput", "description": "Champ numérique min/max/step.", "category": "Interaction"},
    {"slug": "input", "name": "bpm.input", "description": "Champ texte une ligne.", "category": "Interaction"},
    {"slug": "textarea", "name": "bpm.textarea", "description": "Zone de texte multiligne.", "category": "Interaction"},
    {"slug": "checkbox", "name": "bpm.checkbox", "description": "Case à cocher.", "category": "Interaction"},
    {"slug": "radiogroup", "name": "bpm.radioGroup", "description": "Groupe de boutons radio.", "category": "Interaction"},
    {"slug": "slider", "name": "bpm.slider", "description": "Curseur min/max/step.", "category": "Interaction"},
    {"slug": "dateinput", "name": "bpm.dateInput", "description": "Sélecteur de date.", "category": "Interaction"},
    {"slug": "daterangepicker", "name": "bpm.dateRangePicker", "description": "Sélecteur de plage de dates.", "category": "Interaction"},
    {"slug": "timeinput", "name": "bpm.timeInput", "description": "Saisie de l'heure.", "category": "Interaction"},
    {"slug": "rating", "name": "bpm.rating", "description": "Notation par étoiles.", "category": "Interaction"},
    {"slug": "fileuploader", "name": "bpm.fileUploader", "description": "Upload de fichier(s).", "category": "Interaction"},
    {"slug": "colorpicker", "name": "bpm.colorPicker", "description": "Sélecteur de couleur.", "category": "Interaction"},
    {"slug": "chip", "name": "bpm.chip", "description": "Pastille / chip.", "category": "Interaction"},
    # Feedback
    {"slug": "message", "name": "bpm.message", "description": "Bandeau info/success/warning/error.", "category": "Feedback"},
    {"slug": "spinner", "name": "bpm.spinner", "description": "Indicateur de chargement.", "category": "Feedback"},
    {"slug": "loadingbar", "name": "bpm.loadingBar", "description": "Barre de chargement (sweep, blocks, iso, stacked, arc, dots).", "category": "Feedback"},
    {"slug": "tooltip", "name": "bpm.tooltip", "description": "Info-bulle au survol.", "category": "Feedback"},
    {"slug": "statusbox", "name": "bpm.statusBox", "description": "Boîte de statut (success, warning, error, info).", "category": "Feedback"},
    {"slug": "anomalyalert", "name": "bpm.anomalyAlert", "description": "Alerte d'anomalie : valeur attendue vs réelle (severity info/warning/critical).", "category": "Feedback"},
    # Navigation & structure
    {"slug": "breadcrumb", "name": "bpm.breadcrumb", "description": "Fil d'Ariane.", "category": "Navigation"},
    {"slug": "stepper", "name": "bpm.stepper", "description": "Progression multi-étapes (horizontal/vertical, tailles sm/md/lg).", "category": "Navigation"},
    # Média
    {"slug": "audio", "name": "bpm.audio", "description": "Lecteur audio.", "category": "Média"},
    {"slug": "video", "name": "bpm.video", "description": "Lecteur vidéo.", "category": "Média"},
    {"slug": "html", "name": "bpm.html", "description": "Contenu HTML brut (iframe).", "category": "Média"},
    # Graphiques
    {"slug": "linechart", "name": "bpm.lineChart", "description": "Graphique en courbes.", "category": "Graphiques"},
    {"slug": "barchart", "name": "bpm.barChart", "description": "Graphique en barres.", "category": "Graphiques"},
    {"slug": "areachart", "name": "bpm.areaChart", "description": "Graphique en aires.", "category": "Graphiques"},
    {"slug": "scatterchart", "name": "bpm.scatterChart", "description": "Graphique en nuage de points.", "category": "Graphiques"},
    # Utilitaires
    {"slug": "modal", "name": "bpm.modal", "description": "Fenêtre modale.", "category": "Utilitaires"},
    {"slug": "codeblock", "name": "bpm.codeBlock", "description": "Bloc de code avec Copier.", "category": "Utilitaires"},
    # Navigation (suite)
    {"slug": "topnav", "name": "bpm.topNav", "description": "Barre de navigation supérieure (titre + liens).", "category": "Navigation"},
    {"slug": "fab", "name": "bpm.fab", "description": "Bouton d'action flottant (FAB).", "category": "Interaction"},
    {"slug": "treeview", "name": "bpm.treeview", "description": "Arbre de nœuds repliables et sélectionnables.", "category": "Affichage de données"},
    {"slug": "timeline", "name": "bpm.timeline", "description": "Frise chronologique (événements ISO, groupement par date, fil vertical).", "category": "Affichage de données"},
    {"slug": "flowdiagram", "name": "bpm.flowDiagram", "description": "Diagramme d'états et transitions interactif (SVG).", "category": "Affichage de données"},
    {"slug": "statustracker", "name": "bpm.statusTracker", "description": "Suivi de statut réel (barre, étapes completed/current/pending/error).", "category": "Affichage de données"},
    {"slug": "activityfeed", "name": "bpm.activityFeed", "description": "Fil d'activité avec avatars et dates relatives.", "category": "Affichage de données"},
    {"slug": "livegauge", "name": "bpm.liveGauge", "description": "Jauge demi-cercle à seuils (warning/critical) avec aiguille.", "category": "Affichage de données"},
    {"slug": "approvalflow", "name": "bpm.approvalFlow", "description": "Flux de validation multi-étapes (approuvé / en attente / rejeté).", "category": "Affichage de données"},
    {"slug": "orgchart", "name": "bpm.orgChart", "description": "Organigramme hiérarchique HTML/CSS (repliable).", "category": "Mise en page"},
    {"slug": "masterdetail", "name": "bpm.masterDetail", "description": "Vue liste + détail responsive (recherche, mobile).", "category": "Mise en page"},
    {"slug": "wizardform", "name": "bpm.wizardForm", "description": "Formulaire multi-étapes avec stepper et validation.", "category": "Interaction"},
    {"slug": "commandpalette", "name": "bpm.commandPalette", "description": "Palette de commandes modale (fuzzy, clavier, Cmd+K).", "category": "Navigation"},
    {"slug": "image", "name": "bpm.image", "description": "Image avec alt, dimensions et object-fit.", "category": "Média"},
    {"slug": "pdfviewer", "name": "bpm.pdfViewer", "description": "Visualiseur PDF (iframe).", "category": "Média"},
    {"slug": "autocomplete", "name": "bpm.autocomplete", "description": "Champ de saisie avec suggestions.", "category": "Interaction"},
    {"slug": "plotlychart", "name": "bpm.plotlyChart", "description": "Graphique Plotly (iframe ou placeholder).", "category": "Graphiques"},
    {"slug": "map", "name": "bpm.map", "description": "Carte (OpenStreetMap iframe).", "category": "Média"},
    {"slug": "altairchart", "name": "bpm.altairChart", "description": "Graphique Altair / Vega-Lite.", "category": "Graphiques"},
    # Identification & traçabilité
    {"slug": "barcode", "name": "bpm.barcode", "description": "Code-barres (EAN-13, Code 128).", "category": "Identification & traçabilité"},
    {"slug": "qrcode", "name": "bpm.qrCode", "description": "QR Code (URL, vCard, texte).", "category": "Identification & traçabilité"},
    {"slug": "nfcbadge", "name": "bpm.nfcBadge", "description": "Badge / tag NFC (statut Scannable, etc.).", "category": "Identification & traçabilité"},
    # Mise en page / Feedback
    {"slug": "drawer", "name": "bpm.drawer", "description": "Tiroir / panneau latéral (détail, formulaire, filtres).", "category": "Mise en page"},
    {"slug": "pagination", "name": "bpm.pagination", "description": "Pagination (page, taille, total) pour listes et tableaux.", "category": "Affichage de données"},
    # Composants ajoutés (alignement barrel)
    {"slug": "filterpanel", "name": "bpm.filterPanel", "description": "Panneau de filtres (select, multiselect, daterange, text, toggle).", "category": "Interaction"},
    {"slug": "confirmmodal", "name": "bpm.confirmModal", "description": "Modal de confirmation pour actions destructives (danger, warning, info).", "category": "Mise en page"},
    {"slug": "toast", "name": "bpm.toast", "description": "Notification éphémère (success, error, info, warning).", "category": "Feedback"},
    {"slug": "pagelayout", "name": "bpm.pageLayout", "description": "Layout avec sidebar repliable, titre et zone de contenu.", "category": "Mise en page"},
    {"slug": "scrollcontainer", "name": "bpm.scrollContainer", "description": "Conteneur avec défilement interne (hauteur max, scrollbar optionnelle).", "category": "Mise en page"},
    {"slug": "labelvalue", "name": "bpm.labelValue", "description": "Paire label / valeur (orientation, taille, copyable).", "category": "Affichage de données"},
    {"slug": "spinnerdot", "name": "bpm.spinnerDot", "description": "Indicateur de chargement (points).", "category": "Feedback"},
    {"slug": "titlebpm", "name": "bpm.titleBpm", "description": "Titre (alias bpm.title, niveaux 1 à 4).", "category": "Affichage de données"},
    {"slug": "markdown", "name": "bpm.markdown", "description": "Rendu Markdown sécurisé.", "category": "Affichage de données"},
    {"slug": "codeeditor", "name": "bpm.codeEditor", "description": "Éditeur de code (textarea avec valeur, onChange, readOnly).", "category": "Utilitaires"},
    {"slug": "crud", "name": "bpm.crud", "description": "Page CRUD (liste, formulaire, colonnes, champs, endpoint).", "category": "Utilitaires"},
    {"slug": "gps", "name": "bpm.gps", "description": "Affichage ou sélection de position GPS (carte, picker).", "category": "Média"},
    {"slug": "jsoneditor", "name": "bpm.jsonEditor", "description": "Éditeur JSON avec validation et formatage.", "category": "Utilitaires"},
    {"slug": "notificationcenter", "name": "bpm.notificationCenter", "description": "Liste de notifications (lu/non lu, marquage, suppression).", "category": "Feedback"},
    {"slug": "filepreview", "name": "bpm.filePreview", "description": "Aperçu de fichier (image, PDF, texte/code).", "category": "Média"},
    # IA & Spécialisés
    {"slug": "dataexplorer", "name": "bpm.dataExplorer", "description": "Explorateur de données (table, recherche, tri, pagination, export CSV).", "category": "IA & Spécialisés"},
    {"slug": "chatinterface", "name": "bpm.chatInterface", "description": "Interface de chat (messages, saisie, streaming).", "category": "IA & Spécialisés"},
    {"slug": "promptinput", "name": "bpm.promptInput", "description": "Champ de saisie pour prompt IA (auto-resize, Cmd+Enter, tokens).", "category": "IA & Spécialisés"},
    {"slug": "streamingtext", "name": "bpm.streamingText", "description": "Affichage de texte en flux (curseur, option Markdown).", "category": "IA & Spécialisés"},
    {"slug": "diffviewer", "name": "bpm.diffViewer", "description": "Visualisation de diff texte/code (split ou unified).", "category": "IA & Spécialisés"},
    {"slug": "modelselector", "name": "bpm.modelSelector", "description": "Sélecteur de modèle IA (par fournisseur, capacités).", "category": "IA & Spécialisés"},
]


# Catégorie (parmi les 10 familles existantes) des composants exposés par le
# barrel mais absents de COMPONENT_DOC. Pure taxonomie : ne filtre rien, ne
# gate pas la liste. Clé = slug (nom bpm.* en minuscules). Un slug absent ici
# ET de COMPONENT_DOC reçoit la catégorie de repli "Utilitaires".
EXTRA_CATEGORIES: dict[str, str] = {
    "addressinput":     "Interaction",
    "aiquerybar":       "IA & Spécialisés",
    "alarmpanel":       "Feedback",
    "assistantpanel":   "IA & Spécialisés",
    "breadcrumbs":      "Navigation",
    "changelog":        "Affichage de données",
    "chat":             "IA & Spécialisés",
    "commentthread":    "Affichage de données",
    "comparison":       "Affichage de données",
    "contextmenu":      "Interaction",
    "decisiontree":     "Affichage de données",
    "drilldown":        "Affichage de données",
    "emailcomposer":    "Interaction",
    "exportbutton":     "Interaction",
    "funnelchart":      "Graphiques",
    "gantt":            "Affichage de données",
    "geofence":         "Média",
    "groupedlist":      "Affichage de données",
    "heatmap":          "Graphiques",
    "inlineedit":       "Interaction",
    "invoicetemplate":  "Utilitaires",
    "livechart":        "Graphiques",
    "machinestatus":    "IA & Spécialisés",
    "mapview":          "Média",
    "metricrow":        "Affichage de données",
    "offlineindicator": "Feedback",
    "page":             "Mise en page",
    "pivottable":       "Affichage de données",
    "plcconnector":     "IA & Spécialisés",
    "predictivechart":  "Graphiques",
    "printlayout":      "Mise en page",
    "progressring":     "Feedback",
    "radarchart":       "Graphiques",
    "relationgraph":    "Affichage de données",
    "reportpage":       "Mise en page",
    "richtexteditor":   "Interaction",
    "routeplanner":     "Média",
    "scheduler":        "Affichage de données",
    "sensorgrid":       "IA & Spécialisés",
    "signaturepad":     "Interaction",
    "sparkline":        "Graphiques",
    "splitview":        "Mise en page",
    "statemachine":     "Affichage de données",
    "suggestioncard":   "IA & Spécialisés",
    "title4":           "Affichage de données",
    "toggle":           "Interaction",
    "tour":             "Navigation",
    "transition":       "Mise en page",
    "treemap":          "Graphiques",
    "waterfall":        "Graphiques",
}
