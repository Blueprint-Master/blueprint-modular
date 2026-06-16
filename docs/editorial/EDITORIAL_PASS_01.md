# Passe éditoriale 01 — Propositions FR/EN (vitrine Blueprint Modular)

> **Statut : PROPOSITIONS.** Ce document n'applique aucune réécriture. Il analyse les
> textes de la vitrine et propose, page par page, des reformulations à valider par un
> humain. Un second chantier (prompt CC distinct), après validation, appliquera les
> lignes approuvées dans `lib/i18n/fr.ts`, `lib/i18n/en.ts` et les deux fichiers
> `layout.tsx` concernés.
>
> **Périmètre couvert :** `/` · `/presentation` · `/manifeste` · `/built-for-ai` ·
> `/mcp` · `/composants` (catalogue + galerie) · `/modules` · `/galerie` (apps) ·
> `/resources` · `/docs` · `/docs/getting-started` · `/docs/changelog`.
> **Hors périmètre :** contenu de référence `/docs/*` (fiches), `/legal` `/privacy`
> `/terms`, tout code/layout.
>
> **Sources des textes :** `lib/i18n/fr.ts` (type de référence) et `lib/i18n/en.ts`
> pour la quasi-totalité ; deux exceptions hardcodées : `app/(public)/(site)/docs/layout.tsx`
> et `app/(public)/(site)/docs/getting-started/layout.tsx`.
>
> **Positionnement acquis (PR #139/#140), NON rouvert :** « composition d'interface
> vérifiée par IA ». Toutes les propositions s'y conforment.

---

## 1. Synthèse

### Constat général
Le niveau rédactionnel est **déjà bon** — bien meilleur que le « constat déclencheur »
ne le laissait craindre. La voix est largement cohérente, le registre sobre, les claims
étayés par des preuves (rendu réel, source générée, read-only). En conséquence, **la
majorité des segments sont marqués CONSERVER**. Les défauts réels sont peu nombreux mais
nets, et concentrés sur quelques points.

### Les 5 défauts les plus récurrents
1. **CALQUE non traduit (bug)** — `builtForAI.presets` est resté en **français dans
   `en.ts`** (`lib/i18n/en.ts:635-639`). Un anglophone voit « un dashboard de suivi de
   commandes » dans la démo. Défaut le plus grave car visible et non intentionnel.
2. **META TROP LONGUE (>155c)** — plusieurs `metaDescription` dépassent la limite et
   seront tronquées dans les SERP : `/presentation`, `/manifeste`, `/built-for-ai`,
   marginalement `/mcp`.
3. **META HORS-i18n & FR-only** — `/docs` et `/docs/getting-started` ont leurs
   `title`/`description` **codés en dur, en français uniquement**, génériques, avec
   l'abréviation « BPM » non explicitée. Aucune version EN ; aucune cohérence de voix.
4. **DISSONANCE DE FOND React/Python** — le site oscille entre **parité** (« React comme
   en Python ») et **hiérarchie** (« pilotés depuis Python », « Python devant, React
   dessous »). Récurrent, structurant — **signalé en §5, non résolu ici.**
5. **CALQUE EN ponctuel & CTA mous** — quelques tournures EN sentent la traduction
   (« Open the resources ») ou le cliché SaaS (« Discover the… »). Mineur mais répété.

### Les 3 changements à plus fort impact
1. **Traduire `builtForAI.presets` en anglais** — correction d'un bug visible, coût
   nul, gain de crédibilité immédiat sur la page la plus « démonstrative » du site.
2. **Réduire les 3-4 metaDescription trop longues sous 155c** — gain SEO direct
   (pas de troncature), sur les pages d'entrée organique.
3. **Trancher la dissonance React/Python (décision humaine, §5), puis aligner**
   tagline + `why.points[1]` + hero + meta sur la décision — c'est le seul travail de
   **fond** ; tout le reste est cosmétique.

---

## 2. Référentiel de voix (la Constitution)

Extrait de la home et du Manifeste (Principe Six : « Le composant porte l'intelligence ;
le monde l'élargit »). Toute proposition de ce document s'y conforme ; les tensions sont
notées en colonne « Cohérence ».

### 2.1 Attributs de voix (4)
- **Précis** — le terme technique exact, jamais dilué. « composant sémantique », pas
  « brique intelligente ».
- **Sobre-confiant** — l'affirmation sans esbroufe. On montre (rendu réel, source
  générée), on ne se vante pas.
- **Orienté preuve / show-don't-tell** — un exemple de code, un chiffre, un rendu live
  remplacent l'adjectif. La preuve porte la promesse.
- **Légèrement contrarian** — l'angle qui distingue : « documenté vs **consommé** »,
  « le rendu réel, pas des captures », « une seule vérité, zéro divergence ».

### 2.2 Lexique canonique
**Toujours employer (ne pas diluer) :** composants sémantiques · read-only / lecture
seule · MCP · vérifié · ontologie / Ω · composition · déterministe · rendu réel ·
`llms.txt` · `bpm.*` · source de vérité · `suggest_composition` / `get_component`.

**Bannis (clichés SaaS / hyperbole) :** solution · puissant / *powerful* · intuitif /
*intuitive* · fluide / *seamless* · transparent (sens marketing) · « permet de » ·
« En savoir plus » / *Learn more* (CTA générique) · révolutionnaire · le meilleur ·
leader · *Discover…* (CTA mou) · *we are pleased to* · *cutting-edge / next-gen*.

### 2.3 Registre
- **FR** — vouvoiement. Phrases courtes, verbe tôt. **CTA : l'infinitif est la
  convention en place** (« Commencer », « Voir les composants ») et il est cohérent
  partout — on le **conserve** (le brief évoque l'impératif présent ; voir la tension
  notée en §5.2, à trancher si l'on veut basculer en « Commencez »).
- **EN** — anglais US, **voix active**, « you » direct, phrases courtes. Jamais de
  formule de politesse corporate. Pas d'article calqué (« Open **the** resources » →
  « Browse resources »).

### 2.4 Signature rythmique
Une idée par phrase. Le verbe tôt. **Conclusion d'abord** (pyramide inversée) :
le bénéfice ou le fait fort ouvre, le détail suit. Le tiret cadratin sert la respiration,
pas l'empilement.

---

## 3. Sections par page

Légende défauts : `FLOU` · `REMPLISSAGE` · `CALQUE` · `JARGON CREUX` · `ENTERREMENT` ·
`PASSIF` · `INCOHÉRENCE DE VOIX` · `RYTHME` · `CTA FAIBLE` · `DISSONANCE` (→ §5) ·
`META>155` · `HORS-i18n` · `HYPERBOLE`.

---

### 3.1 `/` — Accueil

**Intention.** Arrive un développeur / lead technique B2B (souvent Python) curieux d'un
design system pilotable par IA. Il cherche : *qu'est-ce que c'est, est-ce crédible, par
où je commence.* Il doit repartir convaincu que l'outil est réel (preuve > promesse) et
savoir cliquer « Commencer » ou « Voir les composants ».

**SEO (déjà traité #140 — vérification de cohérence).**
- title FR `home.metaTitle` « Blueprint Modular — composez des interfaces vérifiées par IA »
  (60c, pile la limite) → **CONSERVER.** Cohérent avec le hero.
- title EN « Blueprint Modular — compose AI-verified interfaces » (~50c) → **CONSERVER.**
- meta FR/EN → **CONSERVER** (cohérentes hero + ≤155c).
- H1 = `home.hero.title` (ci-dessous).

#### Table de reformulation — Accueil

| Clé i18n / source | Texte actuel FR | Texte actuel EN | Défaut(s) | Proposition FR | Proposition EN | Pourquoi mieux |
|---|---|---|---|---|---|---|
| `home.hero.title` | Décrivez un besoin. Obtenez une composition d'interface vérifiée. | Describe a need. Get a verified interface composition. | — | **CONSERVER** | **CONSERVER** | H1 net, deux phrases-verbe, aligné positionnement #139/#140. |
| `home.hero.lead` | {count} composants sémantiques qu'une IA sait assembler — et appeler en React comme en Python. | {count} semantic components an AI knows how to assemble — callable in React and Python alike. | DISSONANCE (parité, →§5) | **CONSERVER** (sous réserve §5) | **CONSERVER** (sous réserve §5) | Bon rythme, lexique canonique. Le « React comme en Python » relève de la dissonance de fond, à trancher en §5 — pas une reformulation. |
| `home.hero.ctaPrimary/Secondary` | Commencer / Voir les composants | Get started / Browse components | — | **CONSERVER** | **CONSERVER** | CTA déclaratifs, non génériques. |
| `home.hero.demoCaption` | Rendu réel — ces composants sont ceux du package, pas des captures d'écran. | Live rendering — these are the package's own components, not screenshots. | — | **CONSERVER** | **CONSERVER** | Contrarian + preuve : signature de voix exemplaire. |
| `home.why.title` | Conçu pour les applications métier, pas pour les démos. | Built for business applications, not demos. | — | **CONSERVER** | **CONSERVER** | Antithèse nette, orientée preuve. |
| `home.why.points[1]` (title) | Python devant, React dessous | Python in front, React underneath | DISSONANCE (hiérarchie, →§5) | *(décision §5)* | *(décision §5)* | Contredit la parité du hero. À aligner après décision §5, pas à reformuler isolément. |
| `home.why.points[2].body` | Toute la surface d'API est publiée dans llms.txt, généré depuis les sources TypeScript… | The entire API surface ships in llms.txt, generated from the TypeScript sources… | — | **CONSERVER** | **CONSERVER** | Fait précis, source citée. |
| `home.agents.body` | …C'est la même source générée depuis le code qui alimente ce site : une seule vérité, zéro divergence. | …It is the same code-generated source that powers this site: one truth, zero drift. | — | **CONSERVER** | **CONSERVER** | « une seule vérité, zéro divergence » = preuve mémorable. |
| `home.showcase.liveBody` | …Le code que vous lisez est le code qui tourne. C'est ce que votre application affichera, au pixel près. | …The code you read is the code that runs. This is exactly what your application will render, pixel for pixel. | RYTHME (léger) | **CONSERVER** | **CONSERVER** | Trois phrases courtes, montée en preuve. Long mais maîtrisé. |
| `home.faq.items[3].a` | Chaque module documente ses tables Prisma et ses variables d'environnement. Voir docs/DATABASE.md dans le dépôt pour les prérequis de production. | Each module documents its Prisma tables and environment variables. See docs/DATABASE.md in the repository for production prerequisites. | — | **CONSERVER** | **CONSERVER** | Réponse factuelle, renvoi précis. |
| `home.cta.offer` | Open-source sous licence Apache-2.0 — gratuit, sans verrou propriétaire. Une question, un besoin entreprise ? Écrivez-nous. | Open source under the Apache-2.0 license — free, no vendor lock-in. A question, an enterprise need? Get in touch. | — | **CONSERVER** | **CONSERVER** | Fait (licence) + appel direct. EN actif. |

> Reste de l'accueil (`why.points[0]`, `codeDemo`, `catalog`, `install`, `modules`,
> `whyBpm`, `faq` autres items, `mcpTeaser`, `resourcesTeaser`, `cta`) : **CONSERVER** —
> textes précis, orientés preuve, sans défaut nommé. (`common.tagline`, `mcpTeaser`,
> `resourcesTeaser` sont des **segments partagés** → §4.)

---

### 3.2 `/presentation` — Vue d'ensemble

**Intention.** Visiteur qui veut la carte du produit en 30 secondes : *que contient
Blueprint Modular, par où entrer.* Doit repartir avec les cinq points d'entrée en tête.

#### SEO

| Élément | Actuel | Défaut | Proposé (≤ limite) |
|---|---|---|---|
| title FR | Présentation — Blueprint Modular | — | **CONSERVER** |
| title EN | Overview — Blueprint Modular | — | **CONSERVER** |
| meta FR | « Blueprint Modular en un coup d'œil : des composants React appelés comme des fonctions Python, des modules métier prêts à brancher, un connecteur MCP pour vos agents et une documentation générée depuis le code. » (~205c) | `META>155` · `DISSONANCE` | « Blueprint Modular en un coup d'œil : composants en rendu réel, modules métier prêts à brancher, connecteur MCP pour vos agents, doc générée depuis le code. » (~150c) |
| meta EN | « Blueprint Modular at a glance: React components called like Python functions, ready-to-wire business modules, an MCP connector for your agents, and documentation generated from the code. » (~185c) | `META>155` · `DISSONANCE` | « Blueprint Modular at a glance: live-rendered components, ready-to-wire business modules, an MCP connector for agents, docs generated from code. » (~148c) |
| H1 | Blueprint Modular, en un coup d'œil. / Blueprint Modular, at a glance. | — | **CONSERVER** |

> Note SEO : la meta proposée retire la formule « composants React appelés comme des
> fonctions Python » qui (a) allonge au-delà de 155c et (b) porte la **hiérarchie**
> React/Python (→§5). La reformulation reste factuelle (« en rendu réel ») sans trancher
> la dissonance.

#### Table de reformulation — Présentation

| Clé i18n / source | Texte actuel FR | Texte actuel EN | Défaut(s) | Proposition FR | Proposition EN | Pourquoi mieux |
|---|---|---|---|---|---|---|
| `presentationPage.lead` | Une bibliothèque d'interfaces métier pilotée depuis Python : … une seule source de vérité, du code au catalogue. | A business-UI library driven from Python: … one source of truth, from code to catalog. | DISSONANCE (hiérarchie, →§5) | **CONSERVER** (sous réserve §5) | **CONSERVER** (sous réserve §5) | « pilotée depuis Python » = hiérarchie ; cohérent avec la tagline mais en tension avec le hero. Décision §5. |
| `presentationPage.ecosystem.lead` | Chaque brique se découvre, se teste et se documente au même endroit. Voici par où entrer. | Every building block is discovered, tested and documented in the same place. Here's where to start. | PASSIF (EN léger) | **CONSERVER** | You discover, test and document every building block in one place. Here's where to start. | EN : voix active (« You discover… ») plutôt que « is discovered ». FR déjà actif → conservé. |
| `presentationPage.ecosystem.cards.*` | (5 cartes : Composants / Modules / MCP / Documentation / Ressources) | (idem) | — | **CONSERVER** | **CONSERVER** | Descriptions factuelles, bornées, cohérentes avec les pages cibles. |

---

### 3.3 `/manifeste` — Manifeste

**Intention.** Lecteur qui veut comprendre la *vision* derrière le produit (décideur,
investisseur, dev senior séduit par l'angle). Registre volontairement littéraire et
philosophique — **c'est une voix délibérée**, ancrée par le Principe Six. À préserver.

#### SEO

| Élément | Actuel | Défaut | Proposé |
|---|---|---|---|
| title FR/EN | Manifeste — / Manifesto — Blueprint Modular | — | **CONSERVER** |
| meta FR | « Le Manifeste de Blueprint : des instruments, pas des contraintes. Un logiciel qui traverse les cadres, sent le réel et en restitue le sens — pour penser à travers ce que l'organisation tient séparé. » (~195c) | `META>155` | « Le Manifeste Blueprint : des instruments, pas des contraintes. Un logiciel qui traverse les cadres, sent le réel et en restitue le sens. » (~135c) |
| meta EN | « The Blueprint Manifesto: instruments, not constraints. Software that crosses frames, senses the real and renders its meaning — to think across what the organization keeps apart. » (~180c) | `META>155` | « The Blueprint Manifesto: instruments, not constraints. Software that crosses frames, senses the real and renders its meaning. » (~125c) |
| H1 | Manifeste Blueprint / Blueprint Manifesto | — | **CONSERVER** |

#### Table de reformulation — Manifeste

| Clé i18n / source | Statut | Défaut | Note |
|---|---|---|---|
| `manifestePage.lead` « Des instruments, pas des contraintes » / « Instruments, not constraints » | **CONSERVER** | — | Devise frappante, antithèse mémorable. |
| `manifestePage.intro[*]` (3 §) | **CONSERVER** | — | Prose dense maîtrisée ; EN natif, pas un calque. |
| `manifestePage.sections[*]` (Un→Huit) | **CONSERVER** | — | Huit principes ciselés. Le Six est l'ancre de voix du site. Ne rien toucher. |
| `manifestePage.signature` | **CONSERVER** | — | « fabricant d'instruments… penser à travers ce que l'organisation tient séparé » : signature forte. |
| `manifestePage.ctaSecondary` « Explorer les composants » / « Explore the components » | **CONSERVER** | — | Cohérent ; « Explore » ici a un sens littéral (parcourir), pas le cliché « Discover ». |

> **Le Manifeste est le meilleur texte du site.** Aucune reformulation : seul ajustement,
> raccourcir les deux meta pour le SEO (ci-dessus). Le courage de ne rien changer
> s'applique pleinement ici.

---

### 3.4 `/built-for-ai` — Built for AI

**Intention.** Visiteur le plus « technique-curieux » : il veut *voir* un agent consommer
le catalogue. Doit repartir avec la conviction (démontrée, pas affirmée) que le design
system est consommable par une IA, et l'envie d'essayer la démo / d'ajouter le connecteur.

#### SEO

| Élément | Actuel | Défaut | Proposé |
|---|---|---|---|
| title FR | Built for AI — Blueprint Modular consommable par les agents (~57c) | — | **CONSERVER** |
| title EN | Built for AI — Blueprint Modular, consumable by agents (~54c) | — | **CONSERVER** |
| meta FR | « Blueprint Modular est nativement consommable par les agents IA via MCP. Décrivez un écran en langage naturel, l'outil suggest_composition renvoie des composants bpm.* réels — affichés puis rendus. » (~200c) | `META>155` | « Consommable nativement par les agents via MCP. Décrivez un écran : suggest_composition renvoie des composants bpm.* réels, vérifiés, puis rendus. » (~150c) |
| meta EN | « Blueprint Modular is natively consumable by AI agents over MCP. Describe a screen in natural language, suggest_composition returns real bpm.* components — listed, then rendered. » (~175c) | `META>155` | « Natively consumable by AI agents over MCP. Describe a screen: suggest_composition returns real, verified bpm.* components, then renders them. » (~145c) |
| H1 | Un design system que les agents savent lire — et composer. / A design system agents can read — and compose. | — | **CONSERVER** |

#### Table de reformulation — Built for AI

| Clé i18n / source | Texte actuel FR | Texte actuel EN | Défaut(s) | Proposition FR | Proposition EN | Pourquoi mieux |
|---|---|---|---|---|---|---|
| `builtForAI.lead` (dernière phrase) | …puis rendus. **Aucun autre design system ne montre ça.** | …then renders them. **No other design system shows this.** | `HYPERBOLE` (claim invérifiable) | …vérifiés, puis rendus. **C'est le différenciateur : un catalogue qu'on consomme, pas qu'on consulte.** | …then renders them. **That's the difference: a catalog you consume, not just read.** | Remplace une supériorité invérifiable (« aucun autre ») par le différenciateur factuel déjà tenu ailleurs (`diffBody`). Conforme à l'anti-hyperbole §2.2. Aucun fait nouveau. |
| `builtForAI.presets` | `["un dashboard de suivi de commandes", "des indicateurs de performance et une jauge", "un tableau de données avec recherche et pagination"]` | **`["un dashboard de suivi de commandes", "des indicateurs de performance et une jauge", "un tableau de données avec recherche et pagination"]`** (resté en FR !) | `CALQUE` (bug : non traduit) | **CONSERVER** (FR correct) | `["an order-tracking dashboard", "performance metrics and a gauge", "a data table with search and pagination"]` | Bug visible : l'anglophone voit des libellés FR dans la démo. Traduction native EN. **Vérifier que le moteur `suggest_composition` accepte une saisie EN** (sinon, garder des presets qui matchent côté outil — voir §5.3). |
| `builtForAI.demoPlaceholder` | ex. un dashboard de suivi de commandes | e.g. an order-tracking dashboard | — | **CONSERVER** | **CONSERVER** | Le placeholder EN est, lui, déjà traduit — d'où l'incohérence avec `presets`. |
| `builtForAI.diffBody` | Un design system documenté pour les humains se consulte. Blueprint Modular se consomme : … sans intervention humaine. Read-only, sans donnée personnelle. | A design system documented for humans gets read. Blueprint Modular gets consumed: … with no human in the loop. Read-only, no personal data. | — | **CONSERVER** | **CONSERVER** | Antithèse « consulte vs consomme » = cœur contrarian de la voix. Modèle du genre. |
| `builtForAI.toolsBody` / `demoBody` / `renderBody` | (descriptions techniques de la démo) | (idem) | — | **CONSERVER** | **CONSERVER** | Précis, vérifiables, lexique canonique respecté. |

---

### 3.5 `/mcp` — Connecteur MCP

**Intention.** Visiteur prêt à brancher : il veut l'endpoint, les garanties (read-only,
no-auth, no-PII), les 4 outils, et la marche à suivre. Doit repartir avec le connecteur
ajouté ou l'endpoint copié.

#### SEO

| Élément | Actuel | Défaut | Proposé |
|---|---|---|---|
| title FR/EN | Connecteur MCP — / MCP connector — Blueprint Modular | — | **CONSERVER** |
| meta FR | « Serveur MCP public et read-only qui expose le catalogue de composants Blueprint Modular à Claude et à tout hôte MCP. Sans authentification, sans donnée personnelle. » (~160c) | `META>155` (léger) | « Serveur MCP public et read-only : le catalogue de composants Blueprint Modular, ouvert à Claude et à tout hôte MCP. Sans authentification ni donnée personnelle. » (~155c) |
| meta EN | « Public, read-only MCP server exposing the Blueprint Modular component catalog to Claude and any MCP host. No authentication, no personal data. » (~145c) | — | **CONSERVER** |
| H1 | Le catalogue Blueprint Modular, ouvert à vos agents. / The Blueprint Modular catalog, open to your agents. | — | **CONSERVER** |

#### Table de reformulation — MCP

| Clé i18n / source | Statut | Défaut | Note |
|---|---|---|---|
| `mcp.lead` | **CONSERVER** | — | Garanties annoncées d'emblée (pyramide inversée). |
| `mcp.whatBody`, `mcp.props.*`, `mcp.tools.*` | **CONSERVER** | — | Techniquement précis, bornés, lexique canonique (`read-only`, JSON-RPC, SSE). |
| `mcp.addClaude.steps` / `mcp.addGeneric.steps` | **CONSERVER** | — | Procédures impératives nettes — exactement le bon registre pour des étapes. |
| `mcp.exampleBody` « Une requête initialize en JSON-RPC 2.0 suffit à ouvrir la session » / « A single initialize JSON-RPC 2.0 request opens the session » | **CONSERVER** | — | Concis, factuel. |

> Page exemplaire : aucune reformulation hors meta FR (limite). `mcp.metaTitle`,
> `mcp.props.readonly/noauth/nopii` et le bloc « read-only » sont des **segments
> partagés** avec `/built-for-ai`, `/presentation`, `home.mcpTeaser` → §4 (cohérence
> déjà bonne).

---

### 3.6 `/composants` — Catalogue + Galerie de composants

**Intention.** Développeur en évaluation : il veut *voir* les composants réels, chercher,
ouvrir une fiche. Doit repartir avec la preuve du « rendu réel » et un composant repéré.
(Route canonique `/composants` ; `/components` redirige.)

#### SEO
- `catalog.title` « Catalogue » / « Catalog » — H1 de la vue catalogue. **CONSERVER.**
- `gallery.title` « Galerie de composants » / « Component gallery » — H1 galerie.
  **CONSERVER.**
- Pas de `metaTitle`/`metaDescription` dédiés dans l'i18n pour cette vue (héritée). Voir
  §6 (lot SEO) : envisager une meta dédiée — **proposition de fait existant uniquement**,
  ex. FR « Les {count} composants bpm.* en rendu réel : catalogue cherchable et fiches
  détaillées. » / EN « The {count} bpm.* components, live: a searchable catalog with
  detailed component pages. » *(à valider, car cela crée une meta là où il n'y en a pas)*.

#### Table de reformulation — Composants

| Clé i18n / source | Statut | Défaut | Note |
|---|---|---|---|
| `catalog.lead` « Référence des {count} composants, alimentée par le registre… jamais saisis à la main. Cliquez sur une carte pour la fiche du composant. » | **CONSERVER** | — | Preuve (source générée) + action claire. |
| `gallery.caption` « {count} composants bpm.* en rendu réel » / « {count} bpm.* components, live » | **CONSERVER** | — | Concis, contrarian (« rendu réel »). |
| `gallery.sections.*`, `catalog.searchPlaceholder`, `catalog.searchAria` | **CONSERVER** | — | Libellés fonctionnels corrects. |
| `gallery.demo.*` (états de démo) | **CONSERVER** | — | Micro-copy technique précise. |

---

### 3.7 `/modules` — Catalogue des modules métier

**Intention.** Visiteur qui cherche des briques prêtes (auth, wiki, devis…). Doit
comprendre qu'au-delà des composants il y a des modules complets, documentés, simulables.

#### SEO
- `modulesCatalog.title` « Modules » — H1. **CONSERVER** (mais générique pour un `<title>`
  navigateur si hérité ; voir §6 lot SEO — meta dédiée optionnelle, à partir de faits
  existants).

#### Table de reformulation — Modules

| Clé i18n / source | Statut | Défaut | Note |
|---|---|---|---|
| `modulesCatalog.lead` « Les {count} modules disponibles, classés par catégorie. Chaque module dispose d'une page avec documentation et simulateur pour tester en ligne. » | **CONSERVER** | — | Factuel, promesse vérifiable (simulateur). |
| `modulesCatalog.categories.*`, `meta`, `searchPlaceholder`, `documentation`, `simulator` | **CONSERVER** | — | Libellés justes. |
| `home.modules.descriptions.*` (réutilisés conceptuellement) | **CONSERVER** | — | Listes concrètes, sans remplissage. |

---

### 3.8 `/galerie` — Apps créées avec Modular

**Intention.** Visiteur en quête de **preuve par l'exemple** : de vraies apps nées d'un
prompt. Doit croire au « déterministe » et vouloir voir la chaîne de génération.

#### SEO

| Élément | Actuel | Défaut | Proposé |
|---|---|---|---|
| title FR/EN | Apps créées avec Modular — Galerie / Apps built with Modular — Gallery | — | **CONSERVER** |
| meta FR/EN | sélection… validées par leur auteur… (~150c) | — | **CONSERVER** (≤155c, factuel) |
| H1 | Apps créées avec Modular / Apps built with Modular | — | **CONSERVER** |

#### Table de reformulation — Galerie (apps)

| Clé i18n / source | Texte actuel FR | Texte actuel EN | Défaut(s) | Proposition | Pourquoi |
|---|---|---|---|---|---|
| `galleryPage.lead` | Des instruments réels, nés d'un simple prompt — validés un par un. | Real instruments, born from a single prompt — vetted one by one. | — | **CONSERVER** | « instruments » fait écho au Manifeste ; preuve (« validés un par un »). |
| `galleryPage.detailLead` | Une phrase a produit cette structure, déterministiquement. | One sentence produced this structure, deterministically. | `RYTHME` (FR : « déterministiquement » lourd) | FR : « Une phrase a produit cette structure — de façon déterministe. » · EN : **CONSERVER** | « de façon déterministe » est plus naturel que l'adverbe « déterministiquement » ; conserve le terme canonique « déterministe ». EN déjà fluide. |
| `galleryPage.narrative` | …Modular a dérivé cette structure — entités, modules et indicateurs — de façon déterministe. | …Modular deterministically derived this structure — entities, modules and metrics. | — | **CONSERVER** | Cohérent, terme canonique présent. |
| `galleryPage.empty` | Aucune app n'a encore été retenue… Revenez bientôt… | No app has been featured… Check back soon… | — | **CONSERVER** | État vide utile, non robotique. |

---

### 3.9 `/resources` — Ressources & guides

**Intention.** Visiteur qui cherche *le point d'entrée unique* vers tout (doc, guides,
catalogue, llms.txt, MCP, PyPI). Doit trouver vite le bon lien.

#### SEO
- meta FR/EN ≤155c, factuelles → **CONSERVER.**
- H1 `resources.title` « Tout pour construire avec Blueprint Modular. » / « Everything to
  build with Blueprint Modular. » → **CONSERVER.**

#### Table de reformulation — Resources

| Clé i18n / source | Texte actuel FR | Texte actuel EN | Défaut(s) | Proposition FR | Proposition EN | Pourquoi |
|---|---|---|---|---|---|---|
| `resourcesTeaser.cta` *(segment partagé, home → §4)* | Ouvrir les ressources | **Open the resources** | `CALQUE` (article EN) | Ouvrir les ressources *(CONSERVER FR)* | **Browse resources** | « Open **the** resources » est un calque ; « Browse resources » est l'idiome EN. FR correct. |
| `mcpTeaser.cta` / `resources.cards.mcp` *(partagé)* | Découvrir le connecteur MCP | **Discover the MCP connector** | `CTA FAIBLE` (« Discover » mou) | **CONSERVER** (FR « Découvrir » acceptable) | **Explore the MCP connector** | EN : « Discover » est un cliché SaaS ; « Explore » est plus concret et actif. FR « Découvrir » reste idiomatique. |
| `resources.lead`, `resources.cards.*` (autres) | … | … | — | **CONSERVER** | **CONSERVER** | Descriptions de cartes nettes, factuelles. |

---

### 3.10 `/docs` — Accueil documentation

**Intention.** Visiteur qui veut construire : il cherche le parcours (démarrage,
catalogue, référence machine). Doit choisir sa carte et avancer.

#### SEO — **défaut structurel**

| Élément | Actuel (source) | Défaut | Proposé |
|---|---|---|---|
| title | `docs/layout.tsx` → **« Documentation »** (hardcodé, FR, sans suffixe marque) | `HORS-i18n` · `FLOU` | i18n + suffixe. FR « Documentation — Blueprint Modular » · EN « Documentation — Blueprint Modular » |
| description | `docs/layout.tsx` → **« Guide d'utilisation et référence des composants BPM. »** (hardcodé, **FR-only**, abréviation « BPM », générique) | `HORS-i18n` · `JARGON CREUX` (« BPM ») · pas d'EN | FR « Le point d'entrée pour construire avec Blueprint Modular : installation, catalogue des composants et référence machine pour vos agents. » · EN « The entry point to build with Blueprint Modular: installation, component catalog and machine reference for your agents. » |

> **Action technique (lot SEO, §6) :** déplacer ces deux champs vers l'i18n (nouvelles
> clés, ex. `docsHub.metaTitle` / `docsHub.metaDescription`) et localiser. Texte proposé
> = reformulation de `docsHub.lead` existant, **aucun fait nouveau**.

