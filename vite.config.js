import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages deploys at:
//   https://shubhamshubham66.github.io/AUREL-Fine-Jewelry-E-Commerce-Website/
// So all asset URLs must be prefixed with the repo name in production.
// In dev mode we keep "/" so local dev still works at http://localhost:5173/

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/AUREL-Fine-Jewelry-E-Commerce-Website/' : '/',
  plugins: [react()],
  server: { port: 5173, host: true },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
          'r3f-vendor': ['@react-three/fiber', '@react-three/drei'],
          'animation-vendor': ['framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
}));
