export interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

export interface ComponentExample {
  title: string;
  code: string;
}

export interface ComponentDoc {
  name: string;
  category:
    | "display"
    | "layout"
    | "form"
    | "chart"
    | "feedback"
    | "navigation"
    | "media";
  description: string;
  props: PropDoc[];
  examples: ComponentExample[];
  relatedComponents?: string[];
}

export const COMPONENTS_DOC: ComponentDoc[] = [
  {
    name: "metric",
    category: "display",
    description: "Affiche une valeur clé avec label, delta et tendance.",
    props: [
      { name: "label", type: "string", required: true, description: "Libellé de la métrique" },
      { name: "value", type: "string | number", required: true, description: "Valeur principale" },
      { name: "delta", type: "number", required: false, default: "undefined", description: "Variation (positif = vert, négatif = rouge)" },
      { name: "currency", type: "string", required: false, default: "EUR", description: "Devise ou unité (EUR, USD, %, etc.)" },
      { name: "border", type: "boolean", required: false, default: "true", description: "Affiche la bordure" },
      { name: "compact", type: "boolean", required: false, default: "false", description: "Mode compact" },
      { name: "trackContext", type: "boolean", required: false, default: "false", description: "Expose la métrique au contexte IA" },
    ],
    examples: [
      { title: "Basique", code: 'bpm.metric("CA", "142 500")' },
      { title: "Avec delta", code: "bpm.metric(\"CA\", \"142 500\", delta=3200)" },
      { title: "Compact", code: "bpm.metric(\"TRS\", \"87%\", delta=2, compact=True)" },
    ],
    relatedComponents: ["title", "panel", "progress"],
  },
  {
    name: "table",
    category: "display",
    description: "Tableau de données avec tri, formatage et scroll.",
    props: [
      { name: "columns", type: "TableColumn[]", required: true, description: "Définition des colonnes (key, label, align, render)" },
      { name: "data", type: "Record<string, unknown>[]", required: true, description: "Données à afficher" },
      { name: "striped", type: "boolean", required: false, default: "true", description: "Lignes alternées" },
      { name: "hover", type: "boolean", required: false, default: "true", description: "Surbrillance au survol" },
      { name: "onRowClick", type: "function", required: false, description: "Callback au clic sur une ligne" },
      { name: "trackContext", type: "boolean", required: false, default: "false", description: "Expose le tableau au contexte IA" },
    ],
    examples: [
      { title: "Basique", code: 'bpm.table("Produits,Prix;Farine,1.20;Sucre,0.90")' },
    ],
    relatedComponents: ["pagination", "skeleton", "emptystate"],
  },
  {
    name: "panel",
    category: "display",
    description: "Bloc informatif avec bordure colorée selon le variant.",
    props: [
      { name: "title", type: "string", required: true, description: "Titre du panneau" },
      { name: "children", type: "ReactNode", required: true, description: "Contenu" },
      { name: "variant", type: "'info' | 'success' | 'warning' | 'error'", required: false, default: "info", description: "Style visuel" },
    ],
    examples: [
      { title: "Info", code: 'bpm.panel("Info", "Message informatif.", variant="info")' },
      { title: "Avertissement", code: 'bpm.panel("Attention", "Point critique.", variant="warning")' },
    ],
    relatedComponents: ["message", "statusbox"],
  },
  {
    name: "title",
    category: "display",
    description: "Titre de section (niveaux 1 à 4).",
    props: [
      { name: "children", type: "string | ReactNode", required: true, description: "Texte du titre" },
      { name: "level", type: "1 | 2 | 3 | 4", required: false, default: "1", description: "Niveau de titre (h1 à h4)" },
    ],
    examples: [
      { title: "Niveau 1", code: 'bpm.title("Ma page", level=1)' },
      { title: "Sous-titre", code: 'bpm.title("Détails", level=2)' },
    ],
    relatedComponents: ["metric", "caption", "text"],
  },
  {
    name: "badge",
    category: "display",
    description: "Badge ou étiquette (statut, catégorie).",
    props: [
      { name: "children", type: "string | ReactNode", required: true, description: "Contenu du badge" },
      { name: "variant", type: "'default' | 'primary' | 'success' | 'warning' | 'error'", required: false, default: "default", description: "Style visuel" },
    ],
    examples: [
      { title: "Basique", code: 'bpm.badge("OK")' },
      { title: "Succès", code: 'bpm.badge("Validé", variant="success")' },
    ],
    relatedComponents: ["chip", "statusbox"],
  },
  {
    name: "progress",
    category: "display",
    description: "Barre de progression.",
    props: [
      { name: "value", type: "number", required: true, description: "Valeur actuelle" },
      { name: "max", type: "number", required: false, default: "100", description: "Valeur maximale" },
      { name: "label", type: "string", required: false, description: "Libellé affiché" },
      { name: "showValue", type: "boolean", required: false, default: "false", description: "Afficher la valeur en pourcentage" },
    ],
    examples: [
      { title: "Basique", code: "bpm.progress(value=60)" },
      { title: "Avec label", code: 'bpm.progress(value=75, label="Avancement", showValue=True)' },
    ],
    relatedComponents: ["metric", "skeleton"],
  },
  {
    name: "message",
    category: "feedback",
    description: "Message contextuel (info, succès, avertissement, erreur).",
    props: [
      { name: "children", type: "string | ReactNode", required: true, description: "Contenu du message" },
      { name: "type", type: "'info' | 'success' | 'warning' | 'error'", required: false, default: "info", description: "Type de message" },
    ],
    examples: [
      { title: "Info", code: 'bpm.message("Opération réussie.", type="success")' },
      { title: "Avertissement", code: 'bpm.message("Vérifiez les champs.", type="warning")' },
    ],
    relatedComponents: ["panel", "statusbox"],
  },
  {
    name: "tabs",
    category: "layout",
    description: "Onglets pour organiser le contenu.",
    props: [
      { name: "tabs", type: "TabItem[]", required: true, description: "Liste des onglets (label, content)" },
      { name: "defaultIndex", type: "number", required: false, default: "0", description: "Onglet actif par défaut" },
    ],
    examples: [
      { title: "Deux onglets", code: 'bpm.tabs("Vue 1 | Vue 2")' },
      { title: "Avec contenu", code: 'bpm.tabs("Résumé | Détails")' },
    ],
    relatedComponents: ["accordion", "expander", "card"],
  },
  {
    name: "button",
    category: "form",
    description: "Bouton d’action.",
    props: [
      { name: "children", type: "string | ReactNode", required: true, description: "Libellé du bouton" },
      { name: "variant", type: "'primary' | 'secondary' | 'outline'", required: false, default: "primary", description: "Style" },
      { name: "size", type: "'small' | 'medium' | 'large'", required: false, default: "medium", description: "Taille" },
      { name: "disabled", type: "boolean", required: false, default: "false", description: "Désactivé" },
    ],
    examples: [
      { title: "Basique", code: 'bpm.button("Valider")' },
      { title: "Secondaire", code: 'bpm.button("Annuler", variant="secondary")' },
    ],
    relatedComponents: ["toggle", "chip"],
  },
  {
    name: "input",
    category: "form",
    description: "Champ de saisie texte.",
    props: [
      { name: "label", type: "string", required: false, description: "Libellé du champ" },
      { name: "value", type: "string", required: false, description: "Valeur contrôlée" },
      { name: "placeholder", type: "string", required: false, description: "Texte indicatif" },
      { name: "onChange", type: "function", required: false, description: "Callback à la saisie" },
      { name: "disabled", type: "boolean", required: false, default: "false", description: "Désactivé" },
    ],
    examples: [
      { title: "Basique", code: 'bpm.input("Nom")' },
      { title: "Avec placeholder", code: 'bpm.input("Recherche", placeholder="Saisir...")' },
    ],
    relatedComponents: ["textarea", "selectbox", "numberinput"],
  },
  {
    name: "selectbox",
    category: "form",
    description: "Liste déroulante de choix.",
    props: [
      { name: "label", type: "string", required: false, description: "Libellé" },
      { name: "options", type: "SelectboxOption[]", required: true, description: "Options (value, label)" },
      { name: "value", type: "string | null", required: false, description: "Valeur sélectionnée" },
      { name: "onChange", type: "function", required: false, description: "Callback au changement" },
      { name: "placeholder", type: "string", required: false, default: "Sélectionner...", description: "Texte par défaut" },
    ],
    examples: [
      { title: "Basique", code: 'bpm.selectbox("Statut", options="A,B,C")' },
      { title: "Avec options nommées", code: 'bpm.selectbox("Choix", options="Draft,Published")' },
    ],
    relatedComponents: ["input", "radiogroup", "checkbox"],
  },
  {
    name: "toggle",
    category: "form",
    description: "Interrupteur on/off.",
    props: [
      { name: "label", type: "string", required: false, description: "Libellé" },
      { name: "value", type: "boolean", required: true, description: "État (on/off)" },
      { name: "onChange", type: "function", required: false, description: "Callback au changement" },
    ],
    examples: [
      { title: "Basique", code: "bpm.toggle(\"Activer\", value=True)" },
    ],
    relatedComponents: ["checkbox", "button"],
  },
  {
    name: "linechart",
    category: "chart",
    description: "Graphique en courbes (séries temporelles).",
    props: [
      { name: "data", type: "{ x: string | number; y: number }[]", required: true, description: "Points (x, y)" },
      { name: "width", type: "number", required: false, description: "Largeur en px" },
      { name: "height", type: "number", required: false, description: "Hauteur en px" },
    ],
    examples: [
      { title: "Courbe simple", code: 'bpm.linechart("Jan,10;Fév,20;Mar,15")' },
      { title: "Vide (démo)", code: "bpm.linechart()" },
    ],
    relatedComponents: ["barchart", "areachart", "metric"],
  },
  {
    name: "barchart",
    category: "chart",
    description: "Graphique en barres.",
    props: [
      { name: "data", type: "{ x: string; y: number }[]", required: true, description: "Barres (x = libellé, y = valeur)" },
      { name: "width", type: "number", required: false, description: "Largeur en px" },
      { name: "height", type: "number", required: false, description: "Hauteur en px" },
    ],
    examples: [
      { title: "Barres", code: 'bpm.barchart("A,30;B,45;C,25")' },
      { title: "Vide (démo)", code: "bpm.barchart()" },
    ],
    relatedComponents: ["linechart", "areachart", "table"],
  },
  {
    name: "card",
    category: "layout",
    description: "Carte avec titre et contenu.",
    props: [
      { name: "title", type: "string", required: false, description: "Titre de la carte" },
      { name: "children", type: "ReactNode", required: true, description: "Contenu" },
      { name: "variant", type: "'elevated' | 'outlined'", required: false, default: "elevated", description: "Style" },
    ],
    examples: [
      { title: "Basique", code: 'bpm.card("Titre", "Contenu de la carte.")' },
    ],
    relatedComponents: ["panel", "expander", "tabs"],
  },
  {
    name: "expander",
    category: "layout",
    description: "Bloc repliable (accordéon simple).",
    props: [
      { name: "title", type: "string", required: true, description: "Titre du bloc" },
      { name: "children", type: "ReactNode", required: true, description: "Contenu dépliable" },
      { name: "defaultExpanded", type: "boolean", required: false, default: "false", description: "Ouvert par défaut" },
    ],
    examples: [
      { title: "Basique", code: 'bpm.expander("Détails", "Contenu masqué par défaut.")' },
    ],
    relatedComponents: ["accordion", "card", "tabs"],
  },
  {
    name: "accordion",
    category: "layout",
    description: "Accordéon (plusieurs sections repliables).",
    props: [
      { name: "sections", type: "AccordionSection[]", required: true, description: "Sections (id, title, content)" },
      { name: "allowMultiple", type: "boolean", required: false, default: "false", description: "Plusieurs sections ouvertes" },
    ],
    examples: [
      { title: "Sections", code: 'bpm.accordion("FAQ 1 | FAQ 2 | FAQ 3")' },
    ],
    relatedComponents: ["expander", "tabs", "card"],
  },
  {
    name: "divider",
    category: "layout",
    description: "Séparateur horizontal.",
    props: [],
    examples: [
      { title: "Basique", code: "bpm.divider()" },
    ],
    relatedComponents: ["card", "panel"],
  },
  {
    name: "emptystate",
    category: "feedback",
    description: "État vide (aucune donnée à afficher).",
    props: [
      { name: "title", type: "string", required: true, description: "Titre court" },
      { name: "description", type: "string", required: false, description: "Description ou instruction" },
      { name: "icon", type: "string", required: false, description: "Nom d’icône optionnel" },
    ],
    examples: [
      { title: "Basique", code: 'bpm.emptystate("Aucun résultat", "Modifiez les filtres.")' },
    ],
    relatedComponents: ["empty", "table", "skeleton"],
  },
  {
    name: "statusbox",
    category: "feedback",
    description: "Indicateur de statut (running, complete, error).",
    props: [
      { name: "label", type: "string", required: true, description: "Libellé du statut" },
      { name: "state", type: "'running' | 'complete' | 'error'", required: false, default: "running", description: "État visuel" },
    ],
    examples: [
      { title: "Succès", code: 'bpm.statusbox("Terminé", status="success")' },
      { title: "En cours", code: 'bpm.statusbox("En cours", status="info")' },
    ],
    relatedComponents: ["badge", "message", "progress"],
  },
];

export function getComponentDoc(name: string): ComponentDoc | undefined {
  return COMPONENTS_DOC.find((c) => c.name === name);
}

export function getComponentsByCategory(
  category: ComponentDoc["category"]
): ComponentDoc[] {
  return COMPONENTS_DOC.filter((c) => c.category === category);
}
