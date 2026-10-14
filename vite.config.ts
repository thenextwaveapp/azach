import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Mirrors the /catalog rewrite in vercel.json so the branded catalog URL
    // also works in local dev.
    proxy: {
      "/catalog": {
        target: "https://oomypczpxxpechltrqmq.supabase.co",
        changeOrigin: true,
        rewrite: () => "/storage/v1/object/public/campaign-media/r2r/AZACH-R2R-Catalog.pdf",
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
