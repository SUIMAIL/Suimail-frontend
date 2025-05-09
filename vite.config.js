import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase the limit to 1000 kB
  },
  preview: {
    port: 4173,
    host: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://suimail-backend.onrender.com', // OR http://localhost:3000
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
