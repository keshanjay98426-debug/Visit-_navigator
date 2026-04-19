import { defineconfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineconfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});