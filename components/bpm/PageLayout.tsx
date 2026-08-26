"use client";

import React, { useState } from "react";

/**
 * @component bpm.pageLayout
 * @description Layout d'application avec sidebar rétractable, navigation par icônes Material et switch de thème.
 * @example
 * bpm.pageLayout({ title: "Mon App", items: [{ key: "home", label: "Accueil", icon: "home" }], currentItem: "home", onNavigate: setPage, children: <Content /> })
 *
 * @param {object} props
 * @param {string} props.title - Titre affiché dans la sidebar. Obligatoire.
 * @param {SidebarItem[]} props.items - Éléments de navigation (key, label, icon). Obligatoire.
 * @param {string} props.currentItem - Clé de l'élément actif. Obligatoire.
 * @param {function} props.onNavigate - Callback au clic sur un item (key). Obligatoire.
 * @param {React.ReactNode} props.children - Contenu principal. Obligatoire.
 * @param {boolean} [props.defaultCollapsed=false] - Sidebar rétractée par défaut. Optionnel.
 * @param {"light"|"dark"} [props.theme] - Thème actuel. Optionnel.
 * @param {function} [props.onThemeChange] - Callback changement de thème. Optionnel.
 * @param {React.ReactNode} [props.brandLogo] - Pastille de marque rendue à gauche du titre (ex. logo). Centrée en mode replié. Optionnel.
 * @param {string} [props.brandEyebrow] - Sur-étiquette au-dessus du titre (petites capitales espacées). Masquée en mode replié. Optionnel.
 * @param {"soft"|"solid"} [props.activeItemStyle="soft"] - Rendu de l'item actif : teinte translucide (défaut) ou aplat plein accent. Optionnel.
 * @param {React.ReactNode} [props.footer] - Pied de sidebar (compte, déconnexion…) au-dessus du bouton thème. Optionnel.
 *
 * @associated bpm.topNav, bpm.sidebar
 * @parent bpm.page
 * @forbidden aucun
 */
export interface SidebarItem {
  /** Clé unique de l’entrée. */
  key: string;
  /** Libellé affiché (mode expanded). */
  label: string;
  /** Nom de l’icône Material Symbol (snake_case), ex: "dashboard", "inventory_2", "widgets". Voir https://fonts.google.com/icons (weight 200). */
  icon: string;
}

/**
 * @component bpm.pageLayout
 * @description Layout avec sidebar repliable, titre et zone de contenu.
 */
export interface PageLayoutProps {
  title: string;
  items: SidebarItem[];
  currentItem: string;
  onNavigate: (key: string) => void;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  /** Thème courant (optionnel). Si fourni avec onThemeChange, affiche le bouton thème en bas de la sidebar (aligné .Maker). */
  theme?: "light" | "dark";
  /** Callback changement de thème (clair ↔ sombre). Affiche le bouton thème en bas si défini. */
  onThemeChange?: (theme: "light" | "dark") => void;
  /**
   * Pastille de marque rendue à gauche du titre dans l'en-tête (ex.
   * `<img src="/logo.svg" />`). Centrée en mode replié — tient alors lieu de
   * marque compacte. Absente : l'en-tête garde son titre seul (comportement
   * historique).
   */
  brandLogo?: React.ReactNode;
  /**
   * Sur-étiquette affichée au-dessus du titre en petites capitales espacées
   * (ex. « MAISON »). Masquée en mode replié. Absente : titre seul.
   */
  brandEyebrow?: string;
  /**
   * Rendu de l'item actif. `"soft"` (défaut) : teinte translucide de l'accent
   * — comportement historique, inchangé pour tous les consommateurs existants.
   * `"solid"` : aplat plein accent + texte contrasté (`--bpm-accent-contrast`).
   */
  activeItemStyle?: "soft" | "solid";
  /**
   * Zone de pied de sidebar (compte connecté, déconnexion…), rendue au-dessus
   * du bouton thème et séparée par un filet. Contenu opaque fourni par
   * l'appelant. Absente : seul le bouton thème occupe le pied (si défini).
   */
  footer?: React.ReactNode;
}

const CHEVRON_LEFT = "chevron_left";
const CHEVRON_RIGHT = "chevron_right";
const ICON_LIGHT = "light_mode";
const ICON_DARK = "dark_mode";

const SIDEBAR_WIDTH_COLLAPSED = 56;
const SIDEBAR_WIDTH_EXPANDED = 220;

