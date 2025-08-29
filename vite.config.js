// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Statische Dateien kommen vom Backend unter /storage/...
      '/storage': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Downloads (erzwungen via Content-Disposition)
      '/dl': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
       target: 'http://localhost:3000',
       changeOrigin: true,
  }
      
    }
  },
  build: {
    rollupOptions: {
      input: {
        index:    resolve(__dirname, 'index.html'),
        courses:  resolve(__dirname, 'courses.html'),
        about:    resolve(__dirname, 'about.html'),
        faq:      resolve(__dirname, 'faq.html'),
        contact:  resolve(__dirname, 'contact.html'),
        materials:resolve(__dirname, 'materials.html'),
        admin:    resolve(__dirname, 'admin.html')
      }
    }
  }
});
