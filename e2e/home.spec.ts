import { expect, test } from "@playwright/test";

test("홈에서 리그 목록과 오늘 경기를 함께 보여준다", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Leagues" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Premier League" })).toBeVisible();

  // 종료된 경기는 킥오프 시간 대신 스코어와 FT 를 보여준다.
  await expect(page.getByText("1 - 0")).toBeVisible();
  await expect(page.getByText("FT").first()).toBeVisible();

  // 무료 플랜 지연 안내와 갱신 표기는 한 곳에만 있다.
  await expect(page.getByText("자동 갱신")).toBeVisible();
  await expect(page.getByText("실시간")).toHaveCount(0);
});

test("리그 헤더를 눌러 경기 목록을 접을 수 있다", async ({ page }) => {
  await page.goto("/");

  const header = page
    .getByRole("button", { expanded: true })
    .filter({ hasText: "Premier League" })
    .first();

  await expect(header).toBeVisible();
  await header.click();
  await expect(
    page.getByRole("button", { expanded: false }).filter({ hasText: "Premier League" }).first(),
  ).toBeVisible();
});
