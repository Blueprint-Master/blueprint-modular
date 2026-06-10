#!/usr/bin/env python3
"""
add-jsdoc-loop.py
Boucle nocturne : ajoute JSDoc à chaque composant bpm manquant,
régénère llms.txt, vérifie gate vert, commit par composant.

Usage : python3 scripts/add-jsdoc-loop.py [--dry-run] [--start-at COMPONENT]
"""

import re
import sys
import json
import subprocess
from pathlib import Path

REPO = Path(__file__).parent.parent
COMP_DIR = REPO / "components" / "bpm"
PROGRESS_FILE = REPO / "docs" / "coverage-progress.json"

# Component descriptions (bpm key → description)
DESCRIPTIONS: dict[str, str] = {
    "accordion": "Accordéon (sections repliables).",
    "activityFeed": "Flux chronologique d'activités métier avec avatars initiaux et horodatages relatifs.",
    "addressInput": "Champ de saisie d'adresse avec autocomplétion.",
    "aiQueryBar": "Barre de requête IA (langage naturel → résultat structuré).",
    "alarmPanel": "Panneau d'alarmes industrielles (active, accusée, résolue).",
    "altairChart": "Graphique Altair / Vega-Lite.",
    "anomalyAlert": "Alerte d'anomalie avec valeur attendue vs réelle.",
    "approvalFlow": "Flux de validation multi-étapes (approve/reject par étape).",
    "areaChart": "Graphique en aires.",
    "assistantPanel": "Panneau assistant IA (chips, saisie, réponses).",
    "audio": "Lecteur audio HTML5.",
    "autocomplete": "Champ de saisie avec suggestions.",
    "avatar": "Avatar utilisateur (image, initiales ou icône).",
    "badge": "Badge / étiquette (success, warning, etc.).",
    "barChart": "Graphique en barres.",
    "barcode": "Code-barres (EAN-13, Code 128).",
    "breadcrumb": "Fil d'Ariane simple.",
    "breadcrumbs": "Fil d'Ariane avec items cliquables.",
    "button": "Bouton d'action (primary, secondary, outline, ghost, destructive).",
    "caption": "Légende ou texte secondaire.",
    "card": "Carte avec titre et contenu.",
    "changelog": "Journal des modifications avec catégories et versions.",
    "chatInterface": "Interface de chat (messages, saisie, streaming).",
    "checkbox": "Case à cocher.",
    "chip": "Pastille / chip (tag supprimable ou non).",
    "codeBlock": "Bloc de code avec syntaxe colorée et bouton Copier.",
    "codeEditor": "Éditeur de code (textarea avec valeur, onChange, readOnly).",
    "colorPicker": "Sélecteur de couleur.",
    "column": "Mise en page multi-colonnes responsive.",
    "commandPalette": "Palette de commandes modale (fuzzy search, clavier, Cmd+K).",
    "commentThread": "Fil de commentaires avec réponses et avatars.",
    "comparison": "Tableau de comparaison multi-items.",
    "confirmModal": "Modal de confirmation pour actions destructives (danger, warning, info).",
    "container": "Conteneur avec titre optionnel.",
    "contextMenu": "Menu contextuel (clic droit ou clic bouton).",
    "crud": "Page CRUD générique (liste, formulaire, colonnes, endpoint REST).",
    "dataExplorer": "Explorateur de données unifié (classique ou analytics).",
    "dateInput": "Sélecteur de date.",
    "dateRangePicker": "Sélecteur de plage de dates.",
    "decisionTree": "Arbre de décision interactif (questions, actions, résultats).",
    "diffViewer": "Visualisation de diff texte/code (split ou unified).",
    "divider": "Séparateur horizontal avec label optionnel.",
    "drawer": "Tiroir / panneau latéral (détail, formulaire, filtres).",
    "drillDown": "Navigation drill-down multi-niveaux dans des données hiérarchiques.",
    "emailComposer": "Composeur d'email (To, CC, objet, corps riche).",
    "empty": "État vide minimal (icône + message).",
    "emptyState": "État vide illustré (titre, description, action).",
    "expander": "Bloc repliable avec titre.",
    "exportButton": "Bouton d'export de données (CSV, JSON, Excel).",
    "fab": "Bouton d'action flottant (FAB).",
    "filePreview": "Aperçu de fichier (image, PDF, texte/code).",
    "fileUploader": "Upload de fichier(s) par glisser-déposer ou sélection.",
    "filterPanel": "Panneau de filtres (select, multiselect, daterange, text, toggle).",
    "flowDiagram": "Diagramme d'états et transitions interactif (SVG).",
    "funnelChart": "Graphique en entonnoir (tunnel de conversion).",
    "gantt": "Diagramme de Gantt (tâches, jalons, dépendances).",
    "geofence": "Carte interactive avec zones géographiques (geofences).",
    "gps": "Affichage ou sélection de position GPS.",
    "grid": "Grille responsive avec espacement configurable.",
    "groupedList": "Liste groupée par clé avec en-têtes de groupe.",
    "heatmap": "Carte de chaleur (matrice de valeurs colorisée).",
    "highlightBox": "Carte avec barre latérale (numéro + label) et contenu structuré.",
    "html": "Contenu HTML brut (iframe sandboxée).",
    "image": "Image avec alt, dimensions et object-fit.",
    "inlineEdit": "Édition inline d'un texte (clic pour éditer, Entrée pour valider).",
    "input": "Champ texte une ligne.",
    "invoiceTemplate": "Modèle de facture (émetteur, client, lignes, total).",
    "jsonEditor": "Éditeur JSON avec validation et formatage.",
    "jsonViewer": "Affichage JSON formaté et repliable.",
    "labelValue": "Paire label / valeur (orientation, taille, copiable).",
    "lineChart": "Graphique en courbes.",
    "liveChart": "Graphique en temps réel (mise à jour continue).",
    "liveGauge": "Jauge en temps réel (valeur, min, max).",
    "loadingBar": "Barre de chargement (sweep, blocks, iso, stacked, arc, dots).",
    "machineStatus": "Statut machine industrielle (état, métriques).",
    "mapView": "Carte interactive Leaflet (OpenStreetMap).",
    "map": "Carte (OpenStreetMap iframe).",
    "markdown": "Rendu Markdown sécurisé.",
    "masterDetail": "Vue liste + détail responsive (recherche, mobile).",
    "message": "Bandeau info/success/warning/error.",
    "metricRow": "Ligne de métriques (conteneur pour plusieurs bpm.metric).",
    "modal": "Fenêtre modale.",
    "modelSelector": "Sélecteur de modèle IA (par fournisseur, capacités).",
    "nfcBadge": "Badge NFC (statut Scannable, Programmé, etc.).",
    "notificationCenter": "Centre de notifications (liste, marquage, suppression).",
    "numberInput": "Champ numérique min/max/step.",
    "offlineIndicator": "Indicateur de mode hors-ligne.",
    "orgChart": "Organigramme hiérarchique HTML/CSS (repliable).",
    "pageLayout": "Layout avec sidebar repliable, titre et zone de contenu.",
    "pagination": "Pagination (page, taille, total).",
    "panel": "Panneau informatif (info, success, warning, error).",
    "pdfViewer": "Visualiseur PDF (iframe).",
    "pivotTable": "Tableau croisé dynamique (pivot).",
    "plcConnector": "Connecteur PLC (statut de connexion automate).",
    "plotlyChart": "Graphique Plotly universel (bar, line, pie, scatter…).",
    "popover": "Bulle de contenu au clic ou au survol.",
    "predictiveChart": "Graphique avec prédiction (historique + prévu).",
    "printLayout": "Mise en page optimisée pour l'impression.",
    "progress": "Barre de progression.",
    "progressRing": "Anneau de progression circulaire.",
    "promptInput": "Champ de saisie pour prompt IA (auto-resize, Cmd+Enter).",
    "qrCode": "QR Code (URL, vCard, texte libre).",
    "radarChart": "Graphique radar (araignée) multi-axes.",
    "radioGroup": "Groupe de boutons radio.",
    "rating": "Notation par étoiles.",
    "relationGraph": "Graphe de relations interactif (nœuds et arêtes).",
    "reportPage": "Page de rapport structuré (titre, sections, contenu).",
    "richTextEditor": "Éditeur de texte riche (WYSIWYG).",
    "routePlanner": "Planificateur d'itinéraire (arrêts, distances).",
    "scatterChart": "Graphique en nuage de points.",
    "scrollContainer": "Conteneur avec défilement interne (hauteur max).",
    "scheduler": "Planificateur / agenda (semaine, jour, mois).",
    "sensorGrid": "Grille de capteurs industriels (valeur, seuil, état).",
    "signaturePad": "Pad de signature électronique (dessin à la main).",
    "skeleton": "Placeholder de chargement (skeleton screen).",
    "slider": "Curseur min/max/step.",
    "sparkline": "Mini-graphique sparkline (inline).",
    "splitView": "Vue divisée côte-à-côte (deux panneaux redimensionnables).",
    "spinner": "Indicateur de chargement (roue).",
    "spinnerDot": "Indicateur de chargement (points pulsants).",
    "stateMachine": "Visualiseur de machine à états finis.",
    "statusBox": "Boîte de statut (success, warning, error, info).",
    "statusTracker": "Suivi de statut en étapes (completed/current/pending/error).",
    "stepper": "Progression multi-étapes (horizontal/vertical).",
    "streamingText": "Affichage de texte en flux (curseur animé, Markdown optionnel).",
    "suggestionCard": "Carte de suggestion (titre, description, actions).",
    "table": "Tableau triable avec colonnes configurables.",
    "tabs": "Onglets pour organiser le contenu.",
    "text": "Texte simple (niveau corps).",
    "textarea": "Zone de texte multiligne.",
    "theme": "Bascule thème clair / sombre.",
    "timeInput": "Saisie de l'heure.",
    "timeline": "Frise chronologique (événements ISO, groupement par date).",
    "title": "Titre h1 minimal.",
    "title1": "Titre niveau 1.",
    "title2": "Titre niveau 2.",
    "title3": "Titre niveau 3.",
    "title4": "Titre niveau 4.",
    "titleBpm": "Titre bpm (alias bpm.title, niveaux 1 à 4).",
    "toast": "Notification éphémère (success, error, info, warning).",
    "toggle": "Interrupteur on/off.",
    "tooltip": "Info-bulle au survol.",
    "topNav": "Barre de navigation supérieure (titre + liens).",
    "tour": "Visite guidée interactive (étapes et popups).",
    "transition": "Animation de transition entre états.",
    "treeview": "Arbre de nœuds repliables et sélectionnables.",
    "treemap": "Carte arborescente (treemap) pour données hiérarchiques.",
    "video": "Lecteur vidéo HTML5.",
    "waterfall": "Graphique en cascade (waterfall).",
    "wizardForm": "Formulaire multi-étapes avec stepper et validation.",
}

