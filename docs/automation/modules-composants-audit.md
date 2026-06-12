# Audit « au niveau » — 32 modules & 104 composants

> **Chantier 0** de la mission « porter chaque module et chaque composant au niveau
> d'un produit de référence ». Document d'inventaire et de priorisation : **aucun
> code n'est modifié par cette PR**. L'exécution (une PR par module ou petit lot)
> démarre après validation humaine de ce backlog.
>
> Date : 2026-06-12 · Base : `master` (ad7ec64) · Méthode : lecture exhaustive du
> code (`app/(app)/modules/**`, `app/(public)/(site)/docs/components/**`,
> `components/showcase/registry.tsx`, `lib/generated/bpm-components.json`) +
> contre-vérifications ciblées des handlers (boutons morts, `onChange={() => {}}`),
> des données seedées et des fiches manquantes.

---

## 1. La rubrique « au niveau » (checklist)

Tout module / composant doit cocher les 6 critères. Barème par critère : **0**
(absent) · **1** (partiel) · **2** (conforme). Total sur 12.

- [ ] **1. Finalité évidente** — en < 10 s on comprend quel problème métier est
  résolu et pour qui (titre/sous-titre orientés usage, pas « Simulateur »).
- [ ] **2. Données réalistes seedées** — jamais de champs vides ; jeu de données
  crédible déjà peuplé, déterministe et SSR-safe (pas de `Math.random`/`Date.now`
  au render).
- [ ] **3. Comportement réel** — chaque action produit un effet visible
  (Enregistrer ajoute à une liste affichée ; les filtres filtrent). Zéro bouton
  mort, zéro `onChange={() => {}}`.
- [ ] **4. Effet « wahou »** — mise en page soignée qui démontre la force du
  design system : densité utile, hiérarchie, états, feedback, composants `bpm.*`
  réels (pas de HTML ad hoc).
- [ ] **5. Auto-explicatif** — aucune connaissance préalable requise ; le
  scénario se raconte seul.
- [ ] **6. Exhaustivité** — le module est traité de A à Z ; un export /
  copier-coller le rend opérationnel dans un autre contexte. Ce n'est pas un
  exemple : c'est appelable et fonctionnel en l'état.

**Verdicts** :
- **CONFORME** — total ≥ 10 et aucun critère à 0.
- **À REPRENDRE** — total 5–9, ou ≥ 10 avec un critère à 0.
- **COQUILLE VIDE** — total ≤ 4 ou plusieurs critères à 0.

**Effort** : S < 1 j · M = 1–2 j · L > 2 j.

**Barre de qualité (référence)** : `/modules/wiki` — articles seedés
(`lib/wiki-guest.ts:24-57`), arborescence, tags, recherche textuelle + sémantique,
filtres, création/édition/historique réels, export ZIP. Score 12/12.
**Anti-exemple** : `/modules/export-planifie` — dropdown Fréquence `value={null}`,
`onChange={() => {}}`, bouton Enregistrer sans `onClick`, simulateur qui
**redirige en boucle** vers la page principale. Score 3/12.

---

## 2. Inventaire — 32 modules (`app/(app)/modules/`)

Colonnes scores : Finalité / Données / Comportement / Wahou / Auto-explicatif /
Exhaustivité.

### 2.1 Synthèse

