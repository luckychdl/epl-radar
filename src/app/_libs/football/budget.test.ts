import { beforeEach, describe, expect, it } from "vitest";
import {
  getBudgetSnapshot,
  recordFootballFetch,
  resetBudget,
} from "./budget";

function headers(date: string, available?: string) {
  const result = new Headers({ Date: date });
  if (available) result.set("x-requests-available-minute", available);

  return result;
}

describe("recordFootballFetch", () => {
  beforeEach(() => resetBudget());

  it("Date 가 같으면 캐시 적중으로 보고 외부 호출로 세지 않는다", () => {
    const same = "Wed, 19 Aug 2026 17:47:40 GMT";

    recordFootballFetch("/teams/57", headers(same));
    recordFootballFetch("/teams/57", headers(same));
    recordFootballFetch("/teams/57", headers(same));

    const { totals, paths } = getBudgetSnapshot();

    expect(totals.calls).toBe(3);
    expect(totals.upstream).toBe(1);
    expect(paths[0].path).toBe("/teams/57");
  });

  it("Date 가 바뀌면 새 외부 호출로 센다", () => {
    recordFootballFetch("/teams/57", headers("Wed, 19 Aug 2026 17:47:40 GMT"));
    recordFootballFetch("/teams/57", headers("Wed, 19 Aug 2026 17:57:40 GMT"));

    expect(getBudgetSnapshot().totals.upstream).toBe(2);
  });

  it("날짜만 다른 경로는 한 줄로 묶는다", () => {
    recordFootballFetch("/matches?dateFrom=2026-08-10", headers("a"));
    recordFootballFetch("/matches?dateFrom=2026-08-11", headers("b"));

    const { paths } = getBudgetSnapshot();

    expect(paths).toHaveLength(1);
    expect(paths[0].calls).toBe(2);
  });

  it("429 는 외부 호출이면서 별도로 센다", () => {
    recordFootballFetch("/teams/57", headers("a"), { rateLimited: true });

    const { totals } = getBudgetSnapshot();

    expect(totals.rateLimited).toBe(1);
    expect(totals.upstream).toBe(1);
  });

  it("남은 요청 수는 마지막 응답 헤더 값을 쓴다", () => {
    recordFootballFetch("/teams/57", headers("a", "9"));
    recordFootballFetch("/teams/61", headers("b", "7"));

    expect(getBudgetSnapshot().requestsAvailable).toBe(7);
  });

  it("헤더가 없으면 캐시 여부를 알 수 없으므로 외부 호출로 센다", () => {
    recordFootballFetch("/teams/57", null);
    recordFootballFetch("/teams/57", null);

    expect(getBudgetSnapshot().totals.upstream).toBe(2);
  });
});
