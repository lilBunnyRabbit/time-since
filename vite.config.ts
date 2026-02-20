import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
import { version_plugin } from "./vite-plugin-version";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [
    tailwindcss(),
    svelte(),
    //   {
    //   compilerOptions: {
    //     runes: true,
    //   },
    // }
    version_plugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Time Since",
        short_name: "Time Since",
        description: "Track time since events happened",
        display: "standalone",
        background_color: "#17252C",
        theme_color: "#17252C",
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
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
});
