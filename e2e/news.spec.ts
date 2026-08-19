import { expect, test } from "@playwright/test";

// 외부 RSS 를 실제로 부르는 유일한 테스트다. 네트워크가 막히면 안내가 대신 뜬다.
test("헤더에서 뉴스 페이지로 이동한다", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "News" }).click();

  await expect(page).toHaveURL(/\/news/);
  await expect(page.getByRole("heading", { name: "Football News" })).toBeVisible();

  const articles = page.locator("main a[target=_blank]");
  const notice = page.getByText("뉴스를 불러오지 못했습니다.");

  await expect(articles.first().or(notice)).toBeVisible();
});
