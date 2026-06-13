# Catalogue des connecteurs

> Source de vérité : `lib/connectors/catalog.ts`. Cette page documente les connecteurs
> curés. Un connecteur ne porte que des **clés** de champ (`fields[].key`) ; aucune valeur
> de secret n'existe dans le dépôt (garde CI `scripts/check-connector-secrets.mjs`).

État : **PR2** — 1 connecteur seedé sur 4. PR3 ajoutera Google Sheets, Webhook sortant, Stripe.

| id | Nom | Catégorie | Auth | Hôtes (egress) | Opérations |
|----|-----|-----------|------|----------------|------------|
| `rest-generic` | REST générique | `generic` | `apiKey` | `api.exemple.com` | `listResource` (GET) |

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
