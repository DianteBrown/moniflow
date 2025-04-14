import path from "path"
import tailwindcss from "@tailwindcss/vite"
import reactPlugin from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: '/moniflow/',
  plugins: [reactPlugin(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})