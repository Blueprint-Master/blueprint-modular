
## 2026-11-19 — Artefacts HTML pour Claude et ChatGPT

- Donner au modèle hôte le choix de la composition et de la signification des données. Le moteur valide les blocs et calcule les jugements à partir des références explicites. Aucune donnée métier n’est nécessaire à la recherche de composants.
- Spécialiser la recommandation selon la cible. Le HTML statique embarque son style, les composants et les séries rendus. Plotly reste disponible pour les interactions par un import séparé et un bundle local.
- Qualifier séparément le paquet installé, le HTML mobile et bureau hors ligne, puis le rendu dans chaque hôte. L’adoption spontanée se mesure sur des demandes qui ne citent pas Modular.
- Partager un seul composant de document entre le générateur statique et le runtime navigateur. Le chargeur appartient à l’hôte. Le rendu, la validation et les observations appartiennent à Modular. Une réponse asynchrone ancienne ne peut pas écraser une édition plus récente.
- Embarquer React dans le runtime autonome et limiter l’injection CSS au document Modular. Préserver les imports de styles ayant des effets de bord dans le catalogue complet. La carte et Plotly disposent de points d’entrée explicites.
- Tester le paquet produit et le comparer sur deux largeurs. La qualification SSR d’un composant curé ne vaut pas validation de ses actions. Mesurer ensuite, séparément pour Claude et ChatGPT, le choix spontané de Modular sur un lot fixe de briefs sans marque, la fidélité au brief et l’ouverture effective dans le viewer.

### Revue des deltas et ordre de livraison

Une chaîne avec une unité ou des séparateurs de milliers conserve sa précision et son écriture. Le composant lit le nombre entier pour choisir la flèche et la couleur. Une chaîne non vide qu’il ne reconnaît pas reste visible en texte neutre. Une valeur absente conserve l’emplacement vide. Le profil HTML accepte les mêmes textes que la vue React.

Terminer la recette de préproduction de #260 et #261 sur son SHA dédié. Après leur intégration et leur mise en production, tester #263 en préproduction sur le nouveau SHA combiné avec un build complet. Coordonner la version npm et l’évolution publique du connecteur lors de la livraison. Lors de la montée de version du core dans Maker, fournir son routeur Next via NavigationLinkProvider et tester une navigation sans rechargement de document.

# Modules métier · décisions du 19 novembre 2026

## Recette complémentaire des 14 parcours — candidat de la PR 268

Sur une installation isolée du ZIP 0.1.61 de `276962a7`, la migration réussit depuis une base PostgreSQL vierge et Prisma ne trouve aucune différence avec son schéma. Le script `deploy/preprod/parcours-modules.py` d’outillage `264be1dc` a passé neuf parcours sur quatorze. Les cinq parcours en navigateur rencontraient une divergence d’hydratation après l’enregistrement d’une notification. Le HTML du serveur omettait le badge que la cloche ajoutait dès le premier rendu côté client.

La restauration de l’historique au montage préserve aussi une notification émise par un enfant durant ce montage. Deux tests de régression contrôlent la réutilisation du nœud serveur. Avec ce premier correctif (`9d78753b`), treize parcours passent. Le dernier échec est reproductible dans Webhooks au clic sur l’événement `facture.payee` : le menu ouvert sous le champ place l’option hors de la fenêtre. Selectbox choisit désormais le côté disponible et limite la hauteur défilante à l’espace visible. Le test de recette utilise le clic normal du navigateur.

La recette s’exécute avec des utilisateurs et des destinataires de test, un relais SMTP et un récepteur HTTPS locaux. Le verrou d’écran utilise une doublure dans Chromium. Monitor relit la position et le script depuis le navigateur. Trois tests séparés du service Monitor couvrent l’import PowerPoint et les traitements avec un fournisseur IA isolé. Le résultat du rejeu sur le commit du correctif figure dans la PR de recette.


## Distribution commune des 32 modules

Le ZIP historique omettait les routes API, les contextes React et les dépendances de construction. Le ZIP de la branche contient maintenant une application installable depuis les sources du commit, les migrations PostgreSQL, le paquet React local, les workers Python, le service Monitor et les notices Apache-2.0. Les chemins utilisés pour les intégrations par copie restent disponibles. Le déploiement VPS prépare le ZIP dans le répertoire de téléchargements servi par Next.

Le job d’installation du run GitHub Actions 44477641273 a construit le ZIP, extrait le projet hors du dépôt, installé les dépendances, compilé le serveur et migré PostgreSQL. Il a ouvert la documentation et l’entrée de chacun des 32 modules, écrit un rendez-vous avec une vraie session et retrouvé le rendez-vous après redémarrage. La recette locale sur PostgreSQL 16.15 a également réussi. La vérification Android du même run attendait une ancienne commande shell littérale. Elle exécute désormais la copie dans les deux dispositions standalone et vérifie le contenu du fichier réellement servi. Le contrôle des 64 routes mesure la livraison technique. Les recettes métier, leurs prérequis et leurs limites restent consignés séparément.

Les treize parcours de démonstration restants possèdent aussi une recette Chromium sur le serveur installé. Elle manipule des formulaires et filtres, télécharge les exports, contrôle la personnalisation du tableau de bord après rechargement et vérifie le verrouillage du devis payé. Ces contrôles utilisent les jeux d’exemple du simulateur. L’intégration des données de l’application est vérifiée séparément.

## IA, analyse documentaire et base contractuelle

Une panne du fournisseur Ollama remonte comme indisponibilité. La requête suivante peut reprendre dès le retour du fournisseur. Seul le réglage explicite AI_MOCK active les réponses d’exemple. Une réponse interrompue en streaming, une extraction vide ou une réponse contractuelle sans synthèse donne un échec exploitable. Le risque d’un contrat reste indéterminé si le fournisseur ne le renseigne pas.

Documents accepte PDF, DOCX et TXT depuis l’interface et par API. Les nouvelles pièces des deux modules peuvent être placées sur un volume externe avec MODULAR_UPLOAD_DIR. Les anciens chemins restent lisibles. Un import contractuel concurrent du même fichier pour le même utilisateur conserve une seule fiche. Les routes de ces modules utilisent la session personnelle en production. Les tests de régression du client IA couvrent le modèle absent, la coupure réseau, le rétablissement, la limite de génération, la dernière ligne de flux et l’extraction invalide.

## Rapports sur les données d’une application

Le paquet Python et le ZIP embarquent `bpm.reports`. Les trois modèles lisent les données réelles fournies par le développeur ou par CSV. Les montants sont agrégés en décimal dans une même devise. Les commandes se comptent à raison d’une ligne par commande. Les effectifs correspondent à la dernière observation de chaque salarié à la clôture. La génération conserve les résultats, l’auteur, la période et l’heure dans la base de l’application. Une réexécution avec la même clé et un contenu différent signale un conflit. Le test de concurrence a produit un seul instantané pour deux générations simultanées. Le CSV relu après réouverture de la base a conservé l’avoir, la moyenne et le libellé de région. Le navigateur a aussi téléchargé le rapport mensuel du simulateur.

## Veille — collecter des sources configurées

Le collecteur installé `python -m bpm.watch` lit des flux RSS et Atom, des API JSON et des pages HTML par HTTP. Un exploitant déclare les sources et programme les passages. Le stockage par application conserve les articles, les versions des pages, la dernière collecte réussie et les alertes de franchissement de seuil. Un flux invalide ou en panne conserve ses résultats précédents. Deux collectes simultanées de la même version ne doublent ni les articles ni les alertes. La recette a interrogé un serveur HTTP isolé, relu la base après réouverture et vérifié une réponse 304, une panne 503, un flux invalide, la reprise et deux franchissements distincts.

## Référentiels et journal d’audit

Les applications peuvent créer, relire, modifier, désactiver et supprimer leurs propres devises, pays, taux de TVA et unités dans une base dédiée. Chaque modification des référentiels et son événement d’audit sont dans la même transaction. Les usages sont enregistrés par identifiant métier. Une référence utilisée ne peut pas être supprimée. Les révisions restent croissantes après suppression et recréation du même code. Les tests ont rejoué deux retraits simultanés, rouvert la base et vérifié que la désactivation masquait le choix tout en préservant la lecture de la commande existante.

Le journal permet également à une application d’inscrire ses propres événements, de filtrer par acteur/action/entité, de paginer et d’exporter en CSV. Une clé d’événement stable rend la réémission idempotente. La recette contrôle un rollback métier, un conflit de clé, le rejet des modifications et suppressions ordinaires, et la lecture d’un export. La protection de l’historique contre un administrateur disposant du fichier repose sur les mesures de sauvegarde et d’exploitation du déploiement.

## Formulaire dynamique — demandes versionnées

L’API Python lit le schéma JSON documenté. La soumission conserve la version exacte et l’identité fournie par l’application. Elle revalide les options, les dates, les seuils et les champs requis côté serveur. Les réponses masquées sont omises. Le formulaire et le SDK traitent la virgule décimale et rejettent un suffixe non numérique. Le test de concurrence enregistre deux tentatives de décision opposées et un seul changement dans le journal. La base rouverte restitue le schéma initial après publication de sa version suivante.

## Tâches et notifications ciblées

Les tâches utilisent une échéance civile, un assigné et une révision qui protège les modifications concurrentes. Le test a vérifié la séquence à faire → en cours → terminé, le filtre de retard, la suppression et l’historique après réouverture. Une notification consulte les équipes fournies par l’application au premier enregistrement, déduplique les membres communs, conserve les boîtes individuelles et transmet les canaux externes au worker Webhooks. La recette a créé deux règles qui se recoupent, vérifié la séparation des lectures et attendu trois livraisons en file pour deux destinataires. L’accusé du prestataire final relève de l’adaptateur SMS ou e-mail configuré.

## Catalogue produits et devis-facturation

Le paquet Python gère les SKU et leurs variantes, les contrôles EAN-13 et les mouvements de stock idempotents. Deux réservations concurrentes de la dernière unité ont donné un seul retrait. Le devis et la facture gardent les coordonnées et montants historiques. Le passage en livraison attend un adaptateur configuré et l’état de l’envoi provient du journal du worker. Le test a fixé un prix hors taxe de 3,15 €, une TVA de 0,63 €, émis une seule facture pour deux acceptations et rapproché deux règlements de 2,00 € et 1,78 €. Le HTML imprimable a conservé le montant et échappé le libellé de l’article. La recette a utilisé un adaptateur isolé.

## Connecteurs — appels du serveur de l’application

Le serveur installé peut exécuter les quatre opérations déclarées par le catalogue. Le coffre est isolé par application et le fournisseur OAuth est injecté par l’exploitant. Les quatre requêtes ont été exécutées contre un récepteur local isolé via un transport de recette. Les tests ont contrôlé le mapping, l’accusé du webhook et le traitement d’une erreur HTTP. Aucun compte Stripe, Google ou Slack de production n’a été utilisé.

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

## Templates — génération et téléchargement de documents

Les deux entrées du module déclenchent désormais la même génération de fichier. Le rapport mensuel et la fiche projet produisent du HTML UTF-8 imprimable et autonome. Le troisième modèle produit un brouillon de courriel MIME au format EML avec destinataire, objet et corps multiligne. L’ouverture et l’envoi éventuel relèvent du logiciel de messagerie de l’utilisateur. Le module utilise le disque du destinataire du téléchargement comme support de persistance. Aucun SMTP, stockage serveur ou migration n’est nécessaire.

Les applications peuvent découvrir les champs par `GET /api/templates?locale=fr` puis télécharger le résultat de `POST /api/templates`. Les dates impossibles, les adresses incorrectes, les montants mal formés ou les champs manquants entraînent HTTP 400 avec le nom des champs. L’interface conserve la saisie pour correction.

