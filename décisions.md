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

## Réservation / Créneaux — parcours de travail qualifié

Le lien **Réserver une salle** ouvre le planning partagé de l’organisation. Le visiteur peut toujours essayer le simulateur public. Le planning propose les trois salles du module, par jour ouvré, de 9 h à 18 h, heure de Paris. Un membre voit les disponibilités et peut annuler ses propres réservations. Les intitulés des réunions restent visibles uniquement par leur auteur. Le sélecteur d’organisation définit le planning affiché.

La migration `20261119002000_room_reservations` lie la réservation à son adhésion à l’organisation. Une contrainte unique PostgreSQL pour chacune des neuf heures interdit tout chevauchement, y compris sur la seconde heure. Le départ d’un membre libère ses créneaux. Le déploiement nécessite `prisma migrate deploy` puis le démarrage de la nouvelle version.

**Recette exécutée le 19 novembre.** Sur PostgreSQL 16, deux comptes ont demandé des créneaux qui se recouvrent en parallèle. Une écriture a réussi, la seconde a reçu HTTP 409. Les créneaux adjacents et ceux d’une autre organisation restaient réservables. Le second membre ne pouvait ni lire le titre ni annuler la réunion du premier. Les tests ont vérifié le week-end, le changement d’heure et la fermeture à 18 h. Sur le build Next.js standalone, Chromium a réservé deux heures, puis a retrouvé la réunion avec une nouvelle connexion après redémarrage du serveur. Le premier clic de renoncement a conservé la réservation. L’annulation confirmée a libéré les deux heures.

## Export planifié — exécution dans une application Modular

Le paquet Python embarque `bpm.scheduled_exports`. Une installation correspond à un compte de service, une base SQLite privée sur disque persistant et un relais SMTP. Un appel à `tick` par minute traite les échéances. Un rapport peut provenir d’un fichier publié atomiquement ou d’une fonction de l’application qui lit ses données au moment de l’échéance. L’onglet Simulateur reste un exemple local. Les commandes du worker et ses variables de configuration figurent dans la documentation FR/EN du module.

Le worker utilise les heures civiles du fuseau choisi pour les échéances quotidiennes, hebdomadaires et mensuelles. Après une interruption prolongée, il traite un seul instantané courant. Chaque destinataire dispose d’un journal persistant. Les octets de la pièce jointe sont identiques pour tous les destinataires du même envoi. Une acceptation SMTP est une acceptation par le relais. Une interruption avant de recevoir l’accusé entraîne une vérification manuelle du journal du relais. Les erreurs transitoires dont l’issue est connue sont réessayées après cinq minutes.

**Recette du 19 novembre.** Deux workers concurrents ont livré le CSV de ventes à deux boîtes de recette via SMTP sur l’interface de bouclage, un message par destinataire, avec vérification des octets décodés. Une nouvelle connexion à la base a retrouvé les reçus. Deux invocations distinctes de la commande installable ont généré un CSV depuis les ventes de recette (100 + 210 = 310), puis retrouvé le journal sans expédier de doublon. Sept tests couvrent également l’échéance manquée, le changement d’heure, la reprise après source absente, la suspension, la suppression et la décision après accusé manquant. Le relais de l’exploitant et les sources de données de son organisation sont à configurer au déploiement.

## Webhooks — livraison à un destinataire HTTPS

Le worker `bpm.webhooks` associe un événement à une intégration configurée par l’exploitant. Chaque publication porte un identifiant métier stable. Le producteur peut l’inscrire dans la même transaction SQLite que son opération. Une reprise conserve le corps et l’identifiant. Le destinataire vérifie la signature des octets reçus et enregistre l’identifiant avec sa propre écriture pour dédupliquer les tentatives. Le journal conserve le code HTTP, la durée et les interruptions. Après cinq échecs consécutifs l’alerte est consultable. À partir de 72 heures d’échecs, le worker suspend l’intégration au passage suivant.

