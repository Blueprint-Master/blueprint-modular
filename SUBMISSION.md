# SUBMISSION — Connecteur MCP « Blueprint Modular »

Copie prête pour la soumission aux directories (Claude / ChatGPT). Read-only,
public, sans authentification.

---

## Identité

- **Name** (≤100) : `Blueprint Modular`
- **Tagline** (≤55) : `Catalogue read-only des composants Blueprint Modular`
- **Endpoint** : `https://mcp.blueprint-modular.com`
- **Transport** : Streamable HTTP (stateless)
- **Auth** : None (catalogue public)
- **Contact** : contact@blueprint-modular.com
- **Privacy policy URL** : `https://blueprint-modular.com/privacy`
- **Docs URL** : `https://blueprint-modular.com/mcp`
- **Health** : `https://blueprint-modular.com/api/health`

---

## Description (≤2000 caractères)

Blueprint Modular est un serveur MCP public et en lecture seule qui expose le
catalogue de composants du design system `@blueprint-modular/core` (101
composants, 10 catégories : affichage de données, mise en page, interaction,
feedback, navigation, média, graphiques, utilitaires, identification &
traçabilité, IA & spécialisés).

Il aide un modèle à découvrir et à utiliser correctement les composants `bpm.*`
avant de générer du code : lister le catalogue, rechercher par mot-clé, obtenir
la signature exacte (props, types, exemple) d'un composant, et proposer une
composition à partir d'un besoin décrit en langage naturel.

Quatre outils, tous read-only :
- list_components(category?, cursor?) — parcourir le catalogue, paginé.
- search_components(query, cursor?) — trouver des composants pertinents, paginé.
- get_component(name) — props/types/usage/exemple depuis le registre.
- suggest_composition(need) — briques répondant à une intention d'écran.

Les données proviennent exclusivement d'un registre généré à partir des sources
du package (jamais saisies à la main). Le serveur n'effectue aucune écriture,
n'accède à aucun système de production, ne demande aucune authentification et ne
stocke aucune donnée de conversation. Les réponses sont nettoyées (uniquement de
la donnée catalogue), paginées par curseur avec un plafond de taille, et les
erreurs sont structurées et actionnables. Un rate-limiting basique par IP et des
timeouts bornés protègent l'endpoint.

Idéal pour générer des interfaces Next.js/React cohérentes avec Blueprint
Modular, ou pour explorer le design system depuis Claude ou ChatGPT.

---

## Texte de la politique de confidentialité

Servi sur `/privacy`. Texte intégral :

> **Aucune donnée personnelle collectée.** Le service ne demande, ne collecte ni
> ne traite aucune donnée personnelle. Aucune authentification n'est requise :
> ni compte, ni profil, ni cookie.
>
> **Lectures stateless d'un catalogue public.** Chaque requête est une lecture
> sans état du catalogue public de composants. Le serveur est strictement
> read-only : aucune écriture, aucun accès à un système de production.
>
> **Aucun stockage des données de conversation.** Le contenu des conversations
> et des requêtes d'outils n'est pas conservé. Des compteurs techniques
> éphémères par adresse IP peuvent exister en mémoire pour la limitation de
> débit ; ils ne sont ni persistés, ni utilisés pour identifier un utilisateur.
>
> **Aucun partage avec des tiers.** Aucune donnée n'est vendue, louée ou
> partagée. Aucun pistage publicitaire.
>
> **Contact.** contact@blueprint-modular.com

---

## Instructions pour le reviewer

1. Ajouter le connecteur avec l'URL `https://mcp.blueprint-modular.com`
   (ou un déploiement preview Vercel), authentification **None**.
2. Vérifier `GET /api/health` → `{ "status": "ok", "version": "1.0.0", ... }`.
3. Vérifier que `tools/list` renvoie 4 outils, chacun avec
   `annotations.readOnlyHint = true`.
4. Exécuter les 4 cas de test ci-dessous.
5. Vérifier la pagination (champ `nextCursor` puis ré-appel avec `cursor`).
6. Vérifier les erreurs actionnables (nom inconnu, catégorie inconnue, curseur
   invalide → `isError: true` avec `error` + `hint`).
7. Pages servies : `/mcp` (docs), `/privacy` (confidentialité).

### Cas de test (entrée → sortie attendue)

**1. list_components**
- Entrée : `{"name":"list_components","arguments":{"category":"Graphiques"}}`
- Sortie : objet avec `total: 6`, `returned: 6`, `components[]` listant
  `bpm.linechart`, `bpm.barchart`, `bpm.areachart`, `bpm.scatterchart`,
  `bpm.plotlychart`, `bpm.altairchart` (nom + description). Pas de `nextCursor`
  (une seule page).

**2. search_components**
- Entrée : `{"name":"search_components","arguments":{"query":"tableau triable"}}`
- Sortie : `results[]` trié par pertinence, premier élément `bpm.table`
  (« Tableau triable avec lignes alternées »), avec `matched: ["tableau","triable"]`.

**3. get_component**
- Entrée : `{"name":"get_component","arguments":{"name":"metric"}}`
- Sortie : `{ name: "bpm.metric", category: "Affichage de données",
  description, props (label*, value*, delta?, …), example:
  "bpm.metric({ label: …, value: 125000, delta: \"+12%\", currency: \"EUR\" })",
  associated: ["bpm.badge","bpm.plotlyChart"], import }`. Aucun champ interne.

**4. suggest_composition**
- Entrée : `{"name":"suggest_composition","arguments":{"need":"un dashboard avec des métriques et un graphique"}}`
- Sortie : `suggestions[]` (≤ 8) contenant des composants de type graphique
  (`bpm.*chart`) et `bpm.metric`, chacun avec un champ `why` (termes
  correspondants).

**Erreur (exemple)**
- Entrée : `{"name":"get_component","arguments":{"name":"frobnicator"}}`
- Sortie : `isError: true`, `{ error: "Composant introuvable : \"frobnicator\".",
  hint: "Utilisez search_components … ou list_components …" }`.

---

## Assets manquants / à fournir avant publication

- [ ] **Icône** du connecteur (PNG carré, 512×512 recommandé) — non incluse dans ce repo.
- [ ] **Domaine de production** : configurer le DNS de `blueprint-modular.com`
      (et/ou `mcp.blueprint-modular.com`) vers le déploiement, puis confirmer que
      `/api/mcp` répond en HTTPS.
- [ ] **Vérification de domaine ChatGPT** : ajouter l'enregistrement de
      vérification (TXT/redirection) fourni par le developer mode ChatGPT lors de
      la soumission du connecteur.
- [ ] **Email de contact** : confirmer que `contact@blueprint-modular.com` est
      bien relevé (ou remplacer par l'adresse de support définitive dans
      `lib/mcp/meta.ts`).
- [ ] **Adresse légale / éditeur** si le directory l'exige (non couvert ici).

---

## Notes de conformité

- READ-ONLY strict, données issues du registre généré (jamais dupliquées).
- Sorties auditées : aucun ID interne, chemin, timestamp ni champ debug.
- Pagination par curseur + plafond de taille sur list/search ; get_component borné.
- Erreurs structurées (`isError` + `error` + `hint`), jamais de 500/400 nu.
- Rate-limiting basique par IP (120 req/min) + timeouts bornés.
- Pas d'authentification, pas d'exposition de bpm-prod, SSR-safe.
