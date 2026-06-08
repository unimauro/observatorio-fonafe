import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Base para GitHub Pages (project site): https://unimauro.github.io/observatorio-fonafe/
export default defineConfig({
  base: '/observatorio-fonafe/',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1200 },
})
