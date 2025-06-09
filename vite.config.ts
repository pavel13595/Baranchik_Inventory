import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginInjectDataLocator()],
  server: {
    allowedHosts: true,
    // Добавляем fallback для SPA
    historyApiFallback: true,
  },
  // Для production build (если используется netlify/vercel/static), тоже нужен fallback
  build: {
    rollupOptions: {
      output: {
        // ...existing code...
      },
    },
  },
});
