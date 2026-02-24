/** Suggestions $ pour l'autocomplétion (Wiki, Documents, etc.) */
export const DOLLAR_SUGGESTIONS = [
  { token: "$wiki", label: "Wiki", description: "Article wiki", location: "Wiki" },
  { token: "$doc", label: "Document", description: "Document analysé", location: "Documents" },
  { token: "$metric", label: "Métrique", description: "Valeur bpm.metric", location: "Dashboard" },
  { token: "$table", label: "Table", description: "Tableau de données", location: "" },
  { token: "$chart", label: "Graphique", description: "Graphique", location: "" },
  { token: "$data", label: "Données", description: "Données brutes", location: "" },
];

export function getDollarSuggestions(prefix: string): { token: string; label: string; location?: string; isSub?: boolean }[] {
  const p = (prefix || "").toLowerCase();
  if (!p) return DOLLAR_SUGGESTIONS.map((s) => ({ token: s.token, label: s.label, location: s.location }));
  return DOLLAR_SUGGESTIONS.filter((s) => s.token.replace("$", "").toLowerCase().startsWith(p)).map((s) => ({
    token: s.token,
    label: s.label,
    location: s.location,
  }));
}
