// Chaînes bilingues (fr / en) du module Wiki.
// Mécanisme : useI18n() fournit `locale` ("fr" | "en").
// La parité fr/en est garantie par le type `const en: typeof fr`.
// Organisation par section de page : common, list, article, edit, history,
// new, search, tags, doc, sandbox.

const fr = {
  common: {
    modules: "Modules",
    wiki: "Wiki",
    loading: "Chargement...",
    loadingEllipsis: "Chargement…",
    backToWiki: "← Retour au Wiki",
    backToWikiPlain: "Retour au Wiki",
    backToArticle: "← Retour à l'article",
    backToArticlePlain: "Retour à l'article",
    error: "Erreur",
    cancel: "Annuler",
    save: "Sauvegarder",
    saving: "Enregistrement...",
    edit: "Modifier",
    delete: "Supprimer",
    published: "Publié",
    draft: "Brouillon",
    pinned: "Épinglé",
    tags: "Tags",
    search: "Recherche",
    documentation: "Documentation",
    createArticle: "Créer un article",
    confirmDeleteArticle: "Supprimer cet article ?",
    cannotDelete: "Impossible de supprimer",
    articleNotFound: "Article introuvable",
    articleNotFoundDot: "Article introuvable.",
    minutesShort: (n: number) => `${n} min`,
    locale: "fr-FR",
    localeSort: "fr",
  },
  list: {
    description:
      "Wiki interne : articles en Markdown, arborescence, brouillons et publication. Idéal pour la doc d'équipe.",
    moduleBadge: "Module",
    articles: "Articles",
    newArticle: "+ Nouvel article",
    searchPlaceholder: "Rechercher (titre, contenu, tags)...",
    statusLabel: "Statut :",
    statusAll: "Tous",
    statusPublished: "Publié",
    statusDraft: "Brouillon",
    sortLabel: "Tri :",
    sortUpdatedAt: "Date MàJ",
    sortCreatedAt: "Date création",
    sortTitle: "Titre A-Z",
    sortViewCount: "Vues",
    sortDesc: "Desc",
    sortAsc: "Asc",
    tagLabel: "Tag :",
    tagAll: "Tous",
    emptyWiki: "Votre wiki est vide.",
    createFirstArticle: "Créer le premier article",
    noResultsForFilters: "Aucun article pour ces filtres.",
    clearFilters: "Effacer les filtres",
    allArticles: "📁 Tous les articles",
    noArticleInSection: "Aucun article dans cette section.",
    selectedCount: (n: number) => `${n} article${n > 1 ? "s" : ""} sélectionné${n > 1 ? "s" : ""}`,
    exportZip: "Exporter en ZIP",
    deselectAll: "Tout désélectionner",
    selectAll: "Tout sélectionner",
    perPageSuffix: "(cette page)",
    updatedOn: (date: string) => `Mis à jour le ${date}`,
    viewCount: (n: number) => `${n} vue${n > 1 ? "s" : ""}`,
    sectionLabel: (title: string, count: number) => `Section ${title}, ${count} article(s)`,
    openArticleLabel: (title: string) => `Ouvrir l'article ${title}`,
    createSubArticle: "Créer un sous-article",
    selectArticleLabel: (title: string) => `Sélectionner ${title}`,
  },
  article: {
    readOnly: "Lecture seule",
    askAi: "Demander à l'IA",
    history: "Historique",
    copyLink: "Copier le lien",
    viewHistory: "Voir l'historique",
    exportMarkdown: "Exporter en Markdown (.md)",
    exportPdf: "Exporter en PDF (impression)",
    editLockedTitle:
      "Modifications enregistrées localement (connectez-vous pour sauvegarder en base)",
    updatedOn: (date: string) => `Mis à jour le ${date}`,
    wordCount: (n: number) => `${n} mots`,
    viewCount: (n: number) => `${n} vue${n > 1 ? "s" : ""}`,
    inThisSection: "Dans cette section",
    relatedArticles: "Articles liés",
    relatedArticlesDesc: "Articles qui citent celui-ci.",
    prevArticle: "← Article précédent",
    nextArticle: "Article suivant →",
    prevNextNavLabel: "Navigation précédent / suivant",
    comments: "Commentaires",
    anonymous: "Anonyme",
    addCommentPlaceholder: "Ajouter un commentaire...",
    sending: "Envoi…",
    publish: "Publier",
    toc: "Sommaire",
    noContent: "*Aucun contenu.*",
    aiContext: (title: string, content: string) =>
      `Tu es en train de consulter l'article "${title}" du wiki. Voici son contenu complet :\n\n${content}\n\nRéponds aux questions de l'utilisateur sur cet article ou sur les sujets qu'il aborde.`,
  },
  edit: {
    title: "Modifier l'article",
    unsavedChange: "Modification non sauvegardée",
    savedAt: (time: string) => `Sauvegardé à ${time}`,
    draftSavedAt: (time: string) => `Brouillon sauvegardé à ${time}`,
    viewModeLabel: "Mode d'affichage",
    editor: "Éditeur",
    split: "Split",
    preview: "Aperçu",
    localArticleNotice: "Vous modifiez un article local (non synchronisé).",
    saveToDb: "Sauvegarder en base",
    savingToDb: "Enregistrement…",
    saveToDbLabel: "Sauvegarder cet article en base de données",
    localSaved: "Article sauvegardé localement.",
    labelTitle: "Titre",
    labelPublished: "Publié",
    labelPin: "Épingler cet article",
    labelTemplate: "Template",
    applyTemplate: "Appliquer le template",
    labelCover: "Image de couverture (URL)",
    labelExcerpt: "Résumé (excerpt)",
    excerptPlaceholder: "2-3 lignes optionnel",
    labelTags: "Tags (séparés par Entrée)",
    tagPlaceholder: "Ajouter un tag...",
    removeTag: "Retirer",
    labelChangeNote: "Note de changement (historique)",
    changeNotePlaceholder: "Optionnel : décrire les modifications",
    aiHelp: "Aide IA",
    aiHelpIntro: "Utiliser l'IA pour rédiger ou mettre en forme le contenu de l'article.",
    aiGenerating: "Génération…",
    aiFormatCurrent: "Mettre en forme le contenu actuel",
    aiGenerateFromNotes: "Générer un article depuis des notes",
    aiNotesPlaceholder: "Collez ici vos notes brutes…",
    typeLabel: "Type",
    typeGuide: "Guide",
    typeProcedure: "Procédure",
    typeBestPractice: "Bonnes pratiques",
    typeReference: "Référence",
    workspaceLabel: "Workspace",
    workspaceService1: "Service 1",
    workspaceService2: "Service 2",
    workspaceShared: "Partagé",
    aiGenerateArticle: "Générer l'article",
    saving: "Enregistrement...",
    errorSaving: "Erreur lors de la sauvegarde",
    errorCannotSave: "Impossible de sauvegarder",
    errorCannotSaveGuest: "Impossible de sauvegarder (article invité)",
    errorCannotSaveDb: "Impossible de sauvegarder en base",
    readOnlyGuest: "Article en lecture seule en mode invité (article de base).",
    apiError: "Erreur API",
    aiError: "Erreur IA",
    noStream: "Pas de flux",
    genError: "Erreur lors de la génération",
    genericError: "Erreur",
  },
  history: {
    title: "Historique des révisions",
    intro: "Cliquez sur une révision pour afficher son contenu. Les 50 dernières révisions sont conservées.",
    revisionsPanel: "Révisions (plus récente en haut)",
    view: "Voir",
    restore: "Restaurer",
    compare: "Comparer",
    deselect: "Désélectionner",
    noRevision: "Aucune révision enregistrée.",
    revisionOf: (date: string) => `Révision du ${date}`,
    diffVsPrevious: "Diff vs version précédente",
    restoreThisVersion: "Restaurer cette version",
    comparisonTitle: "Comparaison : Version A (ancienne) vs Version B (récente)",
    comparisonMeta: (a: string, b: string) => `Version A : ${a} · Version B : ${b}`,
    restoreDialogTitle: "Restaurer cette version ?",
    restoreDialogBody:
      "Le contenu actuel de l'article sera remplacé par cette révision. Vous pourrez modifier la note de changement ci-dessous.",
    restoreNoteLabel: "Note de changement (optionnel)",
    restoreNotePlaceholder: "Ex : Restauration de la version du …",
    restoring: "Restauration…",
    errLogin: "Connectez-vous pour voir l'historique.",
    errLoad: "Impossible de charger l'historique.",
    errRestoreVersion: "Impossible de restaurer cette version.",
    errRestore: "Impossible de restaurer.",
  },
  new: {
    title: "Nouvel article",
    generateFromVoice: "✦ Générer depuis une note vocale",
    typeLabel: "Type",
    typeProcedure: "Procédure",
    typeGuide: "Guide",
    typeBestPractice: "Bonne pratique",
    typeReference: "Référence",
    workspaceLabel: "Workspace",
    workspaceService1: "Service 1",
    workspaceService2: "Service 2",
    workspaceShared: "Partagé",
    dictateArticle: "Dicter l'article",
    generatingQwen: "✦ Génération Qwen3…",
    voiceHint:
      "Décrivez oralement votre procédure ou guide → Whisper transcrit → Qwen3 structure l'article.",
    labelTitle: "Titre",
    labelSlug: "Slug (auto-généré)",
    slugPlaceholder: "generé-du-titre",
    labelParent: "Parent",
    parentNone: "Aucun (racine)",
    labelPublished: "Publié",
    labelPin: "Épingler cet article",
    labelExcerpt: "Résumé (excerpt)",
    excerptPlaceholder: "2-3 lignes optionnel",
    labelTags: "Tags (Entrée ou virgule pour ajouter)",
    tagPlaceholder: "Ajouter un tag...",
    removeTag: "Retirer",
    previewOn: "Prévisualisation : oui",
    previewOff: "Prévisualisation : non",
    contentPlaceholder: "Contenu Markdown...",
    guestAuthor: "Invité",
    generatingHeader: "# Génération en cours…\n\n",
    genErrorStatus: (status: number) => `Erreur génération ${status}`,
    genError: "Erreur génération",
    genericError: "Erreur",
  },
  search: {
    breadcrumb: "Recherche",
    title: "Recherche dans le Wiki",
    placeholder: "Rechercher (titre, contenu, tags)...",
    searching: "Recherche…",
    searchButton: "Rechercher",
    results: (n: number) => `Résultats (${n})`,
    noResultsTitle: "Aucun résultat",
    noResultsBody:
      "Aucun article ne correspond à votre recherche. Essayez d'autres termes ou consultez les suggestions ci-dessous.",
    semanticResults: "Résultats sémantiquement proches",
  },
  tags: {
    breadcrumb: "Tags",
    title: "Tags du Wiki",
    description:
      "Nuage de tags ou liste alphabétique avec nombre d'articles. Cliquez sur un tag pour filtrer la liste.",
    viewLabel: "Vue d'affichage",
    cloud: "Nuage",
    listAZ: "Liste A–Z",
    noTagTitle: "Aucun tag",
    noTagBody:
      "Aucun article n'a encore de tag. Ajoutez des tags lors de l'édition des articles.",
    cloudHeading: "Nuage de tags",
    cloudHint: "Cliquez sur un tag pour afficher les articles associés.",
    alphaHeading: "Liste alphabétique",
    articleCount: (n: number) => `${n} article${n > 1 ? "s" : ""}`,
  },
  doc: {
    breadcrumb: "Documentation",
    title: "Documentation — Wiki",
    description:
      "Wiki interne, arborescence d'articles, édition et Aide IA (mise en forme, génération depuis des notes). Le module IA peut s'appuyer sur le contenu des articles.",
    backToModule: "← Retour au module Wiki",
    externalDocLabel: "Documentation complète (externe) :",
  },
  sandbox: {
    breadcrumb: "Simulateur",
    sandboxNotice: "Bac à sable — Vos modifications ne sont pas sauvegardées.",
    reset: "Réinitialiser",
    resetLabel: "Réinitialiser le contenu",
    createFromContent: "Créer un article depuis ce contenu",
    createFromContentLabel: "Créer un article depuis ce contenu",
    title: "Simulateur — Éditeur Markdown",
    intro:
      "Éditeur en mode split-view : modifiez le Markdown à gauche, le rendu s'affiche à droite. Titres, listes, tableaux, code, callouts et liens sont supportés.",
    contentPlaceholder: "Contenu Markdown...",
    editAreaLabel: "Zone d'édition Markdown",
    footnote:
      "Ce contenu n'est pas enregistré en base. Utilisez « Créer un article depuis ce contenu » pour ouvrir la page de création d'article avec ce texte pré-rempli.",
    confirmReset: "Réinitialiser le contenu avec la démo par défaut ?",
    redirectText: "Redirection vers le Wiki…",
    redirectBody: "Vous allez être redirigé vers l'article Guide (mode démo).",
    initialContent: `# Titre de niveau 1

## Titre niveau 2

### Titre niveau 3

#### Titre niveau 4

Du **texte en gras**, de l'*italique*, du ~~barré~~ et du \`code inline\`.

> Blockquote : citation ou remarque importante avec bordure gauche colorée.

Liste à puces :
- Premier point
- Deuxième point
- Troisième point

Liste numérotée :
1. Étape un
2. Étape deux
3. Étape trois

Cases à cocher :
- [ ] Tâche non faite
- [x] Tâche faite

[Lien hypertexte](https://docs.blueprint-modular.com) vers la documentation.

---

## Bloc de code (JavaScript)

\`\`\`javascript
function hello(name) {
  return \`Bonjour, \${name} !\`;
}
console.log(hello("Wiki"));
\`\`\`

## Tableau Markdown

| Colonne A | Colonne B | Colonne C |
|-----------|-----------|-----------|
| Cellule 1 | Cellule 2 | Cellule 3 |
| Données   | Données   | Données   |

## Callouts

> **Info**
> Callout de type information.

> **Succès**
> Callout succès : opération réussie.

> **Avertissement**
> Callout avertissement : attention à ce point.

> **Danger**
> Callout danger : action irréversible.

> **Astuce**
> Callout astuce : conseil pratique.
`,
  },
};