#### Table de reformulation — Docs hub

| Clé i18n / source | Statut | Défaut | Note |
|---|---|---|---|
| `docsHub.title` « Documentation » (H1) | **CONSERVER** | — | H1 correct (le défaut est sur le `<title>`/meta, pas le H1). |
| `docsHub.lead` | **CONSERVER** | — | « Tout ce qu'il faut pour construire et livrer… » : promesse + énumération nette. |
| `docsHub.cards.*` | **CONSERVER** | — | Cartes factuelles ; `database` renvoie précisément à `docs/DATABASE.md`. |

---

### 3.11 `/docs/getting-started` — Démarrage

**Intention.** Développeur prêt à installer. Veut le chemin le plus court vers une app qui
tourne. Doit repartir avec la commande et les 3 étapes claires.

#### SEO — **même défaut structurel que /docs**

| Élément | Actuel (source) | Défaut | Proposé |
|---|---|---|---|
| title | `getting-started/layout.tsx` → **« Démarrage »** (hardcodé, FR) | `HORS-i18n` | FR « Démarrage — Blueprint Modular » · EN « Getting started — Blueprint Modular » |
| description | `getting-started/layout.tsx` → **« Guide de démarrage Blueprint Modular : cas d'usage, installation et premier composant. »** (hardcodé, FR-only) | `HORS-i18n` · pas d'EN | FR **CONSERVER le sens**, localiser : « Installez le package, créez une app, écrivez votre premier composant — en trois étapes, en Python ou en React/JSX. » · EN « Install the package, create an app, write your first component — in three steps, in Python or React/JSX. » |

