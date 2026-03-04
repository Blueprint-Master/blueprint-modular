# @blueprint-modular/core — Guide d'intégration

## Installation
```bash
npm install @blueprint-modular/core tailwindcss
```

## CSS obligatoire
Dans `globals.css` :
```css
@import '@blueprint-modular/core/dist/style.css';
```

## Tailwind obligatoire
Dans `tailwind.config.js` — ajouter dans `content` :
```js
'./node_modules/@blueprint-modular/core/dist/**/*.{js,mjs}'
```

## Variables CSS (optionnel — personnalisation)
```css
:root {
  --bpm-accent: #2563eb;
  --bpm-background: #ffffff;
  --bpm-surface: #f8fafc;
  --bpm-border: #e2e8f0;
  --bpm-text-primary: #0f172a;
  --bpm-text-secondary: #64748b;
}
```

## Next.js — éviter l'erreur SSR
Si erreur "document is not defined" :
```js
import dynamic from 'next/dynamic'
const MyComponent = dynamic(() => import('./MyComponent'), { ssr: false })
```

## API des composants principaux

### Page
```ts
bpm.page({ children: ReactNode })
```

### Tabs
```ts
bpm.tabs({ tabs: [{ label: string, content: ReactNode }], defaultTab?: number })
```

### Table
```ts
bpm.table({
  columns: [{ key: string, label: string, type?: string, sortable?: boolean }],
  data: Record<string, unknown>[],
  searchable?: boolean,
  pagination?: boolean,
  onRowClick?: (row) => void
})
```

### Metric
```ts
bpm.metric({ label: string, value: string|number, delta?: number, unit?: string })
```

### Spinner
```ts
bpm.spinner({ text?: string, size?: "small"|"medium"|"large" })
```
Toujours appeler avec un objet (au minimum `bpm.spinner({})`).

### Modal
```ts
bpm.modal({ title: string, isOpen: boolean, onClose: () => void, children: ReactNode })
```

### PlotlyChart
```ts
bpm.plotlyChart({ data: Plotly.Data[], layout?: Partial<Plotly.Layout> })
```
