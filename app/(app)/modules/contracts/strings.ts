/**
 * Chaînes d'interface (chrome) du module Base contractuelle / Contract repository.
 *
 * Seul le "chrome" est traduit : le contenu des contrats provient de l'API
 * /api/contracts (données utilisateur) et n'est jamais traduit ici.
 *
 * Parité FR/EN garantie par le typage : `fr` est la source de vérité, `en` est
 * typé `ContractsStrings` (toute clé manquante ou en trop est une erreur de compilation).
 *
 * Usage :
 *   import { useI18n } from "@/lib/i18n/LocaleProvider";
 *   import { STR } from "../strings";
 *   const { locale } = useI18n();
 *   const t = STR[locale];
 *   t.page.title
 *   t.fn.filesSelected(3)
 */

import type { Locale } from "@/lib/i18n";

const fr = {
  page: {
    breadcrumbModules: "Modules",
    title: "Base contractuelle",
    description:
      "Analysez vos contrats fournisseurs avec l'IA pour identifier les risques et dates clés.",
    importButton: "Importer",
    importButtonAria: "Importer un contrat",
  },
  stats: {
    overviewAria: "Vue d'ensemble",
    total: "Contrat(s)",
    analyzed: "Analysé(s)",
    pending: "En attente",
    highRisk: "Alertes risque",
  },
  toolbar: {
    searchPlaceholder: "Rechercher un contrat, fournisseur…",
    searchAria: "Rechercher dans les contrats",
    typePlaceholder: "Type",
    statusPlaceholder: "Statut",
    reset: "Réinitialiser",
    resetAria: "Réinitialiser les filtres",
  },
  filters: {
    allWorkspaces: "Tous les workspaces",
    allTypes: "Tous les types",
    allStatuses: "Tous les statuts",
  },
  types: {
    prestation: "Prestation de service",
    licence: "Licence / SaaS",
    cgv: "CGV / CGU",
    nda: "NDA / Confidentialité",
    bail: "Bail / Location",
    partenariat: "Partenariat",
    emploi: "Contrat d'emploi",
    achat: "Achat / Fournisseur",
    other: "Autre",
  },
  table: {
    filename: "Nom du fichier",
    supplier: "Fournisseur",
    object: "Objet du contrat",
    type: "Type",
    contractDate: "Date contrat",
    endDate: "Date de fin",
    risk: "Risque",
    status: "Statut",
    empty: "Aucune donnée disponible",
    notProvided: "Non renseigné",
    rerun: "Relancer",
  },
  risk: {
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
  },
  status: {
    pending: "En attente",
    analyzing: "Analyse en cours…",
    done: "Analysé",
    error: "Erreur d'analyse",
  },
  empty: {
    noContractsTitle: "Aucun contrat importé",
    noContractsDesc:
      "Glissez vos fichiers PDF, DOCX ou TXT directement ici, ou cliquez sur « Importer ».",
    importFirst: "Importer un premier contrat",
    importFirstAria: "Importer un premier contrat",
    noResultsTitle: "Aucun résultat",
  },
  dropOverlay: {
    aria: "Zone de dépôt active",
    title: "Déposez vos fichiers",
    sub: "PDF, DOCX ou TXT — jusqu'à 10 fichiers",
  },
  importModal: {
    title: "Importer des contrats",
    close: "Fermer",
    dropzoneTitle: "Glissez-déposez vos fichiers ici",
    dropzoneSub: "ou",
    chooseFiles: "Choisir des fichiers",
    formatPdf: "PDF",
    formatDocx: "DOCX",
    formatTxt: "TXT",
    maxFiles: "Max 10 fichiers",
    cancel: "Annuler",
    analyzing: "Analyse en cours...",
    analyzeButton: "Analyser les documents",
    noFileAria: "Sélectionnez au moins un fichier pour continuer",
    analyzeAria: "Analyser les documents",
  },
  detail: {
    loading: "Chargement...",
    closeAria: "Fermer le détail",
    rerun: "Réanalyser",
    rerunAria: "Réanalyser ce contrat",
    edit: "Modifier",
    editAria: "Modifier ce contrat",
    deleteAria: "Supprimer ce contrat",
    summary: "Synthèse",
    signatoriesLabel: "Signataire(s) :",
    parties: "Parties",
    supplierLabel: "Fournisseur :",
    supplierPlaceholder: "Nom du fournisseur",
    buyerLabel: "Acheteur :",
    buyerPlaceholder: "Nom de l'acheteur",
    dates: "Dates",
    contractDateLabel: "Date contrat :",
    endDateLabel: "Date de fin :",
    terminationDateLabel: "Date de dénonciation :",
    contractTypeSection: "Type de contrat",
    selectType: "Sélectionner un type",
    risks: "Risques",
    actions: "Actions recommandées",
    analysisInProgress: "Analyse en cours...",
    noExtractedData:
      "Aucune donnée extraite. Lancez une ré-analyse si le contrat est déjà analysé.",
    rerunAnalysis: "Relancer l'analyse",
    cantLoadTitle: "Impossible de charger le détail",
    cantLoadDesc: "Une erreur s'est produite lors du chargement de l'analyse.",
    retry: "Réessayer",
    cancel: "Annuler",
    saving: "Enregistrement...",
    save: "Enregistrer",
  },
  mobile: {
    supplier: "Fournisseur:",
    date: "Date:",
    end: "Fin:",
    risk: "Risque:",
  },
  confirm: {
    title: "Supprimer ce contrat ?",
    confirmLabel: "Supprimer",
    cancelLabel: "Annuler",
  },
  toast: {
    reanalyzeStarted: "Réanalyse du contrat lancée",
    reanalyzeError: "Erreur lors de la réanalyse",
    deleteError: "Erreur lors de la suppression.",
    saveError: "Erreur lors de la sauvegarde.",
    fileTooLarge:
      "Fichier trop volumineux pour l'upload (limite du serveur). Réduisez la taille du fichier ou compressez le PDF.",
    unauthorized: "Non autorisé. Connectez-vous pour importer des contrats.",
  },
  detailPage: {
    notFoundTitle: "Contrat introuvable",
    notFoundDesc: "Ce contrat n'existe pas ou vous n'y avez pas accès.",
    statusLabel: "Statut :",
    riskPrefix: "Risque",
    rerunBusy: "Analyse en cours…",
    rerunAnalysis: "Relancer l'analyse",
    rerunBusyAria: "Analyse en cours, veuillez patienter",
    rerunAria: "Relancer l'analyse du contrat",
    askQuestion: "Poser une question",
    askQuestionAria: "Poser une question sur ce contrat à l'assistant IA",
    partiesAndSignatories: "Parties & signataires",
    supplierLabel: "Fournisseur :",
    buyerLabel: "Acheteur :",
    colName: "Nom",
    colRole: "Rôle",
    colDate: "Date",
    noSignatory: "Aucun signataire extrait",
    notExtracted: "Non extrait",
    datesTitle: "Dates",
    dateContract: "Contrat :",
    dateStart: "Début :",
    dateEnd: "Fin :",
    dateRenewal: "Renouvellement :",
    dateWaiver: "Délai renonciation :",
    terminationNotice: "Préavis résiliation :",
    noDateExtracted: "Aucune date extraite",
    commitments: "Engagements",
    colType: "Type",
    colDescription: "Description",
    colAmount: "Montant",
    colDeadline: "Échéance",
    colResponsible: "Responsable",
    noCommitmentExtracted: "Aucun engagement extrait",
    clauses: "Clauses",
    payment: "Paiement :",
    confidentiality: "Confidentialité :",
    exclusivity: "Exclusivité :",
    governingLaw: "Droit applicable :",
    disputeResolution: "Résolution litiges :",
    penalties: "Pénalités :",
    yes: "Oui",
    no: "Non",
    noClauseExtracted: "Aucune clause extraite",
    recommendedActions: "Actions recommandées",
    colAction: "Action",
    colOwner: "Responsable",
    noActionExtracted: "Aucune action extraite",
    summary: "Synthèse",
    noSummary:
      "Aucune synthèse disponible. Lancez une ré-analyse si le contrat est déjà analysé.",
    risks: "Risques",
    noRisk: "Aucun risque identifié",
    opportunities: "Opportunités",
    noOpportunity: "Aucune opportunité identifiée",
    contextTitle: "Contrat",
    contextAnalysisUnavailable: "Analyse non disponible.",
    contextSummary: "Résumé",
    contextSupplier: "Fournisseur",
    contextBuyer: "Acheteur",
    contextContractDate: "Date contrat",
    contextEndDate: "Date fin",
    contextRiskLevel: "Niveau de risque",
    contextRisks: "Risques",
    contextOpportunities: "Opportunités",
    contextPayment: "Paiement",
    fallbackTitle: "Contrat",
  },
  errorBoundary: {
    title: "Erreur lors du chargement",
    desc: "Impossible de charger les détails du contrat. Vérifiez votre connexion ou réessayez plus tard.",
    retry: "Réessayer",
    retryAria: "Réessayer de charger le contrat",
    backToList: "Retour à la liste",
    backToListAria: "Retour à la liste des contrats",
  },
  simulator: {
    title: "Simulateur Base contractuelle",
    intro:
      "Ouvrez un contrat en mode démo pour tester la page de détail et l'analyse IA.",
    loading: "Chargement…",
    availableTitle: "Contrats disponibles (démo)",
    viewContract: "Voir le contrat",
    onlyAnalyzed: "Seuls les contrats déjà analysés (statut « Analysé ») sont listés.",
    sandboxTitle: "Mode sandbox",
    sandboxDesc:
      "Aucun contrat analysé pour le moment. Uploadez un fichier depuis la Base contractuelle, lancez l'analyse, puis revenez ici pour ouvrir un contrat en démo.",
    goToRepository: "Aller à la Base contractuelle",
    backToRepository: "← Retour à la Base contractuelle",
    documentation: "Documentation",
  },
};

