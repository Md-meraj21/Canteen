import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const jsAsJsx = {
  name: "js-as-jsx",
  async transform(code, id) {
    if (!id.match(/src\/.*\.js$/)) {
      return null;
    }

    return transformWithEsbuild(code, id, {
      loader: "jsx",
      jsx: "automatic",
    });
  },
};

export default defineConfig({
  plugins: [jsAsJsx, react(), tailwindcss()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  server: {
    allowedHosts: ['https://canteen-1-w6yt.onrender.com'] ,
    port: 3000,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
