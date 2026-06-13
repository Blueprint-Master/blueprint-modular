/**
 * Chaînes bilingues du module Catalogue produits.
 * La parité des clés FR/EN est garantie par le type (`en: typeof fr`).
 */

export type Localized = { fr: string; en: string };

const fr = {
  // ——— Commun ———
  moduleName: "Catalogue produits",
  openSimulator: "Ouvrir le simulateur",
  breadcrumbSimulator: "Simulateur",
  breadcrumbDocumentation: "Documentation",

  // ——— Page module ———
  pageDescription:
    "Gérez un catalogue e-commerce ou d'inventaire : fiches produit, variantes, prix, stocks et codes-barres EAN-13. Recherche, filtres, création et ajustements de stock — tout est manipulable dans le Simulateur.",
  badgeCategory: "Métier",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulateur",
  aboutTitle: "À propos",
  aboutBody:
    "Le module Catalogue produits centralise vos références e-commerce ou d'inventaire : chaque produit porte une référence interne (P-1001…), une catégorie, un prix, un stock et un code-barres EAN-13. Le statut (En stock, Stock faible, Rupture) est dérivé automatiquement du stock. Les produits déclinés (coloris, dimensions) embarquent leurs variantes avec référence, prix et stock propres. Recherche, filtres par catégorie et tris se combinent en direct, et la fiche produit permet d'ajuster le stock, d'imprimer le code-barres ou de supprimer la référence.",
  componentsTitle: "Composants utilisés",
  settingsTitle: "Paramétrage",
  settingsBody1:
    "Le simulateur fonctionne entièrement en local (10 produits seedés, aucune API requise). En production, brancher la liste sur votre PIM/ERP et les ajustements de stock sur votre WMS. Voir la ",
  docLinkLabel: "documentation",
  settingsBody2:
    " pour le modèle produit/variante, la génération d'EAN-13 et les points d'intégration.",

  // ——— Page simulateur ———
  simPageTitle: "Simulateur — Catalogue produits",
  simPageDescription:
    "Dix produits seedés (mobilier et équipement de bureau), dont deux avec variantes. Recherchez, filtrez par catégorie, triez, ouvrez une fiche (code-barres EAN-13, QR code, variantes), ajustez le stock, créez ou supprimez un produit : chaque action met à jour le tableau et les métriques.",

  // ——— Page documentation ———
  docPageTitle: "Documentation — Catalogue produits",
  docPageDescription:
    "Catalogue e-commerce / inventaire : modèle produit et variante, statut de stock dérivé, codes-barres EAN-13 et points d'intégration.",
  docDataModelTitle: "Modèle de données",
  docEanTitle: "Codes-barres EAN-13",
  docLifecycleTitle: "Cycle de vie",
  docIntegrationTitle: "Intégration en production",

  // ——— Métriques ———
  metricProducts: "Produits",
  metricStockValue: "Valeur du stock",
  metricAlerts: "Ruptures / stock faible",

  // ——— Recherche, filtres, tris ———
  panelTitle: "Catalogue",
  searchLabel: "Recherche (nom ou référence)",
  searchPlaceholder: "Ex. : chaise, P-1003…",
  categoryLabel: "Catégorie",
  sortLabel: "Tri",
  allCategories: "Toutes les catégories",
  sortNameAsc: "Nom A→Z",
  sortPriceAsc: "Prix croissant",
  sortPriceDesc: "Prix décroissant",
  sortStockAsc: "Stock croissant",

  // ——— Catégories (valeurs internes inchangées, libellés localisés) ———
  categories: {
    Mobilier: "Mobilier",
    Éclairage: "Éclairage",
    Accessoires: "Accessoires",
    Tech: "Tech",
  },

  // ——— Statuts de stock ———
  statuses: {
    "en-stock": "En stock",
    "stock-faible": "Stock faible",
    rupture: "Rupture",
  },

  // ——— Tableau ———
  colRef: "Réf.",
  colProduct: "Produit",
  colCategory: "Catégorie",
  colPrice: "Prix",
  colStock: "Stock",
  colActions: "Actions",
  colVariant: "Variante",
  variantCount: (n: number) => `${n} variantes`,
  emptyState: "Aucun produit ne correspond à la recherche ou aux filtres.",
  btnDetails: "Fiche",
  btnDelete: "Supprimer",
  btnNewProduct: "Nouveau produit",

  // ——— Fiche produit (drawer) ———
  drawerTitle: (ref: string) => `Fiche produit — ${ref}`,
  drawerTitleFallback: "Fiche produit",
  lblReference: "Référence",
  lblCategory: "Catégorie",
  lblPrice: "Prix",
  lblStock: "Stock",
  lblEan: "EAN-13",
  unitsCount: (n: number) => `${n} unités`,
  btnPlusOne: "+1 stock",
  btnMinusOne: "−1 stock",
  btnDeleteProduct: "Supprimer le produit",
  barcodeHeading: "Code-barres (EAN-13)",
  qrHeading: "QR code (référence interne)",
  variantsHeading: (n: number) => `Variantes (${n})`,

  // ——— Création ———
  modalTitle: "Nouveau produit",
  nameLabel: "Nom du produit (requis)",
  namePlaceholder: "Ex. : Fauteuil Bergen",
  priceLabel: "Prix de vente (€)",
  pricePlaceholder: "Ex. : 129.90",
  stockLabel: "Stock initial",
  stockPlaceholder: "Ex. : 10",
  refHint: (ref: string) =>
    `La référence (${ref}) et l'EAN-13 seront générés automatiquement à la création.`,
  btnCancel: "Annuler",
  btnCreate: "Créer le produit",
  errNameRequired: "Le nom du produit est requis.",
  errCategoryRequired: "Choisissez une catégorie.",
  errPriceInvalid: "Indiquez un prix de vente strictement positif.",
  errStockInvalid: "Indiquez un stock initial (0 ou plus).",
  createdDescription: (date: string) => `Produit ajouté au catalogue le ${date}.`,

  // ——— Toasts ———
  toastSource: "Catalogue produits",
  toastOutOfStockTitle: "Stock épuisé",
  toastOutOfStock: (nom: string) => `« ${nom} » est désormais en rupture de stock.`,
  toastStockUpdatedTitle: "Stock mis à jour",
  toastStockUpdated: (nom: string, avant: number, apres: number) =>
    `Stock de « ${nom} » : ${avant} → ${apres}.`,
  toastDeletedTitle: "Produit supprimé",
  toastDeleted: (nom: string, ref: string) => `« ${nom} » (${ref}) a été retiré du catalogue.`,
  toastCreatedTitle: "Produit créé",
  toastCreated: (nom: string, ref: string, ean: string) =>
    `« ${nom} » créé sous la référence ${ref} (EAN ${ean}).`,

  // ——— Suppression (ConfirmModal) ———
  confirmTitle: "Supprimer le produit",
  confirmMessage: (nom: string, ref: string, nbVariantes: number) =>
    `« ${nom} » (${ref}) sera retiré du catalogue${
      nbVariantes > 0 ? ` avec ses ${nbVariantes} variantes` : ""
    }. Cette action est immédiate.`,
  confirmLabel: "Supprimer",
  cancelLabel: "Annuler",
};

