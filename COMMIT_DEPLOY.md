# BLUEPRINT MODULAR — PROCÉDURE COMMIT & DÉPLOIEMENT

> À lire avant tout commit ou déploiement. Ne jamais déployer sans avoir vérifié le build local.

---

## ARCHITECTURE DE DÉPLOIEMENT

```
Machine Windows (dev)
    │
    ├── git push → GitHub (remigit55/blueprint-modular)
    │                   │
    │                   └── SSH → VPS OVH (145.239.199.236)
    │                               │
    │                               ├── /var/www/blueprint-modular       ← blueprint-modular.com
    │                               └── /var/www/blueprint-modular-docs  ← docs.blueprint-modular.com
    │
    └── Scripts locaux (Windows) :
        deploy_blueprint_modular.ps1       ← rsync direct (legacy)
        scripts/deploy-vps-remote.ps1      ← SSH + git pull + deploy (recommandé)
```

**Serveur** : `ubuntu@145.239.199.236`  
**Clé SSH** : `~/.ssh/portfolio_beam_key`  
**Repo Git** : `https://github.com/remigit55/blueprint-modular`  
**Repo local** : `C:\Users\remi.cabrit\blueprint-modular`

---

## PROCÉDURE STANDARD (à suivre dans cet ordre)

### Étape 1 — Vérifier que le build est propre (OBLIGATOIRE)

```powershell
cd C:\Users\remi.cabrit\blueprint-modular
npm run build
```

**Ne jamais committer si le build échoue.** Corriger d'abord.

Si le projet Next.js est dans un sous-dossier :
```powershell
cd C:\Users\remi.cabrit\blueprint-modular
npm run build 2>&1
```

---

### Étape 2 — Commit et push sur GitHub

```powershell
cd C:\Users\remi.cabrit\blueprint-modular

# Voir ce qui a changé
git status
git diff --stat

# Ajouter tous les fichiers modifiés
git add .

# Committer avec un message clair (convention : type: description)
# Types : feat (nouvelle fonctionnalité), fix (correction), docs (documentation),
#         style (CSS/UI sans logique), refactor, chore (config/deps)
git commit -m "feat: ajout sandbox composant bpm.metric"

# Pousser sur GitHub (branche master)
git push origin master
```

---

### Étape 3 — Déployer sur le VPS

**Option A — Depuis Windows (recommandé) :**
```powershell
cd C:\Users\remi.cabrit\blueprint-modular
.\scripts\deploy-vps-remote.ps1
# Ou avec paramètres explicites :
.\scripts\deploy-vps-remote.ps1 -VpsHost 145.239.199.236 -User ubuntu
```
Ce script fait : SSH → git pull sur le VPS → exécute `deploy/deploy-from-git.sh`

**Option B — Directement sur le VPS (SSH manuel) :**
```powershell
# Connexion SSH
ssh -i ~/.ssh/portfolio_beam_key ubuntu@145.239.199.236

# Sur le VPS :
cd /home/ubuntu/blueprint-modular
git pull
./deploy/deploy-from-git.sh
```

---

### Étape 4 — Vérifier le déploiement

```powershell
# Vérifier les fichiers déployés
ssh -i ~/.ssh/portfolio_beam_key ubuntu@145.239.199.236 "ls -la /var/www/blueprint-modular"
ssh -i ~/.ssh/portfolio_beam_key ubuntu@145.239.199.236 "ls -la /var/www/blueprint-modular-docs"
```

Puis tester dans le navigateur :
- https://blueprint-modular.com
- https://docs.blueprint-modular.com
- https://blueprint-modular.com/modules.html (section Modules)

**Vérifier que la bonne version est en ligne :**
- Le script **vide** les répertoires vitrine et doc puis recopie tout (plus de fichiers obsolètes). Il écrit le commit dans **version.txt**.
- Après déploiement : ouvrir https://blueprint-modular.com/version.txt et https://docs.blueprint-modular.com/version.txt — le hash doit être égal à `git rev-parse --short HEAD` en local.
- Si tu vois encore une vieille landing ou une vieille doc : **rechargement forcé (Ctrl+F5)** ou navigation privée. Les pages HTML ont des en-têtes anti-cache pour limiter le cache navigateur.
- **Vitrine** : index, modules.html, modules/*, manifest.json, doc.js, img, js, CSS. **Docs** : tout le contenu (get-started, components, api-reference, deploy, knowledge-base, etc.).

---

## CE QUE FAIT deploy/deploy-from-git.sh

Le script déployé sur le VPS :
1. `git pull` le repo dans `/home/ubuntu/blueprint-modular`
2. Copie `frontend/static/index.html` + CSS/JS/img → `/var/www/blueprint-modular` (site vitrine)
3. Copie toute la documentation → `/var/www/blueprint-modular-docs` (docs)
4. Règle les permissions `ubuntu:ubuntu`

**Les deux domaines sont donc mis à jour à chaque déploiement.**

---

## CAS PARTICULIER — PROJET NEXT.JS

Si le projet Next.js est actif (app dans `blueprint-modular/` à la racine), le déploiement Next.js est différent du site statique. Dans ce cas, après `git pull` sur le VPS :

```bash
# Sur le VPS
cd /home/ubuntu/blueprint-modular
npm ci
npm run build
pm2 restart blueprint-modular  # ou : pm2 start npm --name "blueprint-modular" -- start
```

Variables d'environnement requises sur le VPS (dans `/home/ubuntu/blueprint-modular/.env.local`) :
```
DATABASE_URL=postgresql://bpm:MOT_DE_PASSE@localhost:5432/blueprint_modular
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://blueprint-modular.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ENCRYPTION_SECRET=...
```

---

## MIGRATIONS PRISMA (uniquement si le schéma a changé)

```powershell
# En développement (crée une nouvelle migration)
npx prisma migrate dev --schema=prisma/schema.prisma --name nom_de_la_migration

# En production (applique les migrations existantes)
$env:DATABASE_URL = "postgresql://bpm:MOT_DE_PASSE@145.239.199.236:5432/blueprint_modular"
npx prisma migrate deploy --schema=prisma/schema.prisma
```

**Ne lancer `migrate deploy` en prod que si tu as fait `migrate dev` en local d'abord.**

---

## EN CAS DE PROBLÈME

```powershell
# Vérifier les logs Nginx sur le VPS
ssh -i ~/.ssh/portfolio_beam_key ubuntu@145.239.199.236 "sudo tail -50 /var/log/nginx/error.log"

# Recharger Nginx si besoin
ssh -i ~/.ssh/portfolio_beam_key ubuntu@145.239.199.236 "sudo nginx -t && sudo systemctl reload nginx"

# Rollback : revenir au commit précédent
git revert HEAD
git push origin master
# Puis redéployer
```

---

## RÉSUMÉ EN 3 COMMANDES

```powershell
# 1. Build OK ?
npm run build

# 2. Commit + push
git add . && git commit -m "type: description" && git push origin master

# 3. Déployer
.\scripts\deploy-vps-remote.ps1
```
