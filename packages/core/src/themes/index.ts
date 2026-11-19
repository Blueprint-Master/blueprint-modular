/** The portable JSON format exported by the catalogue's theme editor. */
export interface BrandingTheme {
  id: string;
  nom: string;
  couleurApp: string;
  accent: string;
  fond: string;
  surface: string;
  texte: string;
  rayon: number;
}

export function resolveTheme(themes: readonly BrandingTheme[], defaultId: string, assignedId?: string | null) {
  const fallback = themes.find(theme => theme.id === defaultId);
  if (!fallback) throw new Error("Missing default theme");
  const theme = themes.find(item => item.id === assignedId) ?? fallback;
  if (![theme.nom, theme.couleurApp].every(value => typeof value === "string" && value.trim())
      || ![theme.accent, theme.fond, theme.surface, theme.texte].every(value => /^#[a-f\d]{6}$/i.test(value))
      || !Number.isInteger(theme.rayon) || theme.rayon < 0 || theme.rayon > 16) {
    throw new Error("Invalid branding theme");
  }
  return {
    id: theme.id, name: theme.couleurApp,
    variables: {
      "--bpm-accent": theme.accent, "--bpm-accent-cyan": theme.accent,
      "--bpm-bg": theme.fond, "--bpm-bg-primary": theme.fond,
      "--bpm-surface": theme.surface, "--bpm-bg-secondary": theme.surface,
      "--bpm-text": theme.texte, "--bpm-text-primary": theme.texte,
      "--bpm-radius": theme.rayon + "px",
    },
  };
}

/** Set only this module's properties on the supplied application root. */
export function applyTheme(root: HTMLElement, theme: ReturnType<typeof resolveTheme>) {
  for (const [key, value] of Object.entries(theme.variables)) root.style.setProperty(key, value);
}
