/**
 * Chaînes bilingues du module Newsletter.
 * Parité fr/en garantie par le type : `const en: typeof fr`.
 * Les valeurs techniques (statuts API `archived`, paramètres de requête) ne changent pas :
 * seul l'affichage est traduit.
 */

const fr = {
  // Partagé
  moduleName: "Newsletter",
  breadcrumbModules: "Modules",
  backToModule: "← Retour à la Newsletter",
  backToModules: "← Retour aux modules",
  dateLocale: "fr-FR",
  ellipsis: "…",

  // Liste (page.tsx)
  listDescription:
    "Gérez la photo de header, créez des articles et archivez les numéros. Consultez la liste et cliquez sur une ligne pour ouvrir l'article.",
  filterOptions: [
    { value: "false", label: "Actifs (non archivés)" },
    { value: "true", label: "Archivés" },
    { value: "", label: "Tous" },
  ],
  filterPlaceholder: "Filtrer par statut",
  headerPhotoButton: "Photo de header",
  newArticleButton: "Nouvel article",
  colTitle: "Titre",
  colPublishedAt: "Date de publication",
  colStatus: "Statut",
  colActions: "Actions",
  statusArchived: "Archivé",
  statusActive: "Actif",
  actionView: "Voir",
  actionEdit: "Modifier",
  actionArchive: "Archiver",
  actionUnarchive: "Désarchiver",
  actionDelete: "Supprimer",
  deleteConfirm: (title: string) =>
    `Supprimer l'article « ${title} » ? Cette action est irréversible.`,
  emptyTitle: "Aucun article",
  emptyBefore: "Créez un article avec le bouton ",
  emptyStrongNew: "Nouvel article",
  emptyMiddle: " ou configurez la photo de header dans ",
  emptyStrongHeader: "Photo de header",
  emptyAfter: ".",
  documentationLink: "Documentation",

  // Création (nouveau/page.tsx)
  newBreadcrumb: "Nouvel article",
  newTitle: "Nouvel article",
  newDescription:
    "Remplissez le titre et le contenu. L'extrait et la date de publication sont optionnels.",
  newPanelTitle: "Créer un article",
  titleLabel: "Titre *",
  titleAria: "Titre",
  titlePlaceholder: "Titre de l'article",
  contentLabel: "Contenu",
  contentAria: "Contenu",
  newContentPlaceholder: "Contenu de l'article…",
  excerptLabel: "Extrait (optionnel)",
  excerptAria: "Extrait",
  newExcerptPlaceholder: "Court résumé pour les listes",
  publishedAtLabel: "Date de publication (optionnel)",
  publishedAtAria: "Date de publication",
  titleRequired: "Le titre est requis.",
  createError: "Erreur lors de la création.",
  networkError: "Erreur réseau.",
  creating: "Création…",
  createSubmit: "Créer l'article",
  cancel: "Annuler",

  // Détail ([id]/page.tsx)
  notFoundTitle: "Article introuvable",
  notFoundBody: "L'article demandé n'existe pas ou vous n'y avez pas accès.",
  noContent: "Aucun contenu.",
  articleListButton: "Liste des articles",

  // Édition ([id]/edit/page.tsx)
  editBreadcrumbFallback: "Article",
  editBreadcrumb: "Modifier",
  editTitle: "Modifier l'article",
  editPanelTitle: "Édition",
  editTitlePlaceholder: "Titre",
  editContentPlaceholder: "Contenu…",
  editExcerptPlaceholder: "Court résumé",
  archivedCheckboxLabel: "Archivé",
  saveError: "Erreur lors de l'enregistrement.",
  saving: "Enregistrement…",
  save: "Enregistrer",

  // Paramètres (parametres/page.tsx)
  settingsBreadcrumb: "Paramètres",
  settingsLoading: "Chargement…",
  settingsTitle: "Photo de header",
  settingsDescription:
    "URL de l'image affichée en en-tête de la newsletter (lien public ou chemin relatif).",
  settingsPanelTitle: "Image d'en-tête",
  imageUrlLabel: "URL de l'image",
  imageUrlPlaceholder: "https://exemple.com/image.jpg",
  imageUrlAria: "URL de l'image de header",
  previewLabel: "Aperçu",
  previewAria: "Aperçu du header",
  savedMessage: "Enregistré.",
};

