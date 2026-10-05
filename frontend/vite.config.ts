import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/benefactor-edata': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/public': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
