import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Multi-page build. The admin dashboard is a separate entry so none of its
      // chart code, tables, or polling logic ends up in the marketing bundle that
      // every visitor downloads.
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  server: {
    proxy: {
      // `vite dev` serves the SPA; `vercel dev` serves the functions. Proxying
      // lets the normal Vite dev server work against a locally running API.
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