const en: typeof fr = {
  common: {
    modules: "Modules",
    wiki: "Wiki",
    loading: "Loading...",
    loadingEllipsis: "Loading…",
    backToWiki: "← Back to Wiki",
    backToWikiPlain: "Back to Wiki",
    backToArticle: "← Back to article",
    backToArticlePlain: "Back to article",
    error: "Error",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    edit: "Edit",
    delete: "Delete",
    published: "Published",
    draft: "Draft",
    pinned: "Pinned",
    tags: "Tags",
    search: "Search",
    documentation: "Documentation",
    createArticle: "Create article",
    confirmDeleteArticle: "Delete this article?",
    cannotDelete: "Unable to delete",
    articleNotFound: "Article not found",
    articleNotFoundDot: "Article not found.",
    minutesShort: (n: number) => `${n} min`,
    locale: "en-US",
    localeSort: "en",
  },
  list: {
    description:
      "Internal wiki: Markdown articles, tree structure, drafts and publishing. Ideal for team documentation.",
    moduleBadge: "Module",
    articles: "Articles",
    newArticle: "+ New article",
    searchPlaceholder: "Search (title, content, tags)...",
    statusLabel: "Status:",
    statusAll: "All",
    statusPublished: "Published",
    statusDraft: "Draft",
    sortLabel: "Sort:",
    sortUpdatedAt: "Updated date",
    sortCreatedAt: "Created date",
    sortTitle: "Title A-Z",
    sortViewCount: "Views",
    sortDesc: "Desc",
    sortAsc: "Asc",
    tagLabel: "Tag:",
    tagAll: "All",
    emptyWiki: "Your wiki is empty.",
    createFirstArticle: "Create the first article",
    noResultsForFilters: "No articles for these filters.",
    clearFilters: "Clear filters",
    allArticles: "📁 All articles",
    noArticleInSection: "No articles in this section.",
    selectedCount: (n: number) => `${n} article${n > 1 ? "s" : ""} selected`,
    exportZip: "Export as ZIP",
    deselectAll: "Deselect all",
    selectAll: "Select all",
    perPageSuffix: "(this page)",
    updatedOn: (date: string) => `Updated on ${date}`,
    viewCount: (n: number) => `${n} view${n > 1 ? "s" : ""}`,
    sectionLabel: (title: string, count: number) => `Section ${title}, ${count} article(s)`,
    openArticleLabel: (title: string) => `Open article ${title}`,
    createSubArticle: "Create a sub-article",
    selectArticleLabel: (title: string) => `Select ${title}`,
  },
  article: {
    readOnly: "Read-only",
    askAi: "Ask AI",
    history: "History",
    copyLink: "Copy link",
    viewHistory: "View history",
    exportMarkdown: "Export as Markdown (.md)",
    exportPdf: "Export as PDF (print)",
    editLockedTitle:
      "Changes saved locally (sign in to save to the database)",
    updatedOn: (date: string) => `Updated on ${date}`,
    wordCount: (n: number) => `${n} words`,
    viewCount: (n: number) => `${n} view${n > 1 ? "s" : ""}`,
    inThisSection: "In this section",
    relatedArticles: "Related articles",
    relatedArticlesDesc: "Articles that link to this one.",
    prevArticle: "← Previous article",
    nextArticle: "Next article →",
    prevNextNavLabel: "Previous / next navigation",
    comments: "Comments",
    anonymous: "Anonymous",
    addCommentPlaceholder: "Add a comment...",
    sending: "Sending…",
    publish: "Publish",
    toc: "Contents",
    noContent: "*No content.*",
    aiContext: (title: string, content: string) =>
      `You are viewing the wiki article "${title}". Here is its full content:\n\n${content}\n\nAnswer the user's questions about this article or the topics it covers.`,
  },
  edit: {
    title: "Edit article",
    unsavedChange: "Unsaved change",
    savedAt: (time: string) => `Saved at ${time}`,
    draftSavedAt: (time: string) => `Draft saved at ${time}`,
    viewModeLabel: "Display mode",
    editor: "Editor",
    split: "Split",
    preview: "Preview",
    localArticleNotice: "You are editing a local article (not synced).",
    saveToDb: "Save to database",
    savingToDb: "Saving…",
    saveToDbLabel: "Save this article to the database",
    localSaved: "Article saved locally.",
    labelTitle: "Title",
    labelPublished: "Published",
    labelPin: "Pin this article",
    labelTemplate: "Template",
    applyTemplate: "Apply template",
    labelCover: "Cover image (URL)",
    labelExcerpt: "Excerpt",
    excerptPlaceholder: "2-3 lines, optional",
    labelTags: "Tags (separated by Enter)",
    tagPlaceholder: "Add a tag...",
    removeTag: "Remove",
    labelChangeNote: "Change note (history)",
    changeNotePlaceholder: "Optional: describe the changes",
    aiHelp: "AI help",
    aiHelpIntro: "Use AI to write or format the article content.",
    aiGenerating: "Generating…",
    aiFormatCurrent: "Format the current content",
    aiGenerateFromNotes: "Generate an article from notes",
    aiNotesPlaceholder: "Paste your raw notes here…",
    typeLabel: "Type",
    typeGuide: "Guide",
    typeProcedure: "Procedure",
    typeBestPractice: "Best practices",
    typeReference: "Reference",
    workspaceLabel: "Workspace",
    workspaceService1: "Department 1",
    workspaceService2: "Department 2",
    workspaceShared: "Shared",
    aiGenerateArticle: "Generate article",
    saving: "Saving...",
    errorSaving: "Error while saving",
    errorCannotSave: "Unable to save",
    errorCannotSaveGuest: "Unable to save (guest article)",
    errorCannotSaveDb: "Unable to save to the database",
    readOnlyGuest: "Read-only article in guest mode (base article).",
    apiError: "API error",
    aiError: "AI error",
    noStream: "No stream",
    genError: "Error during generation",
    genericError: "Error",
  },
  history: {
    title: "Revision history",
    intro: "Click a revision to view its content. The last 50 revisions are kept.",
    revisionsPanel: "Revisions (most recent on top)",
    view: "View",
    restore: "Restore",
    compare: "Compare",
    deselect: "Deselect",
    noRevision: "No revisions saved.",
    revisionOf: (date: string) => `Revision from ${date}`,
    diffVsPrevious: "Diff vs previous version",
    restoreThisVersion: "Restore this version",
    comparisonTitle: "Comparison: Version A (older) vs Version B (newer)",
    comparisonMeta: (a: string, b: string) => `Version A: ${a} · Version B: ${b}`,
    restoreDialogTitle: "Restore this version?",
    restoreDialogBody:
      "The current article content will be replaced by this revision. You can edit the change note below.",
    restoreNoteLabel: "Change note (optional)",
    restoreNotePlaceholder: "E.g.: Restored version from …",
    restoring: "Restoring…",
    errLogin: "Sign in to view the history.",
    errLoad: "Unable to load the history.",
    errRestoreVersion: "Unable to restore this version.",
    errRestore: "Unable to restore.",
  },
  new: {
    title: "New article",
    generateFromVoice: "✦ Generate from a voice note",
    typeLabel: "Type",
    typeProcedure: "Procedure",
    typeGuide: "Guide",
    typeBestPractice: "Best practice",
    typeReference: "Reference",
    workspaceLabel: "Workspace",
    workspaceService1: "Department 1",
    workspaceService2: "Department 2",
    workspaceShared: "Shared",
    dictateArticle: "Dictate the article",
    generatingQwen: "✦ Generating with Qwen3…",
    voiceHint:
      "Describe your procedure or guide out loud → Whisper transcribes → Qwen3 structures the article.",
    labelTitle: "Title",
    labelSlug: "Slug (auto-generated)",
    slugPlaceholder: "generated-from-title",
    labelParent: "Parent",
    parentNone: "None (root)",
    labelPublished: "Published",
    labelPin: "Pin this article",
    labelExcerpt: "Excerpt",
    excerptPlaceholder: "2-3 lines, optional",
    labelTags: "Tags (Enter or comma to add)",
    tagPlaceholder: "Add a tag...",
    removeTag: "Remove",
    previewOn: "Preview: on",
    previewOff: "Preview: off",
    contentPlaceholder: "Markdown content...",
    guestAuthor: "Guest",
    generatingHeader: "# Generating…\n\n",
    genErrorStatus: (status: number) => `Generation error ${status}`,
    genError: "Generation error",
    genericError: "Error",
  },
  search: {
    breadcrumb: "Search",
    title: "Search the Wiki",
    placeholder: "Search (title, content, tags)...",
    searching: "Searching…",
    searchButton: "Search",
    results: (n: number) => `Results (${n})`,
    noResultsTitle: "No results",
    noResultsBody:
      "No article matches your search. Try other terms or check the suggestions below.",
    semanticResults: "Semantically related results",
  },
  tags: {
    breadcrumb: "Tags",
    title: "Wiki tags",
    description:
      "Tag cloud or alphabetical list with article counts. Click a tag to filter the list.",
    viewLabel: "Display view",
    cloud: "Cloud",
    listAZ: "List A–Z",
    noTagTitle: "No tags",
    noTagBody:
      "No article has a tag yet. Add tags when editing articles.",
    cloudHeading: "Tag cloud",
    cloudHint: "Click a tag to show the related articles.",
    alphaHeading: "Alphabetical list",
    articleCount: (n: number) => `${n} article${n > 1 ? "s" : ""}`,
  },
  doc: {
    breadcrumb: "Documentation",
    title: "Documentation — Wiki",
    description:
      "Internal wiki, article tree, editing and AI Help (formatting, generation from notes). The AI module can draw on article content.",
    backToModule: "← Back to the Wiki module",
    externalDocLabel: "Full documentation (external):",
  },
  sandbox: {
    breadcrumb: "Simulator",
    sandboxNotice: "Sandbox — Your changes are not saved.",
    reset: "Reset",
    resetLabel: "Reset the content",
    createFromContent: "Create an article from this content",
    createFromContentLabel: "Create an article from this content",
    title: "Simulator — Markdown editor",
    intro:
      "Split-view editor: edit the Markdown on the left, the rendered output appears on the right. Headings, lists, tables, code, callouts and links are supported.",
    contentPlaceholder: "Markdown content...",
    editAreaLabel: "Markdown editing area",
    footnote:
      "This content is not saved to the database. Use “Create an article from this content” to open the article creation page pre-filled with this text.",
    confirmReset: "Reset the content with the default demo?",
    redirectText: "Redirecting to the Wiki…",
    redirectBody: "You will be redirected to the Guide article (demo mode).",
    initialContent: `# Heading level 1

## Heading level 2

### Heading level 3

#### Heading level 4

Some **bold text**, *italic*, ~~strikethrough~~ and \`inline code\`.

> Blockquote: an important quote or note with a colored left border.

Bulleted list:
- First point
- Second point
- Third point

Numbered list:
1. Step one
2. Step two
3. Step three

Checkboxes:
- [ ] Unfinished task
- [x] Finished task

[Hyperlink](https://docs.blueprint-modular.com) to the documentation.

---

## Code block (JavaScript)

\`\`\`javascript
function hello(name) {
  return \`Hello, \${name}!\`;
}
console.log(hello("Wiki"));
\`\`\`

## Markdown table

| Column A  | Column B  | Column C  |
|-----------|-----------|-----------|
| Cell 1    | Cell 2    | Cell 3    |
| Data      | Data      | Data      |

## Callouts

> **Info**
> Information callout.

> **Success**
> Success callout: operation completed.

> **Warning**
> Warning callout: pay attention to this point.

> **Danger**
> Danger callout: irreversible action.

> **Tip**
> Tip callout: practical advice.
`,
  },
};

export const STR = { fr, en };
export type WikiStrings = typeof fr;
