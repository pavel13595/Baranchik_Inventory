import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginInjectDataLocator()],
  server: {
    allowedHosts: true,
    // SPA fallback middleware
    middlewareMode: false,
    setupMiddlewares(middlewares, devServer) {
      middlewares.use((req, res, next) => {
        if (
          req.url &&
          !req.url.startsWith("/src") &&
          !req.url.startsWith("/node_modules") &&
          !req.url.startsWith("/@vite") &&
          !req.url.startsWith("/public") &&
          !req.url.includes(".") // нет расширения файла
        ) {
          req.url = "/index.html";
        }
        next();
      });
      return middlewares;
    },
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
