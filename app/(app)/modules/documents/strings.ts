import type { Locale } from "@/lib/i18n";

/**
 * Chaînes bilingues du module « Analyse de documents ».
 *
 * Patron : STR = { fr, en }. La parité FR/EN est garantie par le type
 * (le bloc `en` doit satisfaire `typeof STR.fr`). Les libellés dynamiques
 * sont exposés via des fonctions paramétrées.
 *
 * Seul le « chrome » (interface) est traduit : les données analysées
 * proviennent de l'API et ne sont pas traduites.
 */

const fr = {
  // Page liste
  list: {
    importTitle: "Analyse de documents",
    importDescription:
      "Importez des documents PDF (analyses, études, rapports) pour générer automatiquement une synthèse actionnable grâce à Claude. Les analyses sont stockées en base de données et peuvent être réexploitées dans d'autres onglets.",
    dropLabel:
      "Glissez-déposez ou cliquez pour sélectionner des fichiers PDF (jusqu'à 10 fichiers)",
    analyzeButton: "Analyser les documents",
    analyzing: "Analyse en cours...",
    documentsHeading: "Documents",
    searchPlaceholder: "Rechercher...",
    loading: "Chargement des documents...",
    emptyText: "Aucun document analysé pour l'instant.",
    emptyCta: "Analyser un document →",
    onlyPdf: "Seuls les fichiers PDF sont acceptés.",
    fileTooLarge:
      "Fichier trop volumineux (limite 1 Mo par défaut). Vérifiez la config serveur.",
    statusDone: "✓",
    statusError: "✗ Erreur",
    statusProcessing: "⏳ Analyse...",
    statusPending: "⏳ En attente",
    columns: {
      filename: "Fichier",
      supplier: "Fournisseur",
      client: "Client",
      contractDate: "Date contrat",
      terminationDate: "Dénonciation",
      analysisStatus: "Statut",
    },
    // Navigation
    backToModules: "← Retour aux modules",
    analyzeNav: "Analyser un document",
    documentationNav: "Documentation",
  },

  // Page détail [id]
  detail: {
    loading: "Chargement...",
    notFoundTitle: "Document introuvable",
    backToList: "Retour à la liste",
    statusDone: "✓",
    statusError: "✗ Erreur",
    statusProcessing: "⏳ Analyse en cours",
    statusPending: "⏳ En attente",
    deleteButton: "Supprimer",
    deleteConfirm: "Supprimer ce document ?",
    analyzing: "Analyse IA en cours...",
    analysisFailed:
      "L'analyse a échoué. Vous pouvez supprimer le document ou réessayer plus tard.",
    supplier: "Fournisseur",
    client: "Client",
    contractDate: "Date de contrat",
    signatureDate: "Date de signature",
    terminationDate: "Date de dénonciation",
    summary: "Synthèse",
    keyPoints: "Points clés",
    commitments: "Engagements",
    backToAnalysis: "← Retour à l'Analyse de documents",
    analyzeNav: "Analyser un document",
    documentationNav: "Documentation",
  },

  // Page documentation
  doc: {
    bcModules: "Modules",
    bcAnalysis: "Analyse de documents",
    bcDocumentation: "Documentation",
    title: "Documentation — Analyse de documents",
    description:
      "Upload, analyse et gestion de documents PDF. Métadonnées et statut d'analyse. Intégration avec le module IA (contexte assistant).",
    introHtml: {
      lead1: "Les modules Blueprint Modular (Auth, Wiki, IA, Documents, etc.) font partie de l'",
      leadStrong1: "application Next.js",
      lead2: ". Il n'y a pas de package séparé par module (pas de ",
      leadCode1: "pip install blueprint-modular-documents",
      lead3: " ni ",
      leadCode2: "npm install blueprint-modular-documents",
      lead4:
        ") : on installe l'application une fois, puis on configure les variables d'environnement et les services (base PostgreSQL, Ollama ou Anthropic pour l'IA) selon les modules utilisés. Cette documentation décrit ",
      leadStrong2: "comment installer",
      lead5:
        " le module Analyse de documents et toutes ses dépendances (Node, Prisma, extraction PDF, serveur IA), ",
      leadStrong3: "comment il fonctionne",
      lead6: ", ",
      leadStrong4: "comment le paramétrer",
      lead7:
        " (variables d'environnement, formats, taille max) et comment l'utiliser (interface ou API).",
    },
    howTitle: "Comment fonctionne le module Analyse de documents",
    howHtml: {
      p1: "Le module permet d'",
      p1Strong1: "uploader",
      p2: " des documents ",
      p2Strong: "PDF",
      p3: ", de les ",
      p3Strong: "analyser automatiquement",
      p4: " via l'IA pour extraire fournisseur, client, dates (contrat, signature, échéance), résumé, points clés et engagements. Le résultat est stocké en base (table ",
      pCode1: "Document",
      p5: ") ; le fichier est enregistré sur disque dans ",
      pCode2: "uploads/[userId]/[docId].pdf",
      p6: ". L'analyse est lancée juste après l'upload (synchrone) : extraction du texte (pdf-parse), puis appel au modèle (Claude si ",
      pCode3: "ANTHROPIC_API_KEY",
      p7:
        " est défini, sinon Ollama / Qwen). Le module Documents est enregistré dans le registry de l'assistant IA : les métadonnées des documents peuvent être injectées dans le contexte des conversations.",
    },
    statusLiStrong: "Statut",
    statusLi:
      " : pending → processing → done (ou error). La liste se rafraîchit tant qu'un document est en cours.",
    alertLiStrong: "Alertes échéance",
    alertLi:
      " : l'UI affiche les documents dont la date de résiliation est dans les 30 prochains jours.",
    installTitle: "Installation et dépendances",
    installHtml: {
      p1: "Le module fait partie de l'application Next.js. Dépendances Node incluses dans le projet : ",
      pCode1: "pdf-parse",
      p2: " pour l'extraction de texte PDF. Pour l'analyse IA (extraction fournisseur, client, dates, résumé, points clés) : soit ",
      pCode2: "ANTHROPIC_API_KEY",
      p3: " (Claude), soit un serveur Ollama (Qwen) configuré via ",
      pCode3: "AI_SERVER_URL",
      p4: " et ",
      pCode4: "AI_MODEL",
      p5: ".",
    },
    cmdSummaryTitle: "Résumé des commandes (installer le module et toutes les dépendances)",
    cmdSummaryCode: `# 1. Dépendances Node et base PostgreSQL
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy

# 2. Analyse IA — au choix :
# Option A : Claude (définir ANTHROPIC_API_KEY dans .env)
# Option B : Ollama (local ou VPS)
ollama serve
ollama pull qwen3:8b

# 3. Lancer l'app
npm run dev

# 4. Ouvrir le module Documents
# http://localhost:3000/modules/documents`,
    cmdSummaryAfterHtml: {
      p1: "Définir ",
      pCode1: "DATABASE_URL",
      p2: " dans ",
      pCode2: ".env",
      p3: ". Pour l'analyse IA : ",
      pCode3: "ANTHROPIC_API_KEY",
      p4: " (Claude) ou ",
      pCode4: "AI_SERVER_URL",
      p5: " + ",
      pCode5: "AI_MODEL",
      p6: " (Ollama). Sans IA, l'upload fonctionne mais l'analyse restera en attente ou erreur.",
    },
    aiTitle: "Analyse IA : Claude ou Ollama",
    aiHtml: {
      p1: "Par défaut, l'analyse utilise ",
      pStrong1: "Claude",
      p2: " (Anthropic) si ",
      pCode1: "ANTHROPIC_API_KEY",
      p3: " est défini. Sinon, fallback sur ",
      pStrong2: "Ollama",
      p4: " (Qwen). Pour utiliser uniquement Ollama, ne pas définir ",
      pCode2: "ANTHROPIC_API_KEY",
      p5: " et lancer Ollama :",
    },
    aiCode: `# Option A — Claude (Anthropic)
# Dans .env : ANTHROPIC_API_KEY=sk-...

# Option B — Ollama (local / VPS)
ollama serve
ollama pull qwen3:8b
# .env : AI_SERVER_URL=http://localhost:11434, AI_MODEL=qwen3:8b`,
    storageTitle: "Où sont sauvegardés les documents",
    storageHtml: {
      pStrong1: "Base de données",
      p1: " : table ",
      pCode1: "Document",
      p2: " (id, filename, mimeType, filePath, uploadedById, analysisStatus, supplier, client, contractDate, terminationDate, summary, keyPoints, commitments, rawText, createdAt). ",
      pStrong2: "Fichiers",
      p3: " : ",
      pCode2: "uploads/[userId]/[docId].pdf",
      p4: ". S'assurer que le répertoire ",
      pCode3: "uploads/",
      p5: " est accessible en écriture.",
    },
    loadTitle: "Comment charger et utiliser le module",
    loadHtml: {
      pStrong1: "Charger",
      p1: " : le module est intégré à l'app ; après ",
      pCode1: "npm install",
      p2: " et ",
      pCode2: "prisma migrate deploy",
      p3: ", il est disponible. Aucun import ou script supplémentaire. ",
      pStrong2: "Utiliser",
      p4: " : depuis l'interface, ouvrez ",
      pCode3: "/modules/documents",
      p5: " pour uploader des PDF et consulter la liste ; depuis du code, appelez ",
      pCode4: "POST /api/documents",
      p6: " (FormData avec ",
      pCode5: "file",
      p7: ") pour uploader, ",
      pCode6: "GET /api/documents",
      p8: " pour lister. Le module Documents est enregistré dans le registry de l'assistant IA : en cochant « Documents » dans le panneau de contexte, les métadonnées des documents sont injectées dans le contexte des conversations.",
    },
    envTitle: "Variables d'environnement et paramétrage",
    envLi: {
      databaseUrlStrong: "DATABASE_URL",
      databaseUrl: " — Connexion PostgreSQL (obligatoire).",
      anthropicStrong: "ANTHROPIC_API_KEY",
      anthropic:
        " — Clé API Anthropic pour l'analyse via Claude (optionnel ; si absent, fallback Ollama).",
      aiServerStrong: "AI_SERVER_URL",
      aiServerStrong2: "AI_MODEL",
      aiServer: " — Serveur Ollama pour l'analyse (ex. ",
      aiServerCode1: "http://localhost:11434",
      aiServer2: ", ",
      aiServerCode2: "qwen3:8b",
      aiServer3: ").",
      formatsStrong: "Formats acceptés",
      formats: " : PDF uniquement (côté API actuel).",
      maxSizeStrong: "Taille max",
      maxSize: " : dépend du serveur (proxy). En cas d'erreur 413, augmenter ",
      maxSizeCode1: "client_max_body_size",
      maxSize2: " (nginx) ou la limite côté Next.js si configurée.",
    },
    dbProdHtml: {
      pStrong: "Base de données et prérequis production",
      p1: " : table ",
      pCode1: "Document",
      p2: ", variables d'environnement et déploiement détaillés dans ",
      pCode2: "docs/DATABASE.md",
      p3: " du dépôt.",
    },
    apiTitle: "API (résumé)",
    apiLi: {
      list: " — Liste des documents de l'utilisateur.",
      upload:
        " — Upload d'un PDF. FormData : ",
      uploadCode: "file",
      upload2: ". Réponse : document créé (analyse lancée en synchrone).",
      detail: " — Détail d'un document.",
      delete: " — Supprimer un document (et le fichier si implémenté).",
    },
    backToAnalysis: "← Retour à l'Analyse de documents",
  },

  // Composant partagé DocumentAnalysisImport
  import: {
    dropTitle: "Glissez-déposez vos fichiers ici",
    or: "ou",
    browse: "Parcourir les fichiers",
    browseAria: "Parcourir les fichiers",
    analyzeAria: "Analyser les documents",
    selectAtLeastOne: "Sélectionnez au moins un fichier pour continuer",
    analyzing: "Analyse en cours...",
  },
};

