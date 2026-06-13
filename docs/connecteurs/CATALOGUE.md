# Catalogue des connecteurs

> Source de vérité : `lib/connectors/catalog.ts`. Cette page documente les connecteurs
> curés. Un connecteur ne porte que des **clés** de champ (`fields[].key`) ; aucune valeur
> de secret n'existe dans le dépôt (garde CI `scripts/check-connector-secrets.mjs`).

État : **PR3** — 4 connecteurs seedés (les 4 archétypes d'auth couverts).

| id | Nom | Catégorie | Auth | Hôtes (egress) | Opérations |
|----|-----|-----------|------|----------------|------------|
| `rest-generic` | REST générique | `generic` | `apiKey` | `api.exemple.com` | `listResource` (GET) |
| `google-sheets` | Google Sheets (lecture) | `data` | `oauth2` | `sheets.googleapis.com`, `oauth2.googleapis.com` | `readRange` (GET) |
| `outgoing-webhook` | Webhook sortant | `messaging` | `webhookSecret` | `hooks.slack.com` | `postMessage` (POST) |
| `stripe` | Stripe (paiements) | `payments` | `bearer` | `api.stripe.com` | `listCharges` (GET) |

---

## `rest-generic` — REST générique

Interroge n'importe quelle API REST authentifiée par **clé en en-tête**. Cas de base du pilier.

- **Auth** : `apiKey`.
  - `apiKey` *(secret, requis)* — résolu au runtime via `vault.get(appId, "rest-generic", "apiKey")`. **Jamais committé.**
  - `baseUrl` *(url, requis)* — hôte cible, ajouté à l'allow-list d'egress de l'app à la configuration. Placeholder : `https://api.exemple.com`.
- **Egress** : `api.exemple.com` (hôte d'exemple de la démo ; en production, l'hôte configuré est ajouté à l'allow-list).
- **Opération `listResource`** : `GET /{resource}?limit={limit}`
  - Entrées : `resource` *(string, requis)*, `limit` *(number, optionnel)*.
  - `collectionPath` : `items`.
  - **Mapping** (forme API → forme Ω) :

    | source (API) | target (Ω) | transform |
    |---|---|---|
    | `id` | `id` | — |
    | `title` | `label` | — |
    | `status` | `status` | — |
    | `createdAt` | `createdAt` | `isoFromUnix` |

- **Fixture de démo** : `lib/connectors/descriptors/rest-generic/fixture.json` (3 enregistrements factices, aucune donnée réelle). La vitrine applique le mapping à cette fixture — aucun appel réseau, aucun secret.

---

## `google-sheets` — Google Sheets (lecture)

Lit une plage d'une feuille via **OAuth2 (lecture seule)**. Le flux OAuth est *déclaré*, jamais implémenté en dur.

- **Auth** : `oauth2`.
  - `refreshToken` *(secret, requis)* — résolu au runtime. **Jamais committé.**
  - `spreadsheetId` *(text, requis)* — placeholder `1AbC…xyz`.
  - `oauth2` : scope `…/auth/spreadsheets.readonly`, `refresh: true`, urls d'autorisation/jeton Google.
- **Egress** : `sheets.googleapis.com`, `oauth2.googleapis.com`.
- **Opération `readRange`** : `GET /v4/spreadsheets/{spreadsheetId}/values/{range}` — entrées `spreadsheetId`, `range`.
  - `collectionPath` : `values` (la Sheets API renvoie une matrice de lignes).
  - **Mapping** par position de colonne : `0 → site`, `1 → status`, `2 → count` (`toNumber`).
- **Fixture** : `…/google-sheets/fixture.json` (2 lignes factices).

---

## `outgoing-webhook` — Webhook sortant (type Slack)

Action **fire-and-forget** qui alimente le **levier A**. L'URL du webhook **est** le secret (elle porte le jeton).

- **Auth** : `webhookSecret`.
  - `webhookUrl` *(secret, requis)* — l'URL complète (host + chemin + jeton), résolue au runtime. **Jamais committée** ; `pathTemplate` reste `/` côté descripteur.
- **Egress** : `hooks.slack.com`.
- **Opération `postMessage`** : `POST /` — entrée `text` *(string, requis)*.
  - **Mapping** de l'accusé : `ok → delivered`, `status → httpStatus`.
- **Fixture** : `…/outgoing-webhook/fixture.json` (accusé normalisé `{ ok, status }`).

---

## `stripe` — Stripe (paiements)

Lit les derniers paiements via l'API Stripe, **jeton Bearer**. Se rattache aux modules devis/facturation.

- **Auth** : `bearer`.
  - `secretKey` *(secret, requis)* — clé Stripe, résolue au runtime. **Jamais committée.**
- **Egress** : `api.stripe.com`.
- **Opération `listCharges`** : `GET /v1/charges?limit={limit}` — entrée `limit` *(number, optionnel)*.
  - `collectionPath` : `data`.
  - **Mapping** : `id → id`, `amount → amount` (`centsToEuros`), `currency → currency`, `created → date` (`isoFromUnix`), `status → status`.
- **Fixture** : `…/stripe/fixture.json` (2 charges factices, ids `ch_demo_*`, aucune clé réelle).