| Module | F | D | C | W | A | E | Total | Verdict | Effort |
|---|---|---|---|---|---|---|---|---|---|
| asset-manager | 2 | 2 | 2 | 2 | 2 | 2 | 12 | CONFORME | — |
| audit-log | 1 | 0 | 1 | 1 | 1 | 0 | 4 | **COQUILLE VIDE** | M |
| auth | 2 | 1 | 2 | 1 | 1 | 1 | 8 | À REPRENDRE | M |
| calendrier | 2 | 2 | 2 | 2 | 2 | 2 | 12 | CONFORME | — |
| catalogue-produits | 1 | 0 | 0 | 0 | 0 | 0 | 1 | **COQUILLE VIDE** | M |
| commentaires | 2 | 2 | 2 | 2 | 2 | 1 | 11 | CONFORME | S |
| connecteurs | 1 | 0 | 0 | 0 | 0 | 0 | 1 | **COQUILLE VIDE** | M |
| contracts | 2 | 2 | 2 | 2 | 2 | 2 | 12 | CONFORME | — |
| devis-facturation | 2 | 1 | 1 | 2 | 1 | 0 | 7 | À REPRENDRE | M |
| documents | 2 | 1 | 2 | 2 | 2 | 2 | 11 | CONFORME | S |
| export-planifie | 1 | 0 | 0 | 1 | 1 | 0 | 3 | **COQUILLE VIDE** | M |
| formulaire-dynamique | 1 | 0 | 0 | 1 | 0 | 0 | 2 | **COQUILLE VIDE** | M |
| ia | 2 | 1 | 2 | 2 | 2 | 2 | 11 | CONFORME | S |
| keep-screen-on | 2 | 1 | 2 | 2 | 2 | 2 | 11 | CONFORME | S |
| monitor | 2 | 0 | 1 | 2 | 2 | 1 | 8 | À REPRENDRE | L |
| multi-langue | 1 | 1 | 0 | 1 | 0 | 0 | 3 | **COQUILLE VIDE** | M |
| newsletter | 2 | 1 | 2 | 1 | 2 | 2 | 10 | CONFORME | S |
| notification | 2 | 2 | 2 | 2 | 2 | 2 | 12 | CONFORME | S |
| notifications-ciblees | 1 | 0 | 0 | 0 | 1 | 0 | 2 | **COQUILLE VIDE** | M |
| rapports | 1 | 0 | 0 | 1 | 0 | 0 | 2 | **COQUILLE VIDE** | M |
| referentiels | 2 | 2 | 1 | 1 | 1 | 1 | 8 | À REPRENDRE | M |
| reservation-creneaux | 1 | 1 | 0 | 1 | 0 | 0 | 3 | **COQUILLE VIDE** | M |
| skeleton | 2 | 2 | 2 | 2 | 2 | 2 | 12 | CONFORME | S |
| tableau-blanc | 2 | 2 | 2 | 2 | 2 | 2 | 12 | CONFORME | S |
| tableaux-de-bord | 2 | 1 | 0 | 1 | 1 | 0 | 5 | **COQUILLE VIDE** | M |
| taches | 2 | 2 | 1 | 1 | 2 | 1 | 9 | À REPRENDRE | M |
| templates | 2 | 2 | 2 | 2 | 2 | 1 | 11 | CONFORME | S |
| themes | 1 | 0 | 0 | 1 | 1 | 0 | 3 | **COQUILLE VIDE** | M |
| veille | 2 | 2 | 2 | 2 | 2 | 1 | 11 | CONFORME | S |
| webhooks | 1 | 0 | 0 | 0 | 0 | 0 | 1 | **COQUILLE VIDE** | M |
| wiki | 2 | 2 | 2 | 2 | 2 | 2 | 12 | CONFORME (référence) | — |
| workflow | 2 | 2 | 2 | 1 | 2 | 1 | 10 | CONFORME | S |

### 2.2 Détail des écarts (preuves)

**Coquilles vides — le motif commun.** Toutes partagent exactement le même
squelette mort : `Selectbox`/`Input` avec `value` vide ou `null` et
`onChange={() => {}}`, bouton final sans `onClick`, aucun `useState`, aucun
`fetch`, données seedées absentes ou réduites à 1 ligne, et souvent un
`simulateur/page.tsx` identique à la page principale ou qui se contente de
`router.replace()` vers elle.

- **audit-log** (4/12) — `page.tsx:6` : `logData` = **1 seule ligne** (« Alice,
  2025-02-25, Modification statut ») ; aucune action (ni filtre, ni export) ;
  simulateur identique à la page.
