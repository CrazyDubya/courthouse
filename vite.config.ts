import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/client',
  build: {
    outDir: '../../dist/client',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/client/index.html')
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@client': resolve(__dirname, 'src/client'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});