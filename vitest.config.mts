import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(root, "src") },
  },
  test: {
    // 순수 함수만 대상으로 한다. DOM 이 필요 없으니 node 환경으로 충분하다.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
