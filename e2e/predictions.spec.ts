import { expect, test } from "@playwright/test";

// 목 서버의 예정 경기(8/22)가 아직 킥오프 전인 시점으로 브라우저 시계를 고정한다.
const NOW = new Date("2026-08-19T12:00:00Z");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NOW);
});

test("킥오프 전 경기에 스코어를 예측하면 기록에 남는다", async ({ page }) => {
  await page.goto("/predictions");

  await page
    .getByRole("button", { expanded: false })
    .filter({ hasText: "Man City" })
    .first()
    .click();

  const prediction = page.getByRole("region", { name: "승부예측" });
  await prediction.getByRole("button", { name: "Arsenal 득점 늘리기" }).click();
  await prediction.getByRole("button", { name: "Arsenal 득점 늘리기" }).click();
  await prediction.getByRole("button", { name: "예측 저장" }).click();

  await expect(prediction.getByText("2 : 0")).toBeVisible();
  await expect(prediction.getByRole("button", { name: "수정" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("listitem").filter({ hasText: "Man City" })).toContainText("2 : 0");
});

test("AI 기능이 꺼져 있으면 AI 예측 영역만 사라진다", async ({ page }) => {
  await page.goto("/predictions");

  await page
    .getByRole("button", { expanded: false })
    .filter({ hasText: "Man City" })
    .first()
    .click();

  const prediction = page.getByRole("region", { name: "승부예측" });
  await expect(prediction.getByText("AI 생성 내용")).toBeVisible();
  await prediction.getByRole("button", { name: "AI 예측 보기" }).click();

  await expect(prediction.getByText("AI 생성 내용")).toHaveCount(0);
  await expect(prediction.getByRole("button", { name: "예측 저장" })).toBeVisible();
});

test("끝난 경기는 이미 받은 결과로 채점한다", async ({ page }) => {
  // 목 서버의 종료 경기 101(Arsenal 2-1 Chelsea)을 미리 예측해 둔 상태를 만든다.
  await page.addInitScript(() => {
    const team = (id: number, shortName: string) => ({
      id,
      shortName,
      crest: `https://crests.football-data.org/${id}.png`,
    });

    localStorage.setItem(
      "epl-radar-predictions",
      JSON.stringify({
        version: 1,
        state: {
          entries: {
            101: {
              match: {
                id: 101,
                utcDate: "2026-08-08T14:00:00Z",
                competitionCode: "PL",
                homeTeam: team(57, "Arsenal"),
                awayTeam: team(61, "Chelsea"),
              },
              user: { home: 2, away: 1, savedAt: "2026-08-07T00:00:00Z" },
              ai: {
                homeWin: 40,
                draw: 30,
                awayWin: 30,
                score: { home: 1, away: 1 },
                reason: "테스트",
              },
            },
          },
        },
      }),
    );
  });

  await page.goto("/predictions");

  const row = page.getByRole("listitem").filter({ hasText: "Chelsea" });
  await expect(row).toContainText("2 - 1");
  await expect(row.getByText("스코어 적중 · 3점")).toBeVisible();
  await expect(row.getByText("빗나감 · 0점")).toBeVisible();
  await expect(page.getByText("같은 경기 맞대결 1승 0무 0패")).toBeVisible();
});
