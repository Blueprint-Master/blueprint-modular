// Dictionnaire bilingue local à la page /demo.
// Ne couvre que les libellés d'interface (UI chrome), pas les données métier
// (noms de clients, contacts, références de commandes, produits, prix...).

const fr = {
  // En-tête
  pageTitle: "Demo - Suivi commercial",
  pageDescription:
    "Démo d’une petite application de suivi commercial : tableau de bord, clients, commandes, produits et équipe. Tout est construit avec les composants bpm.*.",

  // Onglets
  tabDashboard: "Tableau de bord",
  tabClients: "Clients",
  tabOrders: "Commandes",
  tabProducts: "Produits",
  tabTeam: "Équipe",

  // Tableau de bord
  metricRevenue: "CA du mois (k€)",
  metricOrders: "Commandes",
  metricConversion: "Taux de conversion",
  metricQuarterGoal: "Objectif trimestre",
  syncSuccess: "Données synchronisées avec le serveur.",
  hide: "Masquer",
  cardRevenueTrend: "Évolution du CA",
  cardRevenuePerRep: "CA par commercial",
  panelQuarterGoal: "Objectif trimestre",
  progressTeam: "Progression équipe",
  statusCrmSync: "Synchronisation CRM",
  lastSync: "Dernière synchro : aujourd’hui, 14h32. Prochaine : dans 2 h.",
  forceSync: "Forcer une synchro",

  // Clients
  search: "Recherche",
  searchPlaceholder: "Client ou contact…",
  status: "Statut",
  statusAll: "Tous",
  clearFilters: "Effacer les filtres",
  colClient: "Client",
  colContact: "Contact",
  colRevenue: "CA (k€)",
  colStatus: "Statut",
  emptyClientsTitle: "Aucun client",
  emptyClientsDesc: "Modifiez les filtres pour afficher des résultats.",

  // Commandes
  latestOrders: "Dernières commandes",
  colRef: "Référence",
  colAmount: "Montant (€)",
  colDate: "Date",
  orderTrackingTitle: "Suivi d’une commande (exemple)",
  stepValidation: "Validation",
  stepPreparation: "Préparation",
  stepDelivery: "Livraison",
  orderProgress: "Avancement CMD-2024-002",

  // Produits
  catalog: "Catalogue",
  catalogDesc: "Offres et services proposés aux clients. Les abonnements ont un stock illimité.",
  stockAvailable: "Stock disponible",

  // Équipe
  teamPerformance: "Performance des commerciaux ce mois",
  colRep: "Commercial",
  colGoal: "Objectif (k€)",
  colDone: "Réalisé (k€)",

  // Statuts (libellés affichés, mappés depuis les données)
  statusActive: "Actif",
  statusPending: "En attente",
  statusProspect: "Prospect",
  statusDelivered: "Livrée",
  statusInPreparation: "En préparation",
  statusValidated: "Validée",
};

const en: typeof fr = {
  // Header
  pageTitle: "Demo - Sales Tracking",
  pageDescription:
    "Demo of a small sales-tracking application: dashboard, clients, orders, products and team. Everything is built with the bpm.* components.",

  // Tabs
  tabDashboard: "Dashboard",
  tabClients: "Clients",
  tabOrders: "Orders",
  tabProducts: "Products",
  tabTeam: "Team",

  // Dashboard
  metricRevenue: "Monthly revenue (k€)",
  metricOrders: "Orders",
  metricConversion: "Conversion rate",
  metricQuarterGoal: "Quarter goal",
  syncSuccess: "Data synced with the server.",
  hide: "Hide",
  cardRevenueTrend: "Revenue trend",
  cardRevenuePerRep: "Revenue per rep",
  panelQuarterGoal: "Quarter goal",
  progressTeam: "Team progress",
  statusCrmSync: "CRM sync",
  lastSync: "Last sync: today, 2:32 PM. Next: in 2 h.",
  forceSync: "Force a sync",

  // Clients
  search: "Search",
  searchPlaceholder: "Client or contact…",
  status: "Status",
  statusAll: "All",
  clearFilters: "Clear filters",
  colClient: "Client",
  colContact: "Contact",
  colRevenue: "Revenue (k€)",
  colStatus: "Status",
  emptyClientsTitle: "No client",
  emptyClientsDesc: "Adjust the filters to display results.",

  // Orders
  latestOrders: "Latest orders",
  colRef: "Reference",
  colAmount: "Amount (€)",
  colDate: "Date",
  orderTrackingTitle: "Order tracking (example)",
  stepValidation: "Validation",
  stepPreparation: "Preparation",
  stepDelivery: "Delivery",
  orderProgress: "Progress CMD-2024-002",

  // Products
  catalog: "Catalog",
  catalogDesc: "Offers and services available to clients. Subscriptions have unlimited stock.",
  stockAvailable: "Available stock",

  // Team
  teamPerformance: "Sales reps performance this month",
  colRep: "Sales rep",
  colGoal: "Goal (k€)",
  colDone: "Achieved (k€)",

  // Statuses (displayed labels, mapped from data)
  statusActive: "Active",
  statusPending: "Pending",
  statusProspect: "Prospect",
  statusDelivered: "Delivered",
  statusInPreparation: "In preparation",
  statusValidated: "Validated",
};

export type DemoStrings = typeof fr;

export function getDemoStrings(locale: "fr" | "en"): DemoStrings {
  return locale === "en" ? en : fr;
}

/** Mappe une valeur de statut (donnée métier en FR) vers son libellé affiché. */
export function statusLabel(s: DemoStrings, statut: string): string {
  switch (statut) {
    case "Actif":
      return s.statusActive;
    case "En attente":
      return s.statusPending;
    case "Prospect":
      return s.statusProspect;
    case "Livrée":
      return s.statusDelivered;
    case "En préparation":
      return s.statusInPreparation;
    case "Validée":
      return s.statusValidated;
    default:
      return statut;
  }
}
