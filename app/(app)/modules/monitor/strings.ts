import type { Locale } from "@/lib/i18n";

/**
 * Chaînes FR/EN des pages du module Monitor (page module + documentation).
 * Le FR est la source des types ; `en: typeof fr` garantit la parité des clés.
 * Les champs suffixés `Html` contiennent du balisage inline (<strong>, <em>,
 * <kbd>, <code>) rendu via dangerouslySetInnerHTML.
 */
const fr = {
  page: {
    breadcrumbCurrent: "Monitor",
    title: "Blueprint Monitor",
    description:
      "Téléprompte IA pour présentations — import PPTX, suggestions Q&R, traduction et résumé de séance.",
    badgeCategory: "IA",
    readingTime: "⏱ 2 min",
    documentationLink: "Documentation",
  },
  doc: {
    breadcrumbModule: "Monitor",
    breadcrumbCurrent: "Documentation",
    title: "Documentation — Blueprint Monitor",
    description:
      "Téléprompte IA pour présentations : import PPTX, Questions IA (réponses suggérées), traduction et résumé de séance. Overlay semi-transparent (transparence réglable en live via le bouton ◐ dans la barre, 60–95 %).",
    introHtml:
      "Le module <strong>Monitor</strong> est un overlay qui s’affiche à l’écran pendant une présentation. Il permet de charger un fichier <strong>PPTX</strong>, d’afficher le script et les notes par slide, de recevoir des questions en direct et d’obtenir des réponses suggérées par l’IA, de traduire du texte (FR ↔ EN) et de générer un résumé post-séance avec actions de suivi.",
    howToTitle: "Mode opératoire",
    howToItemsHtml: [
      "<strong>Ouvrir le Monitor</strong> — Aller sur <em>Modules → Monitor</em>. L’overlay s’affiche en haut à droite (panneau repliable).",
      "<strong>Clé API Claude (optionnel)</strong> — Pour Questions IA, traduction et résumé : cliquer sur 🔑, saisir la clé Anthropic, elle est stockée en local (localStorage) et envoyée au backend.",
      "<strong>Importer un PPTX</strong> — Cliquer sur « ↑ PPTX », choisir un fichier .pptx. Le backend extrait titre, slides, textes, notes du présentateur et KPIs. La présentation remplace l’état courant (slide 1 affichée).",
      "<strong>Naviguer</strong> — Flèches ← / → ou boutons pour changer de slide. Le script et les notes de la slide courante s’affichent dans l’onglet « Script ».",
      "<strong>Questions IA en direct</strong> — Onglet « Questions IA » : choisir FR ou EN (langue de la réponse), saisir une question reçue en visio, envoyer ; l’IA suggère une réponse en streaming (contexte = slide courante). Possibilité de logger la paire question / réponse pour le résumé.",
      "<strong>Traduction</strong> — Onglet « Traduction » : coller un texte, choisir FR → EN ou EN → FR, envoyer ; la traduction est streamée.",
      "<strong>Résumé de séance</strong> — Onglet « Résumé » : touche <kbd>S</kbd> (ou bouton) pour générer un compte-rendu avec actions de suivi à partir du titre, des slides et des questions loggées (streaming).",
      "<strong>Visio</strong> — Garder l’overlay visible ou le masquer avec <kbd>H</kbd> / <kbd>Échap</kbd> selon besoin (présentation partagée + overlay sur un second écran ou en PIP).",
    ],
    featuresTitle: "Fonctionnalités",
    featureItemsHtml: [
      "<strong>Import PPTX</strong> — Extraction automatique des titres, textes des slides, notes du présentateur et KPIs (si présents).",
      "<strong>Script</strong> — Affichage et édition (double-clic) du script par slide.",
      "<strong>Questions IA</strong> — Toggle FR/EN pour la langue de la réponse ; saisie d’une question reçue en visio ; l’IA suggère une réponse en streaming (contexte = slide courante).",
      "<strong>Traduction</strong> — Texte à traduire, direction FR → EN ou EN → FR, réponse en streaming.",
      "<strong>Résumé</strong> — Génération d’un compte-rendu de la séance avec actions de suivi (à partir du titre, des slides et des questions loggées).",
    ],
    apiKeyTitle: "Clé API Claude (Anthropic)",
    apiKeyHtml:
      "Les appels IA (Q&R, traduction, résumé) utilisent l’API <strong>Claude (Anthropic)</strong>. La clé se saisit dans l’interface du Monitor : bouton <strong>🔑</strong> dans la barre, puis champ « Clé API Claude (Anthropic) ». La valeur est stockée localement (localStorage) et envoyée en header <code>X-Anthropic-API-Key</code> à l’API prompteur. Ne jamais mettre de clé en dur dans le code.",
    shortcutsTitle: "Raccourcis clavier",
    shortcutItemsHtml: [
      "<kbd>→</kbd> ou <kbd>Espace</kbd> — Slide suivante",
      "<kbd>←</kbd> — Slide précédente",
      "<kbd>Q</kbd> — Focus onglet Questions IA",
      "<kbd>T</kbd> — Focus onglet Traduction",
      "<kbd>S</kbd> — Générer le résumé",
      "<kbd>H</kbd> ou <kbd>Échap</kbd> — Masquer / afficher l’overlay",
    ],
    apiTitle: "API (backend Prompteur)",
    apiIntroHtml:
      "Le Monitor appelle l’API <strong>/api/prompteur</strong> (proxy Next.js vers un backend FastAPI sur le port 8001). Les endpoints utilisés :",
    apiEndpointsHtml: [
      "<code>POST /api/prompteur/import-pptx</code> — Upload d’un fichier .pptx (multipart/form-data, champ <code>file</code>). Réponse : <code>title</code>, <code>slide_count</code>, <code>slides[]</code> (id, title, script, notes, kpis).",
      "<code>POST /api/prompteur/suggest-answer</code> — Body JSON : <code>question</code>, <code>slide</code>, <code>lang</code>. Réponse : SSE (stream de texte).",
      "<code>POST /api/prompteur/translate</code> — Body JSON : <code>text</code>, <code>direction</code> (fr_to_en | en_to_fr). Réponse : SSE.",
      "<code>POST /api/prompteur/summarize</code> — Body JSON : <code>presentation_title</code>, <code>slides</code>, <code>questions_logged</code>. Réponse : SSE.",
      "<code>GET /api/prompteur/health</code> — Santé du service et indicateur <code>anthropic_key_set</code>.",
    ],
    apiHeaderNoteHtml:
      "Le header <code>X-Anthropic-API-Key</code> est transmis par le proxy au backend ; le backend doit l’utiliser pour les appels Anthropic (ou fallback sur la variable d’environnement).",
    deployTitle: "Déploiement",
    deployHtml:
      "En production, le service <strong>prompteur-api</strong> (FastAPI) doit tourner (ex. PM2) et être joignable depuis l’app Next.js (<code>PROMPTEUR_API_URL</code> ou routage Nginx vers le backend). Dépendances côté backend : <code>python-pptx</code>, <code>python-multipart</code>, SDK Anthropic. Voir <code>deploy/prompteur-api-requirements.txt</code>.",
    sizeTitle: "Limite de taille du fichier PPTX",
    sizeIntroHtml:
      "La taille maximale est configurée à 100 Mo (Next.js + Nginx). Si vous voyez encore « fichier trop volumineux » :",
    sizeItemsHtml: [
      "<strong>Next.js</strong> — Dans <code>next.config.mjs</code>, <code>experimental.serverActions.bodySizeLimit</code> est déjà à <code>&quot;100mb&quot;</code> ; cela s’applique aux Server Actions. Les Route Handlers (proxy <code>/api/prompteur</code>) peuvent avoir une limite propre selon la version.",
      "<strong>Nginx</strong> — En prod, si la requête passe par Nginx (vers Next.js ou directement vers le backend), ajouter <code>client_max_body_size 100m;</code> dans le bloc <code>server</code> ou dans le <code>location /api/prompteur/</code> pour autoriser les uploads jusqu’à 50 Mo. Sans cela, Nginx renvoie 413 (Payload Too Large) au-delà de 1 Mo par défaut.",
      "<strong>Backend FastAPI (prompteur-api)</strong> — Si le backend impose une limite (ex. Starlette), l’augmenter côté Python (ex. paramètre <code>max_upload_size</code> ou équivalent selon votre <code>main.py</code>).",
    ],
    sizeOutroHtml:
      "Pour accepter des PPTX jusqu’à 50 Mo : configurer au minimum Nginx (<code>client_max_body_size 100m;</code>) et, si besoin, le backend prompteur. Voir aussi le bloc <code>location /api/prompteur/</code> dans <code>deploy/DEPLOY_APP.md</code>.",
    backLink: "← Retour au module",
  },
};

