import type { Locale } from "@/lib/i18n";

/**
 * Chaînes bilingues (fr/en) du module IA.
 * Portée : chrome présent dans app/(app)/modules/ia/ uniquement.
 * Le composant partagé components/AIChat reste inchangé.
 *
 * Parité fr/en garantie par le type : `en` doit être un `typeof STR.fr`.
 */

const fr = {
  // page.tsx
  page: {
    breadcrumbIa: "IA",
    description: "Assistant conversationnel. Contexte Wiki et Documents.",
    badge: "IA",
    readingTime: "⏱ 1 min",
  },
  // simulateur/page.tsx
  simulateur: {
    redirecting: "Redirection vers le simulateur IA…",
  },
  // documentation/page.tsx
  doc: {
    breadcrumbIa: "IA",
    breadcrumbDocumentation: "Documentation",
    title: "Documentation — IA",
    description:
      "Assistant conversationnel (Qwen par défaut via Ollama). Contexte des modules Wiki et Documents. Historique des conversations, sélection des modules pour le contexte.",

    intro: (
      <>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module (pas de <code>pip install blueprint-modular-ia</code> ni <code>npm install blueprint-modular-ia</code>) : on installe l&apos;application une fois, puis on configure la base PostgreSQL et le serveur Ollama (ou Anthropic) pour l&apos;assistant. Cette documentation décrit <strong>comment le module IA fonctionne</strong>, <strong>comment l&apos;installer</strong> (application, base de données, serveur Ollama et modèle), <strong>comment choisir le modèle</strong> (Qwen, Mistral, Claude), les <strong>lignes de commande</strong> pour installer l&apos;assistant IA et toutes ses dépendances (Node, Prisma, Ollama, Qwen ou Mistral), les <strong>lignes de code</strong> pour charger et utiliser le module (API, composant AIChat), et la <strong>gestion des $</strong> dans la zone de saisie pour référencer les modules (Wiki, Documents, etc.) dans vos questions.
      </>
    ),

    howItWorksTitle: "Comment fonctionne le module IA",
    howItWorksBody: (
      <>
        Le module IA fournit un <strong>assistant conversationnel</strong> intégré à l&apos;app. Par défaut, les réponses sont générées par un modèle local via <strong>Ollama</strong> (ex. Qwen3 8B). Le contexte envoyé au modèle peut inclure les données des modules <strong>Wiki</strong> et <strong>Documents</strong> : titres et contenu des articles wiki récents, liste des documents uploadés et métadonnées. L&apos;utilisateur choisit quels modules activer dans le panneau de contexte ; le client construit alors un bloc de texte à partir du registry des modules et l&apos;envoie en <code>context_from_modules</code> à l&apos;API. L&apos;historique des conversations est sauvegardé en base (AiConversation, AiMessage) ; chaque discussion peut être reprise, supprimée ou dupliquée.
      </>
    ),
    howItWorksProviders: (
      <>
        <strong>Providers</strong> : Qwen et Mistral via Ollama ; Claude (Anthropic) si <code>ANTHROPIC_API_KEY</code> est défini. Seuls ces providers sont implémentés.
      </>
    ),
    howItWorksVoice: (
      <>
        <strong>Transcription vocale (Whisper)</strong> : un bouton Micro dans la zone de saisie permet de dicter la question au lieu de la taper. L&apos;audio est envoyé à <code>POST /api/wiki/transcribe</code> (micro-service Whisper sur le VPS, port 9000) ; le texte transcrit est inséré dans la zone de saisie. Même service que pour le Wiki (nouvel article par dictée).
      </>
    ),
    howItWorksStreaming: (
      <>
        <strong>Streaming</strong> : les réponses sont streamées (Server-Sent Events) pour affichage progressif.
      </>
    ),
    howItWorksPrompts: (
      <>
        <strong>Prompts</strong> : le prompt système (lib/ai/prompt-templates) précise le rôle de l&apos;assistant (Blueprint Modular, français, pas de calcul ni d&apos;hypothèses). Si un contexte modules est fourni, il est injecté dans le prompt système.
      </>
    ),

    implementationTitle: "Implémentation (côté app)",
    implementationBody: (
      <>
        Le module IA repose sur : (1) la route API <code>POST /api/ai/chat</code> qui reçoit le message, l&apos;historique et le contexte modules, appelle le client Ollama ou Anthropic, et stream la réponse ; (2) le client <code>lib/ai/vllm-client.ts</code> qui envoie les requêtes à Ollama (<code>/api/chat</code> en streaming) ; (3) le <strong>module registry</strong> (lib/ai/module-registry.ts) dans lequel Wiki et Documents s&apos;enregistrent au chargement de l&apos;app (ModuleRegistryInit) ; (4) le composant <code>AIChat</code> qui gère la saisie, l&apos;autocomplétion des tokens <code>$</code>, l&apos;envoi des messages et l&apos;affichage du flux. Les conversations sont persistées via <code>saveConversationTurn</code> dans l&apos;API après chaque réponse complète.
      </>
    ),

    loadUseTitle: "Lignes de code pour charger et utiliser le module IA",
    loadLabel: "Charger le module :",
    loadBody: (
      <>
        Le module IA est intégré à l&apos;application Next.js ; il n&apos;y a pas de <code>import</code> ou de script à exécuter pour le « charger » séparément. Au démarrage de l&apos;app, le <strong>module registry</strong> est initialisé (ModuleRegistryInit) et enregistre les modules Wiki, Documents, etc. ; l&apos;assistant IA consomme ce registry pour construire le contexte. Assurez-vous que les routes API (<code>/api/ai/chat</code>, <code>/api/ai/conversations</code>, etc.) et le schéma Prisma (AiConversation, AiMessage) sont en place — ce qui est le cas après <code>prisma migrate deploy</code>.
      </>
    ),
    useLabel: "Utiliser le module :",
    useBody: (
      <>
        <strong>Depuis l&apos;interface</strong> : ouvrez la page <code>/modules/ia</code>. Vous pouvez envoyer des messages, sélectionner les modules (Wiki, Documents) dans le panneau de contexte pour inclure leur contenu dans le contexte envoyé au modèle, taper <strong>$</strong> dans la zone de saisie pour insérer des références (<code>$wiki</code>, <code>$doc</code>), et consulter ou reprendre l&apos;historique des conversations. <strong>Depuis du code</strong> : appelez <code>POST /api/ai/chat</code> avec <code>message</code>, <code>provider_name</code>, <code>conversation_history</code>, <code>discussion_id</code> (optionnel), <code>context_from_modules</code> (texte construit côté client à partir du module registry). Voir l&apos;exemple d&apos;appel côté client plus bas.
      </>
    ),

    installTitle: "Installation du module IA et dépendances",
    installBody: (
      <>
        Le module IA fait partie de l&apos;application Next.js. Aucun package séparé n&apos;est requis pour l&apos;UI ; en revanche, pour des réponses réelles (hors mock), il faut un serveur Ollama (ou une clé Anthropic pour Claude). Les dépendances Node sont déjà dans le projet (<code>@anthropic-ai/sdk</code> pour Claude ; pas de SDK OpenAI pour l&apos;instant, Ollama utilise l&apos;API HTTP).
      </>
    ),

    installStep1Title: "1. Installer l’application",
    installStep1Note: (
      <>
        Les modèles Prisma <code>AiConversation</code> et <code>AiMessage</code> sont créés par les migrations. <code>DATABASE_URL</code> doit être défini dans <code>.env</code>. Pour la liste des structures BDD et prérequis production par module, voir <code>docs/DATABASE.md</code> dans le dépôt.
      </>
    ),

    installStep2Title: "2. Installer et lancer Ollama (modèle Qwen ou Mistral)",
    installStep2Note: (
      <>
        Par défaut, l&apos;app utilise <code>AI_SERVER_URL=http://localhost:11434</code>. En dev sans serveur, définir <code>AI_MOCK=true</code> pour des réponses mockées.
      </>
    ),

    installStep3Title: "3. (Optionnel) Claude (Anthropic)",
    installStep3Body: (
      <>
        Pour utiliser Claude comme provider, définir <code>ANTHROPIC_API_KEY</code> dans <code>.env</code>. L&apos;API chat détecte le provider demandé (vllm, qwen, mistral, claude) et appelle soit Ollama soit Anthropic.
      </>
    ),

    summaryTitle: "Résumé des commandes (installer le module IA et toutes les dépendances)",
    summaryBody: "Enchaînement complet pour avoir l’assistant IA opérationnel (app + base + Ollama + modèle) :",
    summaryNote: (
      <>
        Définir dans <code>.env</code> : <code>DATABASE_URL</code>, <code>NEXTAUTH_SECRET</code>, <code>NEXTAUTH_URL</code>, <code>AI_SERVER_URL</code> (ex. <code>http://localhost:11434</code>), <code>AI_MODEL</code> (ex. <code>qwen3:8b</code>). Sans Ollama : <code>AI_MOCK=true</code> pour des réponses simulées.
      </>
    ),

    chooseModelTitle: "Comment choisir le modèle",
    chooseModelBody: (
      <>
        L&apos;assistant peut utiliser plusieurs <strong>providers</strong>. Le choix se fait dans l&apos;interface (sélecteur de modèle) et/ou via les variables d&apos;environnement.
      </>
    ),
    chooseModelOllama: (
      <>
        <strong>Ollama (Qwen, Mistral)</strong> : par défaut, l&apos;app utilise le modèle configuré dans <code>AI_MODEL</code> (ex. <code>qwen3:8b</code>). Pour Qwen et Mistral spécifiquement, vous pouvez définir <code>AI_MODEL_QWEN</code> et <code>AI_MODEL_MISTRAL</code>. Téléchargez le modèle avec <code>ollama pull qwen3:8b</code> ou <code>ollama pull mistral:7b</code>, puis sélectionnez le provider correspondant dans l&apos;UI.
      </>
    ),
    chooseModelClaude: (
      <>
        <strong>Claude (Anthropic)</strong> : définissez <code>ANTHROPIC_API_KEY</code> dans <code>.env</code>. Le provider « claude » devient disponible dans l&apos;assistant ; les requêtes sont envoyées à l&apos;API Anthropic au lieu d&apos;Ollama.
      </>
    ),
    chooseModelMock: (
      <>
        <strong>Mock</strong> : en développement sans serveur, <code>AI_MOCK=true</code> désactive les appels réels et renvoie une réponse factice (utile pour tester l&apos;UI).
      </>
    ),

    envTitle: "Variables d’environnement",
    envServerUrl: (
      <>
        <code>AI_SERVER_URL</code> — URL du serveur Ollama (ex. <code>http://localhost:11434</code> ou <code>http://vps:11434</code>).
      </>
    ),
    envModel: (
      <>
        <code>AI_MODEL</code> — Modèle Ollama par défaut (ex. <code>qwen3:8b</code>).
      </>
    ),
    envModelOverride: (
      <>
        <code>AI_MODEL_QWEN</code>, <code>AI_MODEL_MISTRAL</code> — Override par provider si besoin.
      </>
    ),
    envMock: (
      <>
        <code>AI_MOCK</code> — <code>true</code> pour désactiver les appels réels et renvoyer des réponses mockées (dév).
      </>
    ),
    envTimeout: (
      <>
        <code>AI_TIMEOUT</code> — Délai max en secondes (ex. 120).
      </>
    ),
    envRetries: (
      <>
        <code>AI_MAX_RETRIES</code> — Nombre de tentatives en cas d&apos;erreur réseau.
      </>
    ),
    envAnthropicKey: (
      <>
        <code>ANTHROPIC_API_KEY</code> — Clé API Anthropic pour le provider Claude.
      </>
    ),

    dollarTitle: "Gestion des $ dans l’assistant (références aux modules)",
    dollarBody: (
      <>
        Dans le champ de saisie de l&apos;assistant IA, taper un <strong>$</strong> affiche une liste de <strong>suggestions de tokens</strong> (<code>$wiki</code>, <code>$doc</code>, <code>$metric</code>, etc.). Ces tokens servent à l&apos;<strong>autocomplétion</strong> : en sélectionnant un token, vous l&apos;insérez dans le message. Ils n&apos;injectent pas le contenu des modules à la place du $ ; ils rappellent quels types de données peuvent être inclus. Le <strong>contenu effectif</strong> (articles wiki, documents) est injecté dans le <strong>contexte</strong> envoyé au modèle lorsque les modules correspondants sont sélectionnés dans le panneau de contexte (Module Registry). En résumé : le $ permet de compléter rapidement une référence dans le texte ; la sélection des modules (Wiki, Documents) dans le panneau détermine ce qui est envoyé au modèle comme contexte.
      </>
    ),
    dollarHowLabel: "Comment utiliser le $ dans l’assistant :",
    dollarStep1: (
      <>
        Ouvrez l&apos;assistant IA (page <code>/modules/ia</code>).
      </>
    ),
    dollarStep2:
      "Dans le panneau de contexte, cochez les modules dont vous voulez inclure le contenu (ex. Wiki, Documents) ; le texte de contexte sera construit et envoyé avec votre message.",
    dollarStep3: (
      <>
        Dans la zone de saisie, tapez <strong>$</strong> : une liste de tokens s&apos;affiche (<code>$wiki</code>, <code>$doc</code>, <code>$metric</code>, etc.). Sélectionnez un token pour l&apos;insérer dans votre message (ex. « Résume $wiki »).
      </>
    ),
    dollarStep4: (
      <>
        Le token <code>$wiki</code> (ou autre) dans le message est un rappel ; le contenu réel des articles ou documents est ajouté au contexte grâce aux cases cochées dans le panneau. Envoyez le message ; l&apos;IA répond en s&apos;appuyant sur le contexte fourni.
      </>
    ),
    dollarTokensLabel: "Tokens disponibles :",
    dollarTokenWiki: (
      <>
        <code>$wiki</code> — Wiki (articles).
      </>
    ),
    dollarTokenDoc: (
      <>
        <code>$doc</code> — Documents (analyses, contrats).
      </>
    ),
    dollarTokenMetric: (
      <>
        <code>$metric</code> — Métriques (dashboard).
      </>
    ),
    dollarTokenData: (
      <>
        <code>$table</code>, <code>$chart</code>, <code>$data</code> — Références données (étendues possibles).
      </>
    ),

    storageTitle: "Où sont sauvegardées les conversations",
    storageBody: (
      <>
        Les conversations sont stockées <strong>en base PostgreSQL</strong> : table <code>AiConversation</code> (id, userId, preview, createdAt, updatedAt) et table <code>AiMessage</code> (id, conversationId, userMessage, aiResponse, providerName, createdAt). Chaque tour de dialogue est enregistré après la fin du streaming. L&apos;historique est chargé via <code>GET /api/ai/conversations</code> et affiché dans le panneau latéral ; une discussion peut être supprimée via <code>DELETE /api/ai/conversations/[id]</code>.
      </>
    ),

    apiTitle: "API du module IA (résumé)",
    apiChat: (
      <>
        <code>POST /api/ai/chat</code> — Envoyer un message et recevoir un stream de réponses. Body : <code>message</code>, <code>provider_name</code> (vllm, qwen, mistral, claude), <code>conversation_history</code>, <code>discussion_id</code>, <code>context_from_modules</code> (texte construit côté client depuis le module registry). Réponse : SSE avec <code>type: chunk | done | error</code>, <code>discussion_id</code> dans done.
      </>
    ),
    apiListConversations: (
      <>
        <code>GET /api/ai/conversations</code> — Liste des conversations de l&apos;utilisateur (preview, messages).
      </>
    ),
    apiCreateConversation: (
      <>
        <code>POST /api/ai/conversations</code> — Créer une nouvelle conversation (retourne l&apos;id).
      </>
    ),
    apiDeleteConversation: (
      <>
        <code>DELETE /api/ai/conversations/[id]</code> — Supprimer une conversation.
      </>
    ),
    apiMessages: (
      <>
        <code>GET /api/ai/conversations/[id]/messages</code> — Détail des messages d&apos;une conversation (si exposé).
      </>
    ),
    apiHealth: (
      <>
        <code>GET /api/ai/health</code> — Santé du serveur Ollama (disponibilité, latence).
      </>
    ),
    apiProviders: (
      <>
        <code>GET /api/ai/providers</code> — Liste des providers (vllm, qwen, mistral, claude, etc.) et indicateur de configuration (ex. ANTHROPIC_API_KEY pour Claude).
      </>
    ),
    apiTranscribe: (
      <>
        <code>POST /api/wiki/transcribe</code> — Transcription vocale (Whisper). Utilisée par le bouton Micro de la zone de saisie IA et par le Wiki (nouvel article par dictée). Body : <code>multipart/form-data</code> avec champ <code>audio</code> (fichier webm/mp4). Réponse : <code>&#123; transcription: string &#125;</code>. Prérequis : micro-service Whisper démarré (ex. port 9000, variable <code>WHISPER_SERVICE_URL</code> dans <code>.env</code>).
      </>
    ),

    exampleTitle: "Exemple d’appel côté client (contexte modules)",

    backToModule: "← Retour au module IA",
    externalDocsLabel: "Documentation externe :",
  },
};

const en: typeof fr = {
  page: {
    breadcrumbIa: "AI",
    description: "Conversational assistant. Wiki and Documents context.",
    badge: "AI",
    readingTime: "⏱ 1 min",
  },
  simulateur: {
    redirecting: "Redirecting to the AI simulator…",
  },
  doc: {
    breadcrumbIa: "AI",
    breadcrumbDocumentation: "Documentation",
    title: "Documentation — AI",
    description:
      "Conversational assistant (Qwen by default via Ollama). Context from the Wiki and Documents modules. Conversation history, module selection for context.",

    intro: (
      <>
        Blueprint Modular modules are part of the <strong>Next.js application</strong>. There is no separate package per module (no <code>pip install blueprint-modular-ia</code> nor <code>npm install blueprint-modular-ia</code>): you install the application once, then configure the PostgreSQL database and the Ollama (or Anthropic) server for the assistant. This documentation describes <strong>how the AI module works</strong>, <strong>how to install it</strong> (application, database, Ollama server and model), <strong>how to choose the model</strong> (Qwen, Mistral, Claude), the <strong>command lines</strong> to install the AI assistant and all its dependencies (Node, Prisma, Ollama, Qwen or Mistral), the <strong>code lines</strong> to load and use the module (API, AIChat component), and the <strong>$ handling</strong> in the input area to reference modules (Wiki, Documents, etc.) in your questions.
      </>
    ),

    howItWorksTitle: "How the AI module works",
    howItWorksBody: (
      <>
        The AI module provides a <strong>conversational assistant</strong> built into the app. By default, responses are generated by a local model via <strong>Ollama</strong> (e.g. Qwen3 8B). The context sent to the model can include data from the <strong>Wiki</strong> and <strong>Documents</strong> modules: titles and content of recent wiki articles, list of uploaded documents and metadata. The user chooses which modules to enable in the context panel; the client then builds a text block from the module registry and sends it as <code>context_from_modules</code> to the API. Conversation history is saved to the database (AiConversation, AiMessage); each discussion can be resumed, deleted or duplicated.
      </>
    ),
    howItWorksProviders: (
      <>
        <strong>Providers</strong>: Qwen and Mistral via Ollama; Claude (Anthropic) if <code>ANTHROPIC_API_KEY</code> is set. Only these providers are implemented.
      </>
    ),
    howItWorksVoice: (
      <>
        <strong>Voice transcription (Whisper)</strong>: a Mic button in the input area lets you dictate the question instead of typing it. The audio is sent to <code>POST /api/wiki/transcribe</code> (Whisper micro-service on the VPS, port 9000); the transcribed text is inserted into the input area. Same service as for the Wiki (new article by dictation).
      </>
    ),
    howItWorksStreaming: (
      <>
        <strong>Streaming</strong>: responses are streamed (Server-Sent Events) for progressive display.
      </>
    ),
    howItWorksPrompts: (
      <>
        <strong>Prompts</strong>: the system prompt (lib/ai/prompt-templates) defines the assistant&apos;s role (Blueprint Modular, French, no computation or assumptions). If a module context is provided, it is injected into the system prompt.
      </>
    ),

    implementationTitle: "Implementation (app side)",
    implementationBody: (
      <>
        The AI module relies on: (1) the API route <code>POST /api/ai/chat</code>, which receives the message, the history and the module context, calls the Ollama or Anthropic client, and streams the response; (2) the client <code>lib/ai/vllm-client.ts</code>, which sends requests to Ollama (<code>/api/chat</code> in streaming); (3) the <strong>module registry</strong> (lib/ai/module-registry.ts) in which Wiki and Documents register when the app loads (ModuleRegistryInit); (4) the <code>AIChat</code> component, which handles input, autocompletion of <code>$</code> tokens, message sending and stream display. Conversations are persisted via <code>saveConversationTurn</code> in the API after each complete response.
      </>
    ),

    loadUseTitle: "Code lines to load and use the AI module",
    loadLabel: "Load the module:",
    loadBody: (
      <>
        The AI module is built into the Next.js application; there is no <code>import</code> or script to run in order to &quot;load&quot; it separately. When the app starts, the <strong>module registry</strong> is initialized (ModuleRegistryInit) and registers the Wiki, Documents, etc. modules; the AI assistant consumes this registry to build the context. Make sure the API routes (<code>/api/ai/chat</code>, <code>/api/ai/conversations</code>, etc.) and the Prisma schema (AiConversation, AiMessage) are in place — which is the case after <code>prisma migrate deploy</code>.
      </>
    ),
    useLabel: "Use the module:",
    useBody: (
      <>
        <strong>From the interface</strong>: open the <code>/modules/ia</code> page. You can send messages, select the modules (Wiki, Documents) in the context panel to include their content in the context sent to the model, type <strong>$</strong> in the input area to insert references (<code>$wiki</code>, <code>$doc</code>), and view or resume the conversation history. <strong>From code</strong>: call <code>POST /api/ai/chat</code> with <code>message</code>, <code>provider_name</code>, <code>conversation_history</code>, <code>discussion_id</code> (optional), <code>context_from_modules</code> (text built client-side from the module registry). See the client-side call example below.
      </>
    ),

    installTitle: "Installing the AI module and dependencies",
    installBody: (
      <>
        The AI module is part of the Next.js application. No separate package is required for the UI; however, for real responses (not mocked), you need an Ollama server (or an Anthropic key for Claude). The Node dependencies are already in the project (<code>@anthropic-ai/sdk</code> for Claude; no OpenAI SDK for now, Ollama uses the HTTP API).
      </>
    ),

    installStep1Title: "1. Install the application",
    installStep1Note: (
      <>
        The Prisma models <code>AiConversation</code> and <code>AiMessage</code> are created by the migrations. <code>DATABASE_URL</code> must be set in <code>.env</code>. For the list of database structures and production prerequisites per module, see <code>docs/DATABASE.md</code> in the repository.
      </>
    ),

    installStep2Title: "2. Install and run Ollama (Qwen or Mistral model)",
    installStep2Note: (
      <>
        By default, the app uses <code>AI_SERVER_URL=http://localhost:11434</code>. In dev without a server, set <code>AI_MOCK=true</code> for mocked responses.
      </>
    ),

    installStep3Title: "3. (Optional) Claude (Anthropic)",
    installStep3Body: (
      <>
        To use Claude as a provider, set <code>ANTHROPIC_API_KEY</code> in <code>.env</code>. The chat API detects the requested provider (vllm, qwen, mistral, claude) and calls either Ollama or Anthropic.
      </>
    ),

    summaryTitle: "Command summary (install the AI module and all dependencies)",
    summaryBody: "Full sequence to get the AI assistant up and running (app + database + Ollama + model):",
    summaryNote: (
      <>
        Set in <code>.env</code>: <code>DATABASE_URL</code>, <code>NEXTAUTH_SECRET</code>, <code>NEXTAUTH_URL</code>, <code>AI_SERVER_URL</code> (e.g. <code>http://localhost:11434</code>), <code>AI_MODEL</code> (e.g. <code>qwen3:8b</code>). Without Ollama: <code>AI_MOCK=true</code> for simulated responses.
      </>
    ),

    chooseModelTitle: "How to choose the model",
    chooseModelBody: (
      <>
        The assistant can use several <strong>providers</strong>. The choice is made in the interface (model selector) and/or via environment variables.
      </>
    ),
    chooseModelOllama: (
      <>
        <strong>Ollama (Qwen, Mistral)</strong>: by default, the app uses the model configured in <code>AI_MODEL</code> (e.g. <code>qwen3:8b</code>). For Qwen and Mistral specifically, you can set <code>AI_MODEL_QWEN</code> and <code>AI_MODEL_MISTRAL</code>. Download the model with <code>ollama pull qwen3:8b</code> or <code>ollama pull mistral:7b</code>, then select the corresponding provider in the UI.
      </>
    ),
    chooseModelClaude: (
      <>
        <strong>Claude (Anthropic)</strong>: set <code>ANTHROPIC_API_KEY</code> in <code>.env</code>. The &quot;claude&quot; provider becomes available in the assistant; requests are sent to the Anthropic API instead of Ollama.
      </>
    ),
    chooseModelMock: (
      <>
        <strong>Mock</strong>: in development without a server, <code>AI_MOCK=true</code> disables real calls and returns a fake response (useful for testing the UI).
      </>
    ),

    envTitle: "Environment variables",
    envServerUrl: (
      <>
        <code>AI_SERVER_URL</code> — Ollama server URL (e.g. <code>http://localhost:11434</code> or <code>http://vps:11434</code>).
      </>
    ),
    envModel: (
      <>
        <code>AI_MODEL</code> — Default Ollama model (e.g. <code>qwen3:8b</code>).
      </>
    ),
    envModelOverride: (
      <>
        <code>AI_MODEL_QWEN</code>, <code>AI_MODEL_MISTRAL</code> — Per-provider override if needed.
      </>
    ),
    envMock: (
      <>
        <code>AI_MOCK</code> — <code>true</code> to disable real calls and return mocked responses (dev).
      </>
    ),
    envTimeout: (
      <>
        <code>AI_TIMEOUT</code> — Max delay in seconds (e.g. 120).
      </>
    ),
    envRetries: (
      <>
        <code>AI_MAX_RETRIES</code> — Number of retries on a network error.
      </>
    ),
    envAnthropicKey: (
      <>
        <code>ANTHROPIC_API_KEY</code> — Anthropic API key for the Claude provider.
      </>
    ),

    dollarTitle: "$ handling in the assistant (module references)",
    dollarBody: (
      <>
        In the AI assistant&apos;s input field, typing a <strong>$</strong> shows a list of <strong>token suggestions</strong> (<code>$wiki</code>, <code>$doc</code>, <code>$metric</code>, etc.). These tokens are for <strong>autocompletion</strong>: by selecting a token, you insert it into the message. They do not inject module content in place of the $; they remind you which types of data can be included. The <strong>actual content</strong> (wiki articles, documents) is injected into the <strong>context</strong> sent to the model when the corresponding modules are selected in the context panel (Module Registry). In short: the $ lets you quickly complete a reference in the text; selecting modules (Wiki, Documents) in the panel determines what is sent to the model as context.
      </>
    ),
    dollarHowLabel: "How to use the $ in the assistant:",
    dollarStep1: (
      <>
        Open the AI assistant (page <code>/modules/ia</code>).
      </>
    ),
    dollarStep2:
      "In the context panel, check the modules whose content you want to include (e.g. Wiki, Documents); the context text will be built and sent with your message.",
    dollarStep3: (
      <>
        In the input area, type <strong>$</strong>: a list of tokens appears (<code>$wiki</code>, <code>$doc</code>, <code>$metric</code>, etc.). Select a token to insert it into your message (e.g. &quot;Summarize $wiki&quot;).
      </>
    ),
    dollarStep4: (
      <>
        The <code>$wiki</code> (or other) token in the message is a reminder; the actual content of the articles or documents is added to the context thanks to the boxes checked in the panel. Send the message; the AI replies based on the provided context.
      </>
    ),
    dollarTokensLabel: "Available tokens:",
    dollarTokenWiki: (
      <>
        <code>$wiki</code> — Wiki (articles).
      </>
    ),
    dollarTokenDoc: (
      <>
        <code>$doc</code> — Documents (analyses, contracts).
      </>
    ),
    dollarTokenMetric: (
      <>
        <code>$metric</code> — Metrics (dashboard).
      </>
    ),
    dollarTokenData: (
      <>
        <code>$table</code>, <code>$chart</code>, <code>$data</code> — Data references (possible extensions).
      </>
    ),

    storageTitle: "Where conversations are saved",
    storageBody: (
      <>
        Conversations are stored <strong>in a PostgreSQL database</strong>: table <code>AiConversation</code> (id, userId, preview, createdAt, updatedAt) and table <code>AiMessage</code> (id, conversationId, userMessage, aiResponse, providerName, createdAt). Each dialogue turn is recorded after streaming ends. History is loaded via <code>GET /api/ai/conversations</code> and shown in the side panel; a discussion can be deleted via <code>DELETE /api/ai/conversations/[id]</code>.
      </>
    ),

    apiTitle: "AI module API (summary)",
    apiChat: (
      <>
        <code>POST /api/ai/chat</code> — Send a message and receive a stream of responses. Body: <code>message</code>, <code>provider_name</code> (vllm, qwen, mistral, claude), <code>conversation_history</code>, <code>discussion_id</code>, <code>context_from_modules</code> (text built client-side from the module registry). Response: SSE with <code>type: chunk | done | error</code>, <code>discussion_id</code> in done.
      </>
    ),
    apiListConversations: (
      <>
        <code>GET /api/ai/conversations</code> — List of the user&apos;s conversations (preview, messages).
      </>
    ),
    apiCreateConversation: (
      <>
        <code>POST /api/ai/conversations</code> — Create a new conversation (returns the id).
      </>
    ),
    apiDeleteConversation: (
      <>
        <code>DELETE /api/ai/conversations/[id]</code> — Delete a conversation.
      </>
    ),
    apiMessages: (
      <>
        <code>GET /api/ai/conversations/[id]/messages</code> — Detail of a conversation&apos;s messages (if exposed).
      </>
    ),
    apiHealth: (
      <>
        <code>GET /api/ai/health</code> — Ollama server health (availability, latency).
      </>
    ),
    apiProviders: (
      <>
        <code>GET /api/ai/providers</code> — List of providers (vllm, qwen, mistral, claude, etc.) and a configuration indicator (e.g. ANTHROPIC_API_KEY for Claude).
      </>
    ),
    apiTranscribe: (
      <>
        <code>POST /api/wiki/transcribe</code> — Voice transcription (Whisper). Used by the Mic button of the AI input area and by the Wiki (new article by dictation). Body: <code>multipart/form-data</code> with an <code>audio</code> field (webm/mp4 file). Response: <code>&#123; transcription: string &#125;</code>. Prerequisite: Whisper micro-service started (e.g. port 9000, <code>WHISPER_SERVICE_URL</code> variable in <code>.env</code>).
      </>
    ),

    exampleTitle: "Client-side call example (module context)",

    backToModule: "← Back to the AI module",
    externalDocsLabel: "External documentation:",
  },
};

export const STR = { fr, en } as const;

export function str(locale: Locale) {
  return STR[locale];
}
