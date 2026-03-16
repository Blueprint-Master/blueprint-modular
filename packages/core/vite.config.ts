import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// Alias @ vers racine du repo pour que les composants bpm qui importent @/lib, @/hooks, etc. résolvent au build.
const repoRoot = resolve(__dirname, '../..')

export default defineConfig({
  resolve: {
    alias: { '@': repoRoot },
  },
  plugins: [
    react(),
    dts({ insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'schema/index': resolve(__dirname, 'src/schema/index.ts'),
      },
      name: 'BlueprintModular',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'js';
        return entryName === 'schema/index' ? `schema/index.${ext}` : `index.${ext}`;
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-plotly.js', 'plotly.js', 'zod'],
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