> Note : la meta EN proposée mentionne « Python or React/JSX » (parité), cohérente avec
> `gettingStarted.lead` qui présente **deux chemins** — point à garder à l'œil dans la
> décision §5.

#### Table de reformulation — Getting started

| Clé i18n / source | Statut | Défaut | Note |
|---|---|---|---|
| `gettingStarted.lead` « Deux chemins de démarrage réels… Pilotez votre app en Python (pip + bpm run), ou composez les mêmes composants en React/JSX. » | **CONSERVER** (sous réserve §5) | DISSONANCE (parité) | Présente Python et React **en parité** (« ou »). À confronter à la tagline hiérarchique en §5. |
| `gettingStarted.pythonTrack` / `reactTrack` | **CONSERVER** | — | Deux pistes décrites symétriquement, précises (`bpm run`, `style.css`). |
| `gettingStarted.steps[*]`, `next.*` | **CONSERVER** | — | Étapes impératives nettes, renvois utiles (catalogue, llms.txt). |

---

### 3.12 `/docs/changelog` — Changelog

**Intention.** Visiteur qui veut la trajectoire du produit. Doit voir que c'est généré
(crédibilité), pas une page marketing.

#### Table de reformulation — Changelog

| Clé i18n / source | Statut | Défaut | Note |
|---|---|---|---|
| `changelogPage.lead` « Chaque évolution, dérivée de l'historique des pull requests fusionnées. Généré depuis git, jamais saisi à la main. » | **CONSERVER** | — | Preuve (généré depuis git) = voix du site. |
| `changelogPage.types.*`, `empty`, `backToDocs` | **CONSERVER** | — | Libellés justes. |

