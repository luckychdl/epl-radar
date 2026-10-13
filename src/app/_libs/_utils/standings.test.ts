import { describe, expect, it } from "vitest";
import { createMatch } from "./match.fixtures";
import {
  buildPositionHistory,
  describeStreak,
  getFormStreak,
  getRemainingDifficulty,
} from "./standings";

describe("buildPositionHistory", () => {
  it("결과가 없으면 빈 배열", () => {
    expect(buildPositionHistory([])).toEqual([]);
  });

  it("미종료 경기는 계산에서 제외한다", () => {
    const matches = [
      createMatch({ id: 1, homeId: 1, awayId: 2, status: "TIMED" }),
      createMatch({ id: 2, homeId: 3, awayId: 4, homeGoals: null, awayGoals: null, status: "IN_PLAY" }),
    ];

    expect(buildPositionHistory(matches)).toEqual([]);
  });

  it("라운드별 누적 승점으로 순위를 만든다", () => {
    const matches = [
      // R1: 1승(팀1), 무승부(팀3·팀4)
      createMatch({ id: 1, matchday: 1, homeId: 1, awayId: 2, homeGoals: 2, awayGoals: 0 }),
      createMatch({ id: 2, matchday: 1, homeId: 3, awayId: 4, homeGoals: 1, awayGoals: 1 }),
      // R2: 팀2 가 팀3 을 잡아 승점 3
      createMatch({ id: 3, matchday: 2, homeId: 2, awayId: 3, homeGoals: 3, awayGoals: 0 }),
    ];

    const history = buildPositionHistory(matches);
    const team1 = history.find((row) => row.team.id === 1);
    const team2 = history.find((row) => row.team.id === 2);

    expect(team1?.history.map((point) => point.position)).toEqual([1, 1]);
    expect(team2?.history.map((point) => point.points)).toEqual([0, 3]);
    // R1 최하위였던 팀2 가 R2 에 올라선다.
    expect(team2?.history[0].position).toBeGreaterThan(
      team2?.history[1].position ?? 0,
    );
  });

  it("승점이 같으면 득실차가 앞선 팀이 위로 온다", () => {
    const matches = [
      createMatch({ id: 1, matchday: 1, homeId: 1, awayId: 2, homeGoals: 5, awayGoals: 0 }),
      createMatch({ id: 2, matchday: 1, homeId: 3, awayId: 4, homeGoals: 1, awayGoals: 0 }),
    ];

    const history = buildPositionHistory(matches);

    expect(history[0].team.id).toBe(1);
    expect(history[0].history[0].position).toBe(1);
  });
});

describe("getFormStreak / describeStreak", () => {
  it("결과가 없으면 null", () => {
    expect(getFormStreak([])).toBeNull();
    expect(describeStreak(null)).toBeNull();
  });

  it("가장 최근 결과가 이어진 횟수를 센다", () => {
    expect(getFormStreak(["L", "W", "W", "W"])).toEqual({ outcome: "W", count: 3 });
    expect(describeStreak({ outcome: "W", count: 3 })).toBe("3연승");
  });

  it("1경기만 이어졌으면 연속 표기를 쓰지 않는다", () => {
    expect(describeStreak(getFormStreak(["W", "D"]))).toBe("1무");
  });

  it("무승부와 패배도 각각 표기한다", () => {
    expect(describeStreak(getFormStreak(["D", "D"]))).toBe("2연무");
    expect(describeStreak(getFormStreak(["W", "L", "L"]))).toBe("2연패");
  });
});

describe("getRemainingDifficulty", () => {
  const positions = new Map([
    [1, 1],
    [2, 2],
    [3, 19],
    [4, 20],
  ]);

  it("상대가 없으면 null", () => {
    expect(getRemainingDifficulty([], 1, positions, 20)).toBeNull();
  });

  it("팀 수가 부족하면 null", () => {
    const matches = [createMatch({ homeId: 1, awayId: 2, status: "TIMED" })];

    expect(getRemainingDifficulty(matches, 1, positions, 1)).toBeNull();
  });

  it("순위가 아직 갈리지 않았으면(시즌 초) null", () => {
    const flat = new Map([
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ]);
    const matches = [createMatch({ homeId: 1, awayId: 2, status: "TIMED" })];

    expect(getRemainingDifficulty(matches, 1, flat, 20)).toBeNull();
  });

  it("상위권 상대만 남으면 난이도가 1 에 가깝다", () => {
    const matches = [createMatch({ homeId: 3, awayId: 2, status: "TIMED" })];
    const result = getRemainingDifficulty(matches, 3, positions, 20);

    expect(result?.averageOpponentPosition).toBe(2);
    expect(result?.score).toBeCloseTo(1 - 1 / 19, 5);
  });

  it("하위권 상대만 남으면 난이도가 0 에 가깝다", () => {
    const matches = [createMatch({ homeId: 1, awayId: 4, status: "TIMED" })];
    const result = getRemainingDifficulty(matches, 1, positions, 20);

    expect(result?.score).toBeCloseTo(0, 5);
    expect(result?.opponentCount).toBe(1);
  });

  it("해당 팀이 없는 경기는 무시한다", () => {
    const matches = [
      createMatch({ id: 1, homeId: 3, awayId: 4, status: "TIMED" }),
      createMatch({ id: 2, homeId: 1, awayId: 2, status: "TIMED" }),
    ];

    expect(getRemainingDifficulty(matches, 1, positions, 20)?.opponentCount).toBe(1);
  });
});
