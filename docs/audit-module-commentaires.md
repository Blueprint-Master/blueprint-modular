# Audit du module Commentaires 360° — Blueprint Modular

*Document de référence. Les propositions P1–P18 ont été traitées dans le simulateur et la documentation ; le module n'utilise pas bpm.panel.*

---

## 1. FOND

- **P1** — Structure enrichie : parentId, type (commentaire/annotation/décision/blocage), resolved, resolvedBy, resolvedAt, editedAt, attachments (optionnels).
- **P2** — Auteur structuré : `{ id, displayName, avatar? }` ; l'utilisateur courant voit son displayName avec indicateur « (vous) ».
- **P3** — Contexte entité : en-tête optionnel avec nom et lien de l'entité commentée (ex. « Document : Rapport Q4 »).

## 2. FORME

- **P4** — Textarea multi-lignes (placeholder « Ctrl+Entrée pour envoyer »).
- **P5** — Avatars/initiales colorés par auteur (couleur dérivée de l'id).
- **P6** — Ses propres commentaires : fond bleu très pâle, nom réel + « (vous) ».
- **P7** — Date : format « 25 févr. à 10h00 » ou « Il y a 2h » ; tooltip `title` avec date ISO.
- **P8** — Pas d'icône ℹ ; en-tête « Commentaires (N) » avec compteur.
- **P9** — Bouton Envoyer à droite du champ (inline).
- **P10** — Séparateur « Nouveau commentaire » entre fil et zone de saisie.

## 3. FONCTIONNEMENT

- **P11** — Ctrl+Entrée soumet le formulaire (textarea).
- **P12** — Actions au survol : Modifier, Supprimer (si auteur), Marquer résolu (selon type).
- **P13** — Auto-scroll vers le commentaire posté après envoi (smooth).
- **P14** — Validation .trim() ; bouton Envoyer désactivé si champ vide ou blanc.
- **P15** — État chargement (spinner + « Envoi… ») ; message d'erreur + bouton Réessayer.
- **P16** — Pagination : affichage des N derniers (ex. 10) + « Voir les X commentaires précédents ».

## 4. DOCUMENTATION ET SIMULATEUR

- **P17** — Section « Connexions » : Notifications ciblées, Audit/Log, Workflow.
- **P18** — Simulateur enrichi : fil long (22 commentaires), types variés, réponses (parentId), commentaire résolu, pas de bpm.panel.