const en: typeof fr = {
  list: {
    importTitle: "Document analysis",
    importDescription:
      "Upload PDF documents (analyses, studies, reports) to automatically generate an actionable summary with Claude. Analyses are stored in the database and can be reused in other tabs.",
    dropLabel:
      "Drag and drop or click to select PDF files (up to 10 files)",
    analyzeButton: "Analyze documents",
    analyzing: "Analyzing...",
    documentsHeading: "Documents",
    searchPlaceholder: "Search...",
    loading: "Loading documents...",
    emptyText: "No documents analyzed yet.",
    emptyCta: "Analyze a document →",
    onlyPdf: "Only PDF files are accepted.",
    fileTooLarge:
      "File too large (default limit 1 MB). Check the server configuration.",
    statusDone: "✓",
    statusError: "✗ Error",
    statusProcessing: "⏳ Analyzing...",
    statusPending: "⏳ Pending",
    columns: {
      filename: "File",
      supplier: "Supplier",
      client: "Client",
      contractDate: "Contract date",
      terminationDate: "Termination",
      analysisStatus: "Status",
    },
    backToModules: "← Back to modules",
    analyzeNav: "Analyze a document",
    documentationNav: "Documentation",
  },

  detail: {
    loading: "Loading...",
    notFoundTitle: "Document not found",
    backToList: "Back to list",
    statusDone: "✓",
    statusError: "✗ Error",
    statusProcessing: "⏳ Analyzing",
    statusPending: "⏳ Pending",
    deleteButton: "Delete",
    deleteConfirm: "Delete this document?",
    analyzing: "AI analysis in progress...",
    analysisFailed:
      "The analysis failed. You can delete the document or try again later.",
    supplier: "Supplier",
    client: "Client",
    contractDate: "Contract date",
    signatureDate: "Signature date",
    terminationDate: "Termination date",
    summary: "Summary",
    keyPoints: "Key points",
    commitments: "Commitments",
    backToAnalysis: "← Back to Document analysis",
    analyzeNav: "Analyze a document",
    documentationNav: "Documentation",
  },

  doc: {
    bcModules: "Modules",
    bcAnalysis: "Document analysis",
    bcDocumentation: "Documentation",
    title: "Documentation — Document analysis",
    description:
      "Upload, analysis and management of PDF documents. Metadata and analysis status. Integration with the AI module (assistant context).",
    introHtml: {
      lead1: "The Blueprint Modular modules (Auth, Wiki, AI, Documents, etc.) are part of the ",
      leadStrong1: "Next.js application",
      lead2: ". There is no separate package per module (no ",
      leadCode1: "pip install blueprint-modular-documents",
      lead3: " or ",
      leadCode2: "npm install blueprint-modular-documents",
      lead4:
        "): you install the application once, then configure the environment variables and services (PostgreSQL database, Ollama or Anthropic for AI) depending on the modules used. This documentation describes ",
      leadStrong2: "how to install",
      lead5:
        " the Document analysis module and all its dependencies (Node, Prisma, PDF extraction, AI server), ",
      leadStrong3: "how it works",
      lead6: ", ",
      leadStrong4: "how to configure it",
      lead7:
        " (environment variables, formats, max size) and how to use it (interface or API).",
    },
    howTitle: "How the Document analysis module works",
    howHtml: {
      p1: "The module lets you ",
      p1Strong1: "upload",
      p2: " ",
      p2Strong: "PDF",
      p3: " documents and ",
      p3Strong: "automatically analyze",
      p4: " them with AI to extract supplier, client, dates (contract, signature, due date), summary, key points and commitments. The result is stored in the database (table ",
      pCode1: "Document",
      p5: "); the file is saved to disk under ",
      pCode2: "uploads/[userId]/[docId].pdf",
      p6: ". The analysis runs right after upload (synchronously): text extraction (pdf-parse), then a call to the model (Claude if ",
      pCode3: "ANTHROPIC_API_KEY",
      p7:
        " is set, otherwise Ollama / Qwen). The Documents module is registered in the AI assistant registry: document metadata can be injected into the context of conversations.",
    },
    statusLiStrong: "Status",
    statusLi:
      ": pending → processing → done (or error). The list refreshes while a document is being processed.",
    alertLiStrong: "Due-date alerts",
    alertLi:
      ": the UI displays documents whose termination date falls within the next 30 days.",
    installTitle: "Installation and dependencies",
    installHtml: {
      p1: "The module is part of the Next.js application. Node dependencies included in the project: ",
      pCode1: "pdf-parse",
      p2: " for PDF text extraction. For AI analysis (extracting supplier, client, dates, summary, key points): either ",
      pCode2: "ANTHROPIC_API_KEY",
      p3: " (Claude), or an Ollama server (Qwen) configured via ",
      pCode3: "AI_SERVER_URL",
      p4: " and ",
      pCode4: "AI_MODEL",
      p5: ".",
    },
    cmdSummaryTitle: "Command summary (install the module and all dependencies)",
    cmdSummaryCode: `# 1. Node dependencies and PostgreSQL database
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy

# 2. AI analysis — choose one:
# Option A: Claude (set ANTHROPIC_API_KEY in .env)
# Option B: Ollama (local or VPS)
ollama serve
ollama pull qwen3:8b

# 3. Start the app
npm run dev

# 4. Open the Documents module
# http://localhost:3000/modules/documents`,
    cmdSummaryAfterHtml: {
      p1: "Set ",
      pCode1: "DATABASE_URL",
      p2: " in ",
      pCode2: ".env",
      p3: ". For AI analysis: ",
      pCode3: "ANTHROPIC_API_KEY",
      p4: " (Claude) or ",
      pCode4: "AI_SERVER_URL",
      p5: " + ",
      pCode5: "AI_MODEL",
      p6: " (Ollama). Without AI, upload works but analysis will stay pending or error out.",
    },
    aiTitle: "AI analysis: Claude or Ollama",
    aiHtml: {
      p1: "By default, the analysis uses ",
      pStrong1: "Claude",
      p2: " (Anthropic) if ",
      pCode1: "ANTHROPIC_API_KEY",
      p3: " is set. Otherwise, it falls back to ",
      pStrong2: "Ollama",
      p4: " (Qwen). To use only Ollama, do not set ",
      pCode2: "ANTHROPIC_API_KEY",
      p5: " and start Ollama:",
    },
    aiCode: `# Option A — Claude (Anthropic)
# In .env: ANTHROPIC_API_KEY=sk-...

# Option B — Ollama (local / VPS)
ollama serve
ollama pull qwen3:8b
# .env: AI_SERVER_URL=http://localhost:11434, AI_MODEL=qwen3:8b`,
    storageTitle: "Where documents are saved",
    storageHtml: {
      pStrong1: "Database",
      p1: ": table ",
      pCode1: "Document",
      p2: " (id, filename, mimeType, filePath, uploadedById, analysisStatus, supplier, client, contractDate, terminationDate, summary, keyPoints, commitments, rawText, createdAt). ",
      pStrong2: "Files",
      p3: ": ",
      pCode2: "uploads/[userId]/[docId].pdf",
      p4: ". Make sure the ",
      pCode3: "uploads/",
      p5: " directory is writable.",
    },
    loadTitle: "How to load and use the module",
    loadHtml: {
      pStrong1: "Load",
      p1: ": the module is integrated into the app; after ",
      pCode1: "npm install",
      p2: " and ",
      pCode2: "prisma migrate deploy",
      p3: ", it is available. No additional import or script. ",
      pStrong2: "Use",
      p4: ": from the interface, open ",
      pCode3: "/modules/documents",
      p5: " to upload PDFs and browse the list; from code, call ",
      pCode4: "POST /api/documents",
      p6: " (FormData with ",
      pCode5: "file",
      p7: ") to upload, ",
      pCode6: "GET /api/documents",
      p8: " to list. The Documents module is registered in the AI assistant registry: by checking “Documents” in the context panel, document metadata is injected into the context of conversations.",
    },
    envTitle: "Environment variables and configuration",
    envLi: {
      databaseUrlStrong: "DATABASE_URL",
      databaseUrl: " — PostgreSQL connection (required).",
      anthropicStrong: "ANTHROPIC_API_KEY",
      anthropic:
        " — Anthropic API key for analysis via Claude (optional; if absent, falls back to Ollama).",
      aiServerStrong: "AI_SERVER_URL",
      aiServerStrong2: "AI_MODEL",
      aiServer: " — Ollama server for analysis (e.g. ",
      aiServerCode1: "http://localhost:11434",
      aiServer2: ", ",
      aiServerCode2: "qwen3:8b",
      aiServer3: ").",
      formatsStrong: "Accepted formats",
      formats: " : PDF only (current API).",
      maxSizeStrong: "Max size",
      maxSize: " : depends on the server (proxy). On a 413 error, increase ",
      maxSizeCode1: "client_max_body_size",
      maxSize2: " (nginx) or the Next.js limit if configured.",
    },
    dbProdHtml: {
      pStrong: "Database and production prerequisites",
      p1: " : table ",
      pCode1: "Document",
      p2: ", environment variables and deployment detailed in ",
      pCode2: "docs/DATABASE.md",
      p3: " of the repository.",
    },
    apiTitle: "API (summary)",
    apiLi: {
      list: " — List of the user's documents.",
      upload:
        " — Upload a PDF. FormData: ",
      uploadCode: "file",
      upload2: ". Response: created document (analysis launched synchronously).",
      detail: " — Details of a document.",
      delete: " — Delete a document (and the file if implemented).",
    },
    backToAnalysis: "← Back to Document analysis",
  },

  import: {
    dropTitle: "Drag and drop your files here",
    or: "or",
    browse: "Browse files",
    browseAria: "Browse files",
    analyzeAria: "Analyze documents",
    selectAtLeastOne: "Select at least one file to continue",
    analyzing: "Analyzing...",
  },
};

