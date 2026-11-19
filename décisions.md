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