- **catalogue-produits** (1/12) — 1 produit seedé (« P001, Produit A ») ;
  bouton « Ajouter » sans `onClick` (`page.tsx:22`) ; aucune variante, aucune
  route détail, aucune API.
- **connecteurs** (1/12) — `page.tsx:15-22` : Selectbox `value={null}` +
  `onChange={() => {}}`, Input vide no-op, « Enregistrer » mort ; aucune liste
  de connecteurs configurés, aucun test de connexion.
- **export-planifie** (3/12) — `page.tsx:19-21` : handlers vides + Enregistrer
  mort ; `simulateur/page.tsx:9-10` : redirection en boucle vers la page. Aucune
  liste d'exports planifiés, aucune API. *(L'anti-exemple cité par la mission,
  confirmé.)*
- **formulaire-dynamique** (2/12) — `page.tsx:19-20` : Type A/Type B sans état ni
  logique de dépendance champ↔type ; le « champ dynamique » est un placeholder ;
  simulateur = redirection.
- **multi-langue** (3/12) — `page.tsx:19` : Selectbox FR/EN no-op, « Appliquer »
  sans effet ; aucun dictionnaire, rien ne change de langue.
- **notifications-ciblees** (2/12) — `simulateur/page.tsx:14-18` : 1 option
  statique, Input vide, Enregistrer sans `onClick` ; finalité « règles événement
  → destinataires » jamais démontrée.
- **rapports** (2/12) — `simulateur/page.tsx:15-17` : `value={null}`,
  `onChange={() => {}}`, « Générer » ne génère rien ; ni tableau, ni graphique,
  ni export malgré la description.
- **reservation-creneaux** (3/12) — 3 créneaux seedés mais sélection sans état,
  « Réserver » sans effet, aucune confirmation.
- **tableaux-de-bord** (5/12) — 2 `Metric` statiques ; « Personnaliser les
  widgets » (`page.tsx:24`) sans handler ; aucune personnalisation réelle.
- **themes** (3/12) — `page.tsx:19-20` : ColorPicker et Input `onChange` vides ;
  rien n'est appliqué au DOM ; simulateur = redirection.
- **webhooks** (1/12) — `page.tsx:19` : Input no-op, bouton mort ; pas de liste,
  pas de test d'envoi, simulateur identique à la page. Le module le plus creux.

**À reprendre.**

- **auth** (8/12) — la page affiche la session réelle (avatar, e-mail,
  déconnexion NextAuth, `page.tsx:121-171`) mais le « simulateur » est une
  galerie de liens vers `/login` / `/register` hors module : rien n'est jouable
  in situ.
- **devis-facturation** (7/12) — belle table bpm (Panel/Table/Badge) mais une
  seule ligne seedée (`page.tsx:6`) et boutons « Envoyer » / « Télécharger PDF »
  sans `onClick` (`page.tsx:21`) ; pas d'ajout de ligne ni de cycle de statuts.
- **monitor** (8/12) — la page délègue tout à `components/Monitor` en
  `dynamic(…, { ssr: false })` (`page.tsx:6`) ; doc riche mais aucune donnée de
  démo (il faut uploader un PPTX pour voir quoi que ce soit).
- **referentiels** (8/12) — 2 devises seedées et affichées, mais « Ajouter » sans
  `onClick` (`page.tsx:22`) ; CRUD réduit au R.
- **taches** (9/12) — 3 tâches seedées, filtre par statut fonctionnel, mais
  lecture seule : ni création, ni édition, ni suppression.

