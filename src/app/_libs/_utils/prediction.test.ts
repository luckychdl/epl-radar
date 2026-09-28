import { describe, expect, it } from "vitest";
import { PredictionEntry } from "@/app/_types/predictions";
import { createMatch } from "./match.fixtures";
import {
  clampGoals,
  getFavoredOutcome,
  gradePrediction,
  groupOpenMatchesByDay,
  isPredictionOpen,
  normalizeAiPrediction,
  normalizeProbabilities,
  pruneEntries,
  settleEntries,
  summarizePredictions,
  toPredictionSnapshot,
} from "./prediction";

const NOW = new Date("2026-08-19T12:00:00Z");

function createEntry(
  id: number,
  overrides: Partial<PredictionEntry> = {},
): PredictionEntry {
  return {
    match: toPredictionSnapshot(
      createMatch({
        id,
        homeId: 1,
        awayId: 2,
        status: "TIMED",
        utcDate: `2026-08-${String(10 + id).padStart(2, "0")}T12:00:00Z`,
      }),
    ),
    ...overrides,
  };
}

describe("isPredictionOpen", () => {
  it("킥오프 전 예정 경기만 연다", () => {
    const future = "2026-08-19T14:00:00Z";

    expect(isPredictionOpen({ status: "TIMED", utcDate: future }, NOW)).toBe(true);
    expect(isPredictionOpen({ status: "SCHEDULED", utcDate: future }, NOW)).toBe(true);
    expect(isPredictionOpen({ status: "IN_PLAY", utcDate: future }, NOW)).toBe(false);
    expect(isPredictionOpen({ status: "POSTPONED", utcDate: future }, NOW)).toBe(false);
  });

  it("상태가 늦게 바뀌어도 킥오프 시각이 지나면 닫는다", () => {
    expect(
      isPredictionOpen({ status: "TIMED", utcDate: "2026-08-19T11:59:00Z" }, NOW),
    ).toBe(false);
  });
});

describe("gradePrediction", () => {
  it("스코어가 같으면 exact", () => {
    expect(gradePrediction({ home: 2, away: 1 }, { home: 2, away: 1 })).toBe("exact");
  });

  it("승부만 맞으면 outcome", () => {
    expect(gradePrediction({ home: 1, away: 0 }, { home: 3, away: 1 })).toBe("outcome");
    expect(gradePrediction({ home: 0, away: 0 }, { home: 2, away: 2 })).toBe("outcome");
  });

  it("승부가 다르면 miss", () => {
    expect(gradePrediction({ home: 1, away: 1 }, { home: 1, away: 0 })).toBe("miss");
  });
});

describe("clampGoals", () => {
  it("0~9 정수로 맞춘다", () => {
    expect(clampGoals(-1)).toBe(0);
    expect(clampGoals(12)).toBe(9);
    expect(clampGoals(1.6)).toBe(2);
    expect(clampGoals(Number.NaN)).toBe(0);
  });
});

describe("normalizeProbabilities", () => {
  it("합을 100 으로 맞춘다", () => {
    const result = normalizeProbabilities(1, 1, 1);

    expect(result).not.toBeNull();
    expect(result!.homeWin + result!.draw + result!.awayWin).toBe(100);
  });

  it("합이 100 이 아닌 입력을 비율대로 조정한다", () => {
    expect(normalizeProbabilities(50, 30, 40)).toEqual({
      homeWin: 42,
      draw: 25,
      awayWin: 33,
    });
  });

  it("모두 0 이면 null", () => {
    expect(normalizeProbabilities(0, 0, 0)).toBeNull();
  });
});

describe("getFavoredOutcome", () => {
  it("가장 높은 확률의 결과를 고른다", () => {
    expect(getFavoredOutcome({ homeWin: 50, draw: 25, awayWin: 25 })).toBe("HOME");
    expect(getFavoredOutcome({ homeWin: 20, draw: 30, awayWin: 50 })).toBe("AWAY");
  });

  it("동률이면 무승부를 우선한다", () => {
    expect(getFavoredOutcome({ homeWin: 40, draw: 40, awayWin: 20 })).toBe("DRAW");
  });
});

