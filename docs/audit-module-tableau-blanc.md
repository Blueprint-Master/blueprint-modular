# Audit du module Tableau blanc 360° — Blueprint Modular

*Document de référence. Les propositions issues de l'audit ont été traitées dans le simulateur et la documentation ; le module n'utilise pas bpm.panel.*

---

## 1. FOND

- **Structure enrichie** : post-it avec `id`, `content`, `column`, `author` (objet `{ id, displayName }`), `createdAt` (ISO), `order` pour l'affichage dans la colonne. Optionnel : `boardId` / `sessionId` pour plusieurs tableaux.
- **Colonnes visuelles** : les 3 colonnes (Bien / À améliorer / Action) sont affichées avec en-têtes et couleurs distinctes (vert, orange, bleu) ; le contenu des cartes ne contient plus le préfixe de colonne.
- **Connexions documentées** : Tâches (carte Action → tâche), Workflow (transition / assignation), Notifications ciblées (nouveau post-it ou déplacement).

## 2. FORME

- **Pas de bpm.panel** : conteneur épuré (bordure, fond) pour occuper l'espace atelier ; pas d'icône ℹ.
- **En-tête** : « Zone idées (N post-it) » avec compteur.
- **Colonnes différenciées** : en-tête de colonne coloré + fond de zone distinct par colonne (Bien = vert pâle, À améliorer = orange pâle, Action = bleu pâle).
- **Zone de saisie séparée** : bloc « Nouveau post-it » au-dessus du tableau, avec label clair.
- **Sélecteur de colonne** : liste déroulante « Colonne : Bien / À améliorer / Action » dans le formulaire d'ajout.
- **Hauteur minimale** des cartes (min-h) pour une grille plus régulière.

## 3. FONCTIONNEMENT

- **Actions sur les cartes** : au survol, boutons Modifier, Supprimer, et « → Bien / → À améliorer / → Action » pour déplacer la carte vers une autre colonne.
- **Édition** : clic Modifier → zone de texte inline + Enregistrer / Annuler.
- **Ctrl+Entrée** : soumet le formulaire « Nouveau post-it ».
- **Validation** : envoi vide bloqué ; bouton Ajouter désactivé si le champ est vide.
- **Feedback à l'ajout** : surbrillance temporaire (bordure + fond) sur le post-it nouvellement ajouté + scroll doux pour le mettre en vue.

## 4. NON IMPLÉMENTÉ (hors périmètre court)

- **Drag & drop** : repositionnement par glisser-déposer (nécessiterait une lib ou HTML5 DnD dédiée).
- **Mode présentation** : plein écran sans formulaire (à prévoir en évolution).
- **Colonnes paramétrables** : les libellés et valeurs de colonnes restent fixés pour la rétro (Bien / À améliorer / Action) ; une évolution pourrait permettre des presets type SWOT, Kanban, etc.
- **Coordonnées (x, y)** : pas de position libre sur la toile ; l'ordre dans la colonne est géré par `order`.
