import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '127.0.0.1',
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none'
    },
    // Using port 3001 temporarily due to port 3000 permission issues
    port: 3001,
    strictPort: true,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:5001', // Updated to match our backend port
        changeOrigin: true,
        secure: false
      }
    }
  }
});
