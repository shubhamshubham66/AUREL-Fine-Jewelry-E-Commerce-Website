import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site under the repo path:
//   https://shubhamshubham66.github.io/AUREL-Fine-Jewelry-E-Commerce-Website/
// Setting `base` correctly is required so that Vite emits the right URLs
// for bundled assets (JS, CSS, hashed images). Runtime URLs that live in
// JS strings (e.g. product.image, product.model3D) are prefixed with
// import.meta.env.BASE_URL through src/utils/assets.js.
//
// In dev mode we keep '/' so http://localhost:5173/ still works.

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
