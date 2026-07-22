import path from 'path';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

/** Writes dist/version.json at build time so a deploy is verifiable with one request
 *  (`curl -sk https://aiworkloads.lan/version.json`). `commit` prefers Coolify's
 *  SOURCE_COMMIT env (the .git dir is not in the Docker build context); locally it
 *  falls back to `git rev-parse`. `builtAt` always changes, so freshness is provable
 *  even when the SHA is unavailable. Build-only. */
function versionStamp() {
  return {
    name: 'version-stamp',
    apply: 'build' as const,
    closeBundle() {
      let commit = process.env.SOURCE_COMMIT ?? '';
      if (!commit) {
        try {
          commit = execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
            stdio: ['ignore', 'pipe', 'ignore'],
          })
            .toString()
            .trim();
        } catch {
          commit = 'unknown';
        }
      }
      const stamp = { commit: commit.slice(0, 12), builtAt: new Date().toISOString() };
      writeFileSync(path.resolve(__dirname, 'dist/version.json'), `${JSON.stringify(stamp)}\n`);
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    target: 'ES2022',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-sentry': ['@sentry/react'],
          // Route-based chunks
          'page-operations': ['./pages/OperationsPage.tsx'],
          'page-glossary': ['./pages/GlossaryPage.tsx'],
          'page-deepdive': ['./pages/DeepDivePage.tsx'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  plugins: [
    versionStamp(),
    react({
      // Enable fast refresh for dev mode
      fastRefresh: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Networking for AI Workloads',
        short_name: 'AI Networking',
        theme_color: '#0F1117',
        background_color: '#0F1117',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
    process.env.ANALYZE && visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