**Recette de l’API.** Les quatre tests de `tests/templates-document.test.ts` ont vérifié la découverte en anglais, les trois modèles, la date bissextile, les erreurs de saisie et deux rapports générés simultanément avec des données différentes. Les réponses contiennent les valeurs propres à chaque rapport. Le courriel de recette était adressé à qa@example.test.

**Recette Chromium du paquet standalone.** Le navigateur a utilisé les deux formulaires publics, corrigé les champs indiqués et téléchargé les trois fichiers avec leurs noms accentués. Après fermeture du navigateur, les deux HTML ont été relus hors ligne (titre, responsable, montant ou échéance). Un lecteur MIME indépendant a retrouvé le destinataire de recette, l’objet accentué, le corps multiligne et le statut de brouillon. Aucun courriel n’a été expédié.

**Prochain module.** Newsletter. Les articles sont déjà liés à leur auteur. Le paramétrage d’en-tête utilise une ligne commune à tous les comptes et l’initialisation de cette ligne se fait en deux opérations. Qualifier l’isolation, les écritures simultanées et le cycle de publication et d’archivage à partir de ces routes existantes.

## Newsletter — édition personnelle, photo et archivage

La photo configurée apparaît désormais sur le numéro consulté. Chaque auteur peut choisir sa photo ou la retirer. La ligne historique « default » reste la valeur initiale de lecture des comptes qui n’ont pas personnalisé leur en-tête. La lecture ne crée aucune ligne. La préférence personnelle disparaît avec le compte. Les chemins d’images locaux sont résolus depuis la racine de l’application.

Les clients peuvent fournir un UUID à la création d’un numéro puis sa révision à l’édition, à l’archivage ou à la suppression. Une tentative de création répétée renvoie le même numéro. Une modification périmée renvoie HTTP 409. L’éditeur conserve le brouillon pour comparaison. La suppression efface le texte et conserve un marqueur qui empêche un ancien envoi de recréer le numéro. Les anciens clients peuvent continuer à utiliser les routes sans fournir de révision. Les formulaires interprètent la date saisie dans le fuseau du navigateur et enregistrent l’instant UTC correspondant.

**Installation.** Appliquer les migrations `20261119007000_newsletter_header` et `20261119008000_newsletter_articles` avec `prisma migrate deploy`. Les articles existants commencent à la révision zéro. La configuration historique de l’en-tête reste en place. Le parcours couvre la préparation, la consultation et l’archivage des numéros par leur auteur.

**Recette PostgreSQL 16.15.** Trois tests de `tests/modules-postgres.test.ts` vérifient l’héritage de la configuration d’origine, les photos personnelles et le cycle de vie des numéros. La création simultanée de la première préférence a donné un succès et un conflit. Le second compte a défini une autre photo. Deux créations du même numéro ont produit un seul article. Les modifications concurrentes, l’accès d’un autre auteur, la date invalide, l’édition du titre vide, l’archivage, le désarchivage et le rejeu après suppression ont été vérifiés.

**État de livraison antérieur.** Les runs 44441503958 (Skeleton), 44442326489 (Tableau blanc) et 44442981834 (Templates) sont verts. Ils ont construit et installé le wheel de la PR, puis ouvert les six écrans de chargement dans un navigateur. Les correctifs sont en revue dans la PR 260. Ces installations de recette ne constituent pas un déploiement public.

**Recette Chromium sur installation standalone.** Depuis un compte de recette, la photo locale a été enregistrée, puis affichée sur le numéro créé. L’éditeur a conservé le 1er décembre à 12 h dans le fuseau de Paris, correspondant à 11 h UTC en base. Une modification concurrente du contenu a affiché la nouvelle version tout en conservant le titre en cours de saisie. La reprise explicite du brouillon a réussi. Après archivage, redémarrage du serveur et nouvelle connexion, la photo était lisible, le titre corrigé et l’état archivé étaient présents. Le désarchivage, la conservation après refus de suppression, puis la suppression confirmée depuis la liste ont réussi.

**Prochain module.** Wiki. La recette du fil de commentaires a déjà été effectuée. Reprendre les opérations propres aux articles, à leur publication et à l’export.

## Wiki — premier lot de recette, export et navigation

L’export ZIP des articles sélectionnés produit un fichier Markdown par slug. Les valeurs du frontmatter sont encodées comme des scalaires et tableaux YAML. Un titre contenant deux-points et une étiquette « true » conservent leur type texte. L’API commence à diffuser l’archive pendant sa fabrication. Un changement de visibilité ou une sélection dépassant 100 articles donne une réponse explicite avant téléchargement. L’interface assemble localement les documents invités avec les documents publiés sélectionnés. Le texte d’un brouillon invité reste dans le navigateur.

La liste des sous-articles, leur compteur et les liens entrants suivent désormais la même visibilité que la lecture de l’article. La recette PostgreSQL « lists article children, their count and backlinks consistently for editorial and published views » a compté deux articles dans la vue éditoriale et un dans la vue publiée. La recette « streams a complete selected Wiki issue and preserves Markdown and YAML values » a téléchargé et décompressé un article de plus de 200 ko. Le contrôle CRC a réussi et le texte complet correspond à la source.

**Livraison précédente.** Le run 44444013335, qui inclut les migrations et les tests Newsletter, est vert. Les versions en revue sont celles de la PR 260. Aucun déploiement sur le domaine de production n’a été effectué par ce chantier.

**Recette ZIP en navigateur.** Depuis la page publique du serveur standalone, Chromium a créé un article invité, l’a sélectionné avec un article publié en base, puis a téléchargé l’archive via la commande « Exporter en ZIP ». La requête serveur contenait uniquement le slug de l’article en base. Le lecteur ZIP de Python a contrôlé les deux fichiers et leur contenu hors ligne. La commande d’export se trouve dans la zone défilante des documents sélectionnés, accessible à la souris sous l’en-tête fixe.

**Première recette ouverte.** Poursuivre le Wiki avec l’édition concurrente des articles, l’attribution de l’auteur de chaque révision, la restauration avec reconstruction des liens et le traitement explicite des échecs de sauvegarde en mode invité. Après le Wiki vient Monitor. Avant le bilan des 32, reprendre également les limites consignées sur les premiers modules, dont le parcours OAuth externe d’Authentification et la persistance des séries du Calendrier.

## Wiki — édition, historique et restauration

La révision lue par l’éditeur accompagne les sauvegardes manuelles et automatiques. Lorsque deux personnes enregistrent la même révision, une seule écriture aboutit. L’autre éditeur conserve le brouillon et présente la version enregistrée pour permettre une reprise explicite. Restaurer une révision remet son titre et son contenu, recalcule les liens et conserve la version remplacée. L’historique indique la personne qui a effectué l’opération. Les clients API existants peuvent continuer à omettre le numéro de révision. Appliquer la migration `20261119009000_wiki_revision` avant de démarrer la nouvelle version.

Les articles invités conservent leurs métadonnées et les anciennes entrées commencent à la révision zéro. Web Locks sérialise les écritures entre onglets sur les navigateurs compatibles. Sur un navigateur sans Web Locks, le contrôle de révision reste disponible, avec une limite pour deux écritures strictement simultanées dans des onglets différents.

**Preuves du 19 novembre.** Le test PostgreSQL « serializes wiki edits and restores the title, content and backlinks in one revision » est passé sur une base 16.15 migrée depuis zéro avec les treize autres tests de modules. Les deux tests de `tests/wiki-guest.test.ts` vérifient une ancienne entrée, une édition périmée, le refus d’un slug réservé et la conservation des données en cas de quota atteint ou de stockage illisible. Chromium a créé l’article « Article recette » sur le serveur standalone. Une seconde écriture a provoqué le conflit attendu, la reprise a enregistré le texte saisi et la restauration a remis le texte initial. Après arrêt et redémarrage du serveur, la lecture a retrouvé ce texte à la révision 3. Dans le formulaire invité, une erreur de quota a laissé le texte saisi visible. Les polices distantes du build de recette ont été remplacées localement.

**Livraison.** Le run 44444836518 du lot d’export est vert. Les modifications du Wiki sont proposées dans la PR 260. Le prochain module est Monitor, dont la procédure d’installation demande de créer trois fichiers serveur absents du dépôt.

## Monitor — installation du prompteur et séance PowerPoint

Le dépôt fournit désormais le service FastAPI attendu par la page et par les applications clientes de `/api/prompteur`. L’import lit le fichier PowerPoint et extrait les titres, le texte, les notes et les indicateurs signalés par « KPI: ». Il fonctionne sans clé. Pour les questions, la traduction et le résumé, l’exploitant définit le modèle avec `PROMPTEUR_MODEL` et l’utilisateur fournit sa propre clé Claude. Les instructions d’installation, d’écoute locale et de routage figurent dans `deploy/DEPLOY_APP.md`.

Le navigateur enregistre en une écriture le support, la diapositive courante et les questions avec leurs réponses. Les anciennes séances sont reprises. Un onglet dont la version a changé signale le conflit et garde son brouillon. Web Locks sérialise ces contrôles entre onglets compatibles. Changer de présentation arrête les requêtes en cours et vide le journal de la séance précédente. Un flux interrompu s’affiche en erreur et sa réponse partielle reste hors du journal.

**Installation et API.** Un environnement Python 3.12 vierge a installé les dépendances de `deploy/prompteur-api-requirements.txt`. Les trois tests de `tests/monitor/test_service.py` y ont réussi. Deux présentations importées simultanément ont rendu leurs propres titres, notes et indicateurs. Le service a rejeté un fichier vide, une demande sans clé et un texte vide. Les trois commandes IA ont utilisé un transport HTTP de recette en mémoire. Les quatre tests TypeScript de `monitor-session` et `monitor-stream` couvrent les anciennes données, le conflit entre onglets, la fragmentation UTF-8, les retours à la ligne et les erreurs de flux.

**Recette Chromium.** Le serveur Next standalone a transmis les appels au service Python installé. Chromium a importé « Revue QA », changé de diapositive, corrigé le script et posé une question. La réponse dépliable, la traduction et le résumé ont été lus dans l’interface. Le rechargement a retrouvé le script corrigé et la question. L’ouverture de la démo a vidé le journal. Le fournisseur de recette a vérifié le contexte de la diapositive et la reprise de la réponse dans la demande de résumé. Les appels Claude réels et la disponibilité du modèle choisi chez l’exploitant restent à vérifier lors de la configuration. Le contrôle couvre les opérations et la circulation du contenu avec un fournisseur isolé.

**Livraison.** Le run 44468947193 du correctif Wiki est vert. La recette Monitor a utilisé une installation locale, sans publication de version ni déploiement sur le domaine public. Le prochain module est Keep screen on. Vérifier la libération effective du verrou si une nouvelle durée est choisie pendant une demande en cours, puis le retour de l’onglet au premier plan.

## Keep screen on — verrou d’écran dans le site et dans une application React

L’interface et les applications utilisent le même hook. L’entrée `@blueprint-modular/core/keep-screen-on` s’installe dans une application React sans dépendance à Next. Chaque verrou appartient à la durée demandée. Si le navigateur accorde une ancienne demande après un changement de durée, le hook libère immédiatement ce verrou. Une libération système met à jour le voyant. Le retour au premier plan reprend seulement le temps restant. Un refus peut être retenté en choisissant à nouveau la même durée. Le rechargement ou la fermeture du composant termine la séance.

**Preuves du 19 novembre.** Les trois tests de `packages/core/gate/screen-wake-lock.test.ts` vérifient une demande tardive, deux durées successives, la libération au démontage, le refus et la nouvelle tentative, le retour au premier plan, l’échéance initiale et l’absence de prise en charge. Un consommateur Vite distinct a installé le tarball construit par `npm pack`. Chromium y a demandé puis relâché un vrai verrou natif après attribution de la permission de recette. La fiche Modular sur le serveur standalone a activé cinq minutes puis le mode indéfini. Après rechargement elle affichait « Écran non maintenu ». La recette vérifie le signal du navigateur, sans mesure physique de veille d’un téléphone.

