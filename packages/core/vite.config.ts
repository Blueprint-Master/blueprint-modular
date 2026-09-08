import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve, relative } from 'path'
import { cpSync, rmSync } from 'node:fs'

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
    dts({ insertTypesEntry: true }),
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
