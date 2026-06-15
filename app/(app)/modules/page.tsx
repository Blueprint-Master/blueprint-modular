"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Bell, BookMarked, Bot, Calendar, FileText, LayoutDashboard, Link2, Mail, MessageSquare, Monitor, Package, PenTool, Radio, Settings, Shield, StickyNote, Sun, Table2, Webhook } from "lucide-react";
import { Input, Card, Caption } from "@/components/bpm";
import { CatalogueHero, CatalogueSection } from "@/components/site/CatalogueLayout";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { fmt, type Dictionary } from "@/lib/i18n";

/** Catégories dans l’ordre d’affichage. À l’intérieur de chaque catégorie, les modules sont triés par label. */
const CATEGORY_ORDER = [
  "Authentification",
  "Contenu & productivité",
  "Données & reporting",
  "Processus & workflow",
  "Intégrations & technique",
  "Métier",
] as const;

/** Clé i18n par catégorie : le libellé affiché bascule FR/EN via dict.modulesCatalog.categories. */
const CATEGORY_I18N_KEY: Record<(typeof CATEGORY_ORDER)[number], keyof Dictionary["modulesCatalog"]["categories"]> = {
  Authentification: "auth",
  "Contenu & productivité": "content",
  "Données & reporting": "data",
  "Processus & workflow": "process",
  "Intégrations & technique": "integrations",
  Métier: "business",
};

type ModuleEntry = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  simulatorAndDoc: boolean;
  /** Si défini, le lien « Simulateur » pointe vers cette URL au lieu de href/simulateur (ex. Wiki → page du module). */
  simulateurHref?: string;
};

const MODULES_BY_CATEGORY: Record<(typeof CATEGORY_ORDER)[number], ModuleEntry[]> = {
  Authentification: [
    { href: "/modules/auth", label: "Auth", description: "Authentification Google & e-mail, gestion de sessions et whitelist utilisateurs.", icon: Shield, simulatorAndDoc: true },
  ],
  "Contenu & productivité": [
    { href: "/modules/calendrier/simulateur", label: "Calendrier", description: "Agenda jour / semaine / mois, événements et rappels.", icon: Calendar, simulatorAndDoc: true, simulateurHref: "/modules/calendrier/simulateur" },
    { href: "/modules/commentaires", label: "Commentaires", description: "Commentaires et annotations sur une entité (document, ligne, projet).", icon: MessageSquare, simulatorAndDoc: true },
    { href: "/modules/skeleton", label: "Skeleton", description: "Assemblages de bpm.skeleton pour un chargement de page complet (header, métriques, tableau).", icon: LayoutDashboard, simulatorAndDoc: true },
    { href: "/modules/tableau-blanc", label: "Tableau blanc", description: "Post-it et zones de texte pour rétros ou ateliers.", icon: StickyNote, simulatorAndDoc: true },
    { href: "/modules/templates", label: "Templates", description: "Bibliothèque de modèles (rapports, fiches, emails) avec champs à remplir.", icon: FileText, simulatorAndDoc: true },
    { href: "/modules/newsletter", label: "Newsletter", description: "Photo de header, création d'articles et archivage des numéros.", icon: Mail, simulatorAndDoc: true, simulateurHref: "/modules/newsletter" },
    { href: "/modules/wiki", label: "Wiki", description: "Créez et gérez des articles internes en Markdown avec arborescence et publication.", icon: BookMarked, simulatorAndDoc: true, simulateurHref: "/modules/wiki" },
    { href: "/modules/monitor", label: "Monitor", description: "Téléprompte IA pour présentations — import PPTX, suggestions Q&R, traduction et résumé de séance.", icon: Monitor, simulatorAndDoc: true, simulateurHref: "/modules/monitor" },
    { href: "/modules/keep-screen-on", label: "Keep screen on", description: "Gardez l'écran allumé pendant une présentation ou une réunion — durée réglable ou indéfinie.", icon: Sun, simulatorAndDoc: true, simulateurHref: "/modules/keep-screen-on" },
  ],
  "Données & reporting": [
    { href: "/modules/asset-manager", label: "Gestion de parc", description: "Gestion de parc : actifs, tickets et mise à disposition configurables par domaine (IT, maintenance).", icon: Package, simulatorAndDoc: true, simulateurHref: "/modules/asset-manager" },
    { href: "/modules/contracts", label: "Base contractuelle", description: "Centralisez contrats fournisseurs et CGV, analysez-les avec l'IA.", icon: FileText, simulatorAndDoc: true, simulateurHref: "/modules/contracts" },
    { href: "/modules/documents", label: "Analyse de documents", description: "Uploadez, analysez et interrogez vos documents PDF, Word et plus avec l'IA.", icon: FileText, simulatorAndDoc: true },
    { href: "/modules/export-planifie", label: "Export planifié", description: "Envoi périodique par email de rapports ou exports (PDF/CSV).", icon: Mail, simulatorAndDoc: true },
    { href: "/modules/rapports", label: "Rapports", description: "Création de rapports à partir de données (champs, filtres, graphiques prédéfinis).", icon: Table2, simulatorAndDoc: true },
    { href: "/modules/referentiels", label: "Référentiels", description: "CRUD simple pour listes métier (devises, pays, types) utilisables dans les formulaires.", icon: Table2, simulatorAndDoc: true },
    { href: "/modules/tableaux-de-bord", label: "Tableaux de bord", description: "Disposition de widgets (métriques, graphiques, tableaux) par l'utilisateur.", icon: LayoutDashboard, simulatorAndDoc: true },
    { href: "/modules/veille", label: "Veille", description: "Sources (RSS, API, pages, alertes), suivi de collecte et remontée des écarts.", icon: Radio, simulatorAndDoc: true, simulateurHref: "/modules/veille" },
  ],
  "Processus & workflow": [
    { href: "/modules/audit-log", label: "Audit / Log", description: "Consultation des changements sur une entité (qui, quand, quoi).", icon: PenTool, simulatorAndDoc: true },
    { href: "/modules/notification", label: "Notification", description: "Gérez les alertes applicatives avec 3 niveaux de priorité et un historique complet.", icon: Bell, simulatorAndDoc: true },
    { href: "/modules/notifications-ciblees", label: "Notifications ciblées", description: "Règles événement → destinataires et message.", icon: Bell, simulatorAndDoc: true },
    { href: "/modules/taches", label: "Tâches", description: "Liste de tâches avec assignation, échéance et statut.", icon: PenTool, simulatorAndDoc: true },
    { href: "/modules/workflow", label: "Workflow", description: "États et transitions (brouillon → validé → archivé) avec historique.", icon: PenTool, simulatorAndDoc: true },
  ],
  "Intégrations & technique": [
    { href: "/modules/connecteurs", label: "Connecteurs", description: "Configuration de sources (API, SFTP, base) pour alimenter les données.", icon: Link2, simulatorAndDoc: true },
    { href: "/modules/ia", label: "IA", description: "Assistant conversationnel avec accès à votre Wiki, documents et données métier.", icon: Bot, simulatorAndDoc: true },
    { href: "/modules/multi-langue", label: "Multi-langue", description: "Sélection de langue et textes traduisibles pour l'UI et les contenus.", icon: Settings, simulatorAndDoc: true },
    { href: "/modules/themes", label: "Thèmes / White-label", description: "Choix de thème, logo et couleurs par instance ou client.", icon: Settings, simulatorAndDoc: true },
    { href: "/modules/webhooks", label: "Webhooks", description: "Émission d'événements vers des URLs externes (validation, création, etc.).", icon: Webhook, simulatorAndDoc: true },
  ],
  Métier: [
    { href: "/modules/catalogue-produits", label: "Catalogue produits", description: "Fiche produit, variantes, prix, stock (codes-barres / QR).", icon: Package, simulatorAndDoc: true },
    { href: "/modules/devis-facturation", label: "Devis / Facturation", description: "Lignes, totaux, PDF, statuts (brouillon, envoyé, payé).", icon: FileText, simulatorAndDoc: true },
    { href: "/modules/formulaire-dynamique", label: "Formulaire dynamique", description: "Formulaires dont les champs dépendent d'un type ou référentiel.", icon: PenTool, simulatorAndDoc: true },
    { href: "/modules/reservation-creneaux", label: "Réservation / Créneaux", description: "Choix de créneaux ou de ressources avec disponibilités.", icon: Calendar, simulatorAndDoc: true },
  ],
};

