import { expect, test } from "@playwright/test";

test("리그 순위표에서 팀 상세로 이동한다", async ({ page }) => {
  await page.goto("/leagues/2021/PL/overview");

  await page.getByRole("link", { name: /Arsenal/ }).first().click();

  await expect(page).toHaveURL(/\/teams\/57\/PL\/overview/);
  await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Team form")).toBeVisible();
  await expect(page.getByText(/최근 2경기 6점 · 4득점 2실점/)).toBeVisible();
  await expect(page.getByText("잔여 일정 난이도")).toBeVisible();
});

test("팀을 즐겨찾기하면 My Teams 에 남는다", async ({ page }) => {
  await page.goto("/teams/57/PL/overview");

  await page.getByRole("button", { name: /즐겨찾기/ }).click();
  await page.getByRole("link", { name: "My Teams" }).click();

  await expect(page.getByRole("heading", { name: "My Teams" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Arsenal/ })).toBeVisible();
});

test("탭마다 다른 콘텐츠를 보여준다", async ({ page }) => {
  await page.goto("/teams/57/PL/overview");
  await expect(page.getByText("클럽 정보")).toBeVisible();

  await page.getByRole("link", { name: "Squad" }).click();
  await expect(page).toHaveURL(/\/teams\/57\/PL\/squad/);
  await expect(page.getByRole("heading", { name: /골키퍼/ })).toBeVisible();
  // 응답에 새 포지션이 섞여도 버리지 않는다.
  await expect(page.getByRole("heading", { name: /기타/ })).toBeVisible();

  await page.getByRole("link", { name: "Matches" }).click();
  await expect(page.getByRole("heading", { name: /최근 결과/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /예정 경기/ })).toBeVisible();
});

test("Stats 탭은 시즌 기록과 득점 기여를 보여준다", async ({ page }) => {
  await page.goto("/teams/57/PL/stats");

  await expect(page.getByRole("heading", { name: "시즌 기록" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "홈 · 원정" })).toBeVisible();
  // 현재 시즌 득점 기록이 비면 직전 시즌으로 되돌아간다.
  await expect(page.getByRole("heading", { name: /득점 기여/ })).toBeVisible();
  await expect(page.getByText("12골")).toBeVisible();
  // 개막 직후라 현재 시즌 기록이 비면 직전 시즌 배지를 함께 보여준다.
  await expect(page.getByText("2025-26 시즌")).toBeVisible();
});

test("없는 탭은 404 로 처리한다", async ({ page }) => {
  await page.goto("/teams/57/PL/nope");

  await expect(page.getByText(/could not be found/i)).toBeVisible();
});