**Conformes** (preuves principales) : asset-manager (hub multi-domaines ITSM
complet, 6 sous-modules CRUD sur `/api/asset-manager/*`), calendrier
(`simulateur/page.tsx`, 808 lignes : 3 vues jour/semaine/mois, ~20 événements
seedés déterministes par mois via `buildDemoEvents`, création/suppression
réelles), commentaires (22 commentaires seedés, 4 types, filtres, édition
inline, résolution — quasi niveau wiki ; reste : pièces jointes déclarées mais
non jouées), contracts (`page.tsx`, 1 393 lignes : import drag-drop, analyse IA
asynchrone, slide-over de détail éditable, stats, responsive), documents (upload + polling + détail +
suppression via `/api/documents`, `page.tsx:32-101`), ia (AIChat streaming,
historique persisté, multi-providers), keep-screen-on (Wake Lock API complète,
countdown, edge cases visibilité), newsletter (CRUD complet via
`/api/newsletter/*` — mais table vide au premier accès, voir backlog),
notification (contexte + cloche intégrée au layout, boutons de test réels),
skeleton (6 assemblages pilotés par Selectbox/Slider en live), tableau-blanc
(rétro 3 colonnes, 6 post-it seedés, CRUD + déplacement complets), templates
(workflow 2 étapes + toast ; manque la persistance), veille (4 sources seedées,
ajout de source qui met à jour métriques + flux), wiki (référence), workflow
(transitions réelles + historique ; mono-document).

**Constat transversal modules** :
- **i18n : 0/32.** Tous les modules ont leurs textes FR en dur ; aucun
  dictionnaire (`lib/i18n` existe pour la vitrine mais n'est pas branché sur
  `app/(app)/modules`). La parité FR/EN exigée par la mission est un chantier
  transversal à intégrer à chaque PR de reprise.
- **Pattern « simulateur-redirection »** : plusieurs modules (export-planifie,
  formulaire-dynamique, themes, ia) ont un `simulateur/` qui redirige — soit un
  reliquat à supprimer, soit une page à écrire vraiment.
- **Persistance** : seuls documents, ia, newsletter, wiki touchent une API. Pour
  les autres, un état local seedé bien fait suffit à cocher la rubrique
  (cf. tableau-blanc) — pas besoin de DB pour être « au niveau ».

---

## 3. Inventaire — 104 composants (fiches `/docs/components/<slug>`)

### 3.1 Mécanisme constaté

Trois couches : (1) une **page générique** `[slug]/page.tsx` (description,
badges, sémantique Ω, bloc API — *aucune démo*) qui sert de fallback ; (2) des
**fiches dédiées** `docs/components/<slug>/page.tsx` au gabarit homogène :
sandbox **réellement interactif** (preview pilotée par `useState`, panneau de
contrôles, générateur de code Python mis à jour en live), table des props,
exemples, pagination ; (3) le **registre showcase**
(`components/showcase/registry.tsx`) qui alimente la galerie `/components`
(exemples « défaut / déviant / trajectoire » pour un sous-ensemble).

**Bilan : 91/104 composants ont une fiche dédiée interactive ; 13 retombent sur
la page générique sans aucune démo.**

| Verdict | Nb | Composants |
|---|---|---|
| CONFORME | 86 | toutes les fiches dédiées hors « à reprendre » ci-dessous |
| À REPRENDRE | 5 | topNav, image, pdfViewer, map, gps |
| **COQUILLE VIDE** (pas de fiche) | 13 | title1, title2, title3, anomalyAlert, flowDiagram, statusTracker, activityFeed, liveGauge, approvalFlow, orgChart, masterDetail, wizardForm, commandPalette |

### 3.2 Scores par composant

Scores : Démo live interactive / Exemple réaliste / Finalité claire (0–2).
« — » = pas de fiche dédiée (fallback générique, 0/0/0).

**Positions 1–52** — 48 fiches dédiées, toutes au gabarit interactif complet
(vérifié par échantillonnage large + spot-check `metric/page.tsx:13-22` : 11
`useState` pilotent la preview).

