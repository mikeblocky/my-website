import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  optimizeDeps: {
    include: ['@lucide/svelte', 'tailwind-merge'],
    exclude: ['html-to-image']
  },
  resolve: {
    alias: {
      '@': path.resolve('../../src')
    }
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: true,
    fs: {
      allow: ['../..']
    }
  },
});
