import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate': el service worker se actualiza solo cuando se publica
      // una versión nueva. El usuario ve los cambios al recargar la app.
      registerType: "autoUpdate",
      // Iconos que vivan en /public para que el navegador los encuentre.
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon-180x180.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "maskable-icon-512x512.png",
      ],
      manifest: {
        name: "Simulador de Proyectos de Inversión",
        short_name: "SIMPRO",
        description:
          "Plataforma educativa para construir y simular proyectos de inversión bolivianos.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        // Bloquea la orientación en vertical en celulares. El layout está
        // pensado para portrait — si se gira a horizontal se ve mal.
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "es",
        categories: ["education", "finance", "productivity"],
        // Si la PWA ya está corriendo cuando vuelve un callback (ej. OAuth de
        // Google), navega en esa instancia existente en lugar de abrir el
        // browser. Crítico para que el login con Google funcione bien desde
        // la app instalada en mobile.
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        },
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cache de los archivos estáticos del build (no toca llamadas a Supabase).
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // El bundle JS principal pesa ~2.3 MB. Subimos el límite a 5 MB para que
        // entre. A futuro conviene code-splitting (Vite/Rollup manualChunks).
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Para SPA: cualquier ruta que no exista en el cache cae al index.html
        navigateFallback: "/index.html",
        // Excluye llamadas a la API de Supabase del cache (los datos siempre van
        // a la red, así no se sirve nota vieja por accidente).
        navigateFallbackDenylist: [/^\/api\//, /supabase/],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false, // el SW solo en producción, en dev molesta
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
