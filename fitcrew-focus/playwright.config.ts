import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.APP_URL ?? "http://localhost:3000",
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
});