---

## 4. Segments partagés (reformulés une seule fois)

Ces segments apparaissent sur plusieurs pages. **Une seule formulation, partout** — ne
pas les diverger par page.

| Clé i18n / source | Pages où il apparaît | Texte actuel FR | Texte actuel EN | Défaut(s) | Proposition FR | Proposition EN | Note |
|---|---|---|---|---|---|---|---|
| `common.tagline` | footer (toutes pages) | Composants métier pilotés depuis Python. | Business components driven from Python. | DISSONANCE (hiérarchie, →§5) | *(décision §5)* | *(décision §5)* | Tagline = **point d'ancrage de la dissonance** React/Python. À aligner après §5, pas à reformuler seule. |
| `nav.*` (Présentation, Manifeste, Galerie, Composants, Modules, MCP, Conçu pour l'IA, Ressources, Documentation, Démarrage) | barre de nav + menu mobile (toutes pages) | … | … | — | **CONSERVER** | **CONSERVER** | Libellés de nav clairs et stables (cf. #139 « Conçu pour l'IA »). |
| `footer.*` (Produit, Ressources, Légal, libellés liens) | footer (toutes pages) | … | … | — | **CONSERVER** | **CONSERVER** | Concis, exacts. |
| CTA « Commencer / Voir les composants » (`home.hero`, `home.cta`, `presentationPage`, `manifestePage`) | home, présentation, manifeste | Commencer / Voir les composants | Get started / Browse components | — | **CONSERVER** | **CONSERVER** | Déjà cohérents d'une page à l'autre. |
| Bloc « read-only / sans auth / sans PII » (`mcp.props.*`, `builtForAI.toolsBody`, `home.mcpTeaser.body`, `presentationPage.ecosystem.cards.mcp`, `resources.cards.mcp`) | mcp, built-for-ai, home, présentation, resources | …lecture seule, sans authentification ni donnée personnelle. | …read-only, with no authentication and no personal data. | — | **CONSERVER** | **CONSERVER** | Garanties formulées de façon homogène partout — cohérence déjà excellente. |
| `mcpTeaser.cta` / `resources.cards.mcp` « Découvrir le connecteur MCP » | home, resources | Découvrir le connecteur MCP | Discover the MCP connector | `CTA FAIBLE` (EN) | **CONSERVER** | **Explore the MCP connector** | Voir §3.9 — corriger l'EN une seule fois, partout. |
| `resourcesTeaser.cta` « Ouvrir les ressources » | home, (resources) | Ouvrir les ressources | Open the resources | `CALQUE` (EN) | **CONSERVER** | **Browse resources** | Voir §3.9 — corriger l'EN une seule fois. |
| `{count} composants` / `{count} components` (catalog, gallery, mcp, builtForAI, presentation, modules…) | quasi toutes | — | — | — | **CONSERVER** | **CONSERVER** | Interpolation `fmt`/`plural` déjà alignée sur le registre réel (#140). Ne pas figer de nombre en dur. |

---

## 5. Dissonances de fond — à trancher par l'humain

> **Règle :** ce document **signale**, il ne **résout pas**. Aucune des lignes
> « sous réserve §5 » ci-dessus ne doit être appliquée avant cette décision.

### 5.1 React ⇄ Python : parité ou hiérarchie ? *(dissonance principale)*

Le site tient **deux discours simultanés** :

**Camp HIÉRARCHIE (Python devant) :**
- `common.tagline` : « Composants métier **pilotés depuis Python** » / « driven from Python »
- `home.why.points[1]` : « **Python devant, React dessous** » / « Python in front, React underneath »
- `presentationPage.lead` : « une bibliothèque… **pilotée depuis Python** »
- `presentationPage.metaDescription` : « React components **called like Python functions** »
- `gettingStarted.pythonTrack` : pip + bpm run présenté comme le chemin principal

**Camp PARITÉ (React = Python) :**
- `home.hero.lead` : « appeler **en React comme en Python** » / « callable in React and Python **alike** »
- `home.metaDescription` : « appelables **en React comme en Python** »
- `gettingStarted.lead` : « Pilotez en Python… **ou** composez les mêmes composants en React/JSX » (deux chemins symétriques)
- `gettingStarted.reactTrack` : npm `@blueprint-modular/core` décrit à parité, « la surface lue par le MCP »

**Pourquoi c'est gênant.** Le hero (vitrine #1) dit parité ; la tagline (présente sur
*toutes* les pages) dit hiérarchie. Un même visiteur lit les deux. Le MCP/built-for-ai
s'appuie sur la **surface React/JSX** (`@blueprint-modular/core`) — ce qui tire plutôt
vers la parité, voire vers React comme socle technique.

