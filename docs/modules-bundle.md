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

## Escalades de la Gestion de parc

Depuis `application/`, l’exploitant peut planifier toutes les cinq minutes la commande suivante avec Node.js 22.6 ou ultérieur. Le compte de service admin/owner est l’auteur technique au journal. Le fichier de routage désigne par identifiant les comptes internes qui assurent la permanence pour ce domaine. Pour un groupe, indiquer le compte admin/owner du technicien habilité à traiter les tickets. Sans `workspaceId`, seuls les tickets du domaine dépourvus d’espace de travail sont concernés. Pour un espace nommé, ajouter son `workspaceId` au routage et choisir le compte de service et les destinataires parmi les membres de son organisation. Exemple de structure à adapter sur chaque installation :

```json
{"domainId":"it","actorId":"id-service","targets":{"notify_manager":"id-responsable","senior_tech":"id-technicien","notify_director":"id-direction"}}
```

```bash
node --experimental-strip-types --env-file=.env lib/asset-manager/escalate-sla.mjs /chemin/prive/routage-parc.json
```

L’exécution dépose les alertes dans les boîtes Notifications du domaine configuré et réaffecte le ticket au seuil prévu. Une intervention terminée sort du traitement. À la reprise, chaque seuil franchi est traité une fois pour l’échéance et la priorité du ticket. Les opérations sont consultables sous « Escalade SLA » dans le journal du parc. Un routage incomplet produit un code de sortie non nul avant traitement. Un opérateur peut corriger le fichier puis rejouer la commande. Le domaine maintenance livré ne définit aucun seuil automatique.
