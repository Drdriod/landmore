import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// General-purpose config for local development (Termux, any machine).
// Vercel and GitHub Pages use their own dedicated configs (vite.config.vercel.ts,
// vite.config.github.ts) since they need different base paths and output folders.
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    host: "0.0.0.0",
  },
  preview: {
    port: Number(process.env.PORT) || 4173,
    host: "0.0.0.0",
  },
});
