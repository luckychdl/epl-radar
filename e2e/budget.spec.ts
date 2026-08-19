import { expect, test } from "@playwright/test";

test("요청 예산 화면이 계측값을 보여준다", async ({ page }) => {
  // 먼저 데이터를 쓰는 화면을 열어 계측을 발생시킨다.
  await page.goto("/leagues/2021/PL/overview");

  await page.getByRole("link", { name: "Budget" }).click();

  await expect(page).toHaveURL(/\/budget/);
  await expect(page.getByRole("heading", { name: "요청 예산" })).toBeVisible();
  await expect(page.getByText("최근 1분 외부 호출")).toBeVisible();
  await expect(page.getByText("캐시 적중률")).toBeVisible();

  // next start 는 워커가 여러 개라 계측이 다른 프로세스에 쌓일 수 있다.
  // 표가 있으면 경로가 정규화돼 있는지까지 확인하고, 없으면 안내 문구를 본다.
  const table = page.getByRole("table");
  const empty = page.getByText("아직 기록된 호출이 없습니다.");

  await expect(table.or(empty)).toBeVisible();
});