const en: typeof fr = {
  // Shared
  moduleName: "Newsletter",
  breadcrumbModules: "Modules",
  backToModule: "← Back to Newsletter",
  backToModules: "← Back to modules",
  dateLocale: "en-GB",
  ellipsis: "…",

  // List (page.tsx)
  listDescription:
    "Manage the header photo, create articles and archive issues. Browse the list and click a row to open the article.",
  filterOptions: [
    { value: "false", label: "Active (not archived)" },
    { value: "true", label: "Archived" },
    { value: "", label: "All" },
  ],
  filterPlaceholder: "Filter by status",
  headerPhotoButton: "Header photo",
  newArticleButton: "New article",
  colTitle: "Title",
  colPublishedAt: "Publication date",
  colStatus: "Status",
  colActions: "Actions",
  statusArchived: "Archived",
  statusActive: "Active",
  actionView: "View",
  actionEdit: "Edit",
  actionArchive: "Archive",
  actionUnarchive: "Unarchive",
  actionDelete: "Delete",
  deleteConfirm: (title: string) =>
    `Delete the article "${title}"? This action cannot be undone.`,
  emptyTitle: "No articles",
  emptyBefore: "Create an article with the ",
  emptyStrongNew: "New article",
  emptyMiddle: " button or set up the header photo in ",
  emptyStrongHeader: "Header photo",
  emptyAfter: ".",
  documentationLink: "Documentation",

  // Create (nouveau/page.tsx)
  newBreadcrumb: "New article",
  newTitle: "New article",
  newDescription:
    "Fill in the title and content. The excerpt and publication date are optional.",
  newPanelTitle: "Create an article",
  titleLabel: "Title *",
  titleAria: "Title",
  titlePlaceholder: "Article title",
  contentLabel: "Content",
  contentAria: "Content",
  newContentPlaceholder: "Article content…",
  excerptLabel: "Excerpt (optional)",
  excerptAria: "Excerpt",
  newExcerptPlaceholder: "Short summary for lists",
  publishedAtLabel: "Publication date (optional)",
  publishedAtAria: "Publication date",
  titleRequired: "The title is required.",
  createError: "An error occurred while creating the article.",
  networkError: "Network error.",
  creating: "Creating…",
  createSubmit: "Create article",
  cancel: "Cancel",

  // Detail ([id]/page.tsx)
  notFoundTitle: "Article not found",
  notFoundBody: "The requested article does not exist or you do not have access to it.",
  noContent: "No content.",
  articleListButton: "Article list",

  // Edit ([id]/edit/page.tsx)
  editBreadcrumbFallback: "Article",
  editBreadcrumb: "Edit",
  editTitle: "Edit article",
  editPanelTitle: "Editing",
  editTitlePlaceholder: "Title",
  editContentPlaceholder: "Content…",
  editExcerptPlaceholder: "Short summary",
  archivedCheckboxLabel: "Archived",
  saveError: "An error occurred while saving.",
  saving: "Saving…",
  save: "Save",

  // Settings (parametres/page.tsx)
  settingsBreadcrumb: "Settings",
  settingsLoading: "Loading…",
  settingsTitle: "Header photo",
  settingsDescription:
    "URL of the image shown in the newsletter header (public link or relative path).",
  settingsPanelTitle: "Header image",
  imageUrlLabel: "Image URL",
  imageUrlPlaceholder: "https://example.com/image.jpg",
  imageUrlAria: "Header image URL",
  previewLabel: "Preview",
  previewAria: "Header preview",
  savedMessage: "Saved.",
};

export const STR = { fr, en } as const;
