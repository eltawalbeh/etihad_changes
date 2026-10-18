import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function emitSearchEngineFiles() {
  const seoDir = path.resolve(__dirname, 'src/seo')
  return {
    name: 'emit-search-engine-files',
    generateBundle() {
      for (const fileName of ['robots.txt', 'sitemap.xml']) {
        this.emitFile({
          type: 'asset',
          fileName,
          source: fs.readFileSync(path.join(seoDir, fileName), 'utf8'),
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    emitSearchEngineFiles(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('xlsx')) return 'vendor-xlsx'
          if (id.includes('recharts')) return 'vendor-charts'
          return undefined
        },
      },
    },
  },
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
