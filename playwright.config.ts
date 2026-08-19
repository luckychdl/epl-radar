import { defineConfig, devices } from "@playwright/test";

const APP_PORT = 3210;
const MOCK_PORT = 4010;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://127.0.0.1:${APP_PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `node e2e/mock-server.mjs`,
      port: MOCK_PORT,
      reuseExistingServer: !process.env.CI,
    },
    {
      // 목 서버를 가리켜 실제 football-data 요청 한도를 쓰지 않는다.
      // dev 오버레이가 클릭을 가로막으므로 프로덕션 빌드로 검증한다.
      command: `npx next build && npx next start --port ${APP_PORT}`,
      port: APP_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: {
        FOOTBALL_API_BASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
        FOOTBALL_API_KEY: "e2e-test",
      },
    },
  ],
});
