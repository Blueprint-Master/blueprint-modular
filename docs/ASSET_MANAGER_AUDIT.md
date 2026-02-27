# Audit du module Gestion de parc — Blueprint Modular v0.1.21

## I. Synthèse de l'existant

Le module couvre six sections accessibles depuis un tableau de bord central : **Équipements**, **Tickets**, **Mise à disposition (MAD)**, **Contrats & garanties**, **Connaissances**, et **Gestion des changements (CAB)**. Il repose sur une architecture JSON-driven particulièrement solide (domaines configurables, types d'actifs extensibles, numérotation automatique, SLA, cycle de vie, CMDB), mais l'interface n'expose qu'une fraction de cette richesse backend.

---

## II. Audit — Fond (Contenu & données)

### Ce qui existe

Le module IT est bien configuré en JSON : 5 types d'actifs (laptop, imprimante, serveur, mobile, réseau), 6 statuts avec couleurs, 4 catégories de tickets avec sous-catégories, priorités avec SLA en heures, 7 étapes de cycle de vie, escalade SLA à 3 niveaux, 6 types de relations CMDB, gestion du CAB avec approbateurs d'urgence, et un domaine "maintenance industrielle" en parallèle.

### Lacunes identifiées

| Lacune | Détail |
|--------|--------|
| **Champs manquants sur les actifs** | Type "laptop" a hostname, MAC, domaine AD — pas de numéro de série (SN), date d'achat, prix d'achat, localisation physique (site, salle, rack), utilisateur principal affecté en dur. |
| **Aucun champ d'inventaire transverse** | Pas de champ commun à tous les types (ex. numéro de série, fabricant, modèle, date d'achat, fin de garantie, valeur résiduelle). Chaque type doit les redéfinir manuellement. |
| **Logiciels/licences absents** | Pas de notion de logiciel ou licence attachée à un actif (SAM — Software Asset Management) totalement manquant. |
| **Mouvements physiques non exposés** | Config mentionne AssetMovement en phase 2 ; **l'UI existe** (onglet Historique fiche actif + création mouvement) mais à vérifier visibilité/usage. |
| **Cycle de vie non visible** | Les 7 étapes existent en config mais n'apparaissent nulle part dans l'interface. L'utilisateur ne peut pas voir à quelle étape de vie se trouve un actif. |
| **CMDB partiellement exposée** | Les types de relations existent côté config/API ; **bloc Dépendances / Cartographie** existe sur la fiche actif (création/suppression relations). Vue graphe absente. |
| **Audit trail absent** | Modèle AuditLog prévu en phase 3 mais aucune trace de qui a modifié quoi en UI. |

---

## III. Audit — Forme (UI/UX)

### Points positifs

Design propre, sobre, cohérent avec le style Blueprint Modular. Hiérarchie visuelle lisible, couleurs de statut intuitives (vert = en service, rouge = hors service), formulaires courts pour limiter la friction à la création.

### Problèmes identifiés

