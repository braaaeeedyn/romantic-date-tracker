import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [
    preact({
      // Enable React DevTools in development
      devToolsEnabled: true,
      // Use React Fast Refresh
      prefreshEnabled: true,
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Ensure assets are referenced with correct base URL
    assetsDir: '.',
    // Ensure proper handling of static assets
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
});