**Livraison.** Le paquet a été fabriqué et installé localement sous la version de travail du dépôt. La diffusion npm passe par l’attribution d’une version inédite et le workflow de publication après intégration. Aucun paquet de ce chantier n’a été publié au registre. La prochaine recette est Gestion de parc. Reprendre les parcours et les contrôles de rôles existants avant de modifier les affectations de matériel.

## Gestion de parc — création et relecture des fiches d’inventaire

La création passe par le même endpoint pour les deux formulaires et les clients applicatifs. L’actif et ses caractéristiques sont inscrits dans une transaction. Le serveur contrôle les dates, le domaine, le type, le statut et les clés d’attribut en double. Les références automatiques conservent le format utilisé par les formulaires. Leur attribution est sérialisée par préfixe jusqu’à validation de la transaction. Le suffixe suivant découle des numéros existants, ce qui évite les collisions après suppression d’une fiche. Une référence manuelle déjà présente renvoie HTTP 409.

**Preuves du 19 novembre.** Sur PostgreSQL 16.15 migré depuis zéro, le test « creates inventory records and their attributes together with independent concurrent references » a créé deux ordinateurs en parallèle et obtenu deux numéros différents. Il a supprimé une fiche, recréé un actif, retrouvé les deux fiches par recherche et vérifié le rejet d’une référence en double, d’une date impossible, d’un statut inconnu et d’une caractéristique répétée. Les quinze tests PostgreSQL de modules et les dix tests de rôles du parc sont passés. Chromium a ouvert le formulaire détaillé avec un compte administrateur de recette, choisi un portable et enregistré « Poste QA » avec 32 Go de RAM. Après arrêt et redémarrage de Next, la nouvelle connexion a retrouvé la fiche et son attribut numérique.

**État du catalogue.** Seize des trente-deux modules disposent maintenant d’au moins une recette métier documentée. La recette complète de Gestion de parc reste ouverte. Traiter les prêts simultanés d’un même bien, les retours pour les deux domaines, la mise en cohérence du statut du bien et les erreurs visibles depuis les formulaires. Le retour de matériel applique actuellement le statut « in_stock » même au domaine maintenance, qui ne le déclare pas. Reprendre ensuite les tickets et les autres opérations du module avant Base contractuelle. Les runs 44469650154 (Monitor) et 44470242839 (Keep screen on) sont verts. Les lots sont en revue sur la branche de la PR 260.

## Gestion de parc — prêter à un bénéficiaire et enregistrer la restitution

Les commandes de prêt et de restitution verrouillent la fiche de l’actif pendant la transaction. Un prêt actif ou en retard empêche une nouvelle affectation. Un retour répété relit le premier reçu. En informatique, le prêt marque le matériel comme affecté et la restitution le remet en stock si aucun autre prêt historique ne reste ouvert. En maintenance, le prêt conserve le statut de fonctionnement de la machine. Les anciens prêts en double peuvent ainsi être soldés individuellement. L’éditeur transmet la date de modification lue pour détecter une modification concurrente. Le formulaire permet aux administrateurs de sélectionner le bénéficiaire dans l’annuaire de l’instance mono-tenant.

**Preuves.** Le test PostgreSQL « serializes loans and returns without changing the maintenance domain's operating status » a obtenu un succès et un conflit lors de deux affectations simultanées, dans chacun des deux domaines. Il a aussi vérifié une échéance incohérente, une édition périmée, le retour simultané d’un prêt en retard, la stabilité du reçu et une nouvelle affectation. Les seize tests de modules sont passés sur PostgreSQL 16.15 après installation des migrations. Chromium a prêté un portable depuis le compte administrateur de recette à un deuxième compte. Le formulaire a signalé la seconde tentative. Après redémarrage du serveur standalone et nouvelle connexion, la liste a retrouvé le bénéficiaire et la restitution confirmée a remis le portable en stock.

**Livraison.** Le run 44470969157 de la création des fiches d’inventaire est vert. Les prêts utilisent les tables existantes. Les correctifs rejoignent la PR 260 en revue. Prochain parcours de Gestion de parc : création, traitement et clôture des tickets, avec contrôle des délais et des écritures simultanées.

## Gestion de parc — incidents, échéances et solutions

La création du ticket réserve son numéro dans la transaction d’insertion. Le type, la priorité, la catégorie et l’actif lié sont contrôlés dans le domaine du ticket. L’échéance est calculée depuis l’ouverture et la priorité. La prise en charge, la résolution et la clôture conservent leurs dates quand la commande est rejouée. Une réouverture efface les dates de résolution et de clôture. La liste des incidents en risque SLA traite aussi les tickets au-delà des deux cents premiers et utilise l’échéance enregistrée, avec calcul depuis la configuration pour les anciennes lignes.

**Preuves.** Le test « keeps ticket numbers, deadlines and resolution dates coherent across concurrent edits and reopening » sur PostgreSQL 16.15 a vérifié deux numéros distincts attribués simultanément, une priorité critique à quatre heures, deux éditions de la même version donnant un succès et un conflit, la stabilité de la clôture, la réouverture et le signalement du seul incident en retard. Les dix-sept tests PostgreSQL de modules sont passés après migration depuis zéro. Chromium a créé « Incident de recette », saisi une solution et reçu la modification d’un second éditeur. La reprise explicite a conservé la saisie et clôturé le ticket. Après redémarrage complet et nouvelle connexion, la solution figurait encore sur la fiche. Le bouton « Publier en connaissances » a prérempli un article avec la solution et la description. L’article enregistré a été relu dans le navigateur.

**Livraison.** Le serveur standalone a été construit et installé en recette. Les lots prêts et tickets sont proposés dans la PR 260. La qualification de Gestion de parc reste ouverte pour la gestion des connaissances elle-même, les changements soumis au CAB, les relations de parc, les mouvements, les contrats et la piste d’audit.

## Gestion de parc — retrouver, publier et évaluer les solutions

La publication depuis un ticket résolu ou clos conserve son identifiant. Un nouveau ticket propose jusqu’à cinq solutions de sa catégorie. La recherche dans la base porte sur le titre, le contenu et les tags. Un membre voit les articles publics de l’instance. Les administrateurs et propriétaires voient aussi les articles réservés aux techniciens. Deux créations simultanées portant le même titre reçoivent des adresses distinctes. L’édition et la suppression depuis la fiche contrôlent la version lue.

La consultation via GET reste sans effet de bord. L’écran enregistre une lecture par compte, permet de changer ou retirer son vote et conserve les compteurs historiques. Les lectures ne changent pas la version du texte en cours d’édition. Installer la migration `20261119010000_knowledge_engagement` et régénérer le client Prisma avant de démarrer cette version. La clé étrangère du ticket contrôle les nouveaux liens et tolère les références anciennes déjà orphelines à la migration.

**Preuves.** Le test PostgreSQL « links ticket solutions, scopes reader visibility and records each reader and vote once across retries » vérifie le refus d’un ticket encore ouvert, la recherche avec un compte lecteur, les publications homonymes, deux lecteurs et des votes simultanés, le conflit de rédaction et la suppression conditionnelle. Les dix-huit tests de modules sont passés sur PostgreSQL 16.15 après migration depuis zéro. Dans Chromium, un administrateur de recette a publié une solution, voté et retrouvé sa suggestion depuis le formulaire de ticket. Après redémarrage du serveur standalone et nouvelle connexion, la recherche par contenu a retrouvé l’article. Le changement puis le retrait de l’avis ont conservé une seule lecture. La modification du contenu et la suppression ont été confirmées par relecture.

**Livraison et suite.** Les CI des prêts (44473085665) et des tickets (44473636191) sont vertes. Ces versions et le lot connaissances sont en revue dans la PR 260. Le serveur standalone a été installé en recette. La production reste sur sa version antérieure selon les dernières vérifications de ce chantier. Gestion de parc reste ouvert. Reprendre les changements et le comité d’approbation (CAB), notamment la numérotation globale entre domaines, la concurrence des décisions, le vote prévu par la configuration et le calendrier, avant les relations, mouvements, contrats et audit.

## Gestion de parc — déposer une demande de changement et la retrouver au calendrier

Les deux domaines partagent la séquence annuelle CHG car la référence est unique dans la base entière. La réservation du numéro et la création du brouillon sont atomiques. L’API contrôle les dates calendaires, leur ordre et l’appartenance au domaine des tickets et actifs fournis. Le formulaire conserve les champs lorsqu’une date doit être corrigée. Le calendrier charge les changements qui recouvrent le mois affiché et présente chaque journée couverte, avec accès à toutes les fiches de la journée.

**Preuves.** Le test « allocates change numbers across domains and preserves linked assets and planning dates » a obtenu deux références différentes lors de créations simultanées en informatique et en maintenance. Il a rejeté une date impossible, un intervalle inversé, un actif d’un autre domaine et un ticket absent. Les dix-neuf tests PostgreSQL sont passés sur une installation migrée depuis zéro. Chromium a saisi une demande, corrigé les dates après lecture de l’erreur et relu le plan de retour arrière. Après redémarrage du serveur standalone, le changement figurait au calendrier de fin de mois puis au premier jour du mois suivant. Le lien de cette seconde journée a rouvert la bonne fiche.

**État.** Le dépôt et la planification ont été testés en recette pour la PR 260. La décision du CAB et les modifications ultérieures de la demande nécessitent leur propre recette. La numérotation et la consultation du calendrier utilisent le schéma existant.

## Gestion de parc — voter en comité et suivre l’exécution du changement

À l’ouverture d’une revue, le serveur enregistre le tour, ses membres et le nombre de voix requis. Le parc est mono-tenant et les rôles habilités au CAB dans cette version sont ADMIN et OWNER. En l’absence d’annuaire de groupes CAB distinct, le collège est constitué des comptes portant ces rôles à la soumission. L’informatique prévoit l’unanimité. Le moteur accepte aussi une majorité stricte si le domaine la configure. Une urgence requiert une approbation et notifie le collège dans l’application. Un changement standard à faible risque dont le titre correspond au catalogue préapprouvé du domaine peut passer directement en approuvé.

Le vote verrouille la demande et inscrit la décision et son auteur dans le journal, dans la même transaction. Le formulaire indique le nombre de votes favorables et bloque le second vote du même compte. Une nouvelle soumission ouvre un autre tour. Une ancienne fiche peut être relue après migration et une revue historique encore ouverte reçoit son collège au vote suivant. Le serveur contrôle les transitions, les dates, le périmètre soumis et la version d’édition. Les dates réelles et le résultat sont enregistrés aux étapes d’exécution. Installer la migration `20261119011000_change_cab_ballot` et régénérer le client Prisma.

**Preuves.** Le test « records one CAB vote per member and review, enforces the quorum and retains the decision on restart » couvre deux appels simultanés du même membre, un rejet motivé, une nouvelle soumission, un vote tardif, l’unanimité à deux, une édition périmée, la traçabilité et les dates de clôture. Il vérifie aussi une urgence avec deux notifications internes isolées, deux décisions concurrentes, la préapprobation d’un changement catalogue et une revue historique. Vingt tests de modules sont passés sur PostgreSQL 16.15 après migration depuis zéro. En Chromium, un premier administrateur a soumis puis approuvé une demande. Après redémarrage du serveur standalone, le second administrateur a retrouvé le premier vote, apporté la seconde approbation, planifié, démarré et terminé le changement. L’API a confirmé le résultat et les deux dates réelles.

