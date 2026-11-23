import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    serviceWorkers: "allow",
  },
  webServer: [
    {
      command: 'node scripts/test-hosting-server.mjs',
      port: 4280,
      reuseExistingServer: false,
    },
    {
      command: "node scripts/serve-review.mjs",
      port: 4180,
      reuseExistingServer: false,
    },
    {
      command: "node e2e/update-server.mjs",
      port: 4176,
      reuseExistingServer: false,
    },
    {
      command: "npm run preview -- --port 4173",
      port: 4173,
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 5175 --strictPort",
      port: 5175,
      reuseExistingServer: false,
    },
  ],
});
