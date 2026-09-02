import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const backendProxyTarget = process.env.VITE_API_PROXY_TARGET
  || process.env.BACKEND_URL
  || "http://localhost:5000";

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
    host: "0.0.0.0",
    allowedHosts: true,
    port: 3000,
    proxy: {
      "/backend": {
        target: backendProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, "/api"),
      },
      "/register-api": {
        target: backendProxyTarget,
        changeOrigin: true,
        rewrite: () => "/api/auth/register",
      },
      "/verify-registration-api": {
        target: backendProxyTarget,
        changeOrigin: true,
        rewrite: () => "/api/auth/verify-registration-otp",
      },
      "/resend-registration-api": {
        target: backendProxyTarget,
        changeOrigin: true,
        rewrite: () => "/api/auth/resend-registration-otp",
      },
      "/forgot-password-api": {
        target: backendProxyTarget,
        changeOrigin: true,
        rewrite: () => "/api/auth/forgot-password",
      },
      "/reset-password-api": {
        target: backendProxyTarget,
        changeOrigin: true,
        rewrite: () => "/api/auth/reset-password",
      },
    },
  },
});