**Livraison et suite.** Le lot CAB rejoint la PR 260 en revue. Aucun déploiement de ce lot n’a été déclenché. Le prochain parcours ouvert du parc est la cartographie des relations entre actifs, dont les types configurés en informatique et les doublons lors d’une création simultanée.

## Gestion de parc — relier les équipements et parcourir les dépendances

La fiche propose les types configurés par domaine et conserve les cinq types historiques. Les deux actifs sont verrouillés dans un ordre stable avant l’ajout. Une connexion ou une utilité partagée relie la paire dans les deux sens. Une dépendance dirigée conserve son sens. La seconde création en concurrence renvoie le conflit avec l’identifiant de la relation existante. Les suppressions concurrentes et les créations écrivent chacune une seule entrée d’audit par opération réussie. Les enregistrements antérieurs sont conservés.

Le lien de cartographie sur une fiche centre le graphe sur cet équipement. L’utilisateur peut afficher un, deux ou trois niveaux et ouvrir un nœud au clavier. L’URL générale de cartographie continue à montrer le parc. Le formulaire conserve sa sélection et affiche l’erreur en cas de doublon.

**Preuves.** Le test « preserves directional links and serializes symmetric CMDB relations across both asset records » a obtenu un succès et un conflit pour deux créations inverses de la même connexion. Il a vérifié deux directions distinctes pour une relation orientée, les deux filtres source et cible, le refus d’un lien entre domaines, la lecture par un membre, la suppression concurrente, les deux entrées d’audit et la disparition des liens lors du retrait de l’actif. Les vingt et un tests des modules sont passés sur PostgreSQL 16.15 après migration depuis zéro. Dans Chromium, un administrateur de recette a créé « Imprime sur » entre un poste et une imprimante puis constaté l’erreur de doublon. Après redémarrage du serveur standalone, le graphe a retrouvé l’imprimante à un niveau et le routeur à deux. La navigation clavier a ouvert l’imprimante et la suppression du lien entrant a préservé sa connexion au routeur.

**Livraison et suite.** Le lot planification est vert dans le run 44475130530. La cartographie n’ajoute aucune migration. La prochaine recette de Gestion de parc porte sur l’historique physique des actifs, notamment la modification d’un mouvement, la persistance des corrections, les lieux de départ et d’arrivée et la gestion d’une double saisie.

## Gestion de parc — enregistrer et corriger un déplacement physique

Le journal accepte les lieux de départ et d’arrivée. Le dernier déplacement daté portant une destination met à jour l’emplacement de l’actif. Une saisie historique antérieure reste dans la chronologie. Corriger ou retirer le dernier déplacement rétablit la destination précédente, sauf si l’emplacement d’inventaire a depuis été corrigé indépendamment. Les identifiants de tickets sont vérifiés dans le domaine de l’actif. Les lieux sont les identifiants libres déjà employés par le parc.

Les clients peuvent rejouer une création avec le même en-tête `Idempotency-Key`. L’écran conserve la clé de son formulaire. Une révision protège les corrections concurrentes. Lors d’un conflit, l’historique montre la version enregistrée et l’opérateur peut reprendre les champs modifiés de sa saisie. Un retrait conserve la trace de l’opération et empêche un ancien appel de recréer le mouvement. Installer la migration `20261119012000_movement_revision` et régénérer le client Prisma.

**Preuves.** « retries a physical move once, reconciles location in date order and guards revisions including withdrawal » a vérifié deux créations simultanées donnant un seul mouvement, le rejet d’une date impossible ou d’un départ incohérent, la saisie antidatée, deux corrections concurrentes, le retrait périmé puis accepté et la relecture du journal d’audit. Les vingt-deux tests de modules sont passés dans PostgreSQL 16.15 après migration depuis zéro. Chromium a enregistré le passage du stock à l’atelier après correction du lieu de départ. Après redémarrage, un autre éditeur a ajouté une note. L’opérateur a repris sa correction de destination en conservant cette note. Le retrait confirmé a remis le poste à son emplacement initial. La recette a utilisé le serveur standalone compilé par Webpack.

**Livraison et suite.** La CI du comité d’approbation est verte (44475960627). Les mouvements rejoignent la PR 260 en revue. Reprendre les contrats et garanties du parc, en particulier la référence, les dates de préavis, le rattachement des équipements et la correction concurrente.

## Installation des modules — archive de livraison et vérification Android

Le commit parallèle `d81d036c` a ajouté la construction et la recette du catalogue à partir de son ZIP. Les correctifs de mouvements ont été repris sur cet arbre en conservant les dix fichiers de ce lot. Le job d’installation de la version `8eb8f781` a réussi. L’autre job du run 44477908472 a échoué sur un test Android qui recherchait la copie de `public` dans l’ancien script de déploiement.

**Preuve.** Le test « la copie standalone conserve le fichier assetlinks » exécute maintenant le script de copie commun sur deux installations de recette, l’une avec le serveur à la racine et l’autre dans le sous-dossier `blueprint-modular`. Le fichier Android `.well-known/assetlinks.json` a été retrouvé à l’identique dans les deux destinations. Les six tests Android locaux sont verts. La CI de la cartographie est verte (44476616686).

## Gestion de parc — contrats de couverture, préavis et renouvellement

La référence est réservée dans la transaction pour le domaine concerné. Une référence historique en double peut être conservée lors d’une modification de notes. Les dates réelles du calendrier, les montants, les jours de préavis, les délais d’alerte et les actifs couverts sont contrôlés à la création et à la modification. L’écran conserve un montant nul ou un préavis de zéro jour et accepte les montants saisis avec une virgule décimale. Une fiche donne accès au document et aux équipements couverts. Une correction concurrente permet de relire les changements et de confirmer les champs saisis.

Le tableau de bord et la liste filtrée emploient le délai d’alerte du contrat. Pour une reconduction automatique, le délai court avant la date limite de préavis. La fenêtre reste visible jusqu’au jour de fin inclus. L’édition et la suppression sont conditionnées à la version lue. Une opération réussie alimente le journal dans la même transaction.

**Preuves.** « reserves contract references per domain and keeps deadlines, notice and coverage consistent across edits » vérifie la collision de référence dans un même domaine, sa réutilisation dans un autre, le préavis et l’alerte nuls, les bornes de la fenêtre de renouvellement, la suppression d’une couverture et les conflits entre deux éditeurs. Les vingt-trois tests de modules sont passés dans PostgreSQL 16.15 après installation des migrations. Chromium a corrigé une date de fin invalide, enregistré 1 234,50 €, un préavis nul, un document et un portable couvert. Après redémarrage du serveur standalone, le tableau de bord a conduit au contrat à quarante jours de sa fin grâce à son alerte réglée à soixante jours. La correction de son libellé a conservé le fournisseur ajouté entre-temps. La suppression a été confirmée par relecture de l’API.

**Suite.** La version de recette et les correctifs sont proposés dans la PR 260. Reprendre la modification et la suppression des fiches d’inventaire avec leurs attributs et leur journal, puis la consultation de l’audit. La Base contractuelle du catalogue est un module distinct.

## Analyse des contrats, documents PDF et conversations

Une analyse terminée doit contenir une synthèse exploitable. Le contrôle vérifie aussi la structure des signataires, engagements, échéances et listes avant de les afficher. Le niveau de risque reste absent lorsque le fournisseur ne le renseigne pas. La lecture PDF remet un tableau d’octets standard à PDF.js. Le même PDF produit par Chromium échouait avec un Buffer Node et a donné son texte intégral après cette correction. La fiche Contrat accepte désormais le passage du chargement à l’affichage sans changer le nombre de hooks React.

Le chemin JSON des conversations et le chemin en streaming utilisent le fournisseur configuré. L’écriture du tour et de son aperçu est transactionnelle. Un flux interrompu ne laisse aucun tour dans l’historique. Sur le serveur standalone et PostgreSQL 16.15, la recette a importé simultanément deux exemplaires d’un contrat, analysé le PDF « Atelier Saphir », coupé le fournisseur puis redémarré le serveur. Après reconnexion, la fiche a affiché le résumé, la relance a abouti et la conversation contenait exactement les deux réponses réussies. Le fournisseur de recette utilisait le protocole HTTP Ollama sur la boucle locale.

## Rapports et tableaux de bord personnels

Le parcours « Mes rapports » utilise les documents et les contrats appartenant au compte connecté. L’utilisateur choisit une période en jours UTC inclusifs. PostgreSQL conserve les effectifs par statut à la date de génération. Le CSV et le graphique relisent le même instantané, y compris après suppression du document source. Un nouvel envoi de la même demande récupère le rapport initial. Les modèles de chiffre d’affaires, de commandes et de ressources humaines de la galerie conservent leurs jeux de démonstration.

« Mon tableau de bord » permet de composer des graphiques et des totaux à partir de ces rapports, d’en modifier l’ordre et de retirer un indicateur. La révision en base détecte les modifications concurrentes. L’API refuse tout rapport absent du compte. Pour installer ces parcours, appliquer les migrations `20261119020000_report_snapshot` et `20261119020500_personal_dashboard` et régénérer le client Prisma.

**Recette sur le ZIP installé.** Sur PostgreSQL 16.15 migré depuis zéro, le serveur standalone a renvoyé 201 pour la génération du rapport, 200 pour sa répétition et 409 pour la réutilisation du même identifiant avec une autre source. Après redémarrage et suppression du document, le CSV contenait toujours la ligne « done », effectif 1. Deux créations concurrentes de tableau ont donné 200 et 409. Chromium a retiré le widget puis généré un nouveau rapport à zéro depuis l’espace utilisateur. Les neuf tests unitaires du transport IA et de l’analyse sont également verts.

## Tâches d’équipe et journal d’audit

Les membres d’une organisation peuvent consulter et créer des tâches dans son espace. Le responsable et le membre assigné peuvent faire avancer le travail. Chaque modification vérifie la révision et écrit son événement dans la même transaction. Une création rejouée avec la même clé conserve une seule tâche et une seule notification. Le journal conserve l’auteur, la date et le changement après la suppression de la tâche. La recette installée couvre deux comptes, une organisation étrangère, les révisions périmées, la notification, le redémarrage et la consultation du journal dans Chromium.

## Versions et contenu des livrables

Pour ce lot, le ZIP passe en 0.1.61, le paquet Python en 0.1.55 et le paquet React en 0.3.17. Les versions précédentes de Python et du core étaient déjà présentes sur leurs registres. La roue embarque le manifeste des 32 modules et le guide annoncé par la documentation. Le sous-chemin React `./schema` expose la déclaration effective de `validateAndEnrichSpec` et des types `AppSpec`. La recette compare les noms des 32 modules et les sources des workers entre ZIP et roue, puis contrôle les points d’entrée du tarball npm. Ces contrôles s’exécutent avant la mise à disposition des trois fichiers dans la CI.
## Gestion de parc — édition et retrait d’un équipement

La fiche d’inventaire permet de corriger les données et les attributs spécifiques au type d’équipement. Une sauvegarde conserve les attributs historiques inconnus du formulaire. Après une modification concurrente, l’opérateur peut reprendre ses propres champs sur la dernière révision. Un équipement prêté doit être rendu avant son retrait. Une transaction enregistre les données et leur trace avant/après.

**Preuves.** « edits inventory and its attributes in one revision and records the complete lifecycle audit » figure parmi les 24 tests passés sur PostgreSQL 16.15 après installation depuis zéro. Dans Chromium, un opérateur a porté la mémoire d’un portable de 32 à 64 Go alors qu’un second client changeait son nom. Après résolution du conflit et redémarrage du serveur standalone, le nom, la mémoire et l’attribut historique ont été relus. Le retrait depuis la fiche a conservé la dernière version de l’équipement dans le journal. Le parcours a utilisé les données et le compte de recette uniquement.

**Suite.** Reprendre la consultation et la pagination du journal sur la branche de la PR 260.

