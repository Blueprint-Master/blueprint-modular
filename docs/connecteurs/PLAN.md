# Pilier « Connecteurs » — Plan d'architecture (Chantier 0)

> **Statut : PROPOSITION — aucune ligne de code livrée.** Ce document est le livrable
> du Chantier 0. Il fige l'architecture, les emplacements exacts, la forme du descripteur,
> le lien avec `Ω.connectors`, le rendu vitrine et la stratégie de démo. **Rien d'autre
> n'est commité tant que ce plan n'est pas validé.**

---

## 1. Objet et cadre produit

Cadre : `app = B(s)`. Un LLM produit l'AppSpec `s = (g, Ω, G, A)` ; des builders TypeScript
déterministes produisent le reste. `Ω` possède déjà un champ de première classe `connectors`
(`packages/core/src/schema/app-spec.ts:165`).

Un **connecteur** est une **intégration API pré-codée et vérifiée**. Le LLM ne fait qu'en
**choisir** dans un catalogue curé — il n'écrit jamais de code d'intégration, ne voit jamais
de secret. Le pilier ajoute une 3e entrée à la vitrine, à côté de **Composants** (~101
`bpm.*`) et **Modules** (démonstrateurs).

### Invariant de design (non négociable)
Un descripteur déclare **les champs et le mapping, jamais les secrets**. Les `fields[].key`
sont des **clés**, résolues au runtime par `vault.get(appId, connectorId, key)` — jamais une
valeur. Egress restreint aux `hosts` déclarés. Les démos vitrine n'appellent jamais d'API
réelle avec un secret du dépôt : elles tournent sur des **réponses fixtures** committées.

---

## 2. Constat de l'existant (lecture du code) — deux décisions structurantes

### 2.1 Le type `Connector` de l'AppSpec est IoT/protocole, PAS API-métier
`packages/core/src/schema/app-spec.ts` définit déjà :

```ts
export interface Connector {
  id: string
  protocol: "mqtt" | "opcua" | "modbus" | "rest" | "websocket"
  label: string
  endpoint?: string
  fields: ConnectorField[]   // { source, target, transform?, alertThreshold? }
}
```

C'est le pont **physique↔numérique** (cf. `lib/semantics/types.ts:42`, frame `connector`
= « flux externes, IoT »). Le `ConnectorDescriptor` demandé est un **concept distinct** :
catalogue d'intégrations **API** avec 4 archétypes d'auth (`apiKey|oauth2|webhookSecret|bearer`)
absents de l'enum `protocol`.