ALIAS_MAP = {
    "titleBpm": "Title", "title1": "Title", "title2": "Title",
    "title3": "Title", "title4": "Title",
    "crud": "CrudPage", "selectbox": "Selectbox", "nfcBadge": "NfcBadge",
    "qrCode": "QRCode", "fab": "FAB", "html": "Html", "empty": "Empty",
    "aiQueryBar": "AIQueryBar", "plcConnector": "PLCConnector",
}

SKIP_KEYS = {"page", "chat", "toast"}  # defined locally in bpm.tsx or special


def run(cmd: str, cwd=REPO) -> tuple[bool, str]:
    r = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    return r.returncode == 0, r.stdout + r.stderr


def get_file_stem(key: str) -> str:
    return ALIAS_MAP.get(key, key[0].upper() + key[1:])


def has_jsdoc_before_props(source: str) -> bool:
    """Check if there's a JSDoc comment immediately before the Props interface/type."""
    iface_m = re.search(r"export\s+(?:interface|type)\s+\w+Props\b", source)
    if not iface_m:
        return False
    before = source[:iface_m.start()]
    return bool(re.search(r"/\*\*(.+?)\*/\s*$", before, re.DOTALL))


def add_jsdoc(source: str, bpm_key: str, description: str) -> str:
    """Insert JSDoc immediately before the Props interface/type declaration."""
    iface_m = re.search(r"export\s+(?:interface|type)\s+\w+Props\b", source)
    if not iface_m:
        return source
    pos = iface_m.start()
    jsdoc = f"/**\n * @component bpm.{bpm_key}\n * @description {description}\n */\n"
    return source[:pos] + jsdoc + source[pos:]


