import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: process.env.PORT || 3000, // Usa el puerto que Render proporciona
    host: '0.0.0.0', // Escucha en todas las interfaces de red
  },
});