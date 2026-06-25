import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  server: { 
    port: 5174, 
    strictPort: true,
    allowedHosts: true, // Allow localtunnel hosts
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },

  plugins: [react()],
})
