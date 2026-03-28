import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/agentic-os',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/agentic-os/api': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@agentic-os/types': path.resolve(__dirname, '../shared/types'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
