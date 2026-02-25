# Audit du module Calendrier 360° — Blueprint Modular

*Document de référence issu de l’audit du module Calendrier. Les propositions P1–P14 ont été traitées dans le simulateur et la documentation.*

---

## 1. FOND — Ce que le module contient et expose

### Ce qui existe
- Le module affiche des événements structurés autour de 4 champs : **date**, **heure**, **titre**, **durée** (optionnelle) + une **couleur** optionnelle.
- Les données peuvent venir d’un état React local, d’une API REST ou d’un service externe (Google Calendar).
- Trois vues sont disponibles : **Jour**, **Semaine**, **Mois**.

### Lacunes de fond identifiées
- **Données événement trop pauvres.** Il manque : description/notes, lieu, participants/assignés, statut (confirmé/annulé/tentative), récurrence, lien de visio, catégorie/tag.
- **Aucune notion de "aujourd'hui".** Pas de date courante mise en évidence ni navigation vers le jour réel.
- **Pas de créneaux libres / disponibilité.** Aucune représentation des plages libres.
- **Aucune intégration native avec les autres modules.** Pas de lien documenté avec Tâches, Workflow, Notifications ciblées, Réservation / Créneaux.

---

## 2. FORME — Interface, design, mise en page

### Ce qui fonctionne
- Sélecteur de vue Jour / Semaine / Mois clair, bouton actif différencié (pill).
- Design system Blueprint respecté (fond, bordures, police).
- Grille du mois avec points indicateurs lisible.

### Problèmes de forme identifiés
- **Vue Semaine = liste plate** (Date | Heure | Événement), pas une grille temporelle Lun–Dim × plages horaires.
- **Vue Jour** quasi vide : texte brut sans colonne horaire ni timeline.
- **Vue Mois** : pas d’indication du jour courant ; contenu de démo limité à quelques jours.
- **Pas de navigation temporelle** : aucun « ← Précédent / Suivant → » ni sélecteur de période.
- **Couleurs** : champ documenté mais peu exploité visuellement dans le simulateur.
- **Icône** du module potentiellement incohérente entre liste des modules et documentation.

---

## 3. FONCTIONNEMENT — Interactions, logique, navigation

### Ce qui fonctionne
- Switch entre les 3 vues sans rechargement ; persistance de la vue active correcte.
- Intégration via `bpm.title()` simple à comprendre.

### Problèmes de fonctionnement identifiés
- **Navigation temporelle absente** (bloquant en production).
- **Aucune interaction sur les événements** : clic sans détail / fiche / tooltip.
- **Pas de création ni d’édition d’événements** ; module en lecture seule.
- **Simulateur trop simplifié** par rapport à une vraie intégration.
- **Pas de gestion des conflits** ou événements simultanés (colonnes superposées).
- **Absence de filtres et de recherche** (catégorie, assigné, titre).

---

## 4. PROPOSITIONS D’AMÉLIORATION (P1–P14)

| Id  | Axe        | Proposition |
|-----|------------|-------------|
| P1  | Fond       | Enrichir la structure de l’événement : description, lieu, catégorie, statut, récurrence, participants (tous optionnels). |
| P2  | Fond       | Ajouter le concept de "aujourd’hui" : vue Jour sur la date courante par défaut ; jour courant mis en évidence en vue Mois. |
| P3  | Fond       | Documenter les connexions inter-modules : section "Compatible avec" (Tâches, Workflow, Notifications, Réservation / Créneaux). |
| P4  | Forme      | Refaire la vue Semaine en **grille temporelle** (colonnes Lun–Dim, lignes horaires 08h–20h, blocs positionnés). |
| P5  | Forme      | Refaire la vue Jour en **timeline verticale** (heures à gauche, événements positionnés selon heure et durée). |
| P6  | Forme      | Afficher les couleurs des événements : barre à gauche du bloc (Semaine/Jour), point coloré en Mois. |
| P7  | Forme      | Clarifier ou supprimer l’icône "ℹ" de l’en-tête "Vue calendrier" ; cohérence avec les autres modules. |
| P8  | Forme      | Ajouter un **header de navigation temporelle** : ← / → et titre central (ex. "Semaine du 24 fév. – 2 mars 2025"). |
| P9  | Fonctionnement | Implémenter la **navigation temporelle** comme comportement de base (pagination client, paramètres start/end). |
| P10 | Fonctionnement | Rendre les événements **cliquables** : panneau latéral ou modale avec détail (titre, heure, description, lieu, participants) + actions édition/suppression si droits. |
| P11 | Fonctionnement | Bouton **"+ Nouvel événement"** ouvrant un formulaire de création (réutiliser Formulaire dynamique si possible). |
| P12 | Fonctionnement | Gérer les **événements simultanés** en colonnes flottantes (largeur réduite côte à côte). |
| P13 | Fonctionnement | **Filtre par catégorie/couleur** (pills dans l’en-tête). |
| P14 | Fonctionnement | **Enrichir le simulateur** : événements sur tout le mois, simultanés, sans durée, couleurs différenciées. |

---

## 5. SYNTHÈSE — Priorisation

| Axe                     | État actuel     | Priorité   |
|-------------------------|-----------------|------------|
| Navigation temporelle   | Absente         | Critique   |
| Vue Semaine (grille)    | Liste plate     | Critique   |
| Vue Jour (timeline)     | Texte brut       | Critique   |
| Clic sur événement      | Non implémenté  | Haute     |
| Données enrichies       | Champs minimalistes | Haute  |
| Création d’événement     | Absente         | Haute     |
| Connexion inter-modules  | Non documentée  | Moyenne   |
| Filtres / recherche     | Absents         | Moyenne   |
| Gestion des conflits     | Non gérée       | Moyenne   |
| Couleurs différenciées  | Peu visibles    | Moyenne   |

Le module Calendrier est aujourd’hui un **squelette navigable** plutôt qu’un agenda opérationnel. Il pose les bonnes bases (3 vues, structure d’événement, intégration API) mais nécessite un travail significatif sur la grille temporelle et l’interactivité pour devenir un outil de productivité métier cohérent avec le reste de la plateforme.
