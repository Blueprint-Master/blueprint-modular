# Modules métier · décisions du 19 novembre 2026

## Point de départ

Le catalogue public de Blueprint Modular présente 32 modules et 64 liens de documentation ou de démonstration. Sur le passage HTTP complet, 63 destinations répondaient en 200. Le lien Documentation du calendrier ajoutait `/documentation` à l’URL du simulateur et donnait une 404. La recette de la branche retrouve les 64 destinations depuis le HTML du catalogue et vérifie leur réponse sur le serveur compilé.

Trois modules ont été retenus pour une recette métier. Calendrier et Notifications avaient déjà des API Prisma mais les migrations distribuées ne créaient pas leurs tables. Workflow documentait des routes à construire et son bouton Archiver dans l’onglet Simulateur était inactif.

## Contrats livrés

| Module | Décision | Vérification |
|---|---|---|
| Calendrier | Stocker les événements par utilisateur. Une édition partielle vérifie la borne opposée directement dans l’écriture SQL et conserve les champs omis. Le simulateur manipule des jours civils locaux. Une mensualité au 31 tombe le dernier jour d’un mois court, puis retrouve le 31. | Création, lecture par intervalle, modification, suppression, utilisateurs distincts et éditions concurrentes. Tests aux changements de mois, d’année ISO et d’heure. |
| Notifications | Exposer une boîte personnelle persistante par API. Calculer la priorité avec les règles existantes. Une seconde lecture conserve l’horodatage initial. La cloche de démonstration conserve son historique navigateur. | Création, filtre des non-lues, marquage répété et séparation entre deux comptes. |
| Workflow | Fournir un suivi personnel par référence de dossier. Le journal vaut état courant. La clé unique utilisateur + dossier + révision rend atomiques la transition et son inscription au journal. Une commande périmée renvoie HTTP 409. Les deux entrées du simulateur utilisent la même carte interactive. | Deux validations simultanées donnent un succès et un conflit. Le rechargement retrouve les étapes, l’auteur et les dates. Le redémarrage de la démo efface son journal local. |

Les trois API exigent une session connue dans une compilation de production, y compris lorsque le mode de démonstration partagé est activé pour d’autres pages. Le workflow livré appartient à un utilisateur. Une approbation partagée par plusieurs membres d’une organisation demanderait une politique de rôles et de visibilité spécifique.

Le simulateur Calendrier conserve ses séries en mémoire. Une date de fin explicite borne la série. Sans date de fin, il reprend les valeurs existantes de 60 occurrences quotidiennes ou 12 hebdomadaires ou mensuelles. Un lot dépassant 3 660 occurrences déclenche un message avant création.

## Recette et livraison

- Migrations Prisma appliquées depuis une base vide sur PostgreSQL 16.15 et 18.6. Les tests d’intégration utilisent Prisma et le serveur PostgreSQL. Seule la session est injectée dans ces tests de concurrence.
- Recette supplémentaire par HTTP sur le serveur Next.js standalone, avec connexion NextAuth réelle et cookie de session. Création et relecture d’un événement, notification puis lecture, validation et archivage d’un dossier avec relecture des deux transitions.
- Tests de manipulation des composants React dans un DOM de test. Création et suppression d’un rendez-vous après navigation, archivage, réinitialisation et validation du workflow. Le contrôle d’ouverture des 64 liens porte sur le statut HTTP. Les autres modules gardent leurs propres besoins de recette fonctionnelle.
- Compilation Next.js 16 validée avec Webpack et Turbopack. Le test Turbopack utilise les certificats système de l’environnement pour télécharger les polices habituelles. Le premier commit aligne les types de paramètres asynchrones des routes sur le contrat de Next 16, nécessaire au build complet.
- Livraison en PR en brouillon pour revue des migrations et du traitement des sessions. Les données de recette sont synthétiques et locales. Aucun appel d’écriture vers la production.

## Écarts encore visibles dans les simulateurs

| Module | Comportement observé dans le code | Critère métier restant à démontrer |
|---|---|---|
| Webhooks | La démonstration remplit l’historique de livraison depuis un temporisateur. | Un destinataire de recette reçoit l’événement et les tentatives sont consultables après une interruption. |

## Réservation / Créneaux — parcours de travail qualifié

Le lien **Réserver une salle** ouvre le planning partagé de l’organisation. Le visiteur peut toujours essayer le simulateur public. Le planning propose les trois salles du module, par jour ouvré, de 9 h à 18 h, heure de Paris. Un membre voit les disponibilités et peut annuler ses propres réservations. Les intitulés des réunions restent visibles uniquement par leur auteur. Le sélecteur d’organisation définit le planning affiché.

La migration `20261119002000_room_reservations` lie la réservation à son adhésion à l’organisation. Une contrainte unique PostgreSQL pour chacune des neuf heures interdit tout chevauchement, y compris sur la seconde heure. Le départ d’un membre libère ses créneaux. Le déploiement nécessite `prisma migrate deploy` puis le démarrage de la nouvelle version.

**Recette exécutée le 19 novembre.** Sur PostgreSQL 16, deux comptes ont demandé des créneaux qui se recouvrent en parallèle. Une écriture a réussi, la seconde a reçu HTTP 409. Les créneaux adjacents et ceux d’une autre organisation restaient réservables. Le second membre ne pouvait ni lire le titre ni annuler la réunion du premier. Les tests ont vérifié le week-end, le changement d’heure et la fermeture à 18 h. Sur le build Next.js standalone, Chromium a réservé deux heures, puis a retrouvé la réunion avec une nouvelle connexion après redémarrage du serveur. Le premier clic de renoncement a conservé la réservation. L’annulation confirmée a libéré les deux heures.

## Export planifié — exécution dans une application Modular

Le paquet Python embarque `bpm.scheduled_exports`. Une installation correspond à un compte de service, une base SQLite privée sur disque persistant et un relais SMTP. Un appel à `tick` par minute traite les échéances. Un rapport peut provenir d’un fichier publié atomiquement ou d’une fonction de l’application qui lit ses données au moment de l’échéance. L’onglet Simulateur reste un exemple local. Les commandes du worker et ses variables de configuration figurent dans la documentation FR/EN du module.

Le worker utilise les heures civiles du fuseau choisi pour les échéances quotidiennes, hebdomadaires et mensuelles. Après une interruption prolongée, il traite un seul instantané courant. Chaque destinataire dispose d’un journal persistant. Les octets de la pièce jointe sont identiques pour tous les destinataires du même envoi. Une acceptation SMTP est une acceptation par le relais. Une interruption avant de recevoir l’accusé entraîne une vérification manuelle du journal du relais. Les erreurs transitoires dont l’issue est connue sont réessayées après cinq minutes.

**Recette du 19 novembre.** Deux workers concurrents ont livré le CSV de ventes à deux boîtes de recette via SMTP sur l’interface de bouclage, un message par destinataire, avec vérification des octets décodés. Une nouvelle connexion à la base a retrouvé les reçus. Deux invocations distinctes de la commande installable ont généré un CSV depuis les ventes de recette (100 + 210 = 310), puis retrouvé le journal sans expédier de doublon. Sept tests couvrent également l’échéance manquée, le changement d’heure, la reprise après source absente, la suspension, la suppression et la décision après accusé manquant. Le relais de l’exploitant et les sources de données de son organisation sont à configurer au déploiement.

**Suite du catalogue.** Prochain module : Webhooks. Pour les autres modules, les contrôles d’ouverture du catalogue restent de simples contrôles HTTP. La recette de chaque parcours utilisateur est à consigner ici avec ses conditions de déploiement.