| Composant | Fiche | D/R/F | Verdict | Remarque |
|---|---|---|---|---|
| metric | oui | 2/2/2 | CONFORME | label/value/delta/devise/locale interactifs ; « Chiffre d'affaires » |
| table | oui | 2/2/2 | CONFORME | tri + onRowClick ; colonnes Produit/Prix/Stock/Statut |
| title | oui | 2/2/2 | CONFORME | level/size/bar/inverted pilotables |
| title1 | **non** | —/—/— | **COQUILLE VIDE** | alias de title sans fiche → fallback générique |
| title2 | **non** | —/—/— | **COQUILLE VIDE** | idem |
| title3 | **non** | —/—/— | **COQUILLE VIDE** | idem |
| text | oui | 2/1/2 | CONFORME | content/mono interactifs |
| caption | oui | 2/1/2 | CONFORME | |
| badge | oui | 2/2/2 | CONFORME | 5 variants interactifs |
| progress | oui | 2/2/2 | CONFORME | value/max/label/showValue |
| skeleton | oui | 2/1/2 | CONFORME | 3 variants + dimensions |
| jsonViewer | oui | 2/1/2 | CONFORME | repliable, données structurées |
| avatar | oui | 2/1/2 | CONFORME | src/alt/size |
| panel | oui | 2/2/2 | CONFORME | 4 variants + title |
| tabs | oui | 2/2/2 | CONFORME | 3 onglets métier, onChange |
| expander | oui | 2/1/2 | CONFORME | |
| accordion | oui | 2/1/2 | CONFORME | allowMultiple toggle |
| card | oui | 2/2/2 | CONFORME | 3 variants |
| highlightBox | oui | 2/2/2 | CONFORME | exemple métier complet |
| divider | oui | 2/1/1 | CONFORME | gabarit minimaliste |
| grid | oui | 2/2/2 | CONFORME | cols/gap live |
| column | oui | 2/1/1 | CONFORME | gabarit minimaliste |
| emptyState | oui | 2/2/2 | CONFORME | title/description/action |
| container | oui | 2/1/1 | CONFORME | gabarit minimaliste |
| empty | oui | 2/1/1 | CONFORME | gabarit minimaliste |
| popover | oui | 2/1/2 | CONFORME | 4 placements |
| button | oui | 2/2/2 | CONFORME | variant/size/disabled + onClick démontré |
| theme | oui | 2/1/2 | CONFORME | toggle/select, localStorage expliqué |
| selectbox | oui | 2/2/2 | CONFORME | |
| numberInput | oui | 2/2/2 | CONFORME | min/max/step |
| input | oui | 2/2/2 | CONFORME | 5 types |
| textarea | oui | 2/2/2 | CONFORME | |
| checkbox | oui | 2/2/2 | CONFORME | « Accepter les conditions » |
| radioGroup | oui | 2/2/2 | CONFORME | |
| slider | oui | 2/2/2 | CONFORME | |
| dateInput | oui | 2/2/2 | CONFORME | |
| dateRangePicker | oui | 2/2/2 | CONFORME | |
| timeInput | oui | 2/2/2 | CONFORME | |
| rating | oui | 2/2/2 | CONFORME | étoiles cliquables |
| fileUploader | oui | 2/2/2 | CONFORME | fichiers sélectionnés affichés |
| colorPicker | oui | 2/2/2 | CONFORME | |
| chip | oui | 2/1/1 | CONFORME | gabarit minimaliste |
| message | oui | 2/2/2 | CONFORME | 4 types |
| spinner | oui | 2/1/2 | CONFORME | 11 variantes |
| loadingBar | oui | 2/1/2 | CONFORME | |
| tooltip | oui | 2/1/2 | CONFORME | 4 placements |
| statusBox | oui | 2/2/2 | CONFORME | running/complete/error |
| anomalyAlert | **non** | —/—/— | **COQUILLE VIDE** | composant clé d'élévation sans fiche |
| breadcrumb | oui | 2/2/2 | CONFORME | |
| stepper | oui | 2/2/2 | CONFORME | Informations/Paiement/Confirmation |
| audio | oui | 2/1/2 | CONFORME | |
| video | oui | 2/1/2 | CONFORME | |

**Positions 53–104** — 43 fiches dédiées ; 9 composants complexes sans fiche.