**Recette du 19 novembre.** Un destinataire HTTPS de recette a reçu une commande, répondu 503, puis 204 après redémarrage du worker. Les deux requêtes portaient le même identifiant et une signature valide. Deux processus concurrents ont traité une seule nouvelle tentative. Cinq tests couvrent aussi l’annulation de la transaction métier, la reprise après interruption, les délais, les alertes, la suspension et la rotation du secret. Pour déployer, configurer la destination, le secret et le disque privé, puis lancer `tick` chaque minute. Aucun destinataire client n’a été sollicité.

## Authentification — inscription et connexion

L’inscription par e-mail demandait un mot de passe puis retournait HTTP 501. Le nouveau parcours vérifie l’adresse via un code de huit chiffres envoyé par SMTP. Le code est valable dix minutes et consommé une seule fois. L’inscription concurrente conserve un seul compte et ne remplace pas le mot de passe existant. L’authentification utilise un secret individuel dérivé avec scrypt et un sel par compte. Le quota de codes et les compteurs de tentatives sont partagés entre processus en base. Le formulaire retrouve la page demandée après la connexion.

La migration conserve les photos existantes et crée la relation entre compte Modular et identité du fournisseur OAuth. L’adaptateur Prisma livré a créé, associé, retrouvé et détaché un compte Google de recette. Le parcours en ligne sur les serveurs de Google reste à vérifier avec le client OAuth de l’exploitant.

**Recette du 19 novembre.** Sur un build standalone et une base PostgreSQL 16 migrée depuis zéro, Chromium a suivi le lien de connexion du planning, créé un compte, récupéré le code envoyé à un serveur SMTP local, confirmé l’adresse, ouvert le planning et fermé la session. Un second processus serveur a accepté le même compte après redémarrage. Neuf tests PostgreSQL sont passés, dont trois sur les identités et l’inscription. Le comportement de récupération d’un mot de passe oublié reste à qualifier séparément.

**Déploiement.** Appliquer la migration avant le remplacement du serveur. Configurer un relais SMTP pour l’inscription et/ou un client Google pour OAuth. Le mot de passe partagé de démonstration est retiré et les identités de test sont désactivées en production. Pour une instance qui utilisait le mot de passe partagé, prévoir la création des identifiants individuels et la rotation de `NEXTAUTH_SECRET` au basculement pour fermer les anciennes sessions.

**Récupération de compte.** Le lien « Mot de passe oublié ? » ouvre le formulaire de récupération. Sa preuve SMTP a une finalité distincte de celle de l’inscription. Une transaction remplace le mot de passe, remet à zéro les échecs et incrémente la révision des sessions par mot de passe. Un compte Google sans identifiant local conserve sa méthode de connexion. La migration conserve les codes d’inscription en cours et initialise la révision des comptes existants. Les anciennes sessions OAuth sans indication de fournisseur peuvent nécessiter une reconnexion.

**Recette de récupération.** Dix tests PostgreSQL ont réussi, dont une course entre deux confirmations du même code. Sur le serveur standalone, un second navigateur a demandé le code à un relais SMTP local puis remplacé le mot de passe. La session ouverte avant la récupération est devenue invalide. La connexion avec le nouveau mot de passe fonctionne après redémarrage.

## Commentaires — fil d’un article Wiki

Le module donne accès au Wiki, où chaque article dispose d’un fil persistant. La migration enrichit les commentaires existants. Les types commentaire, annotation, décision et blocage, les réponses, l’édition, la résolution, la réouverture et la suppression passent par la même API que la page. Une suppression efface le contenu et préserve la position des réponses. Une clé de requête évite un double enregistrement après un nouvel essai. Une révision contrôle les éditions simultanées. Le branchement livré porte sur les articles Wiki et hérite de leurs règles de visibilité.

**Recette du 19 novembre.** PostgreSQL a enregistré une seule contribution pour deux publications simultanées utilisant la même clé. Deux modifications concurrentes ont donné un succès et un conflit. L’autre participant a pu répondre à l’article publié et n’a pas pu supprimer la contribution de l’auteur. Chromium a publié une décision, modifié le texte, ajouté une réponse et résolu la décision. Après redémarrage de l’application, la décision était toujours résolue. Sa suppression a conservé la réponse. Le build standalone avec migrations depuis une base vide a servi ces opérations.

