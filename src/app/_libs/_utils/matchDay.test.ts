import { describe, expect, it } from "vitest";
import { createMatch } from "./match.fixtures";
import {
  filterMatchesInWindow,
  getMatchDayWindow,
  getServiceDateParam,
} from "./matchDay";

const KST = 9;

describe("getServiceDateParam", () => {
  it("UTC 로는 전날이어도 KST 자정이 지났으면 다음 날이다", () => {
    expect(getServiceDateParam(new Date("2026-10-13T15:30:00Z"), KST)).toBe(
      "20261014",
    );
  });

  it("KST 자정 직전은 아직 같은 날이다", () => {
    expect(getServiceDateParam(new Date("2026-10-13T14:59:00Z"), KST)).toBe(
      "20261013",
    );
  });
});

describe("getMatchDayWindow", () => {
  it("KST 하루는 UTC 전날 15시부터 당일 15시까지다", () => {
    const window = getMatchDayWindow("20261014", KST);

    expect(window.start.toISOString()).toBe("2026-10-13T15:00:00.000Z");
    expect(window.end.toISOString()).toBe("2026-10-14T15:00:00.000Z");
  });

  it("구간이 걸치는 UTC 날짜를 모두 덮도록 요청 범위를 잡는다", () => {
    const window = getMatchDayWindow("20261014", KST);

    expect(window.dateFrom).toBe("2026-10-13");
    // dateTo 는 배타적이라 10/14 를 포함하려면 10/15 여야 한다.
    expect(window.dateTo).toBe("2026-10-15");
  });

  it("오프셋이 0 이면 UTC 하루 그대로다", () => {
    const window = getMatchDayWindow("20261014", 0);

    expect(window.dateFrom).toBe("2026-10-14");
    expect(window.dateTo).toBe("2026-10-15");
  });
});

describe("filterMatchesInWindow", () => {
  const window = getMatchDayWindow("20261014", KST);

  it("UTC 로는 같은 날이어도 KST 로 다음 날 새벽인 경기는 뺀다", () => {
    const evening = createMatch({ id: 1, homeId: 1, awayId: 2, utcDate: "2026-10-14T10:00:00Z" });
    const nextDawn = createMatch({ id: 2, homeId: 1, awayId: 2, utcDate: "2026-10-14T16:45:00Z" });

    expect(
      filterMatchesInWindow([evening, nextDawn], window).map((m) => m.id),
    ).toEqual([1]);
  });

  it("UTC 로는 전날이어도 KST 로 당일 새벽인 경기는 넣는다", () => {
    const dawn = createMatch({ id: 3, homeId: 1, awayId: 2, utcDate: "2026-10-13T19:00:00Z" });

    expect(filterMatchesInWindow([dawn], window).map((m) => m.id)).toEqual([3]);
  });

  it("끝 경계는 포함하지 않는다", () => {
    const boundary = createMatch({ id: 4, homeId: 1, awayId: 2, utcDate: "2026-10-14T15:00:00Z" });

    expect(filterMatchesInWindow([boundary], window)).toEqual([]);
  });
});
