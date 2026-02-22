# Paysage concurrentiel — ce que les concurrents ont et que Streamlit n’a pas nativement

Document de référence pour le positionnement et la roadmap Blueprint Modular (BPM).  
*Streamlit n’est plus mentionné dans la doc utilisateur ; ce fichier est à usage interne / stratégie.*

---

## Architecture & exécution

| Manque | Concurrents | Impact |
|--------|-------------|--------|
| **Réactivité granulaire** | Shiny, Dash, Panel | Streamlit réexécute tout le script à chaque interaction. Les concurrents ne re-rendent que les composants affectés — crucial pour apps complexes et gros jeux de données. |
| **Callbacks déclaratifs** | Dash | `@callback` avec Input, Output, State distincts : contrôle précis de ce qui déclenche quoi, sans re-run global. |
| **Programmation réactive par graphe de dépendances** | Shiny | Les composants se mettent à jour uniquement si leurs dépendances changent, sans intervention manuelle. |

---

## Layout & UI

| Manque | Concurrents | Impact |
|--------|-------------|--------|
| **Classes CSS sur les composants** | Shiny, Dash | Impossible d’ajouter des classes CSS directement sur un widget Streamlit. |
| **Layouts pixel-perfect / drag & drop** | Dash, Anvil | Dash : HTML/CSS natif dans les layouts. Anvil : builder visuel. |
| **Cards natives** | Shiny, Dash | Composant card avec header/body/footer, shadow, bordure. |
| **Navbar horizontale** | Shiny, Dash | Navigation en topbar, pas seulement sidebar. |
| **Grid layout configurable** | Panel, Dash | Grille responsive avec contrôle par cellule. |
| **Accordion** | Shiny, Dash | Comme expander mais multiple et imbriqué. |
| **Stepper / Wizard** | Dash, Anvil | Interface multi-étapes guidée. |
| **Drawer / Offcanvas** | Shiny | Panneau latéral glissant en overlay. |
| **Floating action button** | Dash | Bouton flottant en position absolue. |

---

## Composants données

| Manque | Concurrents | Impact |
|--------|-------------|--------|
| **DataTable avancée** | Dash DataTable | Tri multi-colonnes, filtrage inline, pagination serveur, édition cellule par cellule, export CSV/Excel natif, colonnes fixes. |
| **Pivot table** | Panel | Tableau croisé dynamique natif. |
| **Tree view / hiérarchie** | Dash | Affichage de données arborescentes. |
| **Timeline** | Dash, Gradio | Composant timeline natif. |
| **KPI card avec sparkline** | Dash Enterprise | Métrique + mini-graphique dans une seule carte. |

---

## Graphiques

| Manque | Concurrents | Impact |
|--------|-------------|--------|
| **Sélection interactive → données Python** | Dash | `selectedData`, `clickData`, `hoverData` dans les callbacks, sans contournement. |
| **Crossfiltering natif** | Panel, Dash | Sélection sur un graphique qui filtre automatiquement les autres. |
| **Gantt chart natif** | Dash | Diagramme de Gantt sans lib externe. |
| **Network graph natif** | Dash (cytoscape) | Graphes nœuds/liens interactifs. |
| **Sankey natif** | Dash | Diagramme de flux. |
| **Graphiques 3D natifs** | Dash | Surface 3D, scatter 3D sans contournement. |

---

## Formulaires & inputs

| Manque | Concurrents | Impact |
|--------|-------------|--------|
| **Validation formulaire côté Python** | Dash, Shiny | Validation champ par champ, messages d’erreur ciblés, sans re-run global. |
| **Input masqué / formaté** | Dash | Téléphone, IBAN, date masquée. |
| **Range date picker** | Shiny, Dash | Plage de dates en un seul composant. |
| **Autocomplete / combobox** | Dash, Panel | Input texte + suggestions (liste ou API). |
| **Rich text editor** | Dash | WYSIWYG (Quill, TipTap). |
| **Signature pad** | Dash | Zone de signature tactile/souris. |
| **Rating / stars** | Gradio, Dash | Composant étoiles natif. |
| **Kanban board** | Dash | Colonnes drag & drop. |

---

## Authentification & droits

| Manque | Concurrents | Impact |
|--------|-------------|--------|
| **Auth native complète** | Shiny, Dash Enterprise, Panel | Login/logout, sessions, rôles, permissions par page ou composant, sans service tiers. |
| **SSO / SAML / LDAP / AD** | Dash Enterprise, Panel | Intégration entreprise native. |
| **Contrôle d’accès par composant** | Shiny, Dash | Masquer/désactiver un widget selon le rôle, pas seulement la page. |
| **Audit log** | Dash Enterprise | Traçabilité des actions utilisateur. |

---

## Performance & scalabilité

| Manque | Concurrents | Impact |
|--------|-------------|--------|
| **Mise à jour partielle sans re-run** | Shiny, Dash, Panel | Essentiel pour gros volumes. |
| **Pagination serveur native** | Dash DataTable | Ne charger que les lignes visibles. |
| **WebSocket multi-utilisateurs, état partagé** | Panel (Bokeh server) | État partagé entre sessions. |
| **Job queue intégrée** | Dash Enterprise | Tâches longues en arrière-plan + suivi. |
| **Horizontal scaling natif** | Dash Enterprise, Panel/K8s | Load balancing multi-instances. |

---

## Déploiement & intégration

| Manque | Concurrents | Impact |
|--------|-------------|--------|
| **Embedding dans une page HTML** | Gradio, Dash, Panel | Intégration comme widget dans un site tiers sans iframe. |
| **Jupyter notebook natif** | Panel, Gradio, Voilà | Exécution et dev directement dans un notebook. |
| **REST API auto-générée** | Gradio | Chaque interface expose une API REST automatiquement. |
| **Export snapshot** | Dash Enterprise | Capture d’état partageable par lien. |
| **Theming avancé via config** | Shiny, Dash | Thème complet (couleurs, polices, spacing) sans CSS custom. |

---

## Ce que BPM peut apporter en propre

*Ni Streamlit ni ses concurrents ne font tout cela nativement :*

1. **Réactivité granulaire + syntaxe simple** — le meilleur des deux mondes.
2. **Design system cohérent (`bpm.*`)** — Streamlit n’a pas de design system ; Dash reste générique.
3. **Registry `$` et `@`** — aucun framework ne fait ça nativement.
4. **Layout piloté par config (`app.config.js`)** — dupliquer une app en ne changeant qu’un fichier de config.

---

*Dernière mise à jour : référence pour la roadmap et le positionnement BPM.*
