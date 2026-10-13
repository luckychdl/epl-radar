import { describe, expect, it } from "vitest";
import { getCacheHitRate, normalizeFootballPath } from "./budget";

describe("normalizeFootballPath", () => {
  it("날짜는 자리표시자로 묶는다", () => {
    expect(
      normalizeFootballPath(
        "/matches?dateFrom=2026-08-10&dateTo=2026-08-20&competitions=PL",
      ),
    ).toBe("/matches?dateFrom=<date>&dateTo=<date>&competitions=PL");
  });

  it("시즌과 limit 도 묶는다", () => {
    expect(normalizeFootballPath("/competitions/PL/scorers?limit=100&season=2025")).toBe(
      "/competitions/PL/scorers?limit=<n>&season=<year>",
    );
  });

  it("캐시 엔트리를 가르는 status 는 남긴다", () => {
    expect(normalizeFootballPath("/competitions/PL/matches?status=FINISHED")).toBe(
      "/competitions/PL/matches?status=FINISHED",
    );
    expect(normalizeFootballPath("/competitions/PL/matches?status=SCHEDULED")).toBe(
      "/competitions/PL/matches?status=SCHEDULED",
    );
  });

  it("쿼리가 없으면 그대로 둔다", () => {
    expect(normalizeFootballPath("/teams/57")).toBe("/teams/57");
  });
});

describe("getCacheHitRate", () => {
  it("호출 대비 외부로 안 나간 비율", () => {
    expect(getCacheHitRate({ calls: 10, upstream: 2 })).toBe(0.8);
  });

  it("전부 외부로 나갔으면 0", () => {
    expect(getCacheHitRate({ calls: 3, upstream: 3 })).toBe(0);
  });

  it("호출이 없으면 null", () => {
    expect(getCacheHitRate({ calls: 0, upstream: 0 })).toBeNull();
  });
});
