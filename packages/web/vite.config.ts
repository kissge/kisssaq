import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "kissSaq",
        short_name: "kissSaq",
        description: "自作クイズ管理ツールkissSaq",
        theme_color: "#ffffff",
        icons: [
          {
            src: "kisssaq.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "kisssaq.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  base: process.env.NODE_ENV === "development" ? "/" : "/kisssaq/",
});
