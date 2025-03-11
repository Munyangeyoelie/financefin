import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative paths for assets
  build: {
    chunkSizeWarningLimit: 1000 // Suppress warnings (optional)
  }
});