export const STR = { fr, en } as const;

/** Renvoie le bloc de chaînes correspondant à la locale. */
export function strings(locale: Locale) {
  return STR[locale];
}

/** Locale BCP-47 pour le formatage des dates. */
export function dateLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "fr-FR";
}

/** Formate une date selon la locale (ou « — » si absente). */
export function fmtDate(dateStr: string | null | undefined, locale: Locale): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(dateLocale(locale));
}

/** Libellé d'upload « Envoyé le … » / « Uploaded on … ». */
export function uploadedOn(dateStr: string, locale: Locale): string {
  const d = new Date(dateStr).toLocaleDateString(dateLocale(locale));
  return locale === "en" ? `Uploaded on ${d}` : `Envoyé le ${d}`;
}

/** Suffixe « (J-X) » / « (D-X) » pour les échéances dans le tableau. */
export function dueSuffix(days: number, locale: Locale): string {
  return locale === "en" ? `(D-${days})` : `(J-${days})`;
}

/** Bannière d'alerte d'échéance (pluriel géré). */
export function alertBanner(
  count: number,
  details: string,
  locale: Locale
): string {
  if (locale === "en") {
    const s = count > 1 ? "s" : "";
    return `${count} contract${s} to terminate within the next 30 days: ${details}`;
  }
  const s = count > 1 ? "s" : "";
  return `${count} contrat${s} à dénoncer dans les 30 prochains jours : ${details}`;
}

/** Compteur « N fichier(s) sélectionné(s) » du composant d'import. */
export function selectedFilesLabel(count: number, locale: Locale): string {
  if (locale === "en") {
    return `${count} file${count > 1 ? "s" : ""} selected`;
  }
  const s = count > 1 ? "s" : "";
  return `${count} fichier${s} sélectionné${s}`;
}

/** Sous-titre « Jusqu'à N fichiers… » / « Up to N files… ». */
export function upToFilesLabel(maxFiles: number, locale: Locale): string {
  return locale === "en"
    ? `Up to ${maxFiles} files at once`
    : `Jusqu'à ${maxFiles} fichiers simultanément`;
}

/** Message d'erreur d'upload générique avec code HTTP. */
export function uploadError(status: number, locale: Locale): string {
  return locale === "en" ? `Upload error (${status})` : `Erreur upload (${status})`;
}
