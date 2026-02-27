# Blueprint Modular — Référence d’intégration (tous les modules, tous les composants)

Ce dépôt est la **source unique** pour l’ensemble des **modules métier** et des **composants BPM** de Blueprint Modular. Un autre projet (ou Cursor dans un autre workspace) peut s’y référer pour copie/synchronisation ou intégration, sans avoir à rendre ce dépôt public : il suffit d’y avoir accès (clone, sous-module, ou chemin local).

**Dépôt source :** `https://github.com/remigit55/blueprint-modular` (ou chemin local vers ce dossier).

**Sans accès Git :** tout développeur peut télécharger le **bundle zip** (modules + composants BPM + lib + prisma) depuis la doc :  
**https://docs.blueprint-modular.com/downloads/blueprint-modules-latest.zip**  
Aucun clone ni accès au dépôt nécessaire. Voir la page [Intégration (doc)](https://docs.blueprint-modular.com/get-started/integration.html#sans-git).

**Pour un utilisateur/développeur :** la doc publique décrit pas à pas [comment utiliser les modules](https://docs.blueprint-modular.com/get-started/integration.html#utiliser-modules) (télécharger le bundle, copier, configurer, BDD, styles, navigation) et [propriété intellectuelle / licence MIT](https://docs.blueprint-modular.com/get-started/integration.html#propriete-intellectuelle) (ce que vous pouvez faire, ce que vous devez faire, pas de garantie).

---

## 1. Tous les modules (UI + routes)

Chaque module vit sous `app/(app)/modules/<nom>/` (pages Next.js App Router). Les sous-routes (documentation, simulateur, etc.) sont listées quand elles existent.

| Module | Chemin racine | Description / sous-routes |
|--------|----------------|---------------------------|
| **asset-manager** | `app/(app)/modules/asset-manager/` | Gestion de parc : tableau de bord, actifs, tickets, MAD, contrats, connaissances, changements, CMDB, audit. Sous-routes : `[domainId]/`, `[domainId]/assets/`, `[domainId]/tickets/`, `[domainId]/assignments/`, `[domainId]/contracts/`, `[domainId]/knowledge/`, `[domainId]/changes/`, `[domainId]/cmdb-graph/`, `[domainId]/audit/`, `documentation/`. |
| **auth** | `app/(app)/modules/auth/` | Authentification. Sous-routes : `documentation/`. |
| **wiki** | `app/(app)/modules/wiki/` | Wiki : articles, révisions, commentaires, backlinks. Sous-routes : `[slug]/`, `new/`, `search/`, `tags/`, `[slug]/edit/`, `[slug]/history/`, `documentation/`, `simulateur/`, `simulator/`. |
| **documents** | `app/(app)/modules/documents/` | Upload et analyse de documents. Sous-routes : `[id]/`, `documentation/`. |
| **contracts** | `app/(app)/modules/contracts/` | Base contractuelle (contrats, CGV). Sous-routes : `[id]/`, `documentation/`, `simulateur/`, `simulator/`. |
| **newsletter** | `app/(app)/modules/newsletter/` | Newsletter : paramètres, articles. Sous-routes : `[id]/`, `[id]/edit/`, `nouveau/`, `parametres/`, `documentation/`. |
| **ia** | `app/(app)/modules/ia/` | Module IA (chat, conversations). Sous-routes : `documentation/`. |
| **monitor** | `app/(app)/modules/monitor/` | Monitor. Sous-routes : `documentation/`. |
| **commentaires** | `app/(app)/modules/commentaires/` | Commentaires. Sous-routes : `simulateur/`, `documentation/`. |
| **calendrier** | `app/(app)/modules/calendrier/` | Calendrier. Sous-routes : `simulateur/`, `documentation/`. |
| **tableau-blanc** | `app/(app)/modules/tableau-blanc/` | Tableau blanc. Sous-routes : `simulateur/`, `documentation/`. |
| **keep-screen-on** | `app/(app)/modules/keep-screen-on/` | Keep screen on. Sous-routes : `documentation/`. |
| **skeleton** | `app/(app)/modules/skeleton/` | Skeleton. Sous-routes : `simulateur/`, `documentation/`. |
| **templates** | `app/(app)/modules/templates/` | Templates. Sous-routes : `simulateur/`, `documentation/`. |
| **workflow** | `app/(app)/modules/workflow/` | Workflow. Sous-routes : `simulateur/`, `documentation/`. |
| **themes** | `app/(app)/modules/themes/` | Thèmes. Sous-routes : `simulateur/`, `documentation/`. |
| **webhooks** | `app/(app)/modules/webhooks/` | Webhooks. Sous-routes : `documentation/`. |
| **tableaux-de-bord** | `app/(app)/modules/tableaux-de-bord/` | Tableaux de bord. Sous-routes : `documentation/`. |
| **referentiels** | `app/(app)/modules/referentiels/` | Référentiels. Sous-routes : `simulateur/`, `documentation/`. |
| **rapports** | `app/(app)/modules/rapports/` | Rapports. Sous-routes : `documentation/`. |
| **reservation-creneaux** | `app/(app)/modules/reservation-creneaux/` | Réservation de créneaux. Sous-routes : `documentation/`, `simulateur/`. |
| **veille** | `app/(app)/modules/veille/` | Veille. Sous-routes : `documentation/`, `simulateur/`. |
| **taches** | `app/(app)/modules/taches/` | Tâches. Sous-routes : `documentation/`, `simulateur/`. |
| **formulaire-dynamique** | `app/(app)/modules/formulaire-dynamique/` | Formulaire dynamique. Sous-routes : `simulateur/`, `documentation/`. |
| **notification** | `app/(app)/modules/notification/` | Notification. |
| **notifications-ciblees** | `app/(app)/modules/notifications-ciblees/` | Notifications ciblées. Sous-routes : `documentation/`, `simulateur/`. |
| **connecteurs** | `app/(app)/modules/connecteurs/` | Connecteurs. Sous-routes : `documentation/`, `simulateur/`. |
| **devis-facturation** | `app/(app)/modules/devis-facturation/` | Devis & facturation. Sous-routes : `documentation/`, `simulateur/`. |
| **export-planifie** | `app/(app)/modules/export-planifie/` | Export planifié. Sous-routes : `documentation/`, `simulateur/`. |
| **multi-langue** | `app/(app)/modules/multi-langue/` | Multi-langue. Sous-routes : `documentation/`, `simulateur/`. |
| **catalogue-produits** | `app/(app)/modules/catalogue-produits/` | Catalogue produits. |
| **audit-log** | `app/(app)/modules/audit-log/` | Journal d’audit. |

Page d’accueil des modules : `app/(app)/modules/page.tsx`.

---

## 2. Toutes les API (routes backend)

Les routes API sont sous `app/api/`. Préfixes principaux :

| Préfixe | Rôle |
|---------|------|
| `app/api/auth/` | NextAuth (`[...nextauth]`), register. |
| `app/api/wiki/` | Wiki : articles, révisions, commentaires, backlinks, export, semantic-search, tags, transcribe, generate, restore. |
| `app/api/documents/` | Documents (CRUD, analyse). |
| `app/api/contracts/` | Base contractuelle (CRUD, search, reanalyze, status). |
| `app/api/newsletter/` | Newsletter (settings, articles, archive). |
| `app/api/ai/` | IA : chat, conversations, messages, providers, health. |
| `app/api/asset-manager/` | Gestion de parc : config, domains, assets, tickets, assignments, contracts, knowledge, changes, ci-relations, movements, audit-log, sla-escalation, approve, reject, return, me. |
| `app/api/settings/` | API keys. |
| `app/api/sandbox/` | Sandbox generate. |
| `app/api/health/` | Health check. |
| `app/api/prompteur/` | Proxy prompteur. |

Fichiers : tous les `**/route.ts` sous ces dossiers.

---

## 3. Tous les composants BPM (design system)

Les composants sont dans `components/bpm/`. Point d’entrée : `components/bpm/index.ts` (exports et types).

| Composant | Fichier |
|------------|---------|
| Accordion, AreaChart, Audio, Autocomplete, Avatar, Badge, BarChart, Barcode, Breadcrumb, Button, Card, Checkbox, Chip, CodeBlock, ColorPicker, Column, Container, DateInput, DateRangePicker, Divider, Drawer, Empty, EmptyState, Expander, FAB, FileUploader, Grid, HighlightBox, Html, Image, Input, JsonViewer, LineChart, LoadingBar, Map, Markdown, Message, Metric, Modal, NumberInput, NfcBadge, Pagination, Panel, PdfViewer, PlotlyChart, Popover, Progress, QRCode, RadioGroup, Rating, ScatterChart, Selectbox, Skeleton, Slider, Spinner, SpinnerDot, StatusBox, Stepper, Table, Tabs, Text, Textarea, Timeline, Title (Title1–4), Toast, Toggle, Tooltip, TopNav, Treeview, Video, Theme | `components/bpm/<Nom>.tsx` |

Pour une liste exacte des exports : ouvrir `components/bpm/index.ts`. Styles globaux associés : `app/globals.css` (variables `--bpm-*`, règles `.bpm-*`, `.asset-manager-page`, etc.).

---

## 4. Bibliothèques partagées (lib)

À copier ou à référencer selon les modules utilisés :

| Dossier / fichier | Rôle |
|-------------------|------|
| `lib/prisma.ts` | Client Prisma (BDD). |
| `lib/auth.ts` | NextAuth, session. |
| `lib/version.ts` | Version app (lit `package.json`). |
| `lib/ai/` | IA : config, context-builder, module-registry, prompt-templates, contract-analyzer, embedding-client, vision-client, vllm-client, assistant-context. |
| `lib/asset-manager/` | Config domaines (`config/domain.*.json`), get-domain-config, load-config, numbering, audit. |
| `lib/contract-extract.ts` | Extraction contrats. |
| `lib/wiki-utils.ts`, `lib/wiki-templates.ts`, `lib/wiki-guest.ts` | Wiki. |
| `lib/rehype-wiki-hashtags.ts` | Rehype hashtags Wiki. |
| `lib/slug.ts` | Slug. |
| `lib/encrypt.ts` | Chiffrement. |
| `lib/docPages.ts` | Pages doc. |
| `lib/notificationLevels.ts` | Niveaux de notification. |
| `lib/prompteur-api.ts` | API prompteur. |
| `lib/generated/bpm-components.json` | Généré (composants BPM). |

---

## 5. Base de données et configuration

- **Schéma Prisma :** `prisma/schema.prisma` (tous les modèles).
- **Migrations :** `prisma/migrations/`.
- **Tables par module :** voir `docs/DATABASE.md`.
- **Variables d’environnement :** `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` ; optionnel selon modules : `AI_SERVER_URL`, `AI_MODEL`, etc. Voir `.env.example` et `docs/DATABASE.md`.
- **Config gestion de parc :** un fichier par domaine dans `lib/asset-manager/config/domain.<domainId>.json` (ex. `domain.it.json`).

---

## 6. Intégration par copie/sync (pour un autre projet)

Pour rendre **tous** les modules et **tous** les composants visibles et utilisables dans une autre app :

1. **Référencer ce dépôt**  
   Dans l’autre projet, indiquer l’URL ou le chemin de ce repo (ex. dans un `INTEGRATION.md` ou `.cursorrules`) :  
   `Source Blueprint Modular : https://github.com/remigit55/blueprint-modular` (ou chemin local).

2. **Copier ou synchroniser**  
   - **Modules :** `app/(app)/modules/` (tout le dossier, ou sous-dossiers ciblés).  
   - **API :** `app/api/` (tout ou par préfixe : wiki, documents, contracts, newsletter, ai, asset-manager, auth, settings, etc.).  
   - **Composants BPM :** `components/bpm/` (tout le dossier + `index.ts`).  
   - **Lib :** `lib/` (au minimum `prisma.ts`, `auth.ts` ; selon besoins : `lib/ai/`, `lib/asset-manager/`, wiki, etc.).  
   - **Prisma :** `prisma/schema.prisma` + `prisma/migrations/` (ou extrait des modèles nécessaires).  
   - **Styles :** parties de `app/globals.css` liées à BPM et aux modules (variables `--bpm-*`, `.bpm-*`, `.asset-manager-page`, etc.).  
   - **Config :** `lib/asset-manager/config/` si le module asset-manager est utilisé.

3. **Adapter**  
   - Layout / navigation : faire pointer les liens vers les routes copiées (`/modules/<nom>/...`).  
   - Env : définir `DATABASE_URL`, `NEXTAUTH_*`, etc.  
   - Prisma : `npx prisma generate` puis `npx prisma migrate deploy` si besoin.

Ce fichier (`INTEGRATION.md`) sert de **référence unique** pour tous les modules et tous les composants Blueprint Modular dans ce dépôt.