| Problème | Détail |
|----------|--------|
| **Tableau de bord trop pauvre** | Six compteurs, sans graphiques, tendances, alertes visuelles. Pas de vision : actifs proche fin de garantie, tickets en retard SLA, contrats qui expirent dans 30 j, actifs "Hors service" non réformés. |
| **Listes sans richesse visuelle** | Pas de tri par colonne, regroupement, export, vue "cards". Liste équipements sans icônes par type, pas de badge coloré de statut dans le tableau. |
| **Formulaire de création d'actif minimaliste** | Seulement 3 champs (Type, Libellé, Statut). Champs spécifiques au type non exposés à la création. |
| **Formulaire de ticket sans actif lié** | On ne peut pas relier un ticket à un actif précis à la création (l'API et le modèle le permettent ; à vérifier en UI). |
| **Formulaire de changement (CAB)** | Pas de date d'intervention prévue, actifs impactés, workflow d'approbation visible. "Plan de rollback" = textarea libre. |
| **Navigation / fil d'Ariane** | Miettes de pain incohérentes selon les pages. |
| **États vides peu engageants** | "Aucun actif", "0 ticket(s)" sans suggestion d'action, illustration ou lien doc. |
| **Mode sombre** | Badges de couleur de statut pas adaptés pour le mode sombre. |

---

## IV. Audit — Fonctionnement (logique métier & workflows)

### Points positifs

Architecture JSON-driven : nouveau domaine possible en dupliquant un fichier de config. Numérotation automatique (NXTF-LAPTOP-2026-0001). SLA avec escalade à 3 niveaux en config.

### Lacunes fonctionnelles

| Lacune | Détail |
|--------|--------|
| **Escalade SLA non visible** | Config définit 3 niveaux (50%, 80%, 100%) ; aucune UI pour tickets en danger, ni config des groupes de notification. |
| **Workflow CAB non visible** | approval_mode, approbateurs d'urgence en config ; workflow (qui approuve, ordre, interface) non implémenté en UI. |
| **Contrats non liés aux actifs** | Un contrat créé n'est pas associé à un ou plusieurs actifs. Impossible de savoir si un actif est sous garantie. |
| **Renouvellement automatique** | Champ "Renouvellement automatique" existe mais pas d'alerte/rappel en UI. |
| **Retour MAD** | Pas de bouton "Restituer l'actif" qui clôturerait la MAD et remettrait l'actif en stock. Statut actif ne change pas automatiquement. |
| **Import en masse** | Aucun import CSV/Excel pour migration depuis GLPI ou Excel. |
| **QR code / étiquette** | Rien pour générer des étiquettes sur les équipements. |
| **Recherche globale** | Pas de barre de recherche cross-entités (actif par hostname, ticket par numéro, contrat par fournisseur). |
| **RBAC non exposé** | Permissions en config mais pas d'interface de gestion des droits dans le module. |

---

## V. Propositions d'amélioration (Blueprint Modular natif)

Toutes les propositions restent dans le cadre des briques Blueprint Modular (composants existants).

### Priorité 1 — Corrections immédiates (Quick Wins)

| Id | Proposition | Détail |
|----|-------------|--------|
| **P1-A** | Champs transverses sur tous les actifs | Config : bloc `common_fields` appliqué à tous les types : serial_number, manufacturer, model, purchase_date, purchase_price, location (site + salle), owner_user_id. Panneau "Informations générales" commun avant champs spécifiques. |
| **P1-B** | Lier un ticket à un actif | Champ `asset_id` (select avec recherche) dans le formulaire de création de ticket. Liste des tickets d'un actif dans l'onglet "Tickets" de la fiche actif. |
| **P1-C** | Lier un contrat à des actifs | Champ multi-sélect `asset_ids` dans le formulaire contrat. Sur la fiche actif, onglet "Contrats" avec contrats actifs (date de fin, badge coloré). |
| **P1-D** | Tableau de bord avec widgets métriques | Remplacer les 6 compteurs par MetricCard avec tendance (↑/↓ vs mois précédent). 3 widgets d'alerte : "Contrats expirant dans 30 jours", "Tickets en dépassement SLA", "Actifs hors service non réformés". Utiliser AlertBanner Blueprint. |
| **P1-E** | Formulaire actif en deux étapes | Étape 1 : Type + Libellé + Statut. Étape 2 : champs spécifiques au type + champs communs. Stepper ou Tabs Blueprint. |

### Priorité 2 — Enrichissement métier (Sprint 2)

| Id | Proposition | Détail |
|----|-------------|--------|
| **P2-A** | Cycle de vie visible sur la fiche actif | Timeline ou ProgressStepper sur la fiche actif : 7 étapes du lifecycle, date de passage, qui a validé. |
| **P2-B** | Vue CMDB (relations) | Onglet "Relations" sur la fiche actif (existe déjà en "Dépendances / Cartographie") ; enrichir avec liste typée "dépend de / connecté à / héberge…". Mini-graphe SVG ultérieur. |
| **P2-C** | Processus de retour MAD | Bouton "Restituer" sur MAD active : clôture MAD (date retour), statut actif "Mis à disposition" → "En stock", entrée dans l'historique. Signature retour (checkbox confirmation). |
| **P2-D** | Indicateurs SLA sur les tickets | Barre de progression colorée (vert/orange/rouge) par ticket (% SLA consommé). Filtre "Tickets en danger SLA" (>80%) depuis le tableau de bord. |
| **P2-E** | Import CSV | Page "Import" dans Équipements : upload CSV, mapping colonne–champ, validation ligne par ligne. Table et Alert Blueprint. |

### Priorité 3 — Excellence ITSM (Sprint 3)

| Id | Proposition | Détail |
|----|-------------|--------|
| **P3-A** | Workflow CAB structuré | Workflow visible : Soumis → En révision → Approuvé par CAB → Planifié → En cours → Clôturé. Approbateurs voient les demandes assignées, bouton "Approuver / Rejeter + commentaire". StatusBadge, ActionPanel. |
| **P3-B** | Logiciels & licences (SAM) | Config software : asset_types software_license (éditeur, produit, version, type licence, postes autorisés, expiration), lié aux actifs via relation CMDB. |
| **P3-C** | Génération étiquettes / QR code | Bouton "Imprimer l'étiquette" sur la fiche actif : PDF avec QR code (URL fiche), libellé, n° inventaire, type. qrcode + reportlab côté serveur. |
| **P3-D** | Recherche globale cross-entités | Barre de recherche (cmd+K / spotlight) dans le header : actifs (hostname, SN, libellé), tickets (numéro, titre), contrats (référence, fournisseur). CommandPalette. |
| **P3-E** | Audit trail sur les fiches | Onglet "Historique" sur chaque fiche actif/ticket/contrat : date, utilisateur, champ modifié, ancienne → nouvelle valeur. Modèle AuditLog. |
| **P3-F** | Alertes email / notifications | Brancher les notifications Blueprint : contrat expire dans N jours, ticket proche SLA, changement approuvé/rejeté, actif réformé. Icône cloche alimentée par triggers backend. |

---

## VI. Tableau récapitulatif

| Axe | État actuel | Priorité d'amélioration |
|-----|-------------|--------------------------|
| Champs communs (SN, fab., prix) | Absent | P1 — Critique |
| Liaison ticket ↔ actif | Partiel (API/fiche) | P1 — Critique |
| Liaison contrat ↔ actifs | Absent | P1 — Critique |
| Tableau de bord avec alertes | Minimaliste | P1 — Haute |
| Formulaire actif étendu | 3 champs seulement | P1 — Haute |
| Cycle de vie visible | Config seule | P2 — Haute |
| Processus retour MAD | Absent | P2 — Haute |
| SLA visuel sur tickets | Absent | P2 — Haute |
| Import CSV | Absent | P2 — Moyenne |
| CMDB / relations | UI liste + ajout/suppression | P2 — Moyenne (vue graphe) |
| Workflow CAB | Config seule | P3 — Haute |
| Logiciels / licences (SAM) | Absent | P3 — Moyenne |
| QR code / étiquettes | Absent | P3 — Faible |
| Recherche globale | Absent | P3 — Haute |
| Audit trail | Config seule | P3 — Moyenne |
| Notifications / alertes email | Absent | P3 — Haute |

---

## VII. Conclusion

Le module Gestion de parc est construit sur une **architecture backend remarquablement solide** pour la v0.1.21 : config JSON extensible, multi-domaines, SLA, CMDB et cycle de vie pensés dès le départ. Le fossé entre la richesse de la config et l'interface est le principal point d'attention.

**Principe retenu** : "Formulaire court à la création, profondeur sur la fiche" — à pousser jusqu'au bout sur chaque entité. Les **priorités 1** (champs communs, liaisons actif–ticket–contrat, dashboard avec alertes) peuvent être traitées en un sprint et transformeront la valeur perçue du module. Les priorités 2 et 3 feront de Blueprint un outil ITSM sérieux, plus agréable que GLPI tout en restant plus léger et lisible.

---

*Audit — Blueprint Modular v0.1.21. À mettre en regard de `docs/ASSET_MANAGER_RESTE_A_FAIRE.md`.*
