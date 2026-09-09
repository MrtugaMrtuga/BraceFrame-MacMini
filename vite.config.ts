import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/favicon-32.png",
        "icons/apple-touch-icon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-1024.png",
        "conselhos/higiene.svg",
        "conselhos/limpeza.svg",
        "conselhos/material.svg",
        "conselhos/higiene.mp4",
      ],
      manifest: {
        name: "BraceFrame",
        short_name: "BraceFrame",
        description: "O teu sorriso em curso",
        lang: "pt-PT",
        dir: "ltr",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f5f5f7",
        theme_color: "#f5f5f7",
        categories: ["health", "lifestyle", "photo"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-1024.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest,mp4}"],
        navigateFallback: "index.html",
      },
    }),
  ],
});
