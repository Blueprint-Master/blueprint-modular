/**
 * Layout minimal pour les routes publiques (démo, landing).
 * Pas de NextAuth ni sidebar app — contenu seul.
 * Inline des variables BPM pour que la démo s'affiche même si le CSS principal charge en retard.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style
            dangerouslySetInnerHTML={{
              __html: `
:root {
  --bpm-bg-primary: #ffffff;
  --bpm-bg-secondary: #f0f0f0;
  --bpm-bg: #f0f0f0;
  --bpm-surface: #ffffff;
  --bpm-text-primary: #333;
  --bpm-text-secondary: #666;
  --bpm-accent: #00a3e2;
  --bpm-accent-cyan: #00a3e2;
  --bpm-border: rgb(237, 237, 237);
  --bpm-accent-mint: #45d09e;
}
.bpm-grid { display: grid; }
.bpm-tabs-container .bpm-tab-button { display: inline-flex; align-items: center; padding: 0.5rem 0.75rem; font-size: 0.875rem; border-bottom: 2px solid transparent; cursor: pointer; }
.bpm-tabs-container .bpm-tab-active { font-weight: 600; border-bottom-color: var(--bpm-accent); color: var(--bpm-accent); }
.bpm-tabs-content { padding: 1rem 0; width: 100%; overflow-x: hidden; }
.bpm-tabs-header { display: flex; align-items: stretch; gap: 0; overflow-x: auto; border-bottom: 1px solid var(--bpm-border); }
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.min-h-screen { min-height: 100vh; }
.max-w-6xl { max-width: 72rem; margin-left: auto; margin-right: auto; }
.max-w-4xl { max-width: 56rem; margin-left: auto; margin-right: auto; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.rounded-lg { border-radius: 0.5rem; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; }
.border-l-4 { border-left-width: 4px; border-left-style: solid; }
.p-4 { padding: 1rem; }
.prose { max-width: none; }
.w-full { width: 100%; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.sticky { position: sticky; }
.top-0 { top: 0; }
.z-10 { z-index: 10; }
.prose-sm { font-size: 0.875rem; }
.h-2 { height: 0.5rem; }
.overflow-hidden { overflow: hidden; }
.rounded-full { border-radius: 9999px; }
.tabular-nums { font-variant-numeric: tabular-nums; }
`,
            }}
          />
      {children}
    </>
  );
}