| Composant | Fiche | D/R/F | Verdict | Remarque |
|---|---|---|---|---|
| html | oui | 2/1/2 | CONFORME | textarea éditable |
| lineChart | oui | 2/1/2 | CONFORME | données Jan/Fév/Mar génériques |
| barChart | oui | 2/1/2 | CONFORME | données A/B/C/D génériques |
| areaChart | oui | 2/1/2 | CONFORME | |
| scatterChart | oui | 2/1/2 | CONFORME | |
| modal | oui | 2/1/2 | CONFORME | isOpen/title/size |
| codeBlock | oui | 2/1/2 | CONFORME | |
| topNav | oui | 2/1/1 | À REPRENDRE | démo minimaliste sans contrôles (`topnav/page.tsx:19-26`) |
| fab | oui | 2/1/2 | CONFORME | 4 positions |
| treeview | oui | 2/1/2 | CONFORME | |
| timeline | oui | 2/1/2 | CONFORME | done/current/upcoming |
| flowDiagram | **non** | —/—/— | **COQUILLE VIDE** | fallback générique |
| statusTracker | **non** | —/—/— | **COQUILLE VIDE** | fallback générique |
| activityFeed | **non** | —/—/— | **COQUILLE VIDE** | fallback générique |
| liveGauge | **non** | —/—/— | **COQUILLE VIDE** | fallback générique |
| approvalFlow | **non** | —/—/— | **COQUILLE VIDE** | fallback générique |
| orgChart | **non** | —/—/— | **COQUILLE VIDE** | fallback générique |
| masterDetail | **non** | —/—/— | **COQUILLE VIDE** | fallback générique |
| wizardForm | **non** | —/—/— | **COQUILLE VIDE** | fallback générique |
| commandPalette | **non** | —/—/— | **COQUILLE VIDE** | fallback générique |
| image | oui | 2/1/1 | À REPRENDRE | finalité peu claire |
| pdfViewer | oui | 1/0/1 | À REPRENDRE | iframe placeholder, pas de vraie démo |
| autocomplete | oui | 2/1/2 | CONFORME | villes réalistes |
| plotlyChart | oui | 2/1/2 | CONFORME | |
| map | oui | 1/0/1 | À REPRENDRE | iframe OSM statique |
| altairChart | oui | 2/1/2 | CONFORME | |
| barcode | oui | 2/1/2 | CONFORME | EAN-13 réaliste |
| qrCode | oui | 2/1/2 | CONFORME | URL/vCard |
| nfcBadge | oui | 2/1/2 | CONFORME | |
| drawer | oui | 2/1/2 | CONFORME | open/side/width |
| pagination | oui | 2/1/2 | CONFORME | |
| filterPanel | oui | 2/1/2 | CONFORME | values/reset |
| confirmModal | oui | 2/1/2 | CONFORME | danger/warning/info |
| toast | oui | 2/1/2 | CONFORME | |
| pageLayout | oui | 2/1/2 | CONFORME | |
| scrollContainer | oui | 2/1/2 | CONFORME | |
| labelValue | oui | 2/1/2 | CONFORME | |
| spinnerDot | oui | 2/1/2 | CONFORME | |
| titleBpm | oui | 2/1/2 | CONFORME | |
| markdown | oui | 2/1/2 | CONFORME | contenu éditable |
| codeEditor | oui | 2/1/2 | CONFORME | |
| crud | oui | 2/1/2 | CONFORME | endpoint jsonplaceholder |
| gps | oui | 1/0/1 | À REPRENDRE | exemple générique, démo limitée |
| jsonEditor | oui | 2/1/2 | CONFORME | validation live |
| notificationCenter | oui | 2/1/2 | CONFORME | lu/non-lu, marquage |
| filePreview | oui | 2/1/2 | CONFORME | image/PDF/texte |
| dataExplorer | oui | 2/1/2 | CONFORME | recherche/export/pagination |
| chatInterface | oui | 2/1/2 | CONFORME | streaming simulé |
| promptInput | oui | 2/1/2 | CONFORME | Cmd+Enter, token count |
| streamingText | oui | 2/1/2 | CONFORME | |
| diffViewer | oui | 2/1/2 | CONFORME | split/unified |
| modelSelector | oui | 2/1/2 | CONFORME | GPT-4o/Claude 3 |