const en: typeof fr = {
  page: {
    breadcrumbCurrent: "Monitor",
    title: "Blueprint Monitor",
    description:
      "AI teleprompter for presentations — PPTX import, suggested Q&A, translation, and session summary.",
    badgeCategory: "AI",
    readingTime: "⏱ 2 min",
    documentationLink: "Documentation",
  },
  doc: {
    breadcrumbModule: "Monitor",
    breadcrumbCurrent: "Documentation",
    title: "Documentation — Blueprint Monitor",
    description:
      "AI teleprompter for presentations: PPTX import, AI Q&A (suggested answers), translation, and session summary. Semi-transparent overlay (opacity adjustable live via the ◐ button in the toolbar, 60–95%).",
    introHtml:
      "The <strong>Monitor</strong> module is an overlay displayed on screen during a presentation. It lets you load a <strong>PPTX</strong> file, display the script and notes for each slide, take questions live and get AI-suggested answers, translate text (FR ↔ EN), and generate a post-session summary with follow-up actions.",
    howToTitle: "How to use",
    howToItemsHtml: [
      "<strong>Open the Monitor</strong> — Go to <em>Modules → Monitor</em>. The overlay appears in the top-right corner (collapsible panel).",
      "<strong>Claude API key (optional)</strong> — For AI Q&A, translation and summary: click 🔑 and enter your Anthropic key; it is stored locally (localStorage) and sent to the backend.",
      "<strong>Import a PPTX</strong> — Click “↑ PPTX” and choose a .pptx file. The backend extracts the title, slides, texts, presenter notes and KPIs. The presentation replaces the current state (slide 1 displayed).",
      "<strong>Navigate</strong> — Arrow keys ← / → or buttons to change slides. The current slide’s script and notes appear in the “Script” tab.",
      "<strong>Live AI Q&A</strong> — “AI Q&A” tab: pick FR or EN (answer language), type a question received during the call and send it; the AI streams a suggested answer (context = current slide). The question/answer pair can be logged for the summary.",
      "<strong>Translation</strong> — “Translation” tab: paste a text, choose FR → EN or EN → FR, send; the translation is streamed.",
      "<strong>Session summary</strong> — “Summary” tab: press <kbd>S</kbd> (or use the button) to generate a recap with follow-up actions from the title, the slides and the logged questions (streaming).",
      "<strong>Video calls</strong> — Keep the overlay visible or hide it with <kbd>H</kbd> / <kbd>Esc</kbd> as needed (shared presentation + overlay on a second screen or in PIP).",
    ],
    featuresTitle: "Features",
    featureItemsHtml: [
      "<strong>PPTX import</strong> — Automatic extraction of titles, slide texts, presenter notes and KPIs (when present).",
      "<strong>Script</strong> — Display and edit (double-click) the script for each slide.",
      "<strong>AI Q&A</strong> — FR/EN toggle for the answer language; type a question received during the call; the AI streams a suggested answer (context = current slide).",
      "<strong>Translation</strong> — Text to translate, FR → EN or EN → FR direction, streamed response.",
      "<strong>Summary</strong> — Generates a session recap with follow-up actions (from the title, the slides and the logged questions).",
    ],
    apiKeyTitle: "Claude API key (Anthropic)",
    apiKeyHtml:
      "AI calls (Q&A, translation, summary) use the <strong>Claude (Anthropic)</strong> API. The key is entered in the Monitor interface: <strong>🔑</strong> button in the toolbar, then the “Claude API key (Anthropic)” field. The value is stored locally (localStorage) and sent as the <code>X-Anthropic-API-Key</code> header to the prompter API. Never hard-code a key in the source code.",
    shortcutsTitle: "Keyboard shortcuts",
    shortcutItemsHtml: [
      "<kbd>→</kbd> or <kbd>Space</kbd> — Next slide",
      "<kbd>←</kbd> — Previous slide",
      "<kbd>Q</kbd> — Focus the AI Q&A tab",
      "<kbd>T</kbd> — Focus the Translation tab",
      "<kbd>S</kbd> — Generate the summary",
      "<kbd>H</kbd> or <kbd>Esc</kbd> — Hide / show the overlay",
    ],
    apiTitle: "API (Prompter backend)",
    apiIntroHtml:
      "The Monitor calls the <strong>/api/prompteur</strong> API (Next.js proxy to a FastAPI backend on port 8001). Endpoints used:",
    apiEndpointsHtml: [
      "<code>POST /api/prompteur/import-pptx</code> — Upload of a .pptx file (multipart/form-data, <code>file</code> field). Response: <code>title</code>, <code>slide_count</code>, <code>slides[]</code> (id, title, script, notes, kpis).",
      "<code>POST /api/prompteur/suggest-answer</code> — JSON body: <code>question</code>, <code>slide</code>, <code>lang</code>. Response: SSE (text stream).",
      "<code>POST /api/prompteur/translate</code> — JSON body: <code>text</code>, <code>direction</code> (fr_to_en | en_to_fr). Response: SSE.",
      "<code>POST /api/prompteur/summarize</code> — JSON body: <code>presentation_title</code>, <code>slides</code>, <code>questions_logged</code>. Response: SSE.",
      "<code>GET /api/prompteur/health</code> — Service health and the <code>anthropic_key_set</code> flag.",
    ],
    apiHeaderNoteHtml:
      "The <code>X-Anthropic-API-Key</code> header is forwarded by the proxy to the backend; the backend must use it for Anthropic calls (or fall back to the environment variable).",
    deployTitle: "Deployment",
    deployHtml:
      "In production, the <strong>prompteur-api</strong> service (FastAPI) must be running (e.g. PM2) and reachable from the Next.js app (<code>PROMPTEUR_API_URL</code> or Nginx routing to the backend). Backend dependencies: <code>python-pptx</code>, <code>python-multipart</code>, Anthropic SDK. See <code>deploy/prompteur-api-requirements.txt</code>.",
    sizeTitle: "PPTX file size limit",
    sizeIntroHtml:
      "The maximum size is configured at 100 MB (Next.js + Nginx). If you still see “file too large”:",
    sizeItemsHtml: [
      "<strong>Next.js</strong> — In <code>next.config.mjs</code>, <code>experimental.serverActions.bodySizeLimit</code> is already set to <code>&quot;100mb&quot;</code>; this applies to Server Actions. Route Handlers (the <code>/api/prompteur</code> proxy) may have their own limit depending on the version.",
      "<strong>Nginx</strong> — In production, if the request goes through Nginx (to Next.js or directly to the backend), add <code>client_max_body_size 100m;</code> in the <code>server</code> block or in the <code>location /api/prompteur/</code> block to allow uploads up to 50 MB. Without it, Nginx returns 413 (Payload Too Large) beyond the default 1 MB.",
      "<strong>FastAPI backend (prompteur-api)</strong> — If the backend enforces a limit (e.g. Starlette), raise it on the Python side (e.g. a <code>max_upload_size</code> parameter or equivalent depending on your <code>main.py</code>).",
    ],
    sizeOutroHtml:
      "To accept PPTX files up to 50 MB: configure at least Nginx (<code>client_max_body_size 100m;</code>) and, if needed, the prompter backend. See also the <code>location /api/prompteur/</code> block in <code>deploy/DEPLOY_APP.md</code>.",
    backLink: "← Back to the module",
  },
};

export const monitorStrings: Record<Locale, typeof fr> = { fr, en };
