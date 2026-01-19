import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    hmr: true
  },
  build: {
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lab: resolve(__dirname, 'lab.html')
      },
      output: {
        manualChunks: {
          phaser: ['phaser'],
          vendor: ['react', 'react-dom'],
          networking: ['peerjs']
        }
      }
    }
  }
});