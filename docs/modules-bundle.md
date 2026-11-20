# Installer les modules Blueprint Modular

Le répertoire `application/` contient le projet Next.js, le paquet React local, les routes API, le schéma PostgreSQL et ses migrations. Le catalogue se trouve à `/modules`. Pour intégrer des éléments dans un projet existant, les anciens chemins `modules/`, `components/bpm/`, `lib/` et `prisma/` restent disponibles. Conserver les routes relatives des écrans et intégrer également leurs routes `application/app/api/`, leurs fournisseurs de contexte et leurs dépendances. Les fichiers LICENSE et NOTICE accompagnent la distribution.

## Démarrer une instance

Utiliser Linux, Node.js 22 avec npm, Bash et PostgreSQL 16. La construction télécharge les dépendances et les polices du site. Depuis `application/`, créer un fichier `.env` à partir de `.env.example`. Renseigner la base dédiée dans `DATABASE_URL`, l’origine HTTPS de l’instance dans `NEXTAUTH_URL` et un secret aléatoire propre à l’instance dans `NEXTAUTH_SECRET`. Laisser le mode de démonstration d’authentification désactivé.

```bash
npm ci
npm ci --prefix packages/core
npm run build --prefix packages/core
npm run build:standalone
npx --no-install prisma migrate deploy
node --env-file=.env .next/standalone/server.js
```

Conserver la base, le secret de session et les fichiers importés sur stockage persistant. Configurer un chemin absolu stable dans `MODULAR_UPLOAD_DIR` pour les nouvelles pièces des modules Documents et Contrats. Le service répond sur `/api/health`. Les chemins de fichiers enregistrés par les modules Documents et Contrats doivent rester accessibles au même emplacement après une mise à jour.

## Services à configurer selon les modules

- Authentification Google utilise les identifiants OAuth de l’instance. La récupération de mot de passe utilise son relais SMTP.
- Les modules IA et Documents utilisent le fournisseur configuré par l’exploitant. Le service du prompteur Monitor et ses dépendances se trouvent sous `deploy/prompteur/` et dans `deploy/prompteur-api-requirements.txt`.
- Les workers Python Export planifié et Webhooks se trouvent sous `bpm/`. Leur configuration, les commandes de traitement et les règles de reprise figurent dans la documentation de chaque module. Pour construire le paquet Python avec son interface embarquée, utiliser `bash scripts/build-python-runtime.sh`, puis `python -m pip wheel --no-deps . -w dist`.
- Les écrans intitulés « Simulateur » proposent une démonstration. Leur documentation précise le mode de stockage et les éventuels services à raccorder.

## Raccorder les écrans Webhooks et Export planifié

L’onglet **Opérations** de chaque module utilise la base SQLite de son worker. Les comptes ADMIN et OWNER de l’installation peuvent consulter les destinataires et piloter les livraisons. Utiliser une instance dédiée par organisation. Les sessions ordinaires et anonymes ne donnent pas accès à ces données.

Dans l’environnement du serveur Next, définir les chemins absolus des bases utilisées par les commandes Python. Déclarer les rapports que cette installation autorise à planifier.

```dotenv
BPM_WEBHOOKS_DB=/var/lib/modular/events.sqlite
BPM_EXPORTS_DB=/var/lib/modular/exports.sqlite
BPM_EXPORT_REPORTS=ventes.csv,tresorerie.pdf
```

Pour une nouvelle base, lancer la commande `list` du worker avec le chemin voulu pour initialiser son schéma. Python 3.9 ou ultérieur, les fuseaux IANA et les droits en lecture/écriture sur les bases et leur répertoire sont nécessaires au serveur Next. Redémarrer le serveur après modification des variables. Laisser les secrets HTTPS et SMTP dans l’environnement des workers. Configurer leur planificateur pour exécuter chaque minute, depuis le répertoire `application/` ou avec le paquet de cette version installé :

```bash
python3 -m bpm.webhooks --db /var/lib/modular/events.sqlite tick
python3 -m bpm.scheduled_exports --db /var/lib/modular/exports.sqlite tick --reports /srv/rapports
```

Les intégrations Webhooks sont définies avec la commande `subscribe` et alimentées par le producteur métier. L’onglet montre les abonnements et les 100 dernières tentatives, leur réponse HTTP et la prochaine reprise. Pour les exports, publier les rapports indiqués dans `/srv/rapports` ou utiliser le fournisseur Python documenté. L’onglet permet de programmer, suspendre, reprendre ou demander un envoi immédiat. **Actualiser** relit les 100 derniers reçus individuels. « Accepté par le relais SMTP » confirme la soumission au relais. Un envoi incertain se rapproche avec le journal du relais avant toute nouvelle soumission.

## Vérifier la version servie

Lire `/api/health` après démarrage de l’application. Les champs `applicationVersion` et `sourceCommit` indiquent la version de l’application et le commit source utilisé pour construire le serveur. L’archive contient ce même commit dans `application/BUILD-REVISION`. Une copie de sources dépourvue de Git et de ce fichier renvoie un commit nul.

## Escalades de la Gestion de parc

