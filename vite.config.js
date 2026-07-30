import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// If you deploy to GitHub Pages at https://<user>.github.io/<repo>/,
// set base to "/<repo>/". For Vercel/Netlify (custom domain or root), leave it as "/".
export default defineConfig({
  plugins: [react()],
  base: "/",
});
