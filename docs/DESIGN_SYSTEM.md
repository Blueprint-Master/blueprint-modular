# Design system BPM (`bpm.*`)

**Objectif** : un design system cohérent pour tous les composants BPM — ni Streamlit ni Dash ne proposent l’équivalent natif.

---

## 1. Tokens (variables CSS)

Tous les composants `bpm.*` s’appuient sur les variables définies dans **`frontend/bpm/theme.css`**. À importer une fois à la racine de l’app (ex. `App.jsx` ou `index.css`).

| Token | Rôle | Valeur par défaut |
|-------|------|-------------------|
| `--bpm-bg`, `--bpm-surface` | Fond général / cartes | `#ffffff` |
| `--bpm-bg-card` | Fond de cartes secondaires | `#f6f6f6` |
| `--bpm-text-primary`, `--bpm-fg` | Texte principal | `#333` |
| `--bpm-text-secondary`, `--bpm-muted` | Texte secondaire | `#666` |
| `--bpm-bleu-profond` | Identité (titres, logo) | `#1A4B8F` |
| `--bpm-bleu-cyan` | Accent (liens, focus, CTA) | `#00A3E0` |
| `--bpm-accent`, `--accent` | Alias accent | `var(--bpm-bleu-cyan)` |
| `--bpm-border` | Bordures | `rgb(237,237,237)` |
| `--bpm-success-*`, `--bpm-warning-*`, `--bpm-error-*` | Feedback | Voir `theme.css` |
| `--bpm-font`, `--bpm-font-mono` | Typo | Inter, ui-monospace |
| `--bpm-space-*`, `--bpm-radius-*` | Spacing / radius | Optionnel |

**Personnalisation** : surcharger ces variables dans ton app (ou dans un fichier `theme-override.css`) pour adapter couleurs et espacements sans toucher au code des composants.

---

## 2. Composants `bpm.*`

- **Layout** : `Layout`, `TopNav`, `DocNav`, `DocSidebar`, `Grid`, `Card`, `Panel`, `Drawer`, `Accordion`, `Stepper`, `FAB`.
- **Inputs** : `Button`, `Input`, `Selectbox`, `Checkbox`, `Toggle`, `Slider`, `DateInput`, `DateRangePicker`, `Autocomplete`, `RadioGroup`, `FileInput`, `ColorPicker`.
- **Data** : `Table`, `Metric`, `SparklineMetric`, `TreeView`, `Timeline`.
- **Feedback** : `Message`, `Modal`, `Toast`, `Spinner`, `Progress`, `Skeleton`, `EmptyState`, `Tooltip`.
- **Structure** : `Title`, `Expander`, `Divider`, `Badge`, `Chip`, `Avatar`, `Breadcrumb`, `Caption`.

Tous acceptent une prop **`className`** pour ajouter des classes CSS (contrairement à Streamlit où ce n’est pas possible nativement).

---

## 3. Règles d’usage

1. **Un seul thème par app** : importer `theme.css` une fois.
2. **Ne pas réinventer les couleurs** : utiliser les tokens (`var(--bpm-*)`) dans tout CSS custom.
3. **Composants = bpm.*** : préférer les composants BPM pour garder la cohérence visuelle et comportementale.

---

*Voir aussi : `frontend/bpm/theme.css`, `docs/ROADMAP.md`.*