export default function ModulesPage() {
  const { dict } = useI18n();
  const t = dict.modulesCatalog;
  const [searchQuery, setSearchQuery] = useState("");
  const linkStyle = { color: "var(--bpm-accent-cyan)" };

  const keywords = useMemo(
    () =>
      searchQuery
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [searchQuery]
  );

  const filteredByCategory = useMemo(() => {
    if (keywords.length === 0) {
      return Object.fromEntries(CATEGORY_ORDER.map((cat) => [cat, MODULES_BY_CATEGORY[cat]])) as typeof MODULES_BY_CATEGORY;
    }
    const out: Partial<Record<(typeof CATEGORY_ORDER)[number], typeof MODULES_BY_CATEGORY[(typeof CATEGORY_ORDER)[number]]>> = {};
    for (const category of CATEGORY_ORDER) {
      const items = MODULES_BY_CATEGORY[category] ?? [];
      const filtered = items.filter((mod) => {
        const text = `${mod.label} ${mod.description} ${category}`.toLowerCase();
        return keywords.every((kw) => text.includes(kw));
      });
      if (filtered.length) out[category] = filtered;
    }
    return out;
  }, [keywords]);

  const totalModules = Object.values(MODULES_BY_CATEGORY).reduce((n, list) => n + list.length, 0);

  return (
    <>
      <CatalogueHero
        eyebrow={t.eyebrow}
        title={t.title}
        lead={fmt(t.lead, { count: totalModules })}
        meta={fmt(t.meta, { count: totalModules })}
      >
        <Input
          type="search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchAria}
        />
      </CatalogueHero>

      {CATEGORY_ORDER.map((category) => {
        const items = filteredByCategory[category];
        if (!items?.length) return null;
        return (
          <CatalogueSection key={category} title={t.categories[CATEGORY_I18N_KEY[category]]}>
            {items.map((mod) => {
              const Icon = mod.icon;
              return (
                <Card
                  key={mod.href}
                  variant="outlined"
                  title={
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: "var(--bpm-bg-secondary)",
                          color: "var(--bpm-accent-cyan)",
                        }}
                      >
                        <Icon className="w-5 h-5" aria-hidden />
                      </span>
                      <span style={{ color: "var(--bpm-text-primary)" }}>{mod.label}</span>
                    </span>
                  }
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Caption style={{ lineHeight: 1.6 }}>{mod.description}</Caption>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      <Link href={`${mod.href}/documentation`} className="hover:underline" style={{ ...linkStyle, fontSize: 13, fontWeight: 600 }}>
                        {t.documentation}
                      </Link>
                      {mod.simulatorAndDoc && (
                        <Link href={mod.simulateurHref ?? `${mod.href}/simulateur`} className="hover:underline" style={{ ...linkStyle, fontSize: 13, fontWeight: 600 }}>
                          {t.simulator}
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </CatalogueSection>
        );
      })}
    </>
  );
}
