// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    ...(mode === 'production' ? {
      'import.meta.env.VITE_API_URL': JSON.stringify('https://batik-kasir-backend.vercel.app/api')
    } : {})
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
}))
