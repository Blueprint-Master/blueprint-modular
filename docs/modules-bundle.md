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