**Suite du catalogue.** Skeleton, puis Tableau blanc.

## Skeleton — six écrans de chargement dans une application installée

Les variantes tableau de bord, liste, article, formulaire, fiche et graphique utilisent maintenant les mêmes composants dans le simulateur et dans le moteur embarqué. Le client Python émettait les six types de nœuds, mais le moteur ne les affichait pas. L’ouverture de l’application révélait également un changement d’ordre des hooks React entre le chargement et le premier rendu. La correction couvre cette transition. Les dimensions sont bornées et le choix de mouvement réduit du navigateur est respecté. Ces composants d’affichage ne stockent aucune donnée.

**Recette du 19 novembre.** Une application Python temporaire utilisant les six fonctions publiques a démarré par la commande `bpm run` d’un wheel installé. En Chromium, à 375 pixels de large, les six régions de chargement étaient présentes, leurs formes avaient une hauteur et une largeur positives, et l’animation était désactivée en mode mouvement réduit. Le scénario reproductible est `scripts/verify-skeleton-wheel.py`.

**Installation et livraison.** Le workflow de la PR construit le runtime, installe le wheel, exécute cette recette et joint le paquet au run. Pour préparer une installation depuis un checkout, lancer `bash scripts/build-python-runtime.sh` avant de fabriquer le wheel. Une installation directement depuis les sources sans cette étape réutilise les anciens fichiers statiques. Le workflow PyPI reconstruit également le runtime lors d’un tag de publication. Aucun tag de publication ni déploiement de production n’a été effectué pour cette recette. La CI du commit précédent, couvrant notamment l’authentification et les commentaires, est verte (run 44431611456).

**Prochain module.** Tableau blanc.

## Tableau blanc — atelier partagé par organisation

Le simulateur conserve ses exemples. L’entrée « Ouvrir le tableau d’équipe » donne accès à des tableaux persistants, chacun identifié par l’organisation et le nom de l’atelier. Un membre peut ajouter, modifier, déplacer ou supprimer un post-it. La page et les applications utilisent `/api/whiteboards/{organizationId}/{board}`. L’atelier enregistre le nom d’affichage au moment de la contribution. Le départ d’un participant conserve les travaux de l’équipe et la suppression de l’organisation efface ses tableaux.

Chaque création porte un UUID fourni par le client. La même requête peut être rejouée sans doubler le post-it. Une suppression conserve un marqueur pour empêcher une ancienne création de ressusciter la carte. L’édition et le déplacement exigent la révision lue. En cas de conflit, la page présente la version actuelle à côté du brouillon, que l’utilisateur peut reprendre explicitement.

**Recette PostgreSQL.** Le test « shares whiteboard notes inside one workshop, with retry and revision checks » a tourné sur PostgreSQL 16.15 après installation des migrations depuis zéro. Deux créations concurrentes ont produit une carte. Deux modifications de la même révision ont donné un succès et un conflit. Un second membre a déplacé, corrigé puis supprimé la carte. Les lectures d’un autre atelier, l’accès sans adhésion, les valeurs invalides et le rejeu après suppression ont été vérifiés.

**Installation.** Appliquer `prisma migrate deploy` avant de lancer le serveur compilé. L’accès à l’atelier requiert un compte membre d’une organisation. Le module n’envoie aucun message aux participants.

**Recette Chromium sur le serveur standalone.** Un compte de recette a ouvert l’atelier depuis la fiche du module, créé un post-it par Ctrl+Entrée puis édité son texte. Une écriture concurrente a affiché la contribution du collègue et conservé le brouillon en cours. La reprise explicite a enregistré le brouillon puis la carte a rejoint « Action ». Après arrêt et redémarrage du serveur et nouvelle connexion, la carte était toujours dans « Action ». Le refus de confirmation a conservé la carte et la suppression confirmée l’a retirée. Les polices distantes ont été remplacées localement pendant cette recette fonctionnelle.

**Prochain module.** Templates. Les deux boutons « Créer » du catalogue et du simulateur n’exécutent qu’un toast. La recette doit vérifier le contenu d’un document effectivement produit par chacun des trois modèles.