Chiffres consolidés : **86 conformes · 5 à reprendre · 13 coquilles vides**.

**Constat transversal composants** : le gabarit sandbox est excellent (preview +
contrôles + code généré) ; les écarts sont concentrés sur (a) les **13 fiches
manquantes** — dont 9 composants complexes qui sont précisément ceux qui
vendraient le mieux le design system (wizardForm, commandPalette, orgChart…) —
et (b) le **réalisme des données** des fiches charts/affichage (Jan/Fév/Mar,
A/B/C/D) qui mériterait des jeux métier, chantier de fond non bloquant.

---

## 4. Backlog priorisé

Ordre proposé : d'abord ce qui est le plus visible et le plus creux (coquilles
vides de modules nommés dans la nav), puis les fiches composant manquantes
(vitrine publique), puis les reprises partielles, puis le fond.

### Vague 1 — Coquilles vides modules (12 PR, une par module)

Effort normalisé à **M** : la rubrique n'exige pas de backend — un état local
seedé bien fait suffit (précédents : tableau-blanc, calendrier, commentaires).
Passer en L uniquement si une vraie persistance Prisma est décidée.

| # | PR (branche `claude/module-<nom>-<hash>`) | Effort | Contenu attendu |
|---|---|---|---|
| 1 | export-planifie | M | liste d'exports planifiés seedée, création réelle (ajout à la liste + toast), pause/suppression, prochaine exécution calculée |
| 2 | rapports | M | 2–3 jeux de données seedés (CA mensuel, commandes), génération → tableau + graphique bpm réels, export CSV |
| 3 | webhooks | M | liste de webhooks seedée, création/édition, bouton « Tester » avec log de delivery simulé |
| 4 | connecteurs | M | connecteurs seedés (API, SFTP, base), création réelle, « Tester la connexion » avec statut + log de dernier sync |
| 5 | themes | M | thèmes prédéfinis seedés, application réelle au DOM (variables CSS), aperçu live |
| 6 | tableaux-de-bord | M | grille de widgets seedée (Metric/Chart bpm), ajout/retrait/réorganisation persistés en local |
| 7 | catalogue-produits | M | catalogue seedé (≥ 10 produits, variantes, stock), fiche produit avec code-barres/QR (bpm.barcode/qrCode), création/édition, filtres |
| 8 | audit-log | M | journal seedé (≥ 30 entrées : qui/quand/quoi/entité), filtres par utilisateur/entité/période, export CSV |
| 9 | formulaire-dynamique | M | schéma de dépendances champ↔type seedé, champs qui apparaissent réellement selon le type, soumission avec récap |
| 10 | notifications-ciblees | M | règles seedées (événement → canal → destinataires), création réelle, simulation d'événement qui déclenche la notification (réutiliser le contexte du module notification) |
| 11 | reservation-creneaux | M | planning de créneaux/ressources seedé, réservation avec état + confirmation, créneaux pris grisés |
| 12 | multi-langue | M | dictionnaire FR/EN de démo, bascule qui traduit réellement un écran d'exemple, persistance du choix |

### Vague 2 — Fiches composant manquantes (2–3 PR par lots cohérents)

| # | Lot | Composants | Effort |
|---|---|---|---|
| 10 | Fiches « process & orchestration » | flowDiagram, statusTracker, approvalFlow, wizardForm | M |
| 11 | Fiches « monitoring & data » | activityFeed, liveGauge, anomalyAlert, masterDetail | M |
| 12 | Fiches « navigation & structure » | orgChart, commandPalette, title1/2/3 (fiche alias ou redirection vers title avec preset) | S |

### Vague 3 — Modules à reprendre (5 PR)

