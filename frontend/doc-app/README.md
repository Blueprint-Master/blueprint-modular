# Site doc Blueprint Modular (BPM)

Site de documentation construit **uniquement avec les composants BPM** (aucun Streamlit).

- **Composants doc** : `DocLayout`, `DocNav`, `DocSidebar`, `CodeBlock` (dans `../bpm/`).
- **Composants BPM** : `Panel`, `Button`, etc. pour le contenu des pages.
- **Stack** : React, React Router, Vite.

## Prérequis

- Node.js 18+
- Logo : copier `../Logo BPM.png` vers `public/Logo BPM.png` pour la nav.

## Installation

```bash
cd doc-app
npm install
cp "../Logo BPM.png" "public/Logo BPM.png"
```

## Dev

```bash
npm run dev
```

Ouvrir http://localhost:5173.

## Build (pour déploiement)

```bash
npm run build
```

Les fichiers statiques sont dans `dist/`. Servir ce dossier avec Nginx (ou déployer sur un hébergeur statique).
