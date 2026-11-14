import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Big libraries in their own files: smaller app bundle, and they stay
        // cached in the browser when only our code changes
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          firebase: ["firebase/app", "firebase/auth"],
        },
      },
    },
  },
});