| # | PR | Effort | Contenu attendu |
|---|---|---|---|
| 13 | devis-facturation | M | plusieurs lignes seedées, ajout/édition de ligne, totaux recalculés, cycle de statuts réel, PDF (ou aperçu imprimable) |
| 14 | referentiels | M | plusieurs référentiels seedés (devises, pays, types), CRUD complet en local |
| 15 | taches | M | création/édition/suppression, changement de statut inline, assignation |
| 16 | auth | M | démo de flux login/register jouable in situ (sandbox, sans toucher la vraie session), au lieu de la galerie de liens |
| 17 | monitor | L | jeu de démo embarqué (script seedé) pour voir le téléprompteur sans upload ; vérification du composant Monitor |

### Vague 4 — Fiches composant à reprendre + fond (2 PR)

| # | PR | Effort |
|---|---|---|
| 18 | Fiches pdfViewer, map, gps, image, topNav : vraies démos interactives | S |
| 19 | Réalisme des données des fiches charts (lineChart, barChart, areaChart, scatterChart… : jeux métier au lieu de Jan/Fév/A/B/C) | S |

### Chantier transversal (à intégrer à chaque PR de vague 1 et 3)

- **i18n FR/EN des modules** : aucun des 32 modules n'est traduit. Décision à
  prendre avant la vague 1 : brancher `lib/i18n` sur `app/(app)/modules` (clé
  par module) et exiger la parité dans chaque PR de reprise.
- **Suppression du pattern « simulateur-redirection »** : chaque PR de reprise
  supprime la redirection ou écrit une vraie page simulateur.

---

## 5. Chiffres consolidés

| Périmètre | Conformes | À reprendre | Coquilles vides |
|---|---|---|---|
| Modules (32) | **15** | **5** | **12** |
| Composants (104) | **86** | **5** | **13** |

Modules conformes (15) : asset-manager, calendrier, commentaires, contracts,
documents, ia, keep-screen-on, newsletter, notification, skeleton,
tableau-blanc, templates, veille, wiki, workflow.
Modules à reprendre (5) : auth, devis-facturation, monitor, referentiels,
taches.
Modules coquilles vides (12) : audit-log, catalogue-produits, connecteurs,
export-planifie, formulaire-dynamique, multi-langue, notifications-ciblees,
rapports, reservation-creneaux, tableaux-de-bord, themes, webhooks.

---

*Document produit par le Chantier 0. Validation humaine attendue avant toute PR
d'exécution.*

## 6. Suivi d'exécution (mis à jour le 2026-06-12)

Chaque PR est basée sur `master`, branche dédiée, tsc 0 + build Next vert sur
l'arbre d'intégration + smoke test HTTP des pages livrées. Aucune n'est mergée :
revue humaine attendue.

| Vague | Périmètre | PR |
|---|---|---|
| 0 | Audit + backlog (ce document) | #46 |
| 1 | export-planifie | #47 |
| 1 | rapports | #51 |
| 1 | webhooks | #52 |
| 1 | connecteurs | #53 |
| 1 | themes | #54 |
| 1 | tableaux-de-bord | #55 |
| 1 | catalogue-produits | #56 |
| 1 | formulaire-dynamique | #57 |
| 1 | audit-log | #58 |
| 1 | notifications-ciblees | #59 |
| 1 | reservation-creneaux | #60 |
| 1 | multi-langue | #61 |
| 2 | fiches flowDiagram, statusTracker, approvalFlow, wizardForm | #63 |
| 2 | fiches activityFeed, liveGauge, anomalyAlert, masterDetail | #64 |
| 2 | fiches orgChart, commandPalette, title1/2/3 | #65 |
| 3 | auth | #62 |
| 3 | devis-facturation | #67 |
| 3 | referentiels | #68 |
| 3 | taches | #66 |
| 3 | monitor | #69 |
| 4 | fiches pdfViewer, map, gps, image, topNav | #71 |
| 4 | réalisme données fiches charts | #70 |

Après merge de ces PR : les 12 coquilles vides modules et les 5 modules « à
reprendre » cochent la rubrique ; les 104 composants ont tous une fiche
interactive dédiée.
