import { expect, test } from "@playwright/test";

test("홈에서 리그 순위표로 이동한다", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Premier League" }).click();

  await expect(page).toHaveURL(/\/leagues\/2021\/PL\/overview/);
  await expect(page.getByRole("link", { name: /Arsenal/ }).first()).toBeVisible();
  await expect(page.getByText("PTS")).toBeVisible();
});

test("라운드별 순위 변동을 계산해 보여준다", async ({ page }) => {
  await page.goto("/leagues/2021/PL/overview");

  await expect(
    page.getByRole("heading", { name: "라운드별 순위 변동" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /라운드별 순위 변동/ })).toBeVisible();
});

test("리그 페이지는 득점 순위를 보여준다", async ({ page }) => {
  await page.goto("/leagues/2021/PL/overview");

  await expect(page.getByText("득점 순위")).toBeVisible();
  await expect(page.getByText("Player 9004")).toBeVisible();
});

test("시즌을 골라 과거 순위표로 이동한다", async ({ page }) => {
  await page.goto("/leagues/2021/PL/overview");

  await expect(page.getByRole("link", { name: /2026-27/ })).toBeVisible();
  await page.getByRole("link", { name: "2025-26" }).click();

  await expect(page).toHaveURL(/season=2025/);
  await expect(page.getByText("득점 순위")).toBeVisible();
});
