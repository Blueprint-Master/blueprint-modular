# @blueprint-modular/core

Composants React prêts à l'emploi pour des interfaces de données — la surface
**React/npm** de [Blueprint Modular](https://blueprint-modular.com).

Tous les composants sont exposés via un objet unique `bpm`. La même surface d'API
est documentée, testée et lue par les agents : le site, le catalogue, `llms.txt`
et le connecteur MCP sont **générés depuis ce code** — une seule vérité, zéro
divergence entre la doc et le composant.

- 🌐 Vitrine & catalogue : <https://blueprint-modular.com>
- 📖 Documentation : <https://blueprint-modular.com/docs>
- 🤖 Connecteur MCP (agents) : <https://blueprint-modular.com/mcp> — endpoint `https://mcp.blueprint-modular.com/api/mcp`
- 🐍 Surface Python (PyPI) : [`blueprint-modular`](https://pypi.org/project/blueprint-modular/)
- 📦 Ce paquet (npm) : [`@blueprint-modular/core`](https://www.npmjs.com/package/@blueprint-modular/core)

## Quick start

```bash
npm install @blueprint-modular/core
```

```tsx
import { bpm } from '@blueprint-modular/core';

export default function Dashboard() {
  return (
    <bpm.metric
      label="Chiffre d'affaires"
      value={125000}
      delta="+12%"
      currency="EUR"
    />
  );
}
```

## Installation

```bash
npm install @blueprint-modular/core
```

Importer la feuille de style une fois (dans votre `globals.css` ou layout) :

```css
@import '@blueprint-modular/core/dist/style.css';
```

Pour Tailwind, ajouter le paquet au `content` de `tailwind.config.js` :

```js
content: ['./node_modules/@blueprint-modular/core/dist/**/*.{js,mjs}']
```

## Usage React

```tsx
import { bpm } from '@blueprint-modular/core';
import '@blueprint-modular/core/dist/style.css';

export default function Dashboard() {
  return bpm.page({
    children: [
      bpm.pageHeader({ title: 'Ventes', subtitle: 'Mise à jour quotidienne' }),
      bpm.metricRow({
        metrics: [
          bpm.metric({ label: 'CA', value: '128 k€', delta: 12 }),
          bpm.metric({ label: 'Commandes', value: 342, delta: -3 }),
        ],
      }),
      bpm.table({
        columns: [
          { key: 'client', label: 'Client', sortable: true },
          { key: 'montant', label: 'Montant', type: 'number' },
        ],
        data: rows,
        searchable: true,
        pagination: true,
      }),
    ],
  });
}
```

Voir [`USAGE.md`](./USAGE.md) pour le guide d'intégration complet (CSS, SSR
Next.js, variables de thème `--bpm-*`).

## Surface Python

Le même catalogue de composants existe en Python via le paquet PyPI
[`blueprint-modular`](https://pypi.org/project/blueprint-modular/) : on décrit
l'interface en Python, le rendu utilise les mêmes briques React.

```bash
pip install blueprint-modular
```

```python
import bpm

bpm.page(
    bpm.page_header(title="Ventes", subtitle="Mise à jour quotidienne"),
    bpm.metric(label="CA", value="128 k€", delta=12),
    bpm.table(columns=[...], data=rows, searchable=True),
)
```

## Pour les agents

Donnez à votre agent le fichier `llms.txt` (surface d'API complète) ou
`llms-core.txt` (variante condensée pour modèles à petit contexte) :

- <https://blueprint-modular.com/llms.txt>
- <https://blueprint-modular.com/llms-core.txt>

Ou branchez directement le [connecteur MCP](https://blueprint-modular.com/mcp).

## Licence

Apache-2.0
