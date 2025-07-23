import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    'process.env.BACKEND_CANISTER_ID': JSON.stringify(process.env.BACKEND_CANISTER_ID || ''),
    'process.env.QUEUE_CANISTER_ID': JSON.stringify(process.env.QUEUE_CANISTER_ID || ''),
  }
});