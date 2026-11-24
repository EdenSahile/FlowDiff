// vite.config.ts
import { defineConfig } from "file:///Users/macbookeden/Documents/Claude/02_Portfolio%20-%20termin%C3%A9s/FlowDiff/node_modules/vitest/dist/config.js";
import react from "file:///Users/macbookeden/Documents/Claude/02_Portfolio%20-%20termin%C3%A9s/FlowDiff/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/Users/macbookeden/Documents/Claude/02_Portfolio - termin\xE9s/FlowDiff";
var vite_config_default = defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    // parked/ contient du code mis de côté, hors application. Sans cette
    // exclusion, Vitest y ramasse des tests dont les imports pointent vers
    // les emplacements d'origine, et qui échouent au chargement.
    exclude: ["**/node_modules/**", "**/dist/**", "parked/**", "e2e/**"],
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-styled-components"]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {},
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("react-router-dom")) return "vendor-react";
          if (id.includes("styled-components")) return "vendor-styled";
          if (id.includes("/zod/")) return "vendor-auth";
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWFjYm9va2VkZW4vRG9jdW1lbnRzL0NsYXVkZS8wMl9Qb3J0Zm9saW8gLSB0ZXJtaW5cdTAwRTlzL0Zsb3dEaWZmXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWFjYm9va2VkZW4vRG9jdW1lbnRzL0NsYXVkZS8wMl9Qb3J0Zm9saW8gLSB0ZXJtaW5cdTAwRTlzL0Zsb3dEaWZmL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYWNib29rZWRlbi9Eb2N1bWVudHMvQ2xhdWRlLzAyX1BvcnRmb2xpbyUyMC0lMjB0ZXJtaW4lQzMlQTlzL0Zsb3dEaWZmL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZydcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHRlc3Q6IHtcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIHNldHVwRmlsZXM6IFsnLi9zcmMvdGVzdC1zZXR1cC50cyddLFxuICAgIC8vIHBhcmtlZC8gY29udGllbnQgZHUgY29kZSBtaXMgZGUgY1x1MDBGNHRcdTAwRTksIGhvcnMgYXBwbGljYXRpb24uIFNhbnMgY2V0dGVcbiAgICAvLyBleGNsdXNpb24sIFZpdGVzdCB5IHJhbWFzc2UgZGVzIHRlc3RzIGRvbnQgbGVzIGltcG9ydHMgcG9pbnRlbnQgdmVyc1xuICAgIC8vIGxlcyBlbXBsYWNlbWVudHMgZCdvcmlnaW5lLCBldCBxdWkgXHUwMEU5Y2hvdWVudCBhdSBjaGFyZ2VtZW50LlxuICAgIGV4Y2x1ZGU6IFsnKiovbm9kZV9tb2R1bGVzLyoqJywgJyoqL2Rpc3QvKionLCAncGFya2VkLyoqJywgJ2UyZS8qKiddLFxuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCh7XG4gICAgICBiYWJlbDoge1xuICAgICAgICBwbHVnaW5zOiBbJ2JhYmVsLXBsdWdpbi1zdHlsZWQtY29tcG9uZW50cyddLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge30sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0JykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LXJvdXRlci1kb20nKSkgcmV0dXJuICd2ZW5kb3ItcmVhY3QnXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzdHlsZWQtY29tcG9uZW50cycpKSByZXR1cm4gJ3ZlbmRvci1zdHlsZWQnXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvem9kLycpKSByZXR1cm4gJ3ZlbmRvci1hdXRoJ1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVksU0FBUyxvQkFBb0I7QUFDcGEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsSUFDSixhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxZQUFZLENBQUMscUJBQXFCO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJbEMsU0FBUyxDQUFDLHNCQUFzQixjQUFjLGFBQWEsUUFBUTtBQUFBLElBQ25FLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLE9BQU87QUFBQSxRQUNMLFNBQVMsQ0FBQyxnQ0FBZ0M7QUFBQSxNQUM1QztBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVEsQ0FBQztBQUFBLEVBQ1QsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFJO0FBQ2YsY0FBSSxHQUFHLFNBQVMsb0JBQW9CLEtBQUssR0FBRyxTQUFTLGtCQUFrQixFQUFHLFFBQU87QUFDakYsY0FBSSxHQUFHLFNBQVMsbUJBQW1CLEVBQUcsUUFBTztBQUM3QyxjQUFJLEdBQUcsU0FBUyxPQUFPLEVBQUcsUUFBTztBQUFBLFFBQ25DO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
