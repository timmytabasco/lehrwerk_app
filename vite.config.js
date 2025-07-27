import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        courses: resolve(__dirname, 'courses.html'),
      },
    },
  },
});
