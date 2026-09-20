import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve, relative, dirname } from 'path'
import { cpSync, rmSync, readdirSync, readFileSync, existsSync } from 'node:fs'

// Alias @ vers racine du repo pour que les composants bpm qui importent @/lib, @/hooks, etc. résolvent au build.
const repoRoot = resolve(__dirname, '../..')

export default defineConfig({
  resolve: {
    alias: { '@': repoRoot },
  },
  plugins: [
    react(),
    { name: "ship-object-assets", closeBundle() { rmSync(resolve(__dirname,"dist/assets/objects"),{recursive:true,force:true}); cpSync(resolve(repoRoot, "public/objects"), resolve(__dirname, "dist/assets/objects"), {recursive:true,filter(source){
      // Publish only runtime derivatives. Original maps/posters remain in the source repo.
      const name=relative(resolve(repoRoot,"public/objects"),source).replaceAll("\\","/");
      return !/^universe-v2\/(?:illustrations\/)?[^/]+\.jpg$/.test(name)&&!/^universe-v2\/previews\/[^/]+\.png$/.test(name);
    }}); } },
    /**
     * Les composants vivent à la RACINE du dépôt (`components/bpm/`), pas sous
     * `packages/core/`. Le `include: ["src"]` du tsconfig fait donc que le plugin
     * n'émet AUCUNE de leurs déclarations : `bpm.d.ts` référence leurs types par
     * des chemins qui SORTENT du paquet publié, `skipLibCheck` avale les TS2307
     * correspondants côté consommateur, et les props valent `any` EN SILENCE.
     *
     * Mesuré sur 0.3.14 : un seul répertoire de composant livré (`Button`), donc
     * 5 composants du barrel sur 172 ont des props réellement opposables.
     *
     * SEUL `include` est touché. `entryRoot` est laissé au plugin, qui le calcule
     * déjà comme la racine du dépôt (la sortie est `dist/packages/core/src/**`) :
     * le poser explicitement DOUBLE le préfixe — mesuré, la sortie devient
     * `dist/packages/core/src/packages/core/src/**` et l'entrée `types` du
     * package.json disparaît. La garde ci-dessous a attrapé ce cas.
     */
    dts({
      insertTypesEntry: true,
      include: ['src/**/*', '../../components/bpm/**/*'],
      /**
       * Le plugin réécrit les spécificateurs d'INSTRUCTION (`import … from "…"`)
       * vers leur emplacement émis, mais laisse tels quels les `import("…")` EN
       * LIGNE — ceux des positions de type, donc exactement ceux qui portent les
       * props. Mesuré sur ce build : 162 références en ligne pointant six niveaux
       * au-dessus de `dist/`, soit hors du paquet.
       *
       * On les ramène dans `dist/`. La réécriture est STRUCTURELLE (on retire les
       * `../` de tête, on recalcule depuis la racine de `dist/`) et ne suppose
       * l'existence de rien : c'est la garde `assert-types-self-contained` qui
       * vérifie ensuite que chaque cible existe réellement. Une réécriture fausse
       * fait donc ÉCHOUER le build au lieu de passer inaperçue.
       */
      beforeWriteFile(filePath, content) {
        const distDir = resolve(__dirname, 'dist')
        const here = dirname(filePath)
        const dedans = (p: string) => !relative(distDir, p).startsWith('..')

        const corrige = content.replace(
          /((?:from\s*|import\s*\(\s*)["'])(\.[^"']*)(["'])/g,
          (tout, avant: string, spec: string, apres: string) => {
            if (dedans(resolve(here, spec))) return tout
            const queue = spec.replace(/^(?:\.\.\/)+/, '')
            if (queue === spec) return tout // pas un chemin ascendant : on ne touche pas
            let rel = relative(here, resolve(distDir, queue)).replace(/\\/g, '/')
            if (!rel.startsWith('.')) rel = `./${rel}`
            return `${avant}${rel}${apres}`
          },
        )
        return { filePath, content: corrige }
      },
    }),
    /**
     * LE PAQUET PUBLIÉ NE DOIT RÉFÉRENCER AUCUN TYPE QU'IL NE CONTIENT PAS.
     *
     * C'est l'invariant, et il est DÉRIVÉ du défaut plutôt que proxifié par un
     * compte : une déclaration qui pointe hors de `dist/` est avalée par le
     * `skipLibCheck: true` du consommateur (TS2307 masqué), et ses props valent
     * `any` EN SILENCE. Le paquet s'installe, compile, et ment.
     *
     * Sans cette garde, l'émission des composants dépend d'une condition TACITE
     * — un `node_modules` à la racine du dépôt, d'où TS résout `react` pour
     * `components/bpm/*.tsx`. Condition remplie sur bpm-prod, et invisible si
     * elle cesse de l'être : le build resterait VERT en publiant un paquet
     * aveugle. *Un mécanisme muet et un mécanisme mort doivent se voir
     * différemment* — ici on refuse de publier plutôt que de se taire.
     */
    {
      name: 'assert-types-self-contained',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist')
        const files: string[] = []
        const walk = (dir: string) => {
          for (const e of readdirSync(dir, { withFileTypes: true })) {
            const p = resolve(dir, e.name)
            if (e.isDirectory()) walk(p)
            else if (e.name.endsWith('.d.ts')) files.push(p)
          }
        }
        walk(distDir)

        const typesEntry = resolve(distDir, 'packages/core/src/index.d.ts')
        if (!existsSync(typesEntry)) {
          throw new Error(
            `[types] l'entrée déclarée par package.json#types est absente : ${relative(distDir, typesEntry)}`,
          )
        }

        // `from "…"` et `import("…")` — uniquement les spécificateurs RELATIFS.
        const SPEC = /(?:from\s*|import\s*\(\s*)["'](\.[^"']*)["']/g
        const dangling: string[] = []
        for (const file of files) {
          for (const m of readFileSync(file, 'utf8').matchAll(SPEC)) {
            const spec = m[1]
            if (/\.(css|json|svg|png|jpe?g|webp)$/.test(spec)) continue
            const base = resolve(dirname(file), spec.replace(/\.js$/, ''))
            if (existsSync(`${base}.d.ts`) || existsSync(resolve(base, 'index.d.ts'))) continue
            dangling.push(`${relative(distDir, file)} → ${spec}`)
          }
        }

        if (dangling.length > 0) {
          const apercu = dangling.slice(0, 8).join('\n  ')
          throw new Error(
            `[types] ${dangling.length} référence(s) de type PENDANTE(s) dans dist/ — le paquet publierait des props ` +
              `silencieusement \`any\` chez le consommateur (skipLibCheck avale le TS2307).\n  ${apercu}` +
              (dangling.length > 8 ? `\n  … et ${dangling.length - 8} autre(s)` : '') +
              `\n\nCause la plus probable : les déclarations de components/bpm/ n'ont pas été émises — ` +
              `TS résout \`react\` depuis la RACINE du dépôt, donc \`npm ci\` y est requis avant de construire le core.`,
          )
        }
      },
    },
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'schema/index': resolve(__dirname, 'src/schema/index.ts'),
        'connectors/index': resolve(__dirname, 'src/connectors/index.ts'),
        'objects/index': resolve(__dirname, 'src/objects/index.ts'),
      },
      name: 'BlueprintModular',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'js';
        // Entrées imbriquées (schema/index, connectors/index) conservent leur chemin.
        return entryName.includes('/') ? `${entryName}.${ext}` : `index.${ext}`;
      },
    },
    rollupOptions: {
      external: [
        'react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime',
        'react-plotly.js', 'plotly.js', 'zod',
        /^next(\/|$)/,
        /^leaflet(\/|$)/,
        'react-leaflet',
        'qrcode.react',
        'idb-keyval',
        'react-markdown',
        /^rehype/,
        /^remark/,
        /^unified/,
        /^mdast/,
        /^hast/,
        /^highlight\.js/,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react/jsx-dev-runtime': 'ReactJSXRuntime',
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.endsWith('.css')) return 'style.css';
          return '[name].[ext]';
        },
      },
    },
  },
})