def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    return {"components": [], "failures": [], "generated": "2026-06-10"}


def save_progress(progress: dict):
    PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2, ensure_ascii=False), encoding="utf-8")


def get_barrel_keys() -> list[str]:
    from pathlib import Path
    bpm_tsx = REPO / "packages/core/src/bpm.tsx"
    src = bpm_tsx.read_text(encoding="utf-8", errors="ignore")
    keys = []
    for m in re.finditer(r"^\s+(\w+):\s*wrap(?:<[^>]+>)?\s*\(", src, re.MULTILINE):
        keys.append(m.group(1))
    for special in ["spinner", "tabs", "title", "chat", "page"]:
        if special not in keys:
            keys.append(special)
    return sorted(set(keys))


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--start-at", default="")
    parser.add_argument("--only", default="", help="Comma-separated list of keys to process")
    args = parser.parse_args()

    barrel_keys = get_barrel_keys()
    if args.only:
        only_set = set(args.only.split(","))
        barrel_keys = [k for k in barrel_keys if k in only_set]

    progress = load_progress()
    done_set = {c["component"] for c in progress.get("components", []) if c.get("status") == "done"}
    failure_set = {c["component"] for c in progress.get("failures", [])}

    started = not bool(args.start_at)
    processed = 0
    failures = 0
    consecutive_failures = 0

    # Track processed files to avoid duplicate commits for aliases
    processed_files: set[str] = set()

    for key in barrel_keys:
        if not started:
            if key == args.start_at:
                started = True
            else:
                continue

        if key in done_set:
            print(f"  [SKIP-DONE] bpm.{key}")
            continue

        if key in SKIP_KEYS:
            print(f"  [SKIP-SPECIAL] bpm.{key} — handled in bpm.tsx")
            continue

        if consecutive_failures >= 5:
            print("  [ABORT] 5 consecutive failures — stopping loop")
            break

        stem = get_file_stem(key)
        tsx_path = COMP_DIR / f"{stem}.tsx"

        if not tsx_path.exists():
            print(f"  [SKIP-NOFILE] bpm.{key} → {stem}.tsx not found")
            continue

        source = tsx_path.read_text(encoding="utf-8", errors="ignore")

        # Check if already has JSDoc before Props
        if has_jsdoc_before_props(source):
            print(f"  [SKIP-HASJSDOC] bpm.{key} — JSDoc already present")
            done_set.add(key)
            progress["components"].append({"component": key, "file": f"{stem}.tsx", "status": "done"})
            save_progress(progress)
            continue

        # Check if we already processed this file (alias)
        if tsx_path.name in processed_files:
            print(f"  [SKIP-ALIAS] bpm.{key} — {stem}.tsx already committed for another key")
            done_set.add(key)
            progress["components"].append({"component": key, "file": f"{stem}.tsx", "status": "done_alias"})
            save_progress(progress)
            continue

        description = DESCRIPTIONS.get(key, f"Composant bpm.{key}.")
        print(f"  [PROCESS] bpm.{key} → {stem}.tsx")

        if args.dry_run:
            print(f"    Would add JSDoc: @description {description}")
            continue

        # Add JSDoc
        new_source = add_jsdoc(source, key, description)
        tsx_path.write_text(new_source, encoding="utf-8")

        # Regenerate llms.txt
        ok, out = run("python3 scripts/generate-llms-txt.py")
        if not ok:
            print(f"  [FAIL-GEN] bpm.{key} — generator failed")
            run(f"git checkout -- components/bpm/{stem}.tsx public/llms.txt")
            progress["failures"].append({"component": key, "reason": "generator failed"})
            save_progress(progress)
            consecutive_failures += 1
            failures += 1
            continue

        # Run gate (fast: just vitest + docs sync, skip full build for speed)
        ok, gate_out = run("node scripts/gate.cjs")
        if not ok:
            print(f"  [FAIL-GATE] bpm.{key} — gate RED")
            print(gate_out[-500:])
            run(f"git checkout -- components/bpm/{stem}.tsx public/llms.txt")
            progress["failures"].append({"component": key, "reason": "gate RED"})
            save_progress(progress)
            consecutive_failures += 1
            failures += 1
            continue

        # Commit
        ok, _ = run(
            f'git add components/bpm/{stem}.tsx public/llms.txt && '
            f'git commit -m "docs(jsdoc): {stem} — add JSDoc before Props\n\nhttps://claude.ai/code/session_01QTKPTsBddy6RzZUcyZrS7z"'
        )
        if ok:
            print(f"  [DONE] bpm.{key} committed")
            done_set.add(key)
            processed_files.add(tsx_path.name)
            progress["components"].append({"component": key, "file": f"{stem}.tsx", "status": "done"})
            save_progress(progress)
            processed += 1
            consecutive_failures = 0
        else:
            print(f"  [FAIL-COMMIT] bpm.{key} — commit failed")
            run(f"git checkout -- components/bpm/{stem}.tsx public/llms.txt")
            progress["failures"].append({"component": key, "reason": "commit failed"})
            save_progress(progress)
            consecutive_failures += 1
            failures += 1

    print(f"\n=== LOOP COMPLETE ===")
    print(f"Processed: {processed}, Failures: {failures}")
    save_progress(progress)


if __name__ == "__main__":
    main()