Depuis `application/`, l’exploitant peut planifier toutes les cinq minutes la commande suivante avec Node.js 22.6 ou ultérieur. Le compte de service admin/owner est l’auteur technique au journal. Le fichier de routage désigne par identifiant les comptes internes qui assurent la permanence pour ce domaine. Pour un groupe, indiquer le compte admin/owner du technicien habilité à traiter les tickets. Sans `workspaceId`, seuls les tickets du domaine dépourvus d’espace de travail sont concernés. Pour un espace nommé, ajouter son `workspaceId` au routage et choisir le compte de service et les destinataires parmi les membres de son organisation. Exemple de structure à adapter sur chaque installation :

```json
{"domainId":"it","actorId":"id-service","targets":{"notify_manager":"id-responsable","senior_tech":"id-technicien","notify_director":"id-direction"}}
```

```bash
node --experimental-strip-types --env-file=.env lib/asset-manager/escalate-sla.mjs /chemin/prive/routage-parc.json
```

L’exécution dépose les alertes dans les boîtes Notifications du domaine configuré et réaffecte le ticket au seuil prévu. Une intervention terminée sort du traitement. À la reprise, chaque seuil franchi est traité une fois pour l’échéance et la priorité du ticket. Les opérations sont consultables sous « Escalade SLA » dans le journal du parc. Un routage incomplet produit un code de sortie non nul avant traitement. Un opérateur peut corriger le fichier puis rejouer la commande. Le domaine maintenance livré ne définit aucun seuil automatique.

## Parcours disponibles par module

L’application Next.js utilise PostgreSQL. Les modules Python s’installent avec la roue et utilisent un fichier SQLite persistant par application ou organisation. Le paquet React se consomme avec npm. Le catalogue contient un exemple et une documentation pour chaque module.

| Module | Parcours à vérifier à la réception | Exécution |
|---|---|---|
| Gestion de parc | Inventorier et prêter un équipement, suivre son incident, consulter l’audit et restaurer la sauvegarde | Application, PostgreSQL |
| Authentification | Créer un compte et ouvrir une session personnelle | Application, PostgreSQL |
| Wiki | Éditer une page, relire une ancienne version et la restaurer | Application, PostgreSQL |
| Documents | Importer un PDF ou un DOCX et relire le document analysé après redémarrage | Application, volume de fichiers, fournisseur IA |
| Base contractuelle | Importer un contrat, reprendre une analyse interrompue et consulter son résultat | Application, volume de fichiers, fournisseur IA |
| Newsletter | Éditer une édition, gérer sa photo puis l’archiver | Application, PostgreSQL et fichiers |
| IA | Démarrer une conversation et poursuivre son historique après redémarrage | Application, PostgreSQL, fournisseur IA |
| Monitor | Ouvrir une séance du prompteur et suivre la progression des diapositives | Application et service prompteur |
| Commentaires | Déposer et retrouver un commentaire sur un article Wiki | Application, PostgreSQL |
| Calendrier | Créer, modifier et supprimer un événement personnel | Application, PostgreSQL |
| Tableau blanc | Enregistrer un tableau partagé dans une organisation | Application, PostgreSQL |
| Keep screen on | Acquérir, relâcher puis redemander le verrou après retour à l’écran | React, navigateur compatible, HTTPS |
| Skeleton | Rendre les six dispositions de chargement depuis une application installée | Roue Python et interface embarquée |
| Templates | Générer puis télécharger un document depuis un modèle | Application |
| Workflow | Faire avancer un dossier et relire le journal de ses transitions | Application, PostgreSQL |
| Thèmes | Charger le JSON d’un client et retrouver le thème par défaut si son attribution disparaît | React, entrée `./themes` |
| Webhooks | Livrer un événement signé, constater le reçu et reprendre après échec | Application, worker Python, SQLite, destinataire HTTPS |
| Tableaux de bord | Enregistrer les indicateurs personnels et détecter une modification concurrente | Application, PostgreSQL |
| Référentiels | Enregistrer une devise, un pays, une TVA ou une unité et préserver les références utilisées | Python, SQLite |
| Rapports | Générer, conserver et exporter un état depuis des données réelles | Application et Python |
| Réservation / Créneaux | Réserver une ressource et traiter un conflit de disponibilité | Application, PostgreSQL |
| Veille | Collecter un flux RSS, une API JSON ou une page et dédupliquer les observations | Python, SQLite, sources HTTP |
| Tâches | Assigner une tâche, notifier le destinataire puis suivre son avancement | Application, PostgreSQL ou Python |
| Formulaire dynamique | Soumettre un schéma conditionnel et retrouver sa version et ses réponses | Python, SQLite |
| Notification | Retrouver une notification personnelle et la marquer comme lue | Application, PostgreSQL |
| Notifications ciblées | Router un événement vers une équipe et dédupliquer les livraisons | Python, SQLite, adaptateur pour e-mail ou SMS |
| Connecteurs | Importer un jeu de données REST, SFTP, PostgreSQL ou MySQL, puis le relire | Python, connexions de l’application hôte |
| Devis / Facturation | Convertir un devis, conserver la facture émise et rapprocher un paiement | Python, SQLite |
| Export planifié | Déclencher l’export et contrôler la pièce jointe reçue par SMTP | Application, worker Python, SQLite, relais SMTP |
| Multi-langue | Charger des dictionnaires, interpoler et formater les valeurs avec repli par clé | React, entrée `./i18n` |
| Catalogue produits | Gérer une variante et réconcilier deux demandes sur la dernière unité en stock | Python, SQLite |
| Journal d’audit | Relire l’historique d’une tâche supprimée ou exporter des événements métier | Application et Python |
