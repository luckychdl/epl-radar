import { describe, expect, it } from "vitest";
import { TableRow } from "@/app/_types/standings";
import { createMatch } from "./match.fixtures";
import {
  getHomeAwaySplit,
  getRecordPoints,
  getSeasonAverages,
  getTeamRecord,
} from "./teamStats";

function createRow(overrides: Partial<TableRow> = {}): TableRow {
  return {
    position: 1,
    team: {
      id: 1,
      name: "Team 1",
      shortName: "T1",
      tla: "T1",
      crest: "https://crests.example/1.png",
    },
    playedGames: 10,
    form: null,
    won: 6,
    draw: 2,
    lost: 2,
    points: 20,
    goalsFor: 18,
    goalsAgainst: 9,
    goalDifference: 9,
    ...overrides,
  };
}

describe("getHomeAwaySplit", () => {
  it("홈과 원정을 따로 집계한다", () => {
    const split = getHomeAwaySplit(
      [
        createMatch({ id: 1, homeId: 1, awayId: 2, homeGoals: 2, awayGoals: 0 }),
        createMatch({ id: 2, homeId: 3, awayId: 1, homeGoals: 1, awayGoals: 1 }),
        createMatch({ id: 3, homeId: 4, awayId: 1, homeGoals: 3, awayGoals: 1 }),
      ],
      1,
    );

    expect(split.home).toEqual({
      played: 1,
      won: 1,
      draw: 0,
      lost: 0,
      goalsFor: 2,
      goalsAgainst: 0,
    });
    expect(split.away).toEqual({
      played: 2,
      won: 0,
      draw: 1,
      lost: 1,
      goalsFor: 2,
      goalsAgainst: 4,
    });
  });

  it("종료되지 않은 경기는 세지 않는다", () => {
    const split = getHomeAwaySplit(
      [
        createMatch({ id: 1, homeId: 1, awayId: 2, status: "TIMED" }),
        createMatch({
          id: 2,
          homeId: 1,
          awayId: 3,
          homeGoals: 1,
          awayGoals: 0,
          status: "IN_PLAY",
        }),
      ],
      1,
    );

    expect(split.home.played).toBe(0);
    expect(split.away.played).toBe(0);
  });

  it("해당 팀이 없는 경기는 건너뛴다", () => {
    const split = getHomeAwaySplit(
      [createMatch({ id: 1, homeId: 2, awayId: 3, homeGoals: 1, awayGoals: 0 })],
      1,
    );

    expect(split.home.played).toBe(0);
    expect(split.away.played).toBe(0);
  });
});

describe("getSeasonAverages", () => {
  it("경기당 지표를 계산한다", () => {
    const averages = getSeasonAverages(createRow());

    expect(averages).toEqual({
      pointsPerGame: 2,
      goalsForPerGame: 1.8,
      goalsAgainstPerGame: 0.9,
      winRate: 0.6,
    });
  });

  it("아직 경기를 안 치렀으면 null", () => {
    expect(getSeasonAverages(createRow({ playedGames: 0 }))).toBeNull();
  });
});

describe("getTeamRecord", () => {
  it("팀 기준으로 승·무·패와 득실을 센다", () => {
    const record = getTeamRecord(
      [
        createMatch({ id: 1, homeId: 1, awayId: 2, homeGoals: 2, awayGoals: 0 }),
        createMatch({ id: 2, homeId: 3, awayId: 1, homeGoals: 1, awayGoals: 1 }),
        createMatch({ id: 3, homeId: 4, awayId: 1, homeGoals: 3, awayGoals: 1 }),
      ],
      1,
    );

    expect(record).toEqual({
      played: 3,
      won: 1,
      draw: 1,
      lost: 1,
      goalsFor: 4,
      goalsAgainst: 4,
    });
  });

  it("종료되지 않은 경기와 남의 경기는 빼고 센다", () => {
    const record = getTeamRecord(
      [
        createMatch({ id: 1, homeId: 1, awayId: 2, status: "TIMED" }),
        createMatch({ id: 2, homeId: 2, awayId: 3, homeGoals: 1, awayGoals: 0 }),
      ],
      1,
    );

    expect(record.played).toBe(0);
  });
});

describe("getRecordPoints", () => {
  it("승 3점 무 1점", () => {
    expect(
      getRecordPoints({
        played: 5,
        won: 3,
        draw: 1,
        lost: 1,
        goalsFor: 0,
        goalsAgainst: 0,
      }),
    ).toBe(10);
  });
});
