import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        // target: 'http://0.0.0.0:3000',
        target: 'https://demo-visualizer.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
