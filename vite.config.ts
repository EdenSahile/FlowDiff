import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    // parked/ contient du code mis de côté, hors application. Sans cette
    // exclusion, Vitest y ramasse des tests dont les imports pointent vers
    // les emplacements d'origine, et qui échouent au chargement.
    exclude: ['**/node_modules/**', '**/dist/**', 'parked/**'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-styled-components'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('react-router-dom')) return 'vendor-react'
          if (id.includes('styled-components')) return 'vendor-styled'
          if (id.includes('/zod/')) return 'vendor-auth'
        },
      },
    },
  },
})