export type ContractsStrings = typeof fr;

const en: ContractsStrings = {
  page: {
    breadcrumbModules: "Modules",
    title: "Contract repository",
    description:
      "Analyze your supplier contracts with AI to surface risks and key dates.",
    importButton: "Import",
    importButtonAria: "Import a contract",
  },
  stats: {
    overviewAria: "Overview",
    total: "Contract(s)",
    analyzed: "Analyzed",
    pending: "Pending",
    highRisk: "Risk alerts",
  },
  toolbar: {
    searchPlaceholder: "Search a contract, supplier…",
    searchAria: "Search the contracts",
    typePlaceholder: "Type",
    statusPlaceholder: "Status",
    reset: "Reset",
    resetAria: "Reset filters",
  },
  filters: {
    allWorkspaces: "All workspaces",
    allTypes: "All types",
    allStatuses: "All statuses",
  },
  types: {
    prestation: "Service agreement",
    licence: "License / SaaS",
    cgv: "Terms & conditions",
    nda: "NDA / Confidentiality",
    bail: "Lease / Rental",
    partenariat: "Partnership",
    emploi: "Employment contract",
    achat: "Purchase / Supplier",
    other: "Other",
  },
  table: {
    filename: "File name",
    supplier: "Supplier",
    object: "Contract subject",
    type: "Type",
    contractDate: "Contract date",
    endDate: "End date",
    risk: "Risk",
    status: "Status",
    empty: "No data available",
    notProvided: "Not provided",
    rerun: "Re-run",
  },
  risk: {
    low: "Low",
    medium: "Medium",
    high: "High",
  },
  status: {
    pending: "Pending",
    analyzing: "Analyzing…",
    done: "Analyzed",
    error: "Analysis error",
  },
  empty: {
    noContractsTitle: "No contract imported",
    noContractsDesc:
      "Drop your PDF, DOCX or TXT files directly here, or click “Import”.",
    importFirst: "Import a first contract",
    importFirstAria: "Import a first contract",
    noResultsTitle: "No results",
  },
  dropOverlay: {
    aria: "Active drop zone",
    title: "Drop your files",
    sub: "PDF, DOCX or TXT — up to 10 files",
  },
  importModal: {
    title: "Import contracts",
    close: "Close",
    dropzoneTitle: "Drag and drop your files here",
    dropzoneSub: "or",
    chooseFiles: "Choose files",
    formatPdf: "PDF",
    formatDocx: "DOCX",
    formatTxt: "TXT",
    maxFiles: "Max 10 files",
    cancel: "Cancel",
    analyzing: "Analyzing...",
    analyzeButton: "Analyze documents",
    noFileAria: "Select at least one file to continue",
    analyzeAria: "Analyze documents",
  },
  detail: {
    loading: "Loading...",
    closeAria: "Close detail",
    rerun: "Re-analyze",
    rerunAria: "Re-analyze this contract",
    edit: "Edit",
    editAria: "Edit this contract",
    deleteAria: "Delete this contract",
    summary: "Summary",
    signatoriesLabel: "Signatory(ies):",
    parties: "Parties",
    supplierLabel: "Supplier:",
    supplierPlaceholder: "Supplier name",
    buyerLabel: "Buyer:",
    buyerPlaceholder: "Buyer name",
    dates: "Dates",
    contractDateLabel: "Contract date:",
    endDateLabel: "End date:",
    terminationDateLabel: "Termination date:",
    contractTypeSection: "Contract type",
    selectType: "Select a type",
    risks: "Risks",
    actions: "Action items",
    analysisInProgress: "Analysis in progress...",
    noExtractedData:
      "No data extracted. Re-run the analysis if the contract has already been analyzed.",
    rerunAnalysis: "Re-run analysis",
    cantLoadTitle: "Unable to load the detail",
    cantLoadDesc: "An error occurred while loading the analysis.",
    retry: "Retry",
    cancel: "Cancel",
    saving: "Saving...",
    save: "Save",
  },
  mobile: {
    supplier: "Supplier:",
    date: "Date:",
    end: "End:",
    risk: "Risk:",
  },
  confirm: {
    title: "Delete this contract?",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
  },
  toast: {
    reanalyzeStarted: "Contract re-analysis started",
    reanalyzeError: "Error during re-analysis",
    deleteError: "Error while deleting.",
    saveError: "Error while saving.",
    fileTooLarge:
      "File too large to upload (server limit). Reduce the file size or compress the PDF.",
    unauthorized: "Unauthorized. Sign in to import contracts.",
  },
  detailPage: {
    notFoundTitle: "Contract not found",
    notFoundDesc: "This contract does not exist or you do not have access to it.",
    statusLabel: "Status:",
    riskPrefix: "Risk",
    rerunBusy: "Analyzing…",
    rerunAnalysis: "Re-run analysis",
    rerunBusyAria: "Analysis in progress, please wait",
    rerunAria: "Re-run the contract analysis",
    askQuestion: "Ask a question",
    askQuestionAria: "Ask the AI assistant a question about this contract",
    partiesAndSignatories: "Parties & signatories",
    supplierLabel: "Supplier:",
    buyerLabel: "Buyer:",
    colName: "Name",
    colRole: "Role",
    colDate: "Date",
    noSignatory: "No signatory extracted",
    notExtracted: "Not extracted",
    datesTitle: "Dates",
    dateContract: "Contract:",
    dateStart: "Start:",
    dateEnd: "End:",
    dateRenewal: "Renewal:",
    dateWaiver: "Waiver deadline:",
    terminationNotice: "Termination notice:",
    noDateExtracted: "No date extracted",
    commitments: "Commitments",
    colType: "Type",
    colDescription: "Description",
    colAmount: "Amount",
    colDeadline: "Deadline",
    colResponsible: "Responsible",
    noCommitmentExtracted: "No commitment extracted",
    clauses: "Clauses",
    payment: "Payment:",
    confidentiality: "Confidentiality:",
    exclusivity: "Exclusivity:",
    governingLaw: "Governing law:",
    disputeResolution: "Dispute resolution:",
    penalties: "Penalties:",
    yes: "Yes",
    no: "No",
    noClauseExtracted: "No clause extracted",
    recommendedActions: "Action items",
    colAction: "Action",
    colOwner: "Owner",
    noActionExtracted: "No action extracted",
    summary: "Summary",
    noSummary:
      "No summary available. Re-run the analysis if the contract has already been analyzed.",
    risks: "Risks",
    noRisk: "No risk identified",
    opportunities: "Opportunities",
    noOpportunity: "No opportunity identified",
    contextTitle: "Contract",
    contextAnalysisUnavailable: "Analysis unavailable.",
    contextSummary: "Summary",
    contextSupplier: "Supplier",
    contextBuyer: "Buyer",
    contextContractDate: "Contract date",
    contextEndDate: "End date",
    contextRiskLevel: "Risk level",
    contextRisks: "Risks",
    contextOpportunities: "Opportunities",
    contextPayment: "Payment",
    fallbackTitle: "Contract",
  },
  errorBoundary: {
    title: "Error while loading",
    desc: "Unable to load the contract details. Check your connection or try again later.",
    retry: "Retry",
    retryAria: "Retry loading the contract",
    backToList: "Back to list",
    backToListAria: "Back to the contracts list",
  },
  simulator: {
    title: "Contract repository simulator",
    intro:
      "Open a contract in demo mode to test the detail page and the AI analysis.",
    loading: "Loading…",
    availableTitle: "Available contracts (demo)",
    viewContract: "View contract",
    onlyAnalyzed: "Only contracts already analyzed (“Analyzed” status) are listed.",
    sandboxTitle: "Sandbox mode",
    sandboxDesc:
      "No analyzed contract yet. Upload a file from the contract repository, run the analysis, then come back here to open a contract in demo mode.",
    goToRepository: "Go to the contract repository",
    backToRepository: "← Back to the contract repository",
    documentation: "Documentation",
  },
};

