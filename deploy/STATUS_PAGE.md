# Page de statut — `status.blueprint-modular.com`

Page de disponibilité publique transposée du modèle Maker
(`status.blueprint-maker.com`), **corrigée** pour mesurer la VRAIE disponibilité
publique et **collecter** un historique 90 jours dès l'activation.

## Ce que la page surveille

| Service | Cible publique | Sonde | « up » si |
|---------|----------------|-------|-----------|
| Vitrine | `https://blueprint-modular.com` | `GET` | HTTP 200–399 |
| Connecteur MCP | `https://mcp.blueprint-modular.com/api/mcp` | `POST` JSON-RPC `tools/list` | HTTP 200 ou SSE |

> Le MCP est sondé en **POST `tools/list`** — jamais en `GET` (le `GET` renvoie
> 405 = sain mais non représentatif ; le `HEAD` se bloque).

## Architecture (≠ modèle Maker)

Le modèle Maker **recalculait** l'uptime à partir de l'activité applicative
(table `GeneratedApp`) + un health **interne** (`/api/internal/health`) — qui
**tombe avec le service** (angle mort) et ne stocke **aucun** point de mesure.

Côté Modular, on **corrige** :

1. **Sonde réelle** (`lib/status/probe.ts`) : appelle les URLs publiques
   (DNS + nginx + SSL + app), pas un `/health` complaisant.
2. **Stockage Postgres** : chaque passage écrit une ligne par service dans la
   table `status_check` (migration `20260617120000_add_status_check`).
3. **Agrégation** (`lib/status/data.ts`) : la page lit ces points et calcule la
   fenêtre 90 jours — elle se remplit donc dès le premier cron.

**Angle mort résiduel assumé** : la sonde s'exécute sur bpm-prod (cron → route
POST). Si l'app Next.js elle-même est à terre, aucune mesure n'est écrite : la
journée apparaît en `no_data`, pas en `outage`. La sonde reste fidèle pour toute
panne en aval des cibles (DNS, certificat, nginx, MCP distinct). Un vrai
monitoring externe (UptimeRobot, etc.) pourra plus tard appeler
`GET /api/status/public` pour lever cet angle mort.

## Fichiers

| Chemin | Rôle |
|--------|------|
| `app/status/page.tsx` | Page (serveur, i18n fr/en, tokens `var(--bpm-*)`) |
| `app/status/layout.tsx` | Métadonnées + `robots: noindex` |
| `app/status/UptimeSection.tsx` | Barre 90 jours (présentation pure) |
| `app/api/status/probe/route.ts` | `POST` — exécute la sonde (jeton) |
| `app/api/status/public/route.ts` | `GET` — payload JSON public |
| `lib/status/probe.ts` | Sondes vitrine + MCP, écriture des mesures |
| `lib/status/data.ts` | Agrégation 90 jours + incidents |
| `lib/status/types.ts` | Types |
| `prisma/migrations/.../migration.sql` | Table `status_check` |

## Exposition

- `noindex` (non indexée) + **non listée** dans le sitemap/la nav principale.
- Accessible par URL directe (`/status`) et via un **lien discret en pied de
  page** (colonne « Légal » du footer).

## OPS — actions humaines (Rémi)

### 1. DNS
Créer `status.blueprint-modular.com` → bpm-prod (`51.83.88.18`).

### 2. nginx
```bash
sudo cp deploy/nginx-status-blueprint-modular.conf /etc/nginx/sites-available/status.blueprint-modular.com
sudo ln -s /etc/nginx/sites-available/status.blueprint-modular.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 3. SSL (certbot)
```bash
sudo certbot --nginx -d status.blueprint-modular.com
```

### 4. Jeton de sonde + cron
1. Générer un jeton : `openssl rand -hex 24`.
2. L'ajouter au `.env` de l'app (`STATUS_PROBE_TOKEN=…`) puis redéployer
   (`./deploy/deploy-from-git.sh`) pour que l'app le lise.
3. Installer le cron (5 min) — voir `deploy/status-probe.crontab` :
   ```bash
   crontab -e
   # coller la ligne en remplaçant <STATUS_PROBE_TOKEN>
   ```

## Vérification (après ops)

1. `/status` accessible et affiche l'état vitrine + MCP.
2. Après quelques minutes :
   `psql -d blueprint_modular -c "SELECT service, ok, http_code, checked_at FROM status_check ORDER BY checked_at DESC LIMIT 5;"`
   → des points existent.
3. Couper temporairement une cible (ou pointer une URL erronée) → la mesure
   passe à `ok=false` / `outage` (la sonde n'affiche pas 100 % par défaut).
