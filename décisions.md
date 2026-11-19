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