export const STR: Record<Locale, ContractsStrings> = { fr, en };

/** Date locale du navigateur selon la locale (fr-FR / en-US). Entrée non datée renvoyée telle quelle. */
function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Fonctions paramétrées (chrome dynamique). */
export const fn = {
  fr: {
    breadcrumbCurrent: () => "Base contractuelle",
    importToastSuccess: (name: string) =>
      `Contrat « ${name} » importé et en cours d'analyse`,
    deleteToastSuccess: (name: string) => `Contrat « ${name} » supprimé`,
    uploadError: (status: number) => `Erreur upload (${status})`,
    riskAria: (label: string) => `Risque : ${label}`,
    riskBadge: (label: string) => `Risque ${label}`,
    rerunRowAria: (filename: string) =>
      `Relancer l'analyse du contrat ${filename}`,
    viewDetailAria: (filename: string) => `Voir le détail de ${filename}`,
    removeFileAria: (filename: string) => `Retirer ${filename}`,
    filesSelected: (n: number) =>
      `${n} fichier${n > 1 ? "s" : ""} sélectionné${n > 1 ? "s" : ""}`,
    analyzingProgress: (label: string, progress: number) =>
      `${label} (${progress}%)`,
    noResultsBody: (query: string) =>
      `Aucun contrat ne correspond à « ${query} ». Modifiez la recherche ou les filtres.`,
    deleteConfirmMessage: (filename: string) =>
      `« ${filename} » sera définitivement supprimé. Cette action est irréversible.`,
    fileCount: (n: number) => ` (${n})`,
    terminationNoticeDays: (days: number) => `${days} jours`,
    amountWithCurrency: (amount: number, currency: string) =>
      `${amount} ${currency}`.trim(),
    deadlineSuffix: (deadline: string) => ` (Échéance: ${deadline})`,
    ownerSuffix: (owner: string) => ` - Responsable: ${owner}`,
    prevContractAria: (filename: string) => `Contrat précédent : ${filename}`,
    nextContractAria: (filename: string) => `Contrat suivant : ${filename}`,
    formatDate: (value: string | null | undefined) => formatDate(value, "fr"),
  },
  en: {
    breadcrumbCurrent: () => "Contract repository",
    importToastSuccess: (name: string) =>
      `Contract “${name}” imported and being analyzed`,
    deleteToastSuccess: (name: string) => `Contract “${name}” deleted`,
    uploadError: (status: number) => `Upload error (${status})`,
    riskAria: (label: string) => `Risk: ${label}`,
    riskBadge: (label: string) => `${label} risk`,
    rerunRowAria: (filename: string) =>
      `Re-run the analysis of contract ${filename}`,
    viewDetailAria: (filename: string) => `View details of ${filename}`,
    removeFileAria: (filename: string) => `Remove ${filename}`,
    filesSelected: (n: number) => `${n} file${n > 1 ? "s" : ""} selected`,
    analyzingProgress: (label: string, progress: number) =>
      `${label} (${progress}%)`,
    noResultsBody: (query: string) =>
      `No contract matches “${query}”. Adjust your search or filters.`,
    deleteConfirmMessage: (filename: string) =>
      `“${filename}” will be permanently deleted. This action cannot be undone.`,
    fileCount: (n: number) => ` (${n})`,
    terminationNoticeDays: (days: number) => `${days} days`,
    amountWithCurrency: (amount: number, currency: string) =>
      `${amount} ${currency}`.trim(),
    deadlineSuffix: (deadline: string) => ` (Deadline: ${deadline})`,
    ownerSuffix: (owner: string) => ` - Owner: ${owner}`,
    prevContractAria: (filename: string) => `Previous contract: ${filename}`,
    nextContractAria: (filename: string) => `Next contract: ${filename}`,
    formatDate: (value: string | null | undefined) => formatDate(value, "en"),
  },
};

/** Label localisé pour un type de contrat (valeurs techniques inchangées). */
export function typeLabel(t: ContractsStrings, key: string): string {
  const map: Record<string, keyof ContractsStrings["types"]> = {
    prestation: "prestation",
    licence: "licence",
    cgv: "cgv",
    nda: "nda",
    bail: "bail",
    partenariat: "partenariat",
    emploi: "emploi",
    achat: "achat",
    other: "other",
    // Valeurs techniques héritées de l'API (lib/contracts/labels)
    supplier: "achat",
  };
  const k = map[key];
  return k ? t.types[k] : key;
}

/** Label localisé pour un niveau de risque (valeurs techniques inchangées). */
export function riskLabel(t: ContractsStrings, key: string): string {
  if (key === "low") return t.risk.low;
  if (key === "medium") return t.risk.medium;
  if (key === "high") return t.risk.high;
  return key;
}

/** Label localisé pour un statut d'analyse (valeurs techniques inchangées). */
export function statusLabel(t: ContractsStrings, key: string): string {
  if (key === "pending") return t.status.pending;
  if (key === "analyzing") return t.status.analyzing;
  if (key === "done") return t.status.done;
  if (key === "error") return t.status.error;
  return key;
}
