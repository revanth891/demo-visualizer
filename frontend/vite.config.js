import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'react-icons']
        }
      }
    }
  },
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
