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
        theme_color: "#ccccee",
        icons: [
          {
            src: "kisssaq.png",
            sizes: "any",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  base: process.env.NODE_ENV === "development" ? "/" : "/kisssaq/",
});
