import type { Locale } from "@/lib/i18n";

/** Texte bilingue porté par les données seedées (objets de devis, désignations de lignes). */
export type L10n = { fr: string; en: string };

export const pick = (text: L10n, locale: Locale): string => text[locale];

/** Texte saisi par l'utilisateur : identique dans les deux langues. */
export const lt = (value: string): L10n => ({ fr: value, en: value });

/** Segment de paragraphe riche : texte brut, code inline, gras ou lien interne. */
export type Seg = { t: string } | { c: string } | { b: string } | { l: string };
export type Rich = Seg[];

const INTL: Record<Locale, string> = { fr: "fr-FR", en: "en-US" };

/** Monnaie : fr « 12 500,00 € », en « €12,500.00 ». */
export const fmtEUR = (n: number, locale: Locale): string =>
  n.toLocaleString(INTL[locale], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** Date ISO (AAAA-MM-JJ) → date longue locale, sans dérive de fuseau. */
export const fmtDate = (iso: string, locale: Locale): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(INTL[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/** Date du jour au format ISO local (pour la création d'un devis). */
export const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Objet par défaut d'un devis créé sans objet. */
export const NEW_QUOTE_SUBJECT: L10n = { fr: "Nouveau devis", en: "New quote" };

const fr = {
  module: {
    title: "Devis / Facturation",
    description:
      "Composez vos devis ligne par ligne (quantités, prix, remises), suivez les totaux HT / TVA / TTC en direct et déroulez le cycle brouillon → envoyé → payé, avec aperçu imprimable. Tout est manipulable dans le Simulateur.",
    badgeCategory: "Métier",
    openSimulator: "Ouvrir le simulateur",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulateur",
    aboutTitle: "À propos",
    aboutBody:
      "Le module Devis / Facturation couvre le quotidien d'une petite structure de services : créer un devis pour un client, le composer ligne par ligne (désignation, quantité, prix unitaire, remise optionnelle), suivre les totaux HT / TVA 20 % / TTC recalculés en direct, puis dérouler le cycle de vie — brouillon, envoyé au client, payé. Un devis payé est verrouillé ; l'aperçu imprimable produit un document propre via l'impression du navigateur.",
    componentsTitle: "Composants utilisés",
    componentsBody: [
      { c: "bpm.metricRow" },
      { t: ", " },
      { c: "bpm.table" },
      { t: " (liste des devis avec " },
      { c: "onRowClick" },
      { t: ", lignes du devis, aperçu), " },
      { c: "bpm.badge" },
      { t: " (statuts), " },
      { c: "bpm.input" },
      { t: " / " },
      { c: "bpm.numberInput" },
      { t: " (formulaire de ligne), " },
      { c: "bpm.modal" },
      { t: " (aperçu imprimable, nouveau devis), " },
      { c: "bpm.confirmModal" },
      { t: " (suppression de ligne) et " },
      { c: "bpm.toast" },
      { t: "." },
    ] as Rich,
    calcTitle: "Calculs",
    calcBody: [
      { t: "Chaque ligne vaut " },
      { c: "quantité × P.U. × (1 − remise/100)" },
      {
        t: " ; le total HT est la somme des lignes, la TVA est appliquée à 20 % et le TTC en découle. Tout est recalculé à chaque ajout, modification ou suppression de ligne — aucun montant n'est stocké en double.",
      },
    ] as Rich,
    setupTitle: "Paramétrage",
    setupBody: [
      {
        t: "Le simulateur fonctionne entièrement en local (trois devis seedés, aucune API requise). En production, brancher la persistance sur votre base, l'envoi sur votre service e-mail et la génération PDF sur l'impression navigateur ou un moteur dédié. Voir la ",
      },
      { l: "documentation" },
      { t: " pour le modèle de données, la numérotation et le cycle de statuts." },
    ] as Rich,
  },

  simPage: {
    breadcrumbSimulator: "Simulateur",
    title: "Simulateur — Devis / Facturation",
    description:
      "Trois devis seedés (ACME en brouillon, Nordis envoyé, Globex payé). Sélectionnez un devis dans la liste, ajoutez ou modifiez des lignes, envoyez-le au client, marquez-le payé, ouvrez l'aperçu imprimable : métriques et totaux sont recalculés à chaque action.",
  },

  doc: {
    breadcrumbDocumentation: "Documentation",
    title: "Documentation — Devis / Facturation",
    description:
      "Modèle de données devis / ligne, règles de calcul (remises, TVA 20 %), cycle de statuts et numérotation des documents.",
    modelTitle: "Modèle de données",
    modelBody:
      "Un devis porte l'en-tête commerciale (numéro, client, objet, dates) et son statut ; les montants ne sont jamais stockés : ils sont dérivés des lignes. Une ligne décrit une prestation avec sa quantité, son prix unitaire HT et une remise en pourcentage optionnelle.",
    modelCode: `{
  "numero": "DV-2026-104",
  "client": "ACME Industries",
  "objet": "Refonte site vitrine",
  "statut": "brouillon",          // brouillon | envoye | paye
  "dateCreation": "2026-06-09",
  "dateEnvoi": null,               // renseignée au passage en "envoye"
  "datePaiement": null,            // renseignée au passage en "paye"
  "lignes": [
    {
      "designation": "Maquettes UI (5 gabarits desktop + mobile)",
      "quantite": 5,
      "prixUnitaire": 480.0,       // HT, en euros
      "remisePct": 0               // 0–100, optionnelle (0 = aucune)
    }
  ]
}`,
    calcTitle: "Calculs et TVA",
    calcBody1: [
      {
        t: "La remise s'applique ligne par ligne, avant la TVA. Le taux unique de 20 % correspond aux prestations de services standard ; il suffit de paramétrer ",
      },
      { c: "TVA_RATE" },
      { t: " pour un autre taux (ou un taux par ligne si votre activité mélange les régimes)." },
    ] as Rich,
    calcBody2:
      "Les totaux sont recalculés à chaque ajout, édition ou suppression de ligne (mémoïsation côté interface) — aucun risque d'écart entre les lignes et le pied de document.",
    cycleTitle: "Cycle de statuts",
    cycleItems: [
      [
        { b: "Brouillon" },
        {
          t: " — état initial à la création. Lignes librement éditables ; l'envoi est bloqué tant que le devis est vide.",
        },
      ],
      [
        { b: "Envoyé" },
        { t: " — action « Envoyer au client » : " },
        { c: "dateEnvoi" },
        {
          t: " est renseignée et le montant TTC entre dans l'encours « en attente ». Les lignes restent modifiables (avenant avant acceptation).",
        },
      ],
      [
        { b: "Payé" },
        { t: " — action « Marquer payé » : " },
        { c: "datePaiement" },
        {
          t: " est renseignée, le montant bascule dans « Encaissé » et le document devient en lecture seule (valeur probante : on ne modifie pas un document réglé, on en émet un nouveau).",
        },
      ],
    ] as Rich[],
    cycleBody:
      "Les transitions sont strictement séquentielles (brouillon → envoyé → payé) ; il n'y a pas de retour en arrière. Pour annuler un devis envoyé, on le laisse expirer (validité 30 jours) ou on émet un devis correctif.",
    numberingTitle: "Numérotation",
    numberingBody: [
      { t: "Format " },
      { c: "DV-AAAA-NNN" },
      { t: " : préfixe document (" },
      { c: "DV" },
      { t: " pour devis, " },
      { c: "FA" },
      {
        t: " pour la facture émise à l'acceptation), année d'émission, puis compteur séquentiel sans trou ni réutilisation — exigence comptable. Dans le simulateur, le compteur reprend après le dernier numéro seedé (",
      },
      { c: "DV-2026-104" },
      { t: " → le prochain devis créé reçoit " },
      { c: "DV-2026-105" },
      {
        t: "). En production, le numéro est attribué par la base (séquence) au moment de la création, jamais côté client.",
      },
    ] as Rich,
    printTitle: "Impression et intégration",
    printBody: [
      {
        t: "L'aperçu met en forme l'en-tête société, le client, les lignes et les totaux, puis s'appuie sur ",
      },
      { c: "window.print()" },
      {
        t: " (seule la zone du devis est imprimée). Pour aller plus loin : persister devis et lignes en base, déclencher l'envoi d'e-mail au passage en « envoyé », et générer le PDF côté serveur si vous devez archiver les documents émis.",
      },
    ] as Rich,
    openSimulator: "Ouvrir le simulateur",
  },

  sim: {
    metricOpen: "Devis en cours",
    metricPending: "Montant TTC en attente",
    metricCollected: "Encaissé",
    status: { brouillon: "Brouillon", envoye: "Envoyé", paye: "Payé" },
    quotesPanelTitle: "Devis",
    listHint: "Cliquez sur une ligne pour ouvrir le devis dans l'éditeur ci-dessous.",
    newQuote: "Nouveau devis",
    colNumber: "Numéro",
    colClient: "Client",
    colSubject: "Objet",
    colTotalTTC: "Total TTC",
    colStatus: "Statut",
    editorTitle: (numero: string, objet: string) => `Éditeur — ${numero} · ${objet}`,
    createdOn: (date: string) => `créé le ${date}`,
    sentOn: (date: string) => `envoyé ${date}`,
    paidOn: (date: string) => `payé ${date}`,
    justNow: "à l'instant",
    /** « le 4 juin 2026 » — utilisé quand la phrase attend un complément de date. */
    onDate: (date: string) => `le ${date}`,
    sendToClient: "Envoyer au client",
    markPaid: "Marquer payé",
    previewPrint: "Aperçu / Imprimer",
    readOnlyBanner: (date: string) =>
      `Devis payé ${date} : document verrouillé, les lignes ne sont plus modifiables (lecture seule). Créez un nouveau devis pour une prestation complémentaire.`,
    colDesignation: "Désignation",
    colQty: "Qté",
    colUnitPrice: "P.U. HT",
    colDiscount: "Remise",
    colLineTotal: "Total HT",
    colActions: "Actions",
    editLineBtn: "✎ Modifier",
    deleteLineBtn: "Supprimer",
    editLineAria: (designation: string) => `Modifier la ligne ${designation}`,
    emptyLines: "Aucune ligne — ajoutez la première prestation ci-dessous.",
    totalHT: "Total HT",
    vat20: "TVA 20 %",
    totalTTC: "Total TTC",
    pct: (n: number) => `${n} %`,
    formEditTitle: "Modifier la ligne",
    formAddTitle: "Ajouter une ligne",
    fieldDesignation: "Désignation",
    fieldDesignationPlaceholder: "Ex. Atelier de cadrage (jour)",
    fieldQty: "Quantité",
    fieldUnitPrice: "P.U. HT (€)",
    fieldUnitPricePlaceholder: "0,00",
    fieldDiscount: "Remise (%)",
    errDesignation: "La désignation est obligatoire.",
    errQty: "La quantité doit être supérieure à zéro.",
    errUnitPrice: "Indiquez un prix unitaire (HT) valide.",
    errDiscount: "La remise doit être comprise entre 0 et 100 %.",
    saveLine: "Enregistrer la ligne",
    addLine: "Ajouter la ligne",
    cancelEdit: "Annuler la modification",
    readOnlyHint: "Édition désactivée : un devis payé ne peut plus être modifié.",
    previewTitle: (numero: string) => `Aperçu — ${numero}`,
    quoteNo: (numero: string) => `Devis n° ${numero}`,
    issuedValidity: (date: string) => `Émis le ${date} · Validité 30 jours`,
    clientLabel: "Client :",
    terms: "Conditions : acompte de 30 % à la commande, solde à la livraison. TVA 20 % — paiement à 30 jours.",
    close: "Fermer",
    print: "Imprimer",
    newQuoteTitle: "Nouveau devis",
    newQuoteIntro: (numero: string) => `Le numéro ${numero} sera attribué automatiquement (brouillon).`,
    newClientLabel: "Client (obligatoire)",
    newClientPlaceholder: "Ex. Initech SARL",
    newSubjectLabel: "Objet",
    newSubjectPlaceholder: "Ex. Application mobile interne",
    errClient: "Le nom du client est obligatoire.",
    cancel: "Annuler",
    createQuote: "Créer le devis",
    confirmDeleteTitle: "Supprimer la ligne",
    confirmDeleteMsg: (designation: string, amount: string) =>
      `« ${designation} » (${amount} HT) sera retirée du devis. Les totaux seront recalculés.`,
    confirmDelete: "Supprimer",
    toastCategory: "Devis & facturation",
    toastLineUpdatedTitle: "Ligne modifiée",
    toastLineUpdated: (designation: string) => `Ligne « ${designation} » mise à jour.`,
    toastLineAddedTitle: "Ligne ajoutée",
    toastLineAdded: (designation: string, amount: string) => `Ligne « ${designation} » ajoutée (${amount} HT).`,
    toastLineDeletedTitle: "Ligne supprimée",
    toastLineDeleted: (designation: string) => `Ligne « ${designation} » supprimée.`,
    toastEmptyTitle: "Devis vide",
    toastEmpty: "Ajoutez au moins une ligne avant d'envoyer le devis.",
    toastSentTitle: "Devis envoyé",
    toastSent: (numero: string, client: string, amount: string) =>
      `Devis ${numero} envoyé à ${client} (${amount} TTC).`,
    toastPaidTitle: "Devis payé",
    toastPaid: (amount: string, numero: string) =>
      `Paiement de ${amount} enregistré pour ${numero}. Le devis passe en lecture seule.`,
    toastCreatedTitle: "Devis créé",
    toastCreated: (numero: string, client: string) =>
      `Devis ${numero} créé pour ${client} (brouillon). Ajoutez des lignes puis envoyez-le.`,
  },
};

const en: typeof fr = {
  module: {
    title: "Quotes / Invoicing",
    description:
      "Build your quotes line by line (quantities, prices, discounts), track the excl. VAT / VAT / incl. VAT totals in real time and walk through the draft → sent → paid cycle, with a printable preview. Everything can be tried out in the Simulator.",
    badgeCategory: "Business",
    openSimulator: "Open the simulator",
    tabDocumentation: "Documentation",
    tabSimulator: "Simulator",
    aboutTitle: "About",
    aboutBody:
      "The Quotes / Invoicing module covers the day-to-day needs of a small services business: create a quote for a client, build it line by line (description, quantity, unit price, optional discount), track the excl. VAT / VAT 20% / incl. VAT totals recalculated live, then walk through the lifecycle — draft, sent to the client, paid. A paid quote is locked; the printable preview produces a clean document through the browser print dialog.",
    componentsTitle: "Components used",
    componentsBody: [
      { c: "bpm.metricRow" },
      { t: ", " },
      { c: "bpm.table" },
      { t: " (quote list with " },
      { c: "onRowClick" },
      { t: ", quote lines, preview), " },
      { c: "bpm.badge" },
      { t: " (statuses), " },
      { c: "bpm.input" },
      { t: " / " },
      { c: "bpm.numberInput" },
      { t: " (line form), " },
      { c: "bpm.modal" },
      { t: " (printable preview, new quote), " },
      { c: "bpm.confirmModal" },
      { t: " (line deletion) and " },
      { c: "bpm.toast" },
      { t: "." },
    ] as Rich,
    calcTitle: "Calculations",
    calcBody: [
      { t: "Each line is worth " },
      { c: "quantity × unit price × (1 − discount/100)" },
      {
        t: "; the total excl. VAT is the sum of the lines, VAT is applied at 20% and the total incl. VAT follows. Everything is recalculated on every line addition, edit or deletion — no amount is ever stored twice.",
      },
    ] as Rich,
    setupTitle: "Configuration",
    setupBody: [
      {
        t: "The simulator runs entirely locally (three seeded quotes, no API required). In production, wire persistence to your database, sending to your e-mail service and PDF generation to the browser print dialog or a dedicated engine. See the ",
      },
      { l: "documentation" },
      { t: " for the data model, numbering and status lifecycle." },
    ] as Rich,
  },

  simPage: {
    breadcrumbSimulator: "Simulator",
    title: "Simulator — Quotes / Invoicing",
    description:
      "Three seeded quotes (ACME as a draft, Nordis sent, Globex paid). Select a quote from the list, add or edit lines, send it to the client, mark it as paid, open the printable preview: metrics and totals are recalculated after every action.",
  },

  doc: {
    breadcrumbDocumentation: "Documentation",
    title: "Documentation — Quotes / Invoicing",
    description:
      "Quote / line data model, calculation rules (discounts, VAT 20%), status lifecycle and document numbering.",
    modelTitle: "Data model",
    modelBody:
      "A quote carries the commercial header (number, client, subject, dates) and its status; amounts are never stored: they are derived from the lines. A line describes a service with its quantity, unit price excl. VAT and an optional percentage discount.",
    modelCode: `{
  "numero": "DV-2026-104",
  "client": "ACME Industries",
  "objet": "Showcase website redesign",
  "statut": "brouillon",          // brouillon | envoye | paye
  "dateCreation": "2026-06-09",
  "dateEnvoi": null,               // set when moving to "envoye"
  "datePaiement": null,            // set when moving to "paye"
  "lignes": [
    {
      "designation": "UI mockups (5 desktop + mobile templates)",
      "quantite": 5,
      "prixUnitaire": 480.0,       // excl. VAT, in euros
      "remisePct": 0               // 0–100, optional (0 = none)
    }
  ]
}`,
    calcTitle: "Calculations and VAT",
    calcBody1: [
      {
        t: "The discount is applied line by line, before VAT. The single 20% rate matches standard service work; just adjust ",
      },
      { c: "TVA_RATE" },
      { t: " for another rate (or a per-line rate if your business mixes VAT regimes)." },
    ] as Rich,
    calcBody2:
      "Totals are recalculated on every line addition, edit or deletion (memoised on the interface side) — no risk of drift between the lines and the document footer.",
    cycleTitle: "Status lifecycle",
    cycleItems: [
      [
        { b: "Draft" },
        {
          t: " — initial state on creation. Lines can be edited freely; sending is blocked while the quote is empty.",
        },
      ],
      [
        { b: "Sent" },
        { t: " — “Send to client” action: " },
        { c: "dateEnvoi" },
        {
          t: " is set and the incl. VAT amount joins the “pending” outstanding balance. Lines remain editable (amendment before acceptance).",
        },
      ],
      [
        { b: "Paid" },
        { t: " — “Mark as paid” action: " },
        { c: "datePaiement" },
        {
          t: " is set, the amount moves to “Collected” and the document becomes read-only (evidential value: a settled document is never modified — a new one is issued).",
        },
      ],
    ] as Rich[],
    cycleBody:
      "Transitions are strictly sequential (draft → sent → paid); there is no going back. To cancel a sent quote, let it expire (valid for 30 days) or issue a corrective quote.",
    numberingTitle: "Numbering",
    numberingBody: [
      { t: "Format " },
      { c: "DV-YYYY-NNN" },
      { t: ": document prefix (" },
      { c: "DV" },
      { t: " for quotes, " },
      { c: "FA" },
      {
        t: " for the invoice issued on acceptance), issue year, then a sequential counter with no gaps and no reuse — an accounting requirement. In the simulator, the counter resumes after the last seeded number (",
      },
      { c: "DV-2026-104" },
      { t: " → the next quote created gets " },
      { c: "DV-2026-105" },
      {
        t: "). In production, the number is assigned by the database (sequence) at creation time, never on the client side.",
      },
    ] as Rich,
    printTitle: "Printing and integration",
    printBody: [
      {
        t: "The preview lays out the company header, the client, the lines and the totals, then relies on ",
      },
      { c: "window.print()" },
      {
        t: " (only the quote area is printed). To go further: persist quotes and lines in a database, trigger the e-mail when a quote moves to “sent”, and generate the PDF server-side if you need to archive issued documents.",
      },
    ] as Rich,
    openSimulator: "Open the simulator",
  },

  sim: {
    metricOpen: "Open quotes",
    metricPending: "Pending incl. VAT",
    metricCollected: "Collected",
    status: { brouillon: "Draft", envoye: "Sent", paye: "Paid" },
    quotesPanelTitle: "Quotes",
    listHint: "Click a row to open the quote in the editor below.",
    newQuote: "New quote",
    colNumber: "Number",
    colClient: "Client",
    colSubject: "Subject",
    colTotalTTC: "Total incl. VAT",
    colStatus: "Status",
    editorTitle: (numero: string, objet: string) => `Editor — ${numero} · ${objet}`,
    createdOn: (date: string) => `created on ${date}`,
    sentOn: (date: string) => `sent ${date}`,
    paidOn: (date: string) => `paid ${date}`,
    justNow: "just now",
    /** "on June 4, 2026" — used where the sentence expects a date complement. */
    onDate: (date: string) => `on ${date}`,
    sendToClient: "Send to client",
    markPaid: "Mark as paid",
    previewPrint: "Preview / Print",
    readOnlyBanner: (date: string) =>
      `Quote paid ${date}: the document is locked and its lines can no longer be edited (read-only). Create a new quote for any follow-up work.`,
    colDesignation: "Description",
    colQty: "Qty",
    colUnitPrice: "Unit price excl. VAT",
    colDiscount: "Discount",
    colLineTotal: "Total excl. VAT",
    colActions: "Actions",
    editLineBtn: "✎ Edit",
    deleteLineBtn: "Delete",
    editLineAria: (designation: string) => `Edit line ${designation}`,
    emptyLines: "No lines yet — add the first item below.",
    totalHT: "Total excl. VAT",
    vat20: "VAT 20%",
    totalTTC: "Total incl. VAT",
    pct: (n: number) => `${n}%`,
    formEditTitle: "Edit line",
    formAddTitle: "Add a line",
    fieldDesignation: "Description",
    fieldDesignationPlaceholder: "E.g. Scoping workshop (day)",
    fieldQty: "Quantity",
    fieldUnitPrice: "Unit price excl. VAT (€)",
    fieldUnitPricePlaceholder: "0.00",
    fieldDiscount: "Discount (%)",
    errDesignation: "A description is required.",
    errQty: "Quantity must be greater than zero.",
    errUnitPrice: "Enter a valid unit price (excl. VAT).",
    errDiscount: "The discount must be between 0 and 100%.",
    saveLine: "Save line",
    addLine: "Add line",
    cancelEdit: "Cancel editing",
    readOnlyHint: "Editing disabled: a paid quote can no longer be modified.",
    previewTitle: (numero: string) => `Preview — ${numero}`,
    quoteNo: (numero: string) => `Quote no. ${numero}`,
    issuedValidity: (date: string) => `Issued on ${date} · Valid for 30 days`,
    clientLabel: "Client:",
    terms: "Terms: 30% deposit on order, balance on delivery. VAT 20% — payment within 30 days.",
    close: "Close",
    print: "Print",
    newQuoteTitle: "New quote",
    newQuoteIntro: (numero: string) => `Number ${numero} will be assigned automatically (draft).`,
    newClientLabel: "Client (required)",
    newClientPlaceholder: "E.g. Initech SARL",
    newSubjectLabel: "Subject",
    newSubjectPlaceholder: "E.g. Internal mobile app",
    errClient: "The client name is required.",
    cancel: "Cancel",
    createQuote: "Create quote",
    confirmDeleteTitle: "Delete line",
    confirmDeleteMsg: (designation: string, amount: string) =>
      `“${designation}” (${amount} excl. VAT) will be removed from the quote. Totals will be recalculated.`,
    confirmDelete: "Delete",
    toastCategory: "Quotes & invoicing",
    toastLineUpdatedTitle: "Line updated",
    toastLineUpdated: (designation: string) => `Line “${designation}” updated.`,
    toastLineAddedTitle: "Line added",
    toastLineAdded: (designation: string, amount: string) =>
      `Line “${designation}” added (${amount} excl. VAT).`,
    toastLineDeletedTitle: "Line deleted",
    toastLineDeleted: (designation: string) => `Line “${designation}” deleted.`,
    toastEmptyTitle: "Empty quote",
    toastEmpty: "Add at least one line before sending the quote.",
    toastSentTitle: "Quote sent",
    toastSent: (numero: string, client: string, amount: string) =>
      `Quote ${numero} sent to ${client} (${amount} incl. VAT).`,
    toastPaidTitle: "Quote paid",
    toastPaid: (amount: string, numero: string) =>
      `Payment of ${amount} recorded for ${numero}. The quote is now read-only.`,
    toastCreatedTitle: "Quote created",
    toastCreated: (numero: string, client: string) =>
      `Quote ${numero} created for ${client} (draft). Add lines, then send it.`,
  },
};

export const STR: Record<Locale, typeof fr> = { fr, en };