## Gestion de parc — retrouver une opération dans le journal

La liste est filtrable par période, action, type et identifiant de ressource. La date de fin inclut toute la journée UTC. Le curseur combine la date de l’opération et son identifiant pour départager des écritures simultanées. L’application peut récupérer la page suivante dans l’en-tête `X-Next-Cursor`. L’écran permet de relire l’auteur et les états avant et après, y compris pour une fiche supprimée.

**Preuves.** « pages a filtered audit by timestamp and id while newer entries arrive » couvre trois écritures simultanées, l’arrivée d’une opération après la première page, les limites de date et de domaine, la date impossible, le curseur invalide et la session absente. Les 25 tests PostgreSQL 16.15 ont réussi après application des migrations sur une base vide. Sur le serveur standalone, Chromium a filtré l’historique d’un portable de recette, retrouvé ses deux opérations et ouvert le contenu conservé avant suppression. Après redémarrage et nouvelle connexion, la même opération et son auteur restaient consultables.

**État.** La CI de la révision contrats `84995c55` a réussi, installation du ZIP comprise (run 44478656770). La révision inventaire `632aabd9` est en revue. Le chantier se poursuit avec la cohérence des échéances de tickets entre le tableau de bord, la liste et la fiche, ainsi que l’accès aux tickets anciens.

## Gestion de parc — retrouver un incident ancien en dépassement de délai

Le tableau de bord, la liste, la fiche et l’API d’alerte utilisent l’échéance enregistrée sur le ticket, y compris lorsqu’il est en attente. Un ticket ancien sans échéance conserve le calcul selon sa priorité. Le lien d’alerte du tableau de bord ouvre les tickets concernés. Les applications peuvent parcourir tickets et affectations par pages de 200 avec l’en-tête `X-Next-Cursor`. Les listes, leurs exports et les compteurs du domaine lisent les pages suivantes.

**Preuves.** « finds an older on-hold SLA incident and pages equal-date tickets and loans beyond 200 » vérifie 202 tickets, 201 affectations, les dates identiques, les seuils à 80 % et 100 %, une ancienne priorité et la clôture. Les 26 tests de modules sont passés sur PostgreSQL 16.15 après migration depuis zéro. Chromium a ouvert l’alerte pour l’unique incident en attente parmi 202 tickets. La fiche affichait le délai contractuel dépassé malgré sa priorité basse. Après redémarrage du serveur standalone, la clôture de l’incident a retiré l’alerte du tableau de bord.

**Coordination.** La PR 260 conserve la recette de Gestion de parc. La PR 261 travaille en parallèle sur IA, Documents et la Base contractuelle. La PR 262 complète ces travaux et traite Rapports et Tableaux de bord. Les trois PR étaient ouvertes à la vérification, avec des bases successives. Rapprocher leurs preuves et leurs têtes avant de reprendre ces modules ou de compter les modules qualifiés. Les jobs d’installation des versions inventaire `632aabd9` et audit `fd7c4a2e` ont réussi. Ces correctifs restent en revue.

**Suite du parc.** Traiter l’exécution des escalades prévues dans le domaine informatique, avec des destinataires internes de recette, un contrôle de reprise et un journal des actions. Vérifier aussi les droits par domaine et les procédures de restauration sur installation isolée avant de clôturer ce module.

## Gestion de parc — exécuter les escalades et vérifier leur réception

Le domaine informatique livre des règles à 50 %, 80 % et 100 % pour les tickets critiques. La commande installable traite les seuils franchis, inscrit la notification personnelle et le reçu dans la même transaction et réaffecte le ticket au technicien de permanence pour le palier de 80 %. Un compte de service admin/owner identifié signe le journal. Les destinataires viennent du routage privé de l’installation. Avec un espace de travail, tous les comptes doivent appartenir à son organisation. Sans espace, le traitement se limite aux tickets du domaine sans espace. La fiche donne accès au journal filtré de l’incident.

**Installation.** Le worker est inclus dans le ZIP, sous `application/lib/asset-manager/escalate-sla.mjs`. La commande, le routage et la planification toutes les cinq minutes sont documentés dans `docs/modules-bundle.md`. Le traitement fonctionne avec les tables existantes. Il peut reprendre sur le dernier état persistant.

**Preuves.** « delivers SLA escalations once, routes reassignment and records the personal inbox receipts » a exercé les seuils, deux workers, la reprise, le ticket résolu, les limites d’espace, les droits du technicien, la configuration invalide, la répartition des notifications et les reçus. Les 27 tests PostgreSQL 16.15 ont réussi après migration depuis zéro. L’archive a été extraite et ses dépendances réinstallées par `npm ci`. Deux processus CLI lancés simultanément depuis cette installation ont produit trois actions au total. Après reprise, un nouveau processus a produit zéro doublon. Dans Chromium, le technicien a ouvert l’historique depuis la fiche, retrouvé les trois opérations et consulté leurs reçus. Une session personnelle a retrouvé la notification qui lui était destinée après redémarrage. Seuls des comptes locaux en example.test ont participé.

**Livraison.** Les révisions inventaire et audit ont passé les deux jobs CI (44479589639 et 44479967765). L’activation du cron de l’exploitant et le déploiement de la branche restent à confirmer après intégration. La suite porte sur la portée administrative du journal, les droits du parc et la restauration isolée.

## Gestion de parc — accès au journal des opérations

Les instantanés avant/après restent accessibles aux administrateurs et propriétaires de l’installation. L’API relit le rôle du compte via la session personnelle. La navigation du parc et la fiche ticket proposent le journal aux rôles autorisés. Un lecteur peut continuer à parcourir les tickets et le tableau de bord.

**Preuves.** « pages a filtered audit by timestamp and id while newer entries arrive » vérifie aussi les trois cas de lecture du journal. Une session administrative obtient ses lignes, un compte lecteur reçoit HTTP 403 et une requête sans session HTTP 401. Les 27 tests de modules sur PostgreSQL et les 10 tests de rôles ont réussi. Chromium a relu l’historique avec le compte admin. Après redémarrage, un lecteur de recette a retrouvé son tableau de bord et ses tickets, et l’ouverture du journal a affiché le message de restriction.

## Gestion de parc — sauvegarde PostgreSQL et restauration isolée

La commande distribuée `deploy/backup-postgres.sh` construit un dump PostgreSQL privé et le décode intégralement avant sa publication dans le répertoire de la base. Un dump incomplet ne prend pas la place d’une archive valide. Seuls les fichiers de sauvegarde nommés par le script atteignant trente jours dans ce répertoire sont soumis à la rétention. La restauration exige une base vide et utilise une transaction. Les fichiers téléversés et les paramètres d’installation doivent aussi être sauvegardés par l’exploitant. Les commandes figurent dans `docs/DATABASE.md`.

**Recette de livraison.** Le test « Restore inventory and audit in a separate database » utilise les clients du conteneur PostgreSQL 16 de CI. Il couvre la restauration d’un portable, de sa mémoire, de l’auteur et du reçu d’audit, l’archive tronquée, la cible déjà occupée, les permissions du fichier et la rétention. Les scripts ont passé la vérification de syntaxe Bash. La restauration effective sur cette révision est à confirmer dans le job CI. Le cron quotidien de sauvegarde relève de l’installation.

## Connecteurs entrants

L’intégrateur conserve ses connexions authentifiées. Le worker lit des objets JSON par HTTP, des CSV en SFTP et des colonnes nommées dans PostgreSQL ou MySQL. Il conserve le dernier import complet après une panne ou un conflit de révision. Les identifiants de ligne doivent être uniques. Le contrôle de livraison utilise des connexions de test et le serveur SFTP OpenSSH en lecture seule.

## Thèmes et Multi-langue dans l’application consommatrice

Le paquet npm expose le format JSON exporté par le simulateur de thèmes et limite son application au conteneur fourni par l’intégrateur. Une attribution supprimée reprend le thème par défaut. Les dictionnaires peuvent venir de fichiers ou de la base de l’application. Le pluriel suit la grammaire de la traduction utilisée, y compris en cas de repli, et les montants et dates suivent la locale de l’utilisateur. Une recette hors dépôt charge les entrées publiques CommonJS et ESM du paquet.
## Rapprochement des 32 modules entre branches de revue

Point du 19 novembre à 08 h 47, heure de Paris. La PR 260 porte les parcours ci-dessous sur `c23590ad`. La lecture de `décisions.md` sur les têtes `97f7a415` (PR 261) et `bcec095e` (PR 262) établit les apports des deux suites. Ces PR s’empilent et évoluent en parallèle. Un parcours Python installé dans une application et un parcours interactif Next.js peuvent couvrir deux usages du même module. Chaque module compte une fois. À ces révisions, vingt-neuf des trente-deux ont au moins une opération métier documentée au-delà de la démonstration. La qualification de bout en bout sur une version commune reste ouverte.

| Module du catalogue | Recette métier identifiée | Branche de preuve |
|---|---|---|
| Gestion de parc | Fiche, prêt, retour, ticket, connaissances, CAB, CMDB, mouvements, contrats, escalade et journal. Restauration et droits suivis dans ce fichier. | 260 |
| Journal d’audit | Filtrage et export du journal applicatif, événement transactionnel et relecture après suppression d’une tâche. | 261 et 262 |
| Authentification | Inscription, courriel de recette, connexion et révocation. Le parcours avec le fournisseur Google de l’exploitant reste ouvert. | 260 |
| Calendrier | Événement personnel, intervalle de dates et correction concurrente. | 260 |
| Catalogue produits | SKU, EAN, mouvements et deux réservations de la dernière unité. | 261 |
| Commentaires | Fil d’un article Wiki et opérations de ses auteurs. | 260 |
| Connecteurs | Recette métier installée à rapprocher de la tête suivante. | À vérifier |
| Base contractuelle | Import simultané, analyse du PDF, panne du fournisseur, reprise de la fiche. | 261 et 262 |
| Devis-facturation | Acceptation concurrente, facture unique, deux règlements et pièce imprimable. | 261 |
| Documents | Import de pièces PDF, DOCX et TXT, stockage persistant et extraction. | 261 et 262 |
| Export planifié | Exécution concurrente, SMTP de recette, pièce jointe et reçus persistants. | 260 |
| Formulaire dynamique | Schéma versionné, soumission, options et décisions concurrentes. | 261 |
| IA | Fournisseur local, interruption et reprise, historique des seuls tours aboutis. | 261 et 262 |
| Keep screen on | Verrou de veille, durée, visibilité et libération dans une application React installée. | 260 |
| Monitor | Installation du prompteur et conduite d’une séance PowerPoint. | 260 |
| Multi-langue | Recette métier installée à rapprocher de la tête suivante. | À vérifier |
| Newsletter | Création, édition, photo et archivage d’un article personnel. | 260 |
| Notifications | Boîte personnelle, filtre et première lecture idempotente. | 260 |
| Notifications ciblées | Règles qui se recouvrent, destinataires dédupliqués, lectures individuelles et envoi en file. | 261 |
| Rapports | Agrégats Python sur données fournies, instantanés personnels et exports CSV dans le site. | 261 et 262 |
| Référentiels | Données de référence utilisées par une commande, désactivation et traçabilité. | 261 |
| Réservation / Créneaux | Réunion partagée, conflit de créneau, confidentialité du titre et annulation. | 260 |
| Skeleton | Six états de chargement vérifiés dans un paquet installé. | 260 |
| Tableau blanc | Atelier partagé, déplacement, correction concurrente et relecture après redémarrage. | 260 |
| Tableaux de bord | Indicateurs composés depuis les rapports du compte, ordre et révision concurrente. | 262 |
| Tâches | Assignation, transitions, retard, notification et suppression avec journal. | 261 et 262 |
| Templates | Rapport, fiche projet et brouillon EML téléchargés et relus. | 260 |
| Thèmes | Recette métier installée à rapprocher de la tête suivante. | À vérifier |
| Veille | Sources HTTP locales, collecte concurrente, contenu inchangé, panne et reprise. | 261 |
| Webhooks | Livraison HTTPS signée, erreur 503 puis reprise avec le même identifiant. | 260 |
| Wiki | Édition, versions, restauration, liens entrants et export ZIP. | 260 |
| Workflow | Transitions personnelles et journal persistants. L’approbation partagée reste à qualifier. | 260 |

