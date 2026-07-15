import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Built for GitHub Pages at /creative-tech-timeline/, but served from the root
// in dev so local URLs stay simple. Runtime code reads import.meta.env.BASE_URL.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/creative-tech-timeline/' : '/',
  plugins: [react()],
  server: { port: 3000, open: true },
}));
