import { describe, expect, it } from "vitest";
import { createMatch } from "./match.fixtures";
import {
  getMatchOutcome,
  getNextMatchOfTeam,
  getRecentMatchesOfTeam,
  getScoreChangedMatchIds,
  groupMatchesByLeague,
  hasUpdatingMatch,
} from "./match";

const LEAGUES = [
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "Primera Division" },
] as const;

describe("getMatchOutcome", () => {
  it("홈 승리는 홈 팀 기준 W, 원정 팀 기준 L", () => {
    const match = createMatch({ homeId: 1, awayId: 2, homeGoals: 2, awayGoals: 0 });

    expect(getMatchOutcome(match, 1)).toBe("W");
    expect(getMatchOutcome(match, 2)).toBe("L");
  });

  it("원정 승리는 반대로 판정한다", () => {
    const match = createMatch({ homeId: 1, awayId: 2, homeGoals: 0, awayGoals: 3 });

    expect(getMatchOutcome(match, 1)).toBe("L");
    expect(getMatchOutcome(match, 2)).toBe("W");
  });

  it("무승부는 양 팀 모두 D", () => {
    const match = createMatch({ homeId: 1, awayId: 2, homeGoals: 1, awayGoals: 1 });

    expect(getMatchOutcome(match, 1)).toBe("D");
    expect(getMatchOutcome(match, 2)).toBe("D");
  });

  it("미종료 경기는 결과가 없다", () => {
    const match = createMatch({
      homeId: 1,
      awayId: 2,
      homeGoals: 1,
      awayGoals: 0,
      status: "IN_PLAY",
    });

    expect(getMatchOutcome(match, 1)).toBeNull();
  });

  it("경기에 없는 팀(중립 조회)은 결과가 없다", () => {
    const match = createMatch({ homeId: 1, awayId: 2, homeGoals: 2, awayGoals: 0 });

    expect(getMatchOutcome(match, 99)).toBeNull();
  });
});

describe("hasUpdatingMatch", () => {
  it("경기가 없으면 폴링하지 않는다", () => {
    expect(hasUpdatingMatch([])).toBe(false);
  });

  it("전 경기가 종료면 폴링하지 않는다", () => {
    const matches = [
      createMatch({ id: 1, homeId: 1, awayId: 2, homeGoals: 1, awayGoals: 0 }),
      createMatch({ id: 2, homeId: 3, awayId: 4, homeGoals: 0, awayGoals: 0 }),
    ];

    expect(hasUpdatingMatch(matches)).toBe(false);
  });

  it("연기·취소만 남아도 폴링하지 않는다", () => {
    const matches = [
      createMatch({ id: 1, homeId: 1, awayId: 2, status: "POSTPONED" }),
      createMatch({ id: 2, homeId: 3, awayId: 4, status: "CANCELLED" }),
    ];

    expect(hasUpdatingMatch(matches)).toBe(false);
  });

  it("예정 경기만 있어도 폴링하지 않는다", () => {
    const matches = [createMatch({ homeId: 1, awayId: 2, status: "TIMED" })];

    expect(hasUpdatingMatch(matches)).toBe(false);
  });

  it("진행 중이거나 하프타임인 경기가 있으면 폴링한다", () => {
    expect(
      hasUpdatingMatch([createMatch({ homeId: 1, awayId: 2, status: "IN_PLAY" })]),
    ).toBe(true);
    expect(
      hasUpdatingMatch([createMatch({ homeId: 1, awayId: 2, status: "PAUSED" })]),
    ).toBe(true);
  });
});

describe("getScoreChangedMatchIds", () => {
  const before = [
    {
      code: "PL",
      name: "Premier League",
      matches: [
        createMatch({ id: 10, homeId: 1, awayId: 2, homeGoals: 0, awayGoals: 0, status: "IN_PLAY" }),
        createMatch({ id: 11, homeId: 3, awayId: 4, homeGoals: 1, awayGoals: 1, status: "IN_PLAY" }),
      ],
    },
  ];

  it("스코어가 바뀐 경기만 집어낸다", () => {
    const after = [
      {
        ...before[0],
        matches: [
          createMatch({ id: 10, homeId: 1, awayId: 2, homeGoals: 1, awayGoals: 0, status: "IN_PLAY" }),
          before[0].matches[1],
        ],
      },
    ];

    expect(getScoreChangedMatchIds(before, after)).toEqual([10]);
  });

  it("변화가 없으면 빈 배열", () => {
    expect(getScoreChangedMatchIds(before, before)).toEqual([]);
  });

  it("이전 응답에 없던 경기는 변경으로 보지 않는다", () => {
    const after = [
      {
        ...before[0],
        matches: [
          ...before[0].matches,
          createMatch({ id: 12, homeId: 5, awayId: 6, homeGoals: 2, awayGoals: 0 }),
        ],
      },
    ];

    expect(getScoreChangedMatchIds(before, after)).toEqual([]);
  });
});

describe("groupMatchesByLeague", () => {
  it("전달된 리그 순서를 유지하고 지원하지 않는 대회는 버린다", () => {
    const matches = [
      createMatch({ id: 1, homeId: 1, awayId: 2, code: "PD" }),
      createMatch({ id: 2, homeId: 3, awayId: 4, code: "CLI" }),
    ];

    const grouped = groupMatchesByLeague(matches, LEAGUES);

    expect(grouped.map((league) => league.code)).toEqual(["PL", "PD"]);
    expect(grouped[0].matches).toHaveLength(0);
    expect(grouped[1].matches.map((match) => match.id)).toEqual([1]);
  });

  it("리그 안에서는 킥오프 순으로 정렬한다", () => {
    const matches = [
      createMatch({ id: 2, homeId: 1, awayId: 2, utcDate: "2026-08-19T18:00:00Z" }),
      createMatch({ id: 1, homeId: 3, awayId: 4, utcDate: "2026-08-19T12:00:00Z" }),
    ];

    const grouped = groupMatchesByLeague(matches, LEAGUES);

    expect(grouped[0].matches.map((match) => match.id)).toEqual([1, 2]);
  });
});

describe("팀별 경기 추출", () => {
  const matches = [
    createMatch({ id: 1, homeId: 1, awayId: 2, utcDate: "2026-08-01T12:00:00Z" }),
    createMatch({ id: 2, homeId: 3, awayId: 1, utcDate: "2026-08-08T12:00:00Z" }),
    createMatch({ id: 3, homeId: 4, awayId: 5, utcDate: "2026-08-09T12:00:00Z" }),
    createMatch({ id: 4, homeId: 1, awayId: 6, utcDate: "2026-08-15T12:00:00Z" }),
  ];

  it("최근 N경기는 오래된 순 정렬 후 뒤에서 자른다", () => {
    expect(getRecentMatchesOfTeam(matches, 1, 2).map((m) => m.id)).toEqual([2, 4]);
  });

  it("다음 경기는 가장 이른 킥오프", () => {
    expect(getNextMatchOfTeam(matches, 1)?.id).toBe(1);
  });

  it("해당 팀 경기가 없으면 undefined", () => {
    expect(getNextMatchOfTeam(matches, 99)).toBeUndefined();
  });
});