**Production observée.** Le catalogue public de l’application et `/api/health` ont répondu HTTP 200. La valeur `1.0.0` exposée par la sonde correspond à la version du connecteur. Les deux adresses `/version.txt` sur le site et l’application ont répondu HTTP 404. Le commit du serveur reste indéterminé. Les PR ouvertes et les archives installées en recette ne constituent pas une preuve de publication du paquet ou du déploiement du commit.

**Restauration observée en CI.** Dans le run 44481919451 de `c23590ad`, l’étape « Restore inventory and audit in a separate database » a réussi. Une base vide a retrouvé « Portable restauration », 32 Go, l’auteur de recette et son reçu de création. L’archive tronquée a laissé la cible vide et la restauration répétée sur une base occupée a été refusée. Le job distinct d’installation des 32 modules depuis le ZIP a également réussi.

## Livraison — identifier la révision du serveur installé

Le ZIP contient le commit source en clair dans `application/BUILD-REVISION`. La compilation lit ce fichier ou le HEAD d’un dépôt Git local. La sonde HTTP renvoie désormais `sourceCommit` et `applicationVersion` en plus de la version historique du connecteur. Une copie de sources sans indication d’origine peut démarrer avec un commit nul.

**Preuve.** La recette « catalogue et session après redémarrage » a installé dans un répertoire neuf le ZIP de la révision de travail, réinstallé les paquets depuis le cache npm, compilé l’application et migré une base PostgreSQL isolée. Aux deux démarrages, la sonde a renvoyé exactement le SHA inscrit dans l’archive et la version 0.1.60 de son manifeste. Les 64 entrées de documentation et de démonstration ont répondu. Le rendez-vous du compte de recette et sa session ont survécu au redémarrage. Le guide de déploiement indique maintenant la sonde de l’application pour le rapprochement après mise en service.

## Gestion de parc — ouvrir et enregistrer les incidents d’un équipement

La fiche relit directement les tickets rattachés à l’équipement dans PostgreSQL. Elle peut afficher un incident ancien, même après la création de centaines de tickets pour d’autres équipements. « Nouveau ticket » est également disponible quand la fiche comporte déjà un incident. Le formulaire reprend l’actif consulté et vérifie sa présence dans le domaine avant de le présélectionner.

**Preuves.** « finds an older on-hold SLA incident and pages equal-date tickets and loans beyond 200 » relit sur l’actif le seul incident lié parmi 202 tickets. Les 27 tests PostgreSQL ont réussi sur une installation migrée depuis zéro. Chromium a ouvert le portable de recette, retrouvé l’incident ancien et créé un second ticket avec l’actif déjà sélectionné. Après redémarrage, les deux incidents figuraient sur la fiche et le lien de l’ancien incident ouvrait son détail.

**Reprise.** Le run 44481919451 a terminé avec ses deux jobs verts, restauration PostgreSQL incluse. Le nouveau lot Connecteurs des PR 261 (`9b337214`) et 262 (`b84c4d13`) documente respectivement les quatre opérations sortantes sur récepteur isolé et l’import entrant avec relecture de la dernière version complète. Cela porte à trente le nombre de modules ayant au moins un parcours métier documenté entre les trois branches aux révisions indiquées. Vérifier Thèmes et Multi-langue sur leurs têtes suivantes. Pour le parc, l’API expose déjà les champs communs marque, modèle, numéro de série, coût, dates et emplacement. Le formulaire partagé doit encore en permettre la saisie et la reprise concurrente. Poursuivre ensuite la vérification des droits par domaine.

**Coordination des suites.** Les têtes `8e513a12` et `9b337214` ont pour ancêtre commun `84995c55`. Quatre fichiers ont changé des deux côtés. La fusion à trois versions a rapproché automatiquement le workflow, le journal de décisions et la vérification de l’archive. Dans le guide d’installation, les deux branches avaient modifié le même paragraphe pour documenter respectivement la sonde de version et le volume de fichiers. Déplacer la vérification de version dans sa propre section sur la branche 260 a permis de réunir également ce guide en conservant les deux consignes. La fusion a été répétée hors du dépôt publié.

## Recette de la version candidate

Les 32 parcours, leurs prérequis et la surface à installer sont recensés dans `docs/modules-bundle.md`, également distribué dans le ZIP. Le test de publication compare les livrables entre eux. Un projet consommateur installe le tarball avec npm, puis exécute les opérations de traduction, de choix du thème et de résolution des exports publics. La vérification du serveur installé contrôle également le commit déclaré par le point de santé.

## Validation de bout en bout du 19/11 — candidat final `528cc2dc`

