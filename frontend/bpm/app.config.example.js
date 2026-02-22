/**
 * Exemple app.config.js — config-driven layout BPM
 * Dupliquer une app = copier ce fichier et modifier uniquement la config.
 * Aucun concurrent (Streamlit, Dash, etc.) ne permet ça nativement.
 *
 * Usage : importer dans l'app et passer à <Layout config={config} /> ou
 * à un wrapper qui construit sidebar/header/routes à partir de config.
 */
export const appConfig = {
  /** Nom de l'app (header, titre) */
  appName: 'Mon App BPM',

  /** URL du logo (sidebar / header) */
  logoUrl: '/logo.svg',

  /** Clic sur le logo (ex. retour accueil) */
  onLogoClick: () => (window.location.href = '/'),

  /** Profil utilisateur (avatar, nom) — optionnel */
  profile: null,
  // profile: { name: 'Alice', avatarUrl: '/avatar.png' },

  /** Position de la sidebar : 'left' | 'right' */
  sidebarPosition: 'left',

  /** Sections de la sidebar : titre + liens */
  sidebarSections: [
    {
      title: 'Accueil',
      links: [{ label: 'Dashboard', href: '/' }],
    },
    {
      title: 'Données',
      links: [
        { label: 'Tableaux', href: '/data/tables' },
        { label: 'Graphiques', href: '/data/charts' },
      ],
    },
    {
      title: 'Paramètres',
      links: [{ label: 'Config', href: '/settings' }],
    },
  ],

  /** Liens principaux pour la nav horizontale (optionnel) */
  navLinks: [
    { label: 'Accueil', href: '/' },
    { label: 'Données', href: '/data/tables' },
    { label: 'Paramètres', href: '/settings' },
  ],

  /** Pages (pour router) : id → { path, component ou lazy } */
  pages: {
    home: { path: '/', component: 'HomePage' },
    tables: { path: '/data/tables', component: 'TablesPage' },
    charts: { path: '/data/charts', component: 'ChartsPage' },
    settings: { path: '/settings', component: 'SettingsPage' },
  },
};

export default appConfig;