describe("normalizeAiPrediction", () => {
  it("범위를 벗어난 값을 보정한다", () => {
    expect(
      normalizeAiPrediction({
        homeWin: 60,
        draw: 30,
        awayWin: 30,
        homeGoals: 11,
        awayGoals: -2,
        reason: "  홈 강세  ",
      }),
    ).toEqual({
      homeWin: 50,
      draw: 25,
      awayWin: 25,
      score: { home: 9, away: 0 },
      reason: "홈 강세",
    });
  });

  it("근거가 없거나 형식이 틀리면 null", () => {
    expect(normalizeAiPrediction(null)).toBeNull();
    expect(
      normalizeAiPrediction({ homeWin: 1, draw: 1, awayWin: 1, reason: "" }),
    ).toBeNull();
  });
});

describe("summarizePredictions", () => {
  it("결과가 확정된 경기만 집계하고 맞대결을 비교한다", () => {
    const ai = (home: number, away: number) => ({
      homeWin: 40,
      draw: 30,
      awayWin: 30,
      score: { home, away },
      reason: "근거",
    });
    const savedAt = NOW.toISOString();

    const summary = summarizePredictions([
      // 나: 스코어 적중(3) / AI: 승부 적중(1) → 승
      createEntry(1, {
        user: { home: 2, away: 1, savedAt },
        ai: ai(1, 0),
        result: { home: 2, away: 1 },
      }),
      // 나: 빗나감 / AI: 빗나감 → 무
      createEntry(2, {
        user: { home: 0, away: 1, savedAt },
        ai: ai(0, 2),
        result: { home: 1, away: 1 },
      }),
      // AI 만 예측
      createEntry(3, { ai: ai(1, 1), result: { home: 0, away: 0 } }),
      // 결과 대기 중은 집계하지 않는다
      createEntry(4, { user: { home: 1, away: 0, savedAt } }),
    ]);

    expect(summary.user).toEqual({
      total: 2,
      exact: 1,
      outcome: 1,
      points: 3,
      hitRate: 50,
    });
    expect(summary.ai).toEqual({
      total: 3,
      exact: 0,
      outcome: 2,
      points: 2,
      hitRate: 67,
    });
    expect(summary.headToHead).toEqual({ win: 1, draw: 1, lose: 0 });
  });

  it("채점된 예측이 없으면 적중률은 null", () => {
    expect(summarizePredictions([]).user.hitRate).toBeNull();
  });
});

describe("settleEntries", () => {
  it("종료된 경기의 결과만 채운다", () => {
    const entries = { 1: createEntry(1), 2: createEntry(2) };
    const next = settleEntries(entries, [
      createMatch({ id: 1, homeId: 1, awayId: 2, homeGoals: 3, awayGoals: 0 }),
      createMatch({ id: 2, homeId: 1, awayId: 2, status: "IN_PLAY", homeGoals: 1, awayGoals: 0 }),
      createMatch({ id: 9, homeId: 1, awayId: 2, homeGoals: 1, awayGoals: 0 }),
    ]);

    expect(next?.[1].result).toEqual({ home: 3, away: 0 });
    expect(next?.[2].result).toBeUndefined();
    expect(next?.[9]).toBeUndefined();
  });

  it("바뀐 게 없으면 null 을 돌려 불필요한 저장을 막는다", () => {
    const entries = { 1: createEntry(1, { result: { home: 1, away: 0 } }) };

    expect(
      settleEntries(entries, [
        createMatch({ id: 1, homeId: 1, awayId: 2, homeGoals: 1, awayGoals: 0 }),
      ]),
    ).toBeNull();
  });
});

describe("pruneEntries", () => {
  it("상한을 넘으면 오래된 경기부터 버린다", () => {
    const entries = { 1: createEntry(1), 2: createEntry(2), 3: createEntry(3) };

    expect(Object.keys(pruneEntries(entries, 2)).sort()).toEqual(["2", "3"]);
  });
});

describe("groupOpenMatchesByDay", () => {
  it("열린 경기만 날짜순으로 묶고 가까운 N일만 남긴다", () => {
    const at = (id: number, utcDate: string, status: "TIMED" | "IN_PLAY" = "TIMED") =>
      createMatch({ id, homeId: 1, awayId: 2, status, utcDate });

    const groups = groupOpenMatchesByDay(
      [
        at(4, "2026-08-22T12:00:00Z"),
        at(1, "2026-08-20T13:00:00Z"),
        at(2, "2026-08-20T12:00:00Z"),
        at(3, "2026-08-21T12:00:00Z"),
        at(5, "2026-08-19T11:00:00Z"),
        at(6, "2026-08-20T14:00:00Z", "IN_PLAY"),
      ],
      NOW,
      2,
    );

    expect(groups.map((group) => group.matches.map((match) => match.id))).toEqual([
      [2, 1],
      [3],
    ]);
  });
});
