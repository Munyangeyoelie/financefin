import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base:  process.env.VITE_BASE_PATH   || "/financefin",
  build: {
    chunkSizeWarningLimit: 1000, // 1000 KB (1 MB)
  },
});
