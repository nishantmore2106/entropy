import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

import { entropyApiPlugin } from './server/vitePlugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), entropyApiPlugin()],
    resolve: {
      alias: [
        { find: '@/src', replacement: path.resolve(__dirname, './src') },
        { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
        { find: '@/lib', replacement: path.resolve(__dirname, './src/lib') },
        { find: '@/sections', replacement: path.resolve(__dirname, './src/sections') },
        { find: '@/data', replacement: path.resolve(__dirname, './src/data') },
        { find: '@', replacement: path.resolve(__dirname, './src') },
      ],
    },
    server: {
      // Strictly deny direct filesystem access to backend directories and secrets
      fs: {
        strict: true,
        deny: [
          '**/data/**',
          '**/server/**',
          '**/scripts/**',
          '**/tests/**',
          '**/backups/**',
          '**/.env*',
          '**/*.sqlite*',
          '**/*.db*',
          '**/*.log',
        ],
      },
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/.chrome-temp/**', '**/scripts/**', '**/dist/**'],
      },
    },
  };
});