const en: typeof fr = {
  // ——— Common ———
  moduleName: "Product catalog",
  openSimulator: "Open the simulator",
  breadcrumbSimulator: "Simulator",
  breadcrumbDocumentation: "Documentation",

  // ——— Module page ———
  pageDescription:
    "Manage an e-commerce or inventory catalog: product sheets, variants, prices, stock levels and EAN-13 barcodes. Search, filters, creation and stock adjustments — everything can be tried out in the Simulator.",
  badgeCategory: "Business",
  tabDocumentation: "Documentation",
  tabSimulator: "Simulator",
  aboutTitle: "About",
  aboutBody:
    "The Product catalog module centralizes your e-commerce or inventory references: each product carries an internal reference (P-1001…), a category, a price, a stock level and an EAN-13 barcode. The status (In stock, Low stock, Out of stock) is derived automatically from the stock level. Products with variations (colors, dimensions) embed their variants, each with its own reference, price and stock. Search, category filters and sorting combine live, and the product sheet lets you adjust stock, print the barcode or delete the reference.",
  componentsTitle: "Components used",
  settingsTitle: "Configuration",
  settingsBody1:
    "The simulator runs entirely locally (10 seeded products, no API required). In production, plug the list into your PIM/ERP and stock adjustments into your WMS. See the ",
  docLinkLabel: "documentation",
  settingsBody2:
    " for the product/variant model, EAN-13 generation and integration points.",

  // ——— Simulator page ———
  simPageTitle: "Simulator — Product catalog",
  simPageDescription:
    "Ten seeded products (furniture and office equipment), two of them with variants. Search, filter by category, sort, open a product sheet (EAN-13 barcode, QR code, variants), adjust stock, create or delete a product: every action updates the table and the metrics.",

  // ——— Documentation page ———
  docPageTitle: "Documentation — Product catalog",
  docPageDescription:
    "E-commerce / inventory catalog: product and variant model, derived stock status, EAN-13 barcodes and integration points.",
  docDataModelTitle: "Data model",
  docEanTitle: "EAN-13 barcodes",
  docLifecycleTitle: "Lifecycle",
  docIntegrationTitle: "Production integration",

  // ——— Metrics ———
  metricProducts: "Products",
  metricStockValue: "Stock value",
  metricAlerts: "Out of stock / low stock",

  // ——— Search, filters, sorting ———
  panelTitle: "Catalog",
  searchLabel: "Search (name or reference)",
  searchPlaceholder: "e.g. chair, P-1003…",
  categoryLabel: "Category",
  sortLabel: "Sort",
  allCategories: "All categories",
  sortNameAsc: "Name A→Z",
  sortPriceAsc: "Price ascending",
  sortPriceDesc: "Price descending",
  sortStockAsc: "Stock ascending",

  // ——— Categories (internal values unchanged, localized labels) ———
  categories: {
    Mobilier: "Furniture",
    Éclairage: "Lighting",
    Accessoires: "Accessories",
    Tech: "Tech",
  },

  // ——— Stock statuses ———
  statuses: {
    "en-stock": "In stock",
    "stock-faible": "Low stock",
    rupture: "Out of stock",
  },

  // ——— Table ———
  colRef: "Ref.",
  colProduct: "Product",
  colCategory: "Category",
  colPrice: "Price",
  colStock: "Stock",
  colActions: "Actions",
  colVariant: "Variant",
  variantCount: (n: number) => `${n} variants`,
  emptyState: "No products match your search or filters.",
  btnDetails: "Details",
  btnDelete: "Delete",
  btnNewProduct: "New product",

  // ——— Product sheet (drawer) ———
  drawerTitle: (ref: string) => `Product sheet — ${ref}`,
  drawerTitleFallback: "Product sheet",
  lblReference: "Reference",
  lblCategory: "Category",
  lblPrice: "Price",
  lblStock: "Stock",
  lblEan: "EAN-13",
  unitsCount: (n: number) => `${n} units`,
  btnPlusOne: "+1 stock",
  btnMinusOne: "−1 stock",
  btnDeleteProduct: "Delete product",
  barcodeHeading: "Barcode (EAN-13)",
  qrHeading: "QR code (internal reference)",
  variantsHeading: (n: number) => `Variants (${n})`,

  // ——— Creation ———
  modalTitle: "New product",
  nameLabel: "Product name (required)",
  namePlaceholder: "e.g. Bergen armchair",
  priceLabel: "Selling price (€)",
  pricePlaceholder: "e.g. 129.90",
  stockLabel: "Initial stock",
  stockPlaceholder: "e.g. 10",
  refHint: (ref: string) =>
    `The reference (${ref}) and the EAN-13 will be generated automatically on creation.`,
  btnCancel: "Cancel",
  btnCreate: "Create product",
  errNameRequired: "Product name is required.",
  errCategoryRequired: "Choose a category.",
  errPriceInvalid: "Enter a selling price greater than zero.",
  errStockInvalid: "Enter an initial stock level (0 or more).",
  createdDescription: (date: string) => `Product added to the catalog on ${date}.`,

  // ——— Toasts ———
  toastSource: "Product catalog",
  toastOutOfStockTitle: "Stock depleted",
  toastOutOfStock: (nom: string) => `"${nom}" is now out of stock.`,
  toastStockUpdatedTitle: "Stock updated",
  toastStockUpdated: (nom: string, avant: number, apres: number) =>
    `"${nom}" stock: ${avant} → ${apres}.`,
  toastDeletedTitle: "Product deleted",
  toastDeleted: (nom: string, ref: string) => `"${nom}" (${ref}) has been removed from the catalog.`,
  toastCreatedTitle: "Product created",
  toastCreated: (nom: string, ref: string, ean: string) =>
    `"${nom}" created with reference ${ref} (EAN ${ean}).`,

  // ——— Deletion (ConfirmModal) ———
  confirmTitle: "Delete product",
  confirmMessage: (nom: string, ref: string, nbVariantes: number) =>
    `"${nom}" (${ref}) will be removed from the catalog${
      nbVariantes > 0 ? ` along with its ${nbVariantes} variants` : ""
    }. This action is immediate.`,
  confirmLabel: "Delete",
  cancelLabel: "Cancel",
};

export const STR = { fr, en } as const;
