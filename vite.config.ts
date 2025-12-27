import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.jpg", "app-icon.jpg"],
      manifest: {
        name: "Blossom - Dating App",
        short_name: "Blossom",
        description: "Find meaningful connections and blossom into love",
        theme_color: "#ec4899",
        background_color: "#0f0a0e",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/app-icon.jpg",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: "/app-icon.jpg",
            sizes: "512x512",
            type: "image/jpeg",
          },
          {
            src: "/app-icon.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cache strategies for different asset types
        runtimeCaching: [
          {
            // Cache Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Google Fonts webfont files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache API calls with network-first strategy
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
        // Don't precache everything, just critical assets
        globPatterns: ["**/*.{js,css,html,ico,jpg,png,svg,woff2}"],
        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // UI framework
          "radix-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-switch",
            "@radix-ui/react-slider",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-separator",
            "@radix-ui/react-progress",
          ],
          // Animation library
          framer: ["framer-motion"],
          // Data fetching
          tanstack: ["@tanstack/react-query"],
          // Supabase
          supabase: ["@supabase/supabase-js"],
          // Maps (heavy)
          mapbox: ["mapbox-gl"],
          // Charts (heavy)
          recharts: ["recharts"],
          // Date utilities
          "date-fns": ["date-fns"],
          // Forms
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
    // Increase chunk size warning limit slightly since we're now splitting
    chunkSizeWarningLimit: 600,
  },
}));
