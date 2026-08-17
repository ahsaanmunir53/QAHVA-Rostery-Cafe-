import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies /api to the local backend, so the frontend code can use
// same-origin paths everywhere and never needs a hardcoded localhost URL.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API || 'http://localhost:5003',
        changeOrigin: true,
      },
    },
  },
});
