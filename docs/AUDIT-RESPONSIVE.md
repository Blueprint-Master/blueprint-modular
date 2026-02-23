# Audit responsive — Blueprint Modular

Rapport d’audit de la réactivité de l’application (app Next.js + composants BPM).

## Correctifs déjà appliqués

1. **Header (AppLayoutClient)**  
   - `px-3 sm:px-4` et `gap-2` pour éviter que le breadcrumb et la cloche se chevauchent sur petit écran.

2. **Main**  
   - `px-3 sm:px-4` pour un padding horizontal adapté au mobile.

3. **Dashboard — Accès rapide**  
   - Grille : `minmax(min(260px, 100%), 1fr)` pour éviter le défilement horizontal sur écrans &lt; 260px.

4. **Sandbox (globals.css)**  
   - Mobile (&lt; 768px) : padding preview 16px, controls 16px, bordure en haut au lieu de gauche.  
   - `.sandbox-code-header` : `flex-wrap` et `gap` pour que les boutons passent à la ligne si besoin.

5. **Tables de props (doc composants)**  
   - Section parente des `table.props-table` : `overflow-x: auto` (via `:has()`).  
   - Table : `min-width: 320px` pour garder la lisibilité tout en permettant le scroll horizontal.

6. **Modal (bpm.Modal)**  
   - Backdrop : `p-4 sm:p-8` pour réduire les marges sur mobile.

7. **Doc pagination**  
   - `flex-wrap` et `gap` pour que les liens Précédent/Suivant ne débordent pas.

8. **Paramètres — liste des clés API**  
   - Lignes en `flex-wrap`, clé en `truncate`, bouton « Supprimer » en `w-full sm:w-auto` sur mobile.

## Points déjà corrects

- **Sidebar** : masquée sur mobile, barre de navigation en bas (`md:hidden` / `hidden md:flex`).  
- **Main** : `pb-20 md:pb-4` pour laisser la place à la barre mobile.  
- **Sandbox** : `grid-template-columns: 1fr` en &lt; 768px.  
- **Wiki** : `grid-template-columns: 1fr` et sidebar en bas sur mobile.  
- **Documents** : champ filtre `max-width: 100%`.  
- **Modules / Composants** : grilles en `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (ou `sm:grid-cols-2 lg:grid-cols-3`).  
- **NotificationBell** : détection mobile et overlay dédié.

## À surveiller ou améliorer plus tard

1. **Sidebar repliée (desktop)**  
   - La zone de contenu garde `md:ml-64` même quand la sidebar est en `w-16`. Adapter le `ml` en fonction de l’état replié nécessiterait de remonter l’état (contexte ou layout).

2. **bpm.Metric**  
   - `min-w-[140px]` : sur une rangée de métriques, risque de scroll horizontal sur tout petit écran. Envisager `min-w-0` avec `min-width` plus faible en media query si besoin.

3. **Formulaire Clés API (Paramètres)**  
   - Champs en `flex-wrap` ; sur très petit écran les `min-w-[140px]` / `min-w-[200px]` peuvent serrer. Les champs passent déjà à la ligne ; affiner les min-width en mobile si nécessaire.

4. **Tooltip (bpm.Tooltip)**  
   - `max-w-[380px]` : sur mobile, limiter à une largeur type `min(380px, calc(100vw - 24px))` pour éviter de dépasser l’écran (à faire dans le composant si besoin).

5. **Pages doc statiques (frontend/static)**  
   - Non auditées ici ; à vérifier séparément (viewport, grilles, tableaux).

## Résumé

- Les principaux points bloquants (grille dashboard, tables de props, header/main, modal, sandbox, paramètres) ont été traités.  
- Le reste est soit déjà responsive, soit à affiner selon l’usage (sidebar repliée, métriques, tooltips, formulaire clés API).
