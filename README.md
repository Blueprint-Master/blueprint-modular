# Blueprint Modular

**Open-source React component library for business applications.**

Blueprint Modular is a production-grade UI framework built for data-intensive apps. 75+ components designed for dashboards, KPI tracking, production monitoring, and enterprise tooling — all accessible through a single `bpm.*` API.

```bash
npm install @blueprint-modular/core
```

---

## Why Blueprint Modular

Most UI libraries give you buttons and inputs. Blueprint Modular gives you the building blocks of business intelligence:

- **Metrics** — `bpm.metric`, `bpm.metricRow` with delta tracking and automatic color coding
- **Data tables** — `bpm.table` with search, pagination, sort, and custom cell renderers
- **Charts** — `bpm.plotlyChart` wrapping Plotly.js with zero configuration
- **Modals** — `bpm.modal` with a predictable conditional rendering pattern
- **Navigation** — `bpm.sidebar`, `bpm.tabs`, `bpm.breadcrumb`
- **Forms** — `bpm.input`, `bpm.selectbox`, `bpm.numberInput`, `bpm.toggle`, `bpm.datePicker`
- **Feedback** — `bpm.badge`, `bpm.spinner`, `bpm.emptyState`, `bpm.alert`

All components share a single import, a consistent prop API, and a unified design language.

---

## Quick start

```tsx
import { bpm } from '@blueprint-modular/core'
import '@blueprint-modular/core/dist/style.css'

export default function Dashboard() {
  return bpm.container({
    children: (
      <>
        {bpm.pageHeader({ title: 'Production Dashboard' })}
        {bpm.metricRow({
          children: (
            <>
              {bpm.metric({ label: 'TRS', value: '87.4%', delta: 2.1, deltaLabel: 'vs last week' })}
              {bpm.metric({ label: 'Output', value: '12 480', delta: -340, deltaLabel: 'units' })}
              {bpm.metric({ label: 'Downtime', value: '2h 14m' })}
            </>
          )
        })}
      </>
    )
  })
}
```

---

## Installation

### npm

```bash
npm install @blueprint-modular/core
```

### Import

```tsx
// Always import as a namespace — never destructure
import { bpm } from '@blueprint-modular/core'
import '@blueprint-modular/core/dist/style.css'
```

### Tailwind (required for bpm.tabs and bpm.badge)

```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/@blueprint-modular/core/dist/**/*.{js,mjs}',
  ],
  safelist: [
    { pattern: /^bpm-tabs-/ },
    { pattern: /^bpm-badge-/ },
  ],
}
```

---

## Component reference

Full reference at [`blueprint-modular.com/llms.txt`](https://blueprint-modular.com/llms.txt) — machine-readable format designed for LLM-assisted development.

### Layout

| Component | Description |
|-----------|-------------|
| `bpm.container` | Root page wrapper |
| `bpm.pageHeader` | Page title + subtitle + actions |
| `bpm.card` | Content card with optional title |
| `bpm.section` | Labeled section within a page |
| `bpm.sidebar` | Collapsible navigation sidebar |
| `bpm.tabs` | Tab navigation with content panels |

### Data display

| Component | Description |
|-----------|-------------|
| `bpm.metric` | Single KPI with label, value, delta |
| `bpm.metricRow` | Responsive row of metrics |
| `bpm.table` | Searchable, sortable, paginated table |
| `bpm.plotlyChart` | Plotly.js chart wrapper |
| `bpm.timeline` | Chronological event list |
| `bpm.badge` | Status indicator |

### Forms

| Component | Description |
|-----------|-------------|
| `bpm.input` | Text input |
| `bpm.numberInput` | Numeric input with min/max |
| `bpm.selectbox` | Dropdown selector |
| `bpm.toggle` | Boolean switch |
| `bpm.datePicker` | Date selector |
| `bpm.button` | Action button (primary / secondary / outline) |

### Feedback

| Component | Description |
|-----------|-------------|
| `bpm.modal` | Dialog overlay |
| `bpm.spinner` | Loading indicator |
| `bpm.emptyState` | Empty list placeholder |
| `bpm.alert` | Inline alert message |

---

## Critical rules

```tsx
// ✅ Correct
import { bpm } from '@blueprint-modular/core'

// ❌ Never destructure
import { bpm.modal } from '@blueprint-modular/core'

// ✅ Modal — always conditional, always inside return()
{isOpen && bpm.modal({ isOpen: true, onClose, title: 'Edit', children: <></> })}

// ❌ Never after return() or outside JSX
const modal = bpm.modal({ ... }) // wrong

// ✅ Charts — always bpm.plotlyChart
{bpm.plotlyChart({ data: traces, layout: {}, height: 300 })}

// ❌ Never bpm.lineChart / bpm.barChart / bpm.areaChart
```

---

## LLM-friendly

Blueprint Modular is designed to be used with AI code generation tools.

- **`llms.txt`** — canonical machine-readable reference at [`blueprint-modular.com/llms.txt`](https://blueprint-modular.com/llms.txt)
- **[Blueprint Maker](https://blueprint-maker.com)** — AI app builder that generates full Next.js apps using `bpm.*` components from a plain-language prompt

---

## Validated at scale

Blueprint Modular is used in production at [NXTFOOD](https://nxtfood.fr) (food processing, ~120 employees) for operational dashboards, production monitoring, and internal tooling.

---

## Stack

| | |
|--|--|
| Language | TypeScript |
| Framework | React 18 |
| Styling | CSS Modules + Tailwind CSS |
| Charts | Plotly.js |
| Package | `@blueprint-modular/core` on npm |
| Version | 0.1.52 |

---

## Related projects

| Project | Description |
|---------|-------------|
| [Blueprint Maker](https://blueprint-maker.com) | AI app builder — prompt → Next.js app using bpm.* |
| Blueprint Monitor | AI teleprompter for video calls |
| Blueprint Market | Vertical app gallery with Stripe |

---

## Convergence gate

A single command validates the entire component surface — types, build, doc sync, smoke render, and prop-surface snapshot:

```bash
npm run gate
```

| Check | What it verifies |
|-------|-----------------|
| `tsc --noEmit` | TypeScript types in `packages/core/src/` compile without errors |
| `vite build` | Library bundles (`dist/index.mjs`, `dist/index.js`, `dist/style.css`) build cleanly |
| Doc sync | `public/llms.txt` and `lib/generated/bpm-components.json` match what the generators would produce today |
| Smoke render | Every `bpm.*` export mounts with minimal props without throwing |
| Prop-surface snapshot | The prop names for every component match the committed snapshot — any removal/rename = FAIL (θ-additive guarantee) |

**When to run it:** before any PR, after adding/modifying a component, after regenerating docs.

**When a check is red:**
- `tsc` / `vite build` failures → fix the type error or build config.
- Doc sync failure → run `python scripts/generate-llms-txt.py && python scripts/generate-bpm-components-json.py` then re-commit.
- Smoke render failure → the component throws with minimal props; update `packages/core/gate/fixtures.ts` with the correct minimal props, or fix the component bug.
- Prop snapshot failure → a prop was removed/renamed. If intentional, run `npx vitest run gate/ --update-snapshots` from `packages/core` and commit the updated snapshot.

---

## License

MIT