**Décision à prendre (3 options) :**
- **A — Parité assumée** : aligner la tagline et `why.points[1]` sur « React comme en
  Python » (deux surfaces égales). Cohérent avec le hero et le MCP.
- **B — Hiérarchie assumée** : aligner le hero et `gettingStarted` sur « Python devant »
  (Python = expérience principale, React = sortie). Cohérent avec la tagline historique.
- **C — Hiérarchie *contextuelle*** : Python devant pour l'audience « builder », parité
  pour l'audience « agents/React ». Plus subtil, plus risqué (re-crée la dissonance si
  mal cadré).

**Recommandation (non décisionnelle) :** **A (parité)** semble la plus sûre — c'est le
sens du hero repositionné (#139/#140) et du socle MCP (surface React). Mais c'est une
**décision produit** : ne pas l'appliquer sans validation. Une fois tranché, les lignes
« sous réserve §5 » des §3.1, §3.2, §3.11 et le segment `common.tagline` (§4) s'alignent
en un lot unique.

### 5.2 CTA FR : infinitif ou impératif présent ?

Le brief §Référentiel demande l'**impératif présent** pour les CTA FR (« Commencez »).
Le site utilise l'**infinitif** (« Commencer », « Voir les composants ») — convention de
bouton très répandue, et **cohérente partout**. Basculer en impératif toucherait ~8 CTA.
**Décision :** garder l'infinitif (recommandé : cohérence + convention) **ou** basculer
tout en impératif. Ne pas mélanger. *(Hors « dissonance de fond » au sens strict, mais
décision de voix transverse à acter.)*

### 5.3 Presets de la démo built-for-ai : dépendance au moteur

Traduire `builtForAI.presets` en EN (§3.4) suppose que `suggest_composition` interprète
correctement une saisie **en anglais**. À **vérifier côté `lib/mcp/registry`** avant
d'appliquer : si l'appariement est sensible à la langue (mots-clés FR), les presets EN
pourraient renvoyer moins de résultats. *(Signalement technique, pas éditorial — mais
bloquant pour la ligne `presets`.)*

---

## 6. Annexe — Lots d'implémentation suggérés (à exécuter par des prompts CC distincts, après validation)

Ordonnés par rapport impact / risque. **Chaque lot = un prompt CC cohérent.** Ne rien
exécuter ici.

| Lot | Contenu | Fichiers touchés | Risque | Dépend de |
|---|---|---|---|---|
| **L1 — Bug presets EN** | Traduire `builtForAI.presets` en anglais | `lib/i18n/en.ts` | Faible | §5.3 (vérif moteur) |
| **L2 — Meta SEO < 155c** | Raccourcir metaDescription : présentation, manifeste, built-for-ai ; léger trim mcp FR | `fr.ts`, `en.ts` | Faible | — |
| **L3 — Meta docs/getting-started en i18n** | Sortir les `title`/`description` hardcodés des 2 `layout.tsx` vers l'i18n + localiser EN (clés `docsHub.metaTitle/Description`, `gettingStarted.metaTitle/Description`) | `docs/layout.tsx`, `docs/getting-started/layout.tsx`, `fr.ts`, `en.ts` | **Moyen** (code + i18n) | — |
| **L4 — Calques/CTA EN** | `resourcesTeaser.cta` → « Browse resources » ; `mcpTeaser.cta`/`resources.cards.mcp` → « Explore the MCP connector » ; `presentationPage.ecosystem.lead` EN en voix active | `en.ts` | Faible | — |
| **L5 — Anti-hyperbole** | `builtForAI.lead` : remplacer « Aucun autre design system… » / « No other design system… » par le différenciateur factuel | `fr.ts`, `en.ts` | Faible | — |
| **L6 — Rythme FR ponctuel** | `galleryPage.detailLead` FR : « déterministiquement » → « de façon déterministe » | `fr.ts` | Faible | — |
| **L7 — Décision React/Python (§5.1)** | Après arbitrage produit : aligner tagline + `why.points[1]` + hero + metas sur l'option retenue | `fr.ts`, `en.ts` | **Élevé** (fond) | **§5.1 tranché** |
| **L8 — (optionnel) Meta dédiées catalogue/modules** | Ajouter metaTitle/Description à `/composants` et `/modules` à partir de faits existants | `fr.ts`, `en.ts`, pages | Moyen | Validation (crée du contenu) |
| **L9 — (optionnel) CTA impératif FR (§5.2)** | Si décidé : basculer tous les CTA FR infinitif → impératif | `fr.ts` | Moyen | **§5.2 tranché** |

---

## Validation de ce livrable
- **Seul fichier ajouté :** `docs/editorial/EDITORIAL_PASS_01.md`. Aucun `.ts` i18n
  modifié, aucun composant touché (cf. `git status`).
- **Couverture :** 12 pages/vues du périmètre traitées (nav + footer recoupés) ; pages
  hors périmètre (`/legal`, `/privacy`, `/terms`, fiches `/docs/*`) explicitement exclues.
- **Discipline :** chaque ligne porte un défaut nommé **ou** la mention **CONSERVER** ;
  FR et EN présents pour chaque proposition ; aucun claim/fait nouveau introduit
  (l'unique retrait — « aucun autre design system » — supprime une hyperbole, n'en ajoute
  pas) ; dissonances de fond signalées, non résolues.