**Décision (isolation) : on NE MODIFIE PAS `app-spec.ts` au MVP.** C'est un fichier
cœur/Maker partagé (chantier Maker/i18n en cours). Le `ConnectorDescriptor` vit dans une
nouvelle arborescence `lib/connectors/`, indépendante. Le lien vers `Ω.connectors` se fait
**par convention d'`id`** (§5), sans toucher au schéma cœur. Une extension typée de
`Connector` (ajout d'un `descriptorId` / `auth`) est explicitement **hors-MVP** et fera
l'objet d'une proposition séparée, coordonnée avec le propriétaire du cœur.

### 2.2 Il existe déjà un MODULE « Connecteurs » — à ne PAS confondre, à ne PAS toucher
`app/(app)/modules/connecteurs/` est un **démonstrateur de module** (hub d'ingestion :
REST/SFTP/PostgreSQL/MySQL, test de connexion, synchros). C'est un **module**, pas le
**pilier**. Zone gelée (chantier modules en cours) → **interdit d'y toucher**.

| | Module `connecteurs` (existant) | Pilier `Connecteurs` (ce chantier) |
|---|---|---|
| Route | `/modules/connecteurs` (groupe `(app)`) | `/connecteurs` (groupe `(public)/(site)`) |
| Nature | Démonstrateur d'écran assemblé | Catalogue curé de descripteurs d'API |
| Emplacement | `app/(app)/modules/connecteurs/` | `app/(public)/(site)/connecteurs/` + `lib/connectors/` |
| Statut | **Gelé, ne pas toucher** | À créer |

Aucune collision de route (`/connecteurs` racine est libre — vérifié). La désambiguïsation
sera explicite dans la doc et le titre de page.

---

## 3. Architecture & emplacements exacts des fichiers

Tout le code neuf vit dans **deux** arborescences neuves (`lib/connectors/`, la surface
`app/(public)/(site)/connecteurs/`) plus des tests et de la doc. Aucun fichier des zones
gelées (modules, i18n partagé, vitrine partagée, cœur) n'est modifié — sauf le point de
coordination CI du §8, signalé.

```
lib/connectors/
  types.ts                      # ConnectorDescriptor, CredentialField, Operation, ResponseMapping (types TS)
  schema.ts                     # validateur zod (mirroir de packages/core/src/schema/spec-validator.ts)
  catalog.ts                    # CONNECTORS: ConnectorDescriptor[] — agrège les 4 descripteurs + helpers (getById, listByCategory)
  vault.ts                      # interface VaultResolver + stub (déclaration uniquement, jamais de valeur)
  descriptors/
    rest-generic/
      descriptor.ts             # le ConnectorDescriptor (apiKey)
      fixture.json              # réponse API factice (aucune donnée réelle, aucun secret)
    google-sheets/
      descriptor.ts             # (oauth2)
      fixture.json
    outgoing-webhook/
      descriptor.ts             # (webhookSecret)
      fixture.json
    stripe/
      descriptor.ts             # (bearer)
      fixture.json
  mapping.ts                    # applyResponseMapping(fixture, op.responseMapping) -> forme Ω (pur, déterministe, testable)

app/(public)/(site)/connecteurs/
  page.tsx                      # liste des connecteurs (cartes par catégorie)
  [id]/page.tsx                 # fiche : champs déclarés + mapping + réponse mock mappée
  strings.ts                    # i18n FR/EN LOCAL (en typé sur fr) — pattern des modules, PAS lib/i18n partagé
  ConnecteursListClient.tsx     # rendu liste (si interactivité/filtre nécessaire)
  FicheClient.tsx               # rendu fiche + démo mock client-side

tests/
  connectors-schema.test.ts     # chaque descripteur valide contre le schéma zod
  connectors-mapping.test.ts    # applyResponseMapping sur fixture -> forme Ω attendue (les 4)
  connectors-no-secret.test.ts  # invariant : aucun fields[].value, aucune valeur secrète dans descripteurs/fixtures

scripts/
  check-connector-secrets.mjs   # garde CI : échoue si une valeur de secret est commitée (scan lib/connectors/**)

docs/connecteurs/
  PLAN.md                       # ce document
  CATALOGUE.md                  # (PR catalogue) fiche de chaque connecteur, archétype d'auth, hosts, opérations
  connecteurs.json              # (optionnel) ledger de curation, calqué sur docs/automation/semantique.json
```

**Pourquoi `lib/connectors/` et non `packages/core/` ?** Le catalogue est de la **curation
côté produit/vitrine** (le moat est la liste curée), pas une primitive du cœur publié sur
npm/PyPI. Le garder hors `packages/core` évite tout couplage avec le gate cœur et la zone
Maker, et respecte l'isolation.

**Pourquoi un `strings.ts` local et non `lib/i18n/fr.ts` ?** `lib/i18n/{fr,en}.ts` est en
zone i18n gelée. Les modules utilisent déjà un `strings.ts` local (en typé sur fr) — on
suit ce précédent éprouvé, sans toucher au dictionnaire partagé. (Voir §9 pour la nav.)

---

## 4. Forme finale du descripteur

```ts
// lib/connectors/types.ts
export type AuthMethod = "apiKey" | "oauth2" | "webhookSecret" | "bearer";
export type ConnectorCategory = "generic" | "data" | "messaging" | "payments";
export type CredentialFieldType = "secret" | "text" | "url";

export interface I18nText { fr: string; en: string; }

/** DÉCLARATION d'un champ d'identifiant — porte une CLÉ, jamais une valeur. */
export interface CredentialField {
  key: string;                 // identifiant logique résolu au runtime via vault.get(appId, connectorId, key)
  label: I18nText;
  type: CredentialFieldType;   // "secret" => valeur jamais lisible/loggée/committée
  required: boolean;
  placeholder?: string;        // hint d'UI, JAMAIS une valeur réelle
  // INTERDIT par construction : aucun champ "value" / "default" pour un type "secret".
}

export interface ConnectorAuth {
  method: AuthMethod;
  fields: CredentialField[];   // DÉCLARATION de champs vides
  // oauth2 uniquement : déclaration, jamais d'implémentation de flux en dur
  oauth2?: { scopes: string[]; authorizationUrl: string; tokenUrl: string; refresh: boolean };
}

/** Mapping forme-API -> forme-données Ω. Aligné sur ConnectorField de l'AppSpec. */
export interface ResponseMappingRule {
  source: string;              // chemin dans la réponse API (dot-path, ex. "data[0].amount")
  target: string;              // champ Ω cible (ex. "payment.amount")
  transform?: string;          // nom d'une transformation pure déclarée (ex. "centsToEuros")
}

export interface Operation {
  id: string;
  httpMethod: "GET" | "POST";  // MVP : lecture (GET) + action fire-and-forget (POST)
  pathTemplate: string;        // ex. "/v1/charges?limit={limit}" — relatif à un host de l'allow-list
  inputSchema: Record<string, { type: "string" | "number"; required: boolean }>;
  responseMapping: ResponseMappingRule[];
  sampleResponse: unknown;     // = contenu de fixture.json — sert la démo mock + les tests
}

export interface ConnectorDescriptor {
  id: string;                  // identifiant stable, référencé par Ω.connectors[].id
  name: I18nText;
  category: ConnectorCategory;
  description: I18nText;
  auth: ConnectorAuth;
  hosts: string[];             // allow-list d'egress (ex. ["api.stripe.com"])
  operations: Operation[];
}
```

Validation (`lib/connectors/schema.ts`) : un schéma **zod** (zod déjà présent, cf.
`spec-validator.ts`) qui, en plus du typage structurel, **fait respecter l'invariant** :
aucune propriété `value`/`default` sur un `CredentialField`, `placeholder` non vide
seulement pour les types `text|url`, `hosts` non vide, chaque `Operation.pathTemplate`
cohérent. Les tests `connectors-schema.test.ts` valident les 4 descripteurs.

---

## 5. Lien catalogue ↔ `Ω.connectors` (côté Maker)

Le LLM **choisit** un connecteur ; il pose son `id` dans l'AppSpec. Le câblage est par
**convention d'identifiant**, sans modifier le schéma cœur au MVP :

```
Catalogue (curé)                         AppSpec produit par le LLM (Ω)
ConnectorDescriptor.id = "stripe"  ◄───  Ω.connectors[].id = "stripe"
  .auth.fields[].key = "secretKey"        (le LLM ne fournit que l'id ; jamais de secret)
  .operations[].responseMapping  ─────►   alimente Ω.connectors[].fields ({source,target,transform})
```

- **Le LLM ne fournit que l'`id`** d'un descripteur du catalogue (et éventuellement les
  paramètres d'`inputSchema`). Il ne voit ni `fields[].value`, ni hosts détaillés, ni code.
- Le `responseMapping` du descripteur est **structurellement compatible** avec le
  `ConnectorField` de l'AppSpec (`{ source, target, transform? }`) : le builder peut
  projeter `responseMapping` → `Ω.connectors[].fields` sans transformation de forme.
- **Résolution runtime** (hors-MVP côté exécution, déclaré ici) :
  `vault.get(appId, connectorId, key)` rend la valeur du secret au moment de l'appel ;
  le descripteur ne porte que `key`. Interface `VaultResolver` déclarée dans
  `lib/connectors/vault.ts`, avec un stub qui **lève** si on tente de lire une valeur en
  contexte vitrine (garde-fou).
- **Validation Maker** : le builder rejette tout `Ω.connectors[].id` absent du catalogue
  (le LLM ne peut pas inventer un connecteur). Ce contrôle est documenté ; son branchement
  dans le validateur Maker est **hors-MVP** (coordination cœur requise) et signalé au §8.

---

## 6. Rendu vitrine d'une fiche

`/connecteurs` (liste) → cartes groupées par `category`, chacune : nom (FR/EN), badge
d'archétype d'auth, description courte, lien vers la fiche. Tokens `--bpm-*` / `site-*`,
composants `bpm.*` (Card, Badge, Title…), responsive (grille qui retombe en 1 colonne).

`/connecteurs/[id]` (fiche) affiche **exactement** ce qu'est un connecteur, sans rien de
secret :

1. **En-tête** : nom, catégorie, méthode d'auth, hosts (allow-list d'egress) affichés en
   clair (ce ne sont pas des secrets).
2. **Champs d'identifiant déclarés** — un tableau `label | type | requis | placeholder`,
   **valeurs toujours vides et champs désactivés** (`disabled`). On montre la *déclaration*,
   pas une saisie. Les champs `type: "secret"` portent un cadenas et la mention « résolu au
   runtime via le coffre — jamais stocké ici ».
3. **Opérations** : pour chaque opération, méthode + `pathTemplate` + paramètres d'entrée.
4. **Mapping** : tableau `source (API) → target (Ω) [→ transform]`.
5. **Réponse mock mappée** : à gauche le `sampleResponse` (fixture committée, factice) ;
   à droite le résultat de `applyResponseMapping(fixture, responseMapping)` — calculé
   **100 % côté client, zéro réseau**. C'est la preuve visuelle que le mapping fonctionne.

Tout est bilingue (FR/EN via `strings.ts` local). Mobile : tableaux scrollables, pile
verticale source/résultat sous le point de rupture.

---

## 7. Stratégie de démo mock (zéro secret, zéro réseau)

- **Mode fixture (par défaut, MVP)** : la fiche n'appelle **jamais** d'API. Elle applique
  `responseMapping` à `sampleResponse` (fixture committée, données factices). Déterministe,
  testable, sûr. C'est la seule démo livrée au MVP.
- **Mode « saisis ta propre clé » (BYOK) — hors-MVP, documenté** : une clé saisie par
  l'utilisateur, gardée **uniquement dans l'état React** (jamais persistée, jamais committée,
  jamais envoyée à notre backend), pourrait permettre un appel direct navigateur→host. Non
  livré au MVP pour rester strictement sans réseau ; tracé ici comme évolution.
- **Fixtures** : `fixture.json` par connecteur, **données entièrement factices** (noms,
  montants, ids inventés). Aucun token, aucune URL signée, aucun PII réel. Vérifié par la
  garde CII du §8.

---

## 8. Sécurité & garde CI (impératif)

**Invariants à faire respecter par le code ET la CI :**

1. **Aucun secret dans le dépôt** — descripteurs, catalogue, `s`, fixtures, contexte LLM.
   Seules des **clés** (`fields[].key`) sont déclarées.
2. **Egress restreint** aux `hosts` déclarés (allow-list par connecteur).
3. **Démos sans secret** — fixtures uniquement (§7).

**Garde CI — `scripts/check-connector-secrets.mjs`** (échoue = exit 1) :
- Refuse toute propriété `value`/`default`/`token`/`secret` **portant une valeur** dans
  `lib/connectors/**` (descripteurs + catalogue).
- Scanne descripteurs + `fixture.json` pour motifs de secrets réels : `sk_live_`,
  `sk_test_`, `xoxb-`, `xoxp-`, `ghp_`, `AKIA…`, JWT (`eyJ…`), clés privées
  `-----BEGIN … PRIVATE KEY-----`, chaînes à haute entropie ≥ N. Échec si match.
- Vérifie que chaque `CredentialField` n'a que des clés/labels/placeholders (pas de valeur).

**Branchement CI** — point de coordination signalé : le gate s'exécute via
`scripts/gate.cjs` (appelé par `.github/workflows/gate.yml`). Ce fichier orchestre tsc/
build/doc-sync/vitest **côté cœur**. Deux options, **à valider** :
- **(A, recommandée)** Ajouter une étape `check-connector-secrets.mjs` **et** l'exécution
  des `tests/connectors-*.test.ts` (via la config vitest racine) dans `gate.cjs`. Touche un
  fichier d'infra CI (hors zones gelées modules/i18n/vitrine/cœur) — sûr, mais signalé.
- **(B)** Un workflow GitHub dédié `connectors-guard.yml` autonome (n'édite pas `gate.cjs`).
  Plus isolé, mais duplique le runner.

`vitest.config.ts` racine inclut déjà `tests/**/*.test.{ts,tsx}` → les tests connecteurs y
sont pris sans modification de config.

---

## 9. Fichiers partagés / zones gelées — conflits signalés (décision requise)

Le chantier reste isolé sauf trois points de contact potentiels avec des zones gelées
(modules / i18n partagé / vitrine partagée / cœur). **Aucun ne sera touché sans ton accord.**

1. **Nav du pilier (`components/site/SiteNav.tsx` + `lib/i18n/{fr,en}.ts`)** — zone vitrine/i18n
   gelée. SiteNav **omet déjà volontairement** « Composants » et « Modules » (commentaire
   l.9-12 : ces vues vivent dans l'app/Ressources, pas dans la nav publique). Par cohérence,
   `/connecteurs` **n'a pas besoin** d'entrée de nav au MVP : la surface est joignable par
   URL directe et pourra être liée depuis le footer/Ressources par le propriétaire de la
   vitrine, plus tard. **Décision proposée : ne pas modifier SiteNav ni le dictionnaire
   partagé au MVP.** i18n du pilier = `strings.ts` local.
2. **`packages/core/src/schema/app-spec.ts`** (cœur/Maker) — **non modifié** (§2.1, §5).
   Lien par convention d'`id`. Extension typée = proposition séparée.
3. **`scripts/gate.cjs`** (infra CI) — modifié seulement si option (A) du §8 retenue. Sinon
   workflow dédié (B). À trancher.

---

## 10. Parité i18n, tokens, mobile

- **i18n FR/EN** : `strings.ts` local, `en` typé sur `fr` (toute clé manquante casse la
  compilation). Tous les textes du descripteur sont `{ fr, en }`.
- **Tokens** : `--bpm-*` / `site-*` uniquement ; aucun style en dur. Composants `bpm.*`.
- **Mobile** : zéro régression — grille responsive, tableaux scrollables, pile verticale
  source/résultat. Vérifié empiriquement avant « fait ».

---

## 11. Découpage en PRs (un chantier = une PR, squash, CI verte, tag)

| Étape | Branche | Contenu | Tag |
|---|---|---|---|
| 1. Schéma | `claude/connecteurs-schema` | `lib/connectors/types.ts` + `schema.ts` (zod) + `vault.ts` (interface) + `mapping.ts` + tests schéma/mapping (sans connecteur réel : fixture synthétique) | `Implements: connecteurs/schema` |
| 2. Catalogue + 1 connecteur | `claude/connecteurs-catalogue` | `catalog.ts` + connecteur **REST générique** (apiKey) + fixture + mapping testé + `docs/connecteurs/CATALOGUE.md` + **garde CI secrets** | `Implements: connecteurs/catalogue` |
| 3. +3 connecteurs | `claude/connecteurs-seed` | Google Sheets (oauth2), Webhook sortant (webhookSecret), Stripe (bearer) + fixtures + mappings testés | `Implements: connecteurs/seed` |
| 4. Surface vitrine | `claude/connecteurs-surface` | `/connecteurs` liste + `/connecteurs/[id]` fiche + `strings.ts` FR/EN + démo mock | `Implements: connecteurs/surface` |

Chaque PR : CI verte avant merge, squash. Branche de ce Chantier 0 :
`claude/connecteurs-pillar-yym98q` (doc seule).

---

## 12. Les 4 connecteurs seed (couvrent les 4 archétypes d'auth)

| # | Connecteur | `id` | `category` | Auth | Hosts (allow-list) | Opération MVP | Rattachement |
|---|---|---|---|---|---|---|---|
| 1 | REST générique | `rest-generic` | `generic` | `apiKey` (en-tête) | déclaré par champ `text` (host paramétrable, validé contre l'allow-list à l'usage) | `GET` paramétrable | Cas de base |
| 2 | Google Sheets (lecture) | `google-sheets` | `data` | `oauth2` (scopes + refresh déclarés) | `sheets.googleapis.com`, `oauth2.googleapis.com` | `GET` lignes d'une feuille | Lecture de données |
| 3 | Webhook sortant (type Slack) | `outgoing-webhook` | `messaging` | `webhookSecret` | `hooks.slack.com` (configurable) | `POST` message (fire-and-forget) | Alimente le levier `A` (actions) |
| 4 | Stripe (lecture) | `stripe` | `payments` | `bearer` | `api.stripe.com` | `GET` derniers paiements | Modules devis/facturation |

Détails par connecteur (champs déclarés, scopes, mapping `source→target`, fixture factice)
seront figés dans `docs/connecteurs/CATALOGUE.md` aux PR 2-3.

- **REST générique** : `fields = [{ key: "apiKey", type: "secret" }, { key: "baseUrl", type: "url" }]`,
  1 GET paramétrable, mapping minimal liste→items.
- **Google Sheets** : `oauth2 = { scopes: ["spreadsheets.readonly"], refresh: true, authorizationUrl, tokenUrl }`,
  `fields = [{ key: "refreshToken", type: "secret" }, { key: "spreadsheetId", type: "text" }]`.
  **Flux OAuth déclaré, jamais implémenté en dur.**
- **Webhook sortant** : `fields = [{ key: "webhookUrl", type: "secret" }]` (l'URL Slack EST
  le secret), `POST` corps `{ text }`. Mapping de la *requête* (forme Ω → payload), réponse
  triviale (ack).
- **Stripe** : `fields = [{ key: "secretKey", type: "secret" }]`, `GET /v1/charges?limit={limit}`,
  `responseMapping` typé : `data[].amount → payment.amount` (transform `centsToEuros`),
  `data[].currency → payment.currency`, `data[].created → payment.date`. Fixture = charges
  factices.

---

## 13. Définition de fini (MVP du pilier) & vérification

- [ ] Schéma `ConnectorDescriptor` typé (`types.ts`) + validé (`schema.ts` zod).
- [ ] Catalogue des 4 connecteurs, chacun ≥ 1 opération + mapping **testé sur fixture**.
- [ ] Surface `/connecteurs` : liste + fiche (champs déclarés vides, mapping, réponse mock),
      FR/EN, tokens `--bpm-*`/`site-*`, responsive.
- [ ] Zéro secret dans le dépôt ; **garde CI** qui échoue si une valeur de secret est commitée.
- [ ] `docs/connecteurs/` à jour (PLAN + CATALOGUE).

**Vérification empirique** (avant tout « fait ») : `npm run gate` vert, `vitest` connecteurs
verts, et la surface lancée en `next dev` — fiche affichant champs vides + mapping + résultat
mock, en FR et EN, sur viewport mobile. Build vert ≠ fonctionnel.

---

## 14. Questions ouvertes pour la validation

1. **Branchement CI** : option (A) étape dans `gate.cjs` (recommandée) ou (B) workflow dédié ?
2. **Nav** : confirme-t-on **pas d'entrée SiteNav** au MVP (cohérent avec l'omission actuelle
   de Composants/Modules) ?
3. **Placement surface** : `app/(public)/(site)/connecteurs/` (chrome vitrine, mirroir de
   `/components` — **recommandé**) ou `app/(app)/connecteurs/` (chrome app, mirroir de
   `/modules`) ?
4. **Lien Ω** : confirme-t-on le lien **par convention d'`id`** (sans toucher `app-spec.ts`)
   au MVP, l'extension typée de `Connector` étant une proposition cœur séparée ?

> **STOP — j'attends ta validation de ce plan avant d'écrire la moindre ligne de code.**