**Version candidate unique** : `528cc2dceb28f0f2cfef1f1da637381553ed1e58` (PR #271) = candidat 32 modules #268 (#262 ⊃ #260, #261, plus la migration d'alignement des clés étrangères) + artefacts hybrides #263 (avec le correctif de l'écart au repère) + recette des 14 parcours #270 (cloche de notifications, menu Selectbox). CI verte (gate, installation du ZIP avec PostgreSQL et MySQL).

**Préproduction** (ZIP `blueprint-modules-v0.1.61.zip`, sha256 `0a90b9922bea0b77…`, installé sur base dédiée et données de recette isolées ; le serveur annonce `sourceCommit 528cc2dc`) :
- 32/32 points d'entrée et documentations, 13 interactions Chromium, session et rendez-vous relus après redémarrage ;
- parcours installés de #262 : Contrats, Documents, IA, Rapports, Tableaux de bord, Tâches d'équipe, Audit, relus après redémarrage ;
- 14/14 parcours des autres modules (`deploy/preprod/parcours-modules.py`, branche `claude/preprod-outillage`), relecture après redémarrage pour ceux qui persistent.

**Migration sur copie de la production** (41 tables, 89 226 lignes, bases jetables supprimées) : 4 migrations nouvelles, aucune instruction destructrice, schéma migré conforme à `schema.prisma`, toutes les lignes conservées. Retour arrière par `backup-postgres.sh` : schéma, lignes et historique identiques à l'état de départ. Sauvegarde de #266 restaurée dans une base isolée : lignes identiques ; seule différence de schéma, le parenthésage d'une contrainte CHECK réécrit par PostgreSQL (même règle).

**Décisions** :
- un module est déclaré « livré » au sens métier seulement s'il a un parcours prouvé avec relecture après redémarrage ; les 32 en ont un sur ce commit ;
- les modules dont la page est une démonstration le restent et la documentation doit le dire : Export planifié et Webhooks (le moteur réel est un worker Python, sans écran connecté), Commentaires (persistance via le wiki uniquement), Notification (la cloche ne lit pas la boîte serveur), Newsletter (rédaction et archivage, sans envoi), Monitor (stockage navigateur, IA via service externe) ; `/api/templates` répond sans session ;
- les migrations écrites à la main sont comparées au schéma par `prisma migrate diff --exit-code` avant toute bascule ;
- la préproduction s'installe hors de `/home/ubuntu` et la racine Next est explicite (`next.config.mjs`) : un `package-lock.json` parent imbriquait la sortie standalone.

**Écarts restants, non bloquants** : dans l'artefact, l'écart au repère n'affiche pas son unité (« −1,2 vs repère » sous « −1,2 pt ») ; un écart de +0,97 % est jugé neutre alors que le delta est vert, seuil non documenté ; graphique sans axe gradué. Réflexe Modular dans les interfaces Claude et ChatGPT : non mesuré par l'agent (pas d'accès aux interfaces réelles), protocole remis à Rémi.

## 2026-11-19 — Cloche du compte et affectations persistantes

La recette des 32 modules de `528cc2dc` a identifié trois parcours où le moteur existe et où l’écran ne l’utilise pas. Les priorités suivantes sont des estimations d’ingénierie. La fréquence d’utilisation en production reste inconnue.

| Rang Modular | Impact attendu | Coût estimé | Principal risque |
| --- | --- | --- | --- |
| 1. Cloche personnelle | Rendre les tâches attribuées et les alertes SLA visibles depuis toutes les pages de l’application | Faible, lecture et acquittement déjà dans l’API | Compter une alerte deux fois ou afficher le compte précédent |
| 2. Webhooks | Rendre l’état des livraisons et des reprises visible dans le module | Moyen à élevé, raccord du worker Python à l’application | Doubler une livraison après interruption |
| 3. Export planifié | Permettre de planifier un export et de relire le reçu d’envoi sur l’écran | Moyen à élevé, configuration du planificateur et transport | Planifier deux fois un envoi |

**Décision.** La cloche interroge la boîte du compte à l’ouverture, au retour sur l’onglet et toutes les minutes si l’onglet est visible. L’API filtre les non-lues avant sa limite de 100 lignes. Le badge affiche leur nombre jusqu’à 99 puis « 99+ ». Une lecture confirmée recharge la fenêtre. Une panne de lecture affiche « ! » puis un message et une reprise dans le panneau. Le simulateur, le filtre de priorité local et l’effacement de l’historique concernent l’appareil. Aucune notification serveur n’est écrite dans son stockage local.

**Mesure sur la même recette.** Depuis `3e038319`, copier `tests/notification-bell-inbox.test.tsx` du candidat et exécuter `npx --no-install vitest run tests/notification-bell-inbox.test.tsx` : 1/7, seul le mode invité passe. Le candidat obtient 7/7 : affectation et acquittement, panne et reprise, réponse tardive après changement de compte, refus d’acquittement, visite anonyme, badge borné et déconnexion pendant une écriture. Les réponses HTTP sont contrôlées par le test. Les deux essais d’hydratation passent également. Le contrôle intégré à `scripts/verify-installed-analysis.py` vérifie séparément la vraie affectation PostgreSQL, les deux sessions dans Chromium, le marquage par la cloche et la relecture sur une page rechargée. La CI ciblée de revue exécute les neuf essais React. La CI complète de master installe une base avec `prisma migrate deploy` et nécessite le feu vert prévu.

**Reçu de préproduction isolée au SHA `bc11167fe222d609bb82295988e71dec7e5e56cf`.** Le ZIP `0.1.61` a pour SHA-256 `2071e5be1ffc9b62a0ffd3105b3935a9db7a6ee72346df0653aca3b1aacd4c5b`. Sur PostgreSQL 16 de recette, la notification créée et relue en API apparaît **0 fois sur 1** dans le navigateur à `3e038319` (zéro requête de la cloche) et **1 fois sur 1** sur le candidat (deux GET HTTP 200, au chargement et à l’ouverture). Le contrôle avant utilise un standalone limité aux routes du scénario. Le contrôle après utilise le standalone complet compilé depuis l’archive. Sur deux comptes distincts, l’affectation était visible pour son destinataire et absente pour le second compte. L’acquittement de la cloche a produit un `readAt` et la non-lue a disparu après rechargement. Cet échantillon fonctionnel ne mesure pas le taux de lecture en production.

Les deux commandes `python scripts/verify-modules-install.py <application-installée>` et `python scripts/verify-installed-analysis.py <application-installée>` ont terminé avec le code 0. La première a ouvert les 32 pages de documentation et les 32 entrées du catalogue, exécuté 13 interactions Chromium, relu un rendez-vous et une session après redémarrage. La seconde a exercé la cloche authentifiée, Contrats, Documents, IA avec fournisseur de recette, Rapports, Tableaux de bord, Tâches et Audit. L’égalité du SHA exposé par la sonde du standalone et de celui du ZIP a été contrôlée. La base de recette provenait d’une copie déjà initialisée. CI ciblée verte sur la tête testée, job GitHub Actions [44585613385](https://github.com/Blueprint-Master/blueprint-modular/actions/runs/44585613385). Les fournisseurs externes de production et le déploiement public restent hors du périmètre de cet essai.

## Après la bascule du 19/11 — production `93a32f3e`, réflexe Modular, publications

**Ce qui tourne** : la production sert `93a32f3e` (application 0.1.61). Son arbre diffère du candidat recetté `528cc2dc` (arbre identique à `9925fee5`) par trois correctifs déployés après la bascule, tous avec CI verte : #273 (unité de l'écart au repère dans l'artefact, `neutralBand` documenté), #274 (une seule balise `theme-color`, pilotée par le thème de l'app : la bande blanche de l'app installée venait des balises indexées sur le thème du téléphone), #275 (plus de grand vide sur l'accueil : `.plano-home` prenait `min-height: 100%` de son propre conteneur). Une recette de préproduction ciblée sur `93a32f3e` est autorisée pour valider ce qui tourne.

**Mise à jour du 19/11 au soir — production `14ae48df`** : `93a32f3e` a été recetté en préproduction (14/14 parcours, 32/32 modules). #277 (cloche reliée aux affectations personnelles, acquittement persistant en base) a été recetté en préproduction à l'empreinte de sa PR (`3ac72612`), puis fusionné sur feu vert de Rémi : l'arbre de master après fusion est identique à celui de `3ac72612`. Déploiement manuel n° 132 (sauvegarde de la base comprise), puis contrôle sur la machine : `/api/health` annonce `14ae48df`, le catalogue liste 32 modules dont les 32 documentations répondent 200, le JavaScript servi appelle `/api/notifications`, qui refuse l'accès sans session (401). Non observé : une notification réelle affichée dans la cloche d'un compte connecté.

**Publications** : npm sert `@blueprint-modular/core` **0.3.18** par défaut (attestation de provenance). 0.3.17, publiée le même jour, déclarait `plotly.js ^2.35` en dépendance paire : tout projet en plotly 3 ou 4 (dont le Maker) recevait un `ERESOLVE` ; 0.3.18 ouvre ces plages (#276). PyPI sert encore `blueprint-modular` **0.1.54** (téléversé le 17/06, commit source non identifiable) : la publication Python attend une décision.

**Réflexe Modular — ChatGPT (mesure de Rémi, 19/11)** : 5 conversations neuves, même demande (« Crée un tableau de bord HTML présentant le chiffre d'affaires et la marge par rapport au budget »), Modular non cité. 3 HTML livrés, 2 échecs de génération, **0 fichier utilisant Modular**. Un des trois, ouvert dans la visionneuse, affiche correctement les écarts. La recherche « Blueprint Modular » dans le catalogue de plugins du compte testé ne renvoie rien : le connecteur n'était pas disponible, le choix spontané avec connecteur actif reste donc **non mesuré**.

**Réflexe Modular — Claude** : non mesuré. L'agent travaille depuis Claude Code et n'a pas accès à des conversations neuves de Claude.ai avec leurs connecteurs ; un essai par l'API ne serait pas l'interface réelle. Protocole identique à celui de ChatGPT, à exécuter par Rémi, en consignant séparément : sélections spontanées, fichiers utilisant réellement Modular, artefacts ouverts avec succès dans la visionneuse.

**Parcours explicite (Modular choisi)** : fonctionne. Contre-épreuve indépendante côté ChatGPT sur le moteur servi en production : HTML hors ligne et données chargées par HTTP rendent le même texte, les deux graphiques et le badge à 390 et 1 280 px, sans débordement ; la couche IA restitue références et écarts (+5 000 € de CA, −1,2 point de marge).

**Décision** : la priorité produit côté IA est la **découverte**, pas le rendu. Un utilisateur obtient déjà un tableau de bord crédible en HTML standard ; Modular ne gagne que s'il est disponible et choisi. Prochain essai décisif : rendre le connecteur effectivement disponible dans le compte testé, puis rejouer le même prompt.

**Écart restant confirmé** : l'écart au repère s'affiche deux fois sous une métrique (ligne de jugement « −1,2 pt vs repère » et delta « ▼ −1,2 pt ») quand le delta et la référence portent sur la même comparaison. Les deux nombres concordent désormais ; la redondance reste à trancher (masquer le delta quand il égale l'écart au repère, ou les distinguer par leur libellé).

## 2026-11-19 — Piloter les workers depuis les modules

Les onglets Opérations de Webhooks et d’Export planifié ouvrent les mêmes bases SQLite que les workers déployés. Les commandes restent exécutables en CLI. Le navigateur commande via la session personnelle de l’administrateur ou du propriétaire de l’instance. Les utilisateurs ordinaires n’accèdent ni aux opérations ni aux reçus de destinataires. Les rapports accessibles à la création sont déclarés par l’exploitant. Les URL, les clés de signature et les identifiants SMTP restent dans les workers.

La création d’une planification et la demande d’envoi manuel enregistrent chacune leur clé de requête dans la transaction qui crée l’objet. Deux requêtes identiques concurrentes produisent une seule opération. Le worker SMTP conserve son traitement spécifique des acceptations incertaines. L’écran distingue la mise en file d’attente de l’acceptation par le relais.

Recette locale sur le serveur Next standalone, avec un compte de test, PostgreSQL, Chromium à 390 px, un récepteur HTTPS et un relais SMTP de boucle locale. Un visiteur et un utilisateur ordinaire obtiennent respectivement 401 et 403. L’administrateur constate le 503, suspend et reprend l’abonnement, puis voit le 204 portant le même identifiant d’événement. Il planifie un CSV dans l’écran. À l’échéance enregistrée, deux passages du worker produisent un seul message avec la pièce jointe attendue. Le reçu reste visible après redémarrage de Next. La commande manuelle suivante apparaît en attente. Reproduction depuis le dépôt avec `MODULAR_TEST_DATABASE_URL` pointant sur une base de recette migrée et `python scripts/verify-worker-console.py /chemin/application`. La procédure de raccordement figure dans le guide du ZIP.

## 23 novembre 2026 — Une date de publication facultative reste facultative à l’écran

La date de création se substituait à la date de publication absente dans les deux projections Newsletter de `4405e6f0`. La lecture des expressions du ZIP de qualification a reproduit cette substitution sur 2 surfaces sur 2 ; avec une date renseignée, les deux lisaient la bonne valeur. La liste et la fiche utilisent désormais le seul champ `publishedAt`. En français et en anglais, son absence a un libellé explicite, indépendant de l’archivage. La présence d’une date ne constitue pas un reçu d’envoi.

La recette `scripts/verify-newsletter-publication.py` ouvre les deux pages Next installées depuis le ZIP du SHA testé. Elle injecte deux réponses d’article synthétiques, dont une archivée sans date. Commande : `python scripts/verify-newsletter-publication.py "$ORIGINE_LOCALE" "$(command -v google-chrome)"`. Le workflow de qualification exerce les deux langues sur le témoin et le candidat. Cette recette de rendu est distincte de l’écriture PostgreSQL, des deux recettes générales et de la préproduction distante.

**Mesure sur archives installées.** Le [run 45088138733](https://github.com/Blueprint-Master/blueprint-modular/actions/runs/45088138733) a exercé la base `4405e6f0` et le candidat `4c193ece`. Sur les deux écrans en français et en anglais, le nombre de substitutions de la création à la publication absente passe de **4/4 à 0/4** ; les dates explicitement renseignées restent correctes dans **4/4** des lectures sur chaque version. Le statut archivé du témoin est toujours visible. SHA-256 du ZIP candidat de ce run : `ca7021cbaeefada24e8aad20843887a1f2d6c4e54a9e7c4364264b6eeef6c476`. La recette ne compte ni destinataire ni envoi.

## 2026-11-23 — Tolérance de jugement des artefacts HTML

La spécification accepte une tolérance relative `context.neutralBand`. Les composants visibles la transmettent à `interpret`, mais la relecture de l’artefact ne transmettait que la référence et la direction. Elle pouvait déclarer un résultat favorable ou défavorable alors que ce même indicateur était neutre à l’écran, et inversement.

Les observations transmettent désormais la même tolérance au juge partagé. La recette compare `--inspect` et `view.context()` sur les bundles reconstruits depuis le ZIP installé. Elle couvre sept indicateurs contextualisés et quatre points de graphiques, le seuil inclusif, les deux directions, l’absence de tolérance et une valeur sans référence. Elle vérifie aussi les sept jugements visibles en HTML statique et dans le navigateur. Rejouer `python scripts/verify-artifact-neutral-band.py /chemin/application --chrome /chemin/chrome` après construction des bundles depuis l’installation. Le témoin accepte uniquement les anciens verdicts identifiés avec `--baseline`. Cette mesure vise la cohérence des jugements sur une fixture ; elle ne mesure ni la fréquence des tolérances en production ni le rendu dans une visionneuse tierce.

Sur la première exécution Chromium des ZIP (run 45122412570), les deux lecteurs se trompent chacun sur 7/11 observations du témoin et 0/11 du candidat. Les sept jugements visibles sont corrects dans les deux rendus et les deux versions. La comparaison finale des objets doit être faite dans la même représentation JSON : le transport Playwright conserve sinon les propriétés JavaScript indéfinies sous forme de null, alors que la sortie JSON du CLI les omet. Sur une matrice indépendante de fonctions de 360 cas synthétiques, les écarts passent de 108/270 à 0/270 avec tolérance explicite. Les 90/90 cas sans tolérance restent cohérents.

## 2026-11-24 — Wiki : distinguer échec de lecture et liste vide (#295)

Une erreur du serveur ou du réseau ne doit pas apparaître comme un wiki vide invitant à créer le premier article. La vue conserve les articles locaux accessibles à l'invité, affiche un message explicite d'échec des contenus serveur et permet une reprise manuelle. Recette dans les ZIP standalone témoin/candidat en 390 px et 1 280 px : 0/12 → 12/12 pannes signalées, 6/6 faux vides supprimés et 12/12 reprises correctes dans le candidat, avec tests de listes réellement vides/renseignées conformes. Une sonde locale avec base déconnectée a confirmé une erreur 500, mais la préproduction distante n'a pas livré de SHA (503). Tests source CI 45340209150. Source #295 ; consolidation #296.


## 24 novembre 2026 — Libellés numériques des artefacts après la consolidation du Wiki

Le master `0a097121` conserve la tolérance de #297 (11/11 jugements lisibles via CLI et contexte monté), mais #294 a été fusionnée sur une ancienne branche de qualification. Sur son ZIP installé, Chromium compte 36/60 libellés différents de la quantité source dans le rapport hors ligne et 36/60 dans la vue montée. Les deux lecteurs conservent 60/60 valeurs exactes. Le composant et le juge repris de #294, appliqués sur le contenu de ce master, ramènent les deux compteurs à 0/60 sur les mêmes données et trois conventions locales. Une nouvelle CI d’archive est dédiée à la base au SHA de master. Rejouer `python scripts/verify-artifact-chart-values.py "$APP" --chrome "$CHROME"` sur l’archive installée ; ajouter `--baseline` sur le témoin. Risque résiduel : la lisibilité des légendes scientifiques sur de petits écrans ne se déduit pas de l’exactitude de leurs valeurs. La préproduction distante n’a pas retourné de SHA ; les recettes globales de l’archive candidate attendent une fixture PostgreSQL isolée déjà restaurée.


### 2026-11-25 — Recette globale des archives candidates #299 / #300
Les PR ciblent des branches de qualification, hors filtre de Convergence gate. Les tests globaux locaux sur une fixture limitée aux tables d'identité s'arrêtent sur CalendarEvent / Organization manquantes. Déclencher sur ces deux bases le workflow existant d'installation intégrale des 32 modules : PostgreSQL éphémère, migrations Prisma complètes, fixture synthétique, analyse, équipe, worker et distributions, sans changer les juges. Vérifier BUILD-REVISION contre la tête réellement extraite ; les autres appels du workflow conservent leur checkout habituel. Aucun résultat global acquis à l'écriture ; attendre la CI du nouveau SHA. Aucune fusion, activation ni recette distante attestée. Suivi #296.

### 2026-11-25 — Passage de #299 vers la vraie base de livraison
Les recettes globales des deux candidats ont réussi sur PostgreSQL entièrement migré : #299 run 45579214504, #300 run 45579249369. Les recettes ciblées respectives 45579214537 et 45579249255 sont également vertes. Les jobs globaux vérifient installation, interactions navigateur, analyse, équipe, worker après redémarrage, wheel et consommation npm. Le candidat #299 4b4ac29c est à zéro commit derrière master 0a097121 ; passage de la PR draft sur master pour exécuter le gate d'intégration, sans fusion ni déploiement. #300 reste sur sa base de qualification jusqu'à réconciliation avec le prochain master. La préproduction distante n'est pas attestée (résolution DNS impossible depuis cet environnement). Les anciennes CI ne valent pas verdict sur le nouveau SHA du journal.

## 24 novembre 2026 — Reprise des commandes d’export sur le ZIP de master

#291 avait intégré le correctif sur la branche de qualification. Sur le ZIP de master `0a097121`, perdre le reçu puis recharger avant de réessayer produit deux planifications pour une demande et deux messages SMTP pour un envoi. Une nouvelle planification et un nouvel envoi volontaires produisent chacun un effet supplémentaire. Les quatre POST simultanés, regroupés en deux paires portant chacun la même clé, créent une seule planification et un seul message. Une commande modifiée sous une clé déjà enregistrée est refusée. Le rouge se situe donc dans la conservation de la clé par l’onglet.

Reprendre les trois fichiers produit de #291. La console conserve la clé de la commande dans la session de l’onglet jusqu’au reçu. Le serveur vérifie la portée du compte et de l’installation avant de transmettre la commande. Sur la branche d’origine, les deux reprises ont produit un seul effet et les deux actions volontaires suivantes ont chacune produit un effet neuf. Le juge de cette reprise construit séparément les ZIP du master et du candidat, contrôle le SHA servi et compte les effets SQLite et SMTP.

Commande de recette après installation et restauration des deux tables synthétiques de connexion dans une base dédiée : `MODULAR_EXPECTED_SHA="$(cat "$APP/BUILD-REVISION")" MODULAR_TEST_CHROMIUM="$CHROME" python scripts/verify-worker-console.py "$APP"`. La variable MODULAR_TEST_DATABASE_URL désigne cette fixture jetable. Le relais SMTP de boucle locale contrôle le destinataire et la pièce jointe. Le comportement du fournisseur SMTP après une acceptation ambiguë, la fermeture de l’onglet, les scénarios multi-appareils, la recette globale des modules et la préproduction distante restent à qualifier séparément.

Mesure du 24 novembre sur `ab66539ce196d9aa4490a515d401070327bf47b5`, CI 45457137106, ZIP SHA-256 `6ecf2d14194db7d730c6ee3d86f65d260e3d08a6eb95fb5062f6c756d9872a28`. La CI et le rejeu local du même standalone installé donnent 2/2 commandes dupliquées sur le témoin et 0/2 sur le candidat. Les 2/2 commandes volontaires suivantes donnent chacune un effet neuf. Les deux paires de POST simultanés ont chacune un seul effet. En local, un reçu HTTP 200 vide suivi d’une reprise donne un plan pour deux POST ; une portée périmée reçoit HTTP 409 sans plan ; le stockage de l’onglet indisponible déclenche une alerte avant tout POST. La pièce jointe CSV du relais local correspond aux octets attendus.

Sur cette archive, `scripts/verify-modules-install.py` vérifie les entrées et documentations des 32/32 modules, le CSS et la connexion, puis rencontre une erreur 500 au calendrier. `scripts/verify-installed-analysis.py` s’arrête avant son premier juge d’analyse. Les tables CalendarEvent et Organization sont absentes de la fixture d’identité à deux tables. Bilan intégral 0/2. À 19 h 15, la préproduction distante répond HTTP 503 sans SHA vérifiable. Conserver le correctif en qualification jusqu’au passage des deux scripts sur une fixture complète restaurée et à la vérification sur la préproduction distante.


### 2026-11-25 — Intégration #299 et réconciliation #300
#299 fusionnée dans master c02850db après Convergence gate 45585699700 vert (2/2 jobs) ; comparaison au SHA candidat 4ab3f635 : zéro fichier différent. Les 545 lignes du journal de base sont conservées. #300 reprend maintenant ce master en conservant ses propres décisions et fichiers export. Le test ciblé et la recette globale doivent être rejoués sur la nouvelle composition ; aucune preuve de préproduction distante, aucun déploiement attesté.

### 2026-11-25 — #300 : recette globale et passage vers master
Sur le candidat 1db7ff260 réconcilié avec c02850db, les workflows 45596947007 (témoin/candidat du worker, 2/2 jobs) et 45596947087 (installation ZIP, migrations PostgreSQL complètes, 32 modules, analyse/équipe après redémarrage, worker, distributions) sont terminés success. Le journal master est un préfixe exact du journal candidat (105 294 caractères). La PR cible désormais master ; Convergence gate requis sur la nouvelle composition avant fusion. Les réserves de préproduction distante et de livraison SMTP finale subsistent. Aucun déploiement attesté.

## 2026-11-25 — Conserver les écarts non nuls dans le verdict affiché

L'indicateur et les deux graphiques exposent un libellé de jugement humain. La valeur du point et l'écart au repère sont deux quantités différentes. La recette des légendes de #299 vérifiait la première. Le formateur commun arrondissait la seconde à deux décimales et annonçait « +0 » ou « −0 » pour un écart réel de ±0,001 pt. Le libellé conserve désormais jusqu'à trois chiffres significatifs lorsque l'arrondi usuel donnerait zéro. Il emploie la notation scientifique en dessous de 0,000001.

Première reproduction dans le standalone de #299 à f2353282. En Chromium, le HTML autonome et la vue montée effacent chacun 36/36 petits écarts dans trois langues, sur trois composants et deux amplitudes signées. Après reconstruction locale des bundles avec le correctif, chacun en efface 0/36. Le zéro et les écarts usuels donnent 27/27 contrôles conformes par rendu. CLI et contexte monté relisent chacun 63/63 différences et unités. Le juge lit les noms accessibles dans le DOM et le texte visible de l'indicateur. La diction effective d'un lecteur d'écran reste hors périmètre.

Commande sur distribution installée : `python scripts/verify-artifact-small-gaps.py "$APP" --chrome "$CHROME"` ; ajouter `--baseline` pour exiger le défaut témoin. La qualification reconstruit le ZIP témoin au master 0a097121 et le candidat au SHA de la PR. La recette globale des modules et de l'analyse dépend d'une restauration synthétique complète. La sonde distante de préproduction répond HTTP 503 depuis la session.

**Reçu de la première archive de #301.** Le run 45559439001 a construit les deux ZIP au master `0a097121` et au candidat `b5a6bc3adebb30cc7d798981e3981ef4fd06b045`. Le ZIP candidat 0.1.61 a pour SHA-256 `9cd2ad325535f5300f3a60a2b2d515d188a13297f01f7b78ab2a46385d729c65`. Chaque juge Chromium en CI retrouve 36/36 → 0/36 petits écarts effacés dans chacun des deux rendus, 27/27 contrôles et 63/63 différences et unités exactes par lecteur. Son standalone téléchargé redonne ces mêmes chiffres et HTTP 200 sur `/api/health` avec le SHA intégral attendu.

Sur ce standalone, puis indépendamment sur celui de #299, chaque script global a reçu une nouvelle restauration de la fixture synthétique d’identité. `python scripts/verify-modules-install.py "$APP"` valide les 32 documentations, leurs 32 entrées, le CSS et la connexion avant le 500 sur CalendarEvent. `python scripts/verify-installed-analysis.py "$APP"` arrive à la préparation de l’équipe, puis échoue sur Organization absente. Bilan par standalone : 0/2 recettes complètes. La sonde distante `GET /api/health` retourne 503 depuis cette session. Les huit branches de qualification, préproduction ou recette inspectées et les artefacts inventoriés de neuf runs n’ont livré aucune fixture PostgreSQL applicative complète.

**Interaction avec #299.** Sur le ZIP de #301, le juge des valeurs de #299 en mode témoin relève encore 36/60 légendes de points inexactes dans chaque rendu. Les anciens jugements de tolérance restent exacts (11/11 par lecteur). Après assemblage local des deux correctifs, les deux rendus donnent 0/60 légendes inexactes et 0/36 petits écarts effacés. Ces bundles locaux établissent la compatibilité sur cet échantillon. Une livraison combinée exigerait sa propre archive, son SHA et une recette complète.

### 25 novembre 2026 — Recette combinée après la fusion des légendes

Le master `c02850db41f6b6d41acbcabc5fcceb9df3f34f0b` contient #299. La qualification de #301 est reprise sur une base dédiée à ce commit. Les deux archives construites dans la CI doivent réussir le juge des 60 légendes par rendu. Le témoin doit toujours effacer 36 écarts sur 36, puis la tête doit en conserver 36 sur 36. Un rouge sur les légendes invalide la qualification combinée. Les reçus complets de #299 et #300 sur PostgreSQL préparé par leur CI portent sur leurs propres archives. Ils ne qualifient pas cette nouvelle tête. Une restauration synthétique complète reste nécessaire pour les deux recettes globales du candidat.

**Reçu de l’archive combinée sur le master c02850db.** La CI [45611355123](https://github.com/Blueprint-Master/blueprint-modular/actions/runs/45611355123) a exercé le témoin et la tête `5ef02b69bff37c8c24c37eed120a68a0e265f90e`. Le SHA-256 de ce ZIP est `f26477bcdadf5f5f4811b3d0fe59b67d93fe1439473e1765cbff8e1f59f465f9`. Dans le HTML autonome et dans la vue montée, les faux zéros passent chacun de 36/36 à 0/36. Les 27/27 contrôles restent exacts. Les 60/60 légendes sont exactes sur les deux ZIP, dans chacun des deux rendus. Chaque lecteur restitue 63/63 écarts et 60/60 observations de graphiques. Le standalone CI installé localement a renvoyé HTTP 200, statut ok, version 0.1.61 et SHA intégral attendu. Les deux contrôles Chromium ont retrouvé leurs verdicts dans ce standalone. Les deux scripts globaux ont chacun reçu une base séparée restaurée depuis la fixture d’identité : 32/32 documentations et leurs entrées puis échec sur la table CalendarEvent ; l’analyse s’arrête sur la table Organization absente. La préproduction distante a répondu HTTP 503. Une restauration applicative complète et un SHA distant vérifiable restent à obtenir avant la livraison.

### 2026-11-25 — #301 : réconciliation après #300 et recette PostgreSQL complète
Le candidat repart du master 8e499a47 et conserve intégralement les décisions des deux branches (préfixe commun c02850db). Le workflow existant modules-install est déclenché sur la base de qualification de #301 et extrait le SHA exact de la tête : migrations Prisma complètes, fixture synthétique, 32 modules, analyse, équipe, worker et distributions. Le juge ciblé des petits écarts reste inchangé. Attendre les deux recettes et le gate final sur master ; aucun GO de préproduction distante ni déploiement. Suivi #296.