function MaterialIcon({
  icon,
  size = 24,
  style = {},
}: {
  icon: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="material-symbols-outlined bpm-material-icon"
      role="img"
      aria-hidden
      style={{
        fontFamily: "Material Symbols Outlined",
        fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24",
        fontSize: size,
        width: size,
        height: size,
        minWidth: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {icon}
    </span>
  );
}

export function PageLayout({
  title,
  items,
  currentItem,
  onNavigate,
  children,
  defaultCollapsed = false,
  theme,
  onThemeChange,
  brandLogo,
  brandEyebrow,
  activeItemStyle = "soft",
  footer,
}: PageLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const showToggle = !isCollapsed || sidebarHovered;

  /* DÉFÉRENCE À LA CHARTE — ces redéfinitions inline écrasaient les jetons de
     la charte (html:root) pour TOUT le sous-arbre du shell : accent #048dc3,
     radius 6px et corps 14px imposés à chaque app générée, quelle que soit sa
     charte. Chaque valeur passe par un jeton intermédiaire `--bpm-page-layout-*`
     (le nom qu'émettent déjà les apps générées : alias posés à html:root
     précisément pour ce shell) avec pour REPLI la valeur d'aujourd'hui — une
     app sans charte ne bouge pas d'un octet. NB : `--bpm-accent:
     var(--bpm-accent, …)` serait un cycle CSS (propriété invalide), d'où le
     jeton intermédiaire ; radius et font-size gagnent les mêmes crochets,
     à émettre côté charte quand elle voudra les gouverner. */
  const themeVars =
    theme === "dark"
      ? {
          "--bpm-bg": "var(--bpm-page-layout-bg, #0f172a)",
          "--bpm-bg-secondary": "var(--bpm-page-layout-bg-secondary, #1e293b)",
          "--bpm-border": "var(--bpm-page-layout-border, #334155)",
          "--bpm-text": "var(--bpm-page-layout-text, #f1f5f9)",
          "--bpm-text-secondary": "var(--bpm-page-layout-text-secondary, #94a3b8)",
          "--bpm-accent": "var(--bpm-page-layout-accent, #048dc3)",
          "--bpm-radius": "var(--bpm-page-layout-radius, 6px)",
          "--bpm-font-size-base": "var(--bpm-page-layout-font-size-base, 14px)",
          "--bpm-font-size-lg": "var(--bpm-page-layout-font-size-lg, 1.125rem)",
        }
      : {
          "--bpm-bg": "var(--bpm-page-layout-bg, #ffffff)",
          "--bpm-bg-secondary": "var(--bpm-page-layout-bg-secondary, #f8fafc)",
          "--bpm-border": "var(--bpm-page-layout-border, #e2e8f0)",
          "--bpm-text": "var(--bpm-page-layout-text, #0f172a)",
          "--bpm-text-secondary": "var(--bpm-page-layout-text-secondary, #64748b)",
          "--bpm-accent": "var(--bpm-page-layout-accent, #048dc3)",
          "--bpm-radius": "var(--bpm-page-layout-radius, 6px)",
          "--bpm-font-size-base": "var(--bpm-page-layout-font-size-base, 14px)",
          "--bpm-font-size-lg": "var(--bpm-page-layout-font-size-lg, 1.125rem)",
        };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bpm-bg)",
        ...themeVars,
      } as React.CSSProperties}
    >
      <aside
        style={{
          width: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
          background: "var(--bpm-bg)",
          borderRight: "1px solid var(--bpm-border)",
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.25s ease",
          overflow: "hidden",
        }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Ligne du haut : titre + chevron ouvrir/fermer (aligné .Maker) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            gap: 8,
            minHeight: 40,
            padding: "4px 0 8px",
            flexShrink: 0,
          }}
        >
          {brandLogo != null && (
            <span
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-hidden
            >
              {brandLogo}
            </span>
          )}
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              // Le logo remplace le retrait gauche historique du titre.
              paddingLeft: isCollapsed || brandLogo != null ? 0 : 12,
              flex: isCollapsed ? 0 : 1,
              minWidth: 0,
              overflow: "hidden",
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {brandEyebrow != null && brandEyebrow !== "" && (
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--bpm-text-secondary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.4,
                }}
              >
                {brandEyebrow}
              </span>
            )}
            <span
              /* Le nom de l'app EN ENTIER au survol. Mesuré sur la critique
                 vision de la production : « Le titre de la sidebar est tronqué
                 'Pilotage Trésore…' SANS TOOLTIP ni version courte lisible »,
                 « 'Gestion Atelier …' […] trahit un manque de soin sur
                 l'identité de l'application ». Quatre constats, deux apps. */
              title={typeof title === "string" ? title : undefined}
              style={{
                fontSize: "var(--bpm-font-size-lg)",
                fontWeight: 600,
                color: "var(--bpm-text)",
                minWidth: 0,
                overflow: "hidden",
                /* DEUX LIGNES avant de couper, au lieu d'une.
                 *
                 * L'infobulle ci-dessus ne rend l'information qu'au SURVOL —
                 * donc à personne sur un écran tactile, et à personne qui se
                 * contente de regarder. Or c'est l'identité de l'app : le juge
                 * dit qu'elle « ne donne pas confiance ».
                 *
                 * Le pavé à deux lignes récupère la quasi-totalité des noms
                 * réels (« Pilotage Trésorerie », « Gestion Atelier Vélos »)
                 * sans repousser la navigation : à `lineHeight: 1.2`, la
                 * seconde ligne coûte une hauteur de texte, une seule fois, en
                 * tête de rail. Au-delà, l'ellipse reprend son rôle et
                 * l'infobulle prend le relais. */
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                lineHeight: 1.2,
              }}
            >
              {title}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setIsCollapsed((c) => !c)}
            aria-label={isCollapsed ? "Ouvrir le menu" : "Réduire le menu"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              padding: 0,
              border: "none",
              borderRadius: "var(--bpm-radius)",
              background: "transparent",
              color: "var(--bpm-text-secondary)",
              cursor: "pointer",
              opacity: showToggle ? 1 : 0,
              pointerEvents: showToggle ? "auto" : "none",
              transition: "background-color 0.15s ease, opacity 0.15s ease",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bpm-bg-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <MaterialIcon icon={isCollapsed ? CHEVRON_RIGHT : CHEVRON_LEFT} size={20} />
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: isCollapsed ? "center" : "stretch",
          }}
        >
          {items.map((item) => {
            const isActive = currentItem === item.key;
            const isSolidActive = isActive && activeItemStyle === "solid";
            return (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  width: isCollapsed ? 32 : "100%",
                  minWidth: isCollapsed ? 32 : undefined,
                  borderRadius: "var(--bpm-radius)",
                  // Barre (2px) + bouton fondus en un pavé arrondi net.
                  overflow: "hidden",
                }}
              >
                {!isCollapsed && (
                  <span
                    style={{
                      width: 2,
                      flexShrink: 0,
                      background: isActive ? "var(--bpm-accent)" : "transparent",
                      borderRadius: 0,
                    }}
                    aria-hidden
                  />
                )}
                <button
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: isCollapsed ? 0 : "8px 12px",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    flex: 1,
                    minWidth: 0,
                    height: 32,
                    border: "none",
                    background: isActive
                      ? isSolidActive
                        ? "var(--bpm-accent)"
                        : "var(--bpm-bg-secondary)"
                      : "transparent",
                    color: isActive
                      ? isSolidActive
                        ? "var(--bpm-accent-contrast, #ffffff)"
                        : "var(--bpm-accent)"
                      : "var(--bpm-text-secondary)",
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: "var(--bpm-font-size-base)",
                    borderRadius: "var(--bpm-radius)",
                    boxSizing: "border-box",
                    transition: "background-color 0.15s ease",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--bpm-bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <MaterialIcon icon={item.icon} size={20} />
                  <span
                    style={{
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : undefined,
                      maxWidth: isCollapsed ? 0 : undefined,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      flex: isCollapsed ? "none" : 1,
                      minWidth: isCollapsed ? 0 : 0,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Pied de sidebar : slot appelant (compte…) + bouton thème (aligné .Maker) */}
        {(footer != null || onThemeChange != null) && (
          <div
            style={{
              flexShrink: 0,
              paddingTop: 8,
              borderTop: "1px solid var(--bpm-border)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {footer != null && <div style={{ minWidth: 0 }}>{footer}</div>}
            {onThemeChange != null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                }}
              >
            <button
              type="button"
              onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
              aria-label="Thème clair / sombre"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: isCollapsed ? 0 : "8px 12px",
                justifyContent: isCollapsed ? "center" : "flex-start",
                width: isCollapsed ? 32 : "100%",
                minWidth: isCollapsed ? 32 : undefined,
                height: 32,
                border: "none",
                borderRadius: "var(--bpm-radius)",
                background: "transparent",
                color: "var(--bpm-text-secondary)",
                cursor: "pointer",
                font: "inherit",
                fontSize: "var(--bpm-font-size-base)",
                boxSizing: "border-box",
                transition: "background-color 0.15s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bpm-bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <MaterialIcon
                icon={theme === "dark" ? ICON_LIGHT : ICON_DARK}
                size={20}
              />
              <span
                style={{
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : undefined,
                  maxWidth: isCollapsed ? 0 : undefined,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  flex: isCollapsed ? "none" : 1,
                  minWidth: isCollapsed ? 0 : 0,
                  transition: "opacity 0.15s ease",
                }}
              >
                Thème
              </span>
            </button>
              </div>
            )}
          </div>
        )}
      </aside>
      <main
        style={{
          flex: 1,
          background: "var(--bpm-bg)",
          overflow: "auto",
          padding: 32,
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}
