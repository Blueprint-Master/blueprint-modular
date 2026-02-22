# Config-driven layout (`app.config.js`)

**Objectif** : piloter toute la structure de l’app (sidebar, header, pages) via un seul fichier de config. **Aucun concurrent ne permet de dupliquer une app en changeant un seul fichier.**

---

## 1. Principe

- Un fichier **`app.config.js`** (ou `.json`) décrit :
  - le nom de l’app, le logo, le profil utilisateur ;
  - la position de la sidebar (gauche/droite) ;
  - les **sections et liens** de la sidebar ;
  - les **liens de la nav** horizontale (optionnel) ;
  - les **pages** (path → composant ou lazy).

- Le shell **Layout** (ou un wrapper type `AppFromConfig`) lit cette config et :
  - rend la sidebar avec les bons liens ;
  - rend le header avec logo / nav ;
  - associe les routes aux bons composants.

- **Dupliquer une app** = copier le projet, modifier **uniquement** `app.config.js` (titres, liens, pages). Pas besoin de toucher au code des pages ni au Layout.

---

## 2. Schéma de `app.config.js`

Voir **`frontend/bpm/app.config.example.js`** pour un exemple complet.

| Clé | Type | Description |
|-----|------|-------------|
| `appName` | string | Nom affiché (header, titre) |
| `logoUrl` | string | URL du logo |
| `onLogoClick` | function | Action au clic sur le logo |
| `profile` | object \| null | `{ name, avatarUrl }` pour l’avatar |
| `sidebarPosition` | 'left' \| 'right' | Position de la sidebar |
| `sidebarSections` | array | `[{ title, links: [{ label, href }] }]` |
| `navLinks` | array | `[{ label, href }]` pour la barre de nav |
| `pages` | object | `{ id: { path, component } }` pour le routeur |

En React, `component` peut être une référence de composant ou un nom de module pour lazy loading.

---

## 3. Intégration avec `Layout.jsx`

Le composant **`Layout`** (Phase 2 BPM) accepte une prop **`config`**. En pratique :

1. Importer la config : `import appConfig from './app.config.js';`
2. Construire `sidebarProps` et `sidebarContent` à partir de `appConfig.sidebarSections` et `appConfig.logoUrl`, etc.
3. Passer `config={appConfig}` (ou les props dérivées) à `<Layout />`.

La doc-app utilise déjà un **`docConfig.js`** (sidebar sections, nav links) ; une app métier peut faire de même avec `app.config.js` en suivant le même schéma.

---

## 4. Fichiers

- **Exemple** : `frontend/bpm/app.config.example.js`
- **Layout** : `frontend/bpm/Layout.jsx` (commentaire « Phase 2 : piloté par config »)
- **Doc-app** : `frontend/doc-app/src/docConfig.js` (structure similaire)

---

*Voir aussi : `docs/DESIGN_SYSTEM.md`, `docs/ROADMAP.md`.*
