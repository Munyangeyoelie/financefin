import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/financefin/', // Add this line - match it to your deployment subdirectory
  build: {
    chunkSizeWarningLimit: 1000, // 1000 KB (1 MB)
  },
});