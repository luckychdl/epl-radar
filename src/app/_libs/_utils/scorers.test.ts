import { describe, expect, it } from "vitest";
import { Scorer } from "@/app/_types/scorers";
import {
  getPreviousSeasonYear,
  getScorersOfTeam,
  sumScorers,
  toSeasonOptions,
} from "./scorers";

function createScorer(
  id: number,
  teamId: number,
  goals: number,
  assists: number | null = null,
): Scorer {
  return {
    player: {
      id,
      name: `Player ${id}`,
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      nationality: "England",
      section: "Offence",
      position: null,
      shirtNumber: null,
    },
    team: {
      id: teamId,
      name: `Team ${teamId}`,
      shortName: `T${teamId}`,
      tla: `T${teamId}`,
      crest: `https://crests.example/${teamId}.png`,
    },
    playedMatches: 10,
    goals,
    assists,
    penalties: null,
  };
}

describe("getPreviousSeasonYear", () => {
  it("시즌 시작 연도에서 1을 뺀다", () => {
    expect(getPreviousSeasonYear("2026-08-21")).toBe(2025);
  });

  it("형식이 깨지면 null", () => {
    expect(getPreviousSeasonYear("not-a-date")).toBeNull();
  });
});

describe("getScorersOfTeam", () => {
  it("해당 팀 선수만 득점 순으로 남긴다", () => {
    const scorers = [
      createScorer(1, 57, 5),
      createScorer(2, 61, 9),
      createScorer(3, 57, 8),
    ];

    expect(getScorersOfTeam(scorers, 57).map((s) => s.player.id)).toEqual([3, 1]);
  });

  it("득점이 같으면 도움으로 가른다", () => {
    const scorers = [createScorer(1, 57, 5, 2), createScorer(2, 57, 5, 7)];

    expect(getScorersOfTeam(scorers, 57).map((s) => s.player.id)).toEqual([2, 1]);
  });

  it("해당 팀이 없으면 빈 배열", () => {
    expect(getScorersOfTeam([createScorer(1, 61, 5)], 57)).toEqual([]);
  });
});

describe("sumScorers", () => {
  it("도움이 비어 있으면 0으로 센다", () => {
    const totals = sumScorers([
      createScorer(1, 57, 5, 3),
      createScorer(2, 57, 2, null),
    ]);

    expect(totals).toEqual({ goals: 7, assists: 3, players: 2 });
  });

  it("빈 목록은 0", () => {
    expect(sumScorers([])).toEqual({ goals: 0, assists: 0, players: 0 });
  });
});

describe("toSeasonOptions", () => {
  const seasons = [
    { startDate: "2026-08-21" },
    { startDate: "2025-08-15" },
    { startDate: "2024-08-16" },
  ];

  it("최신순으로 라벨을 만든다", () => {
    const options = toSeasonOptions(seasons, "2026-08-21");

    expect(options.map((option) => option.label)).toEqual([
      "2026-27",
      "2025-26",
      "2024-25",
    ]);
  });

  it("진행 중인 시즌만 isCurrent", () => {
    const options = toSeasonOptions(seasons, "2026-08-21");

    expect(options.filter((option) => option.isCurrent)).toHaveLength(1);
    expect(options[0].isCurrent).toBe(true);
  });

  it("같은 연도가 중복돼도 한 번만 남긴다", () => {
    const options = toSeasonOptions(
      [{ startDate: "2025-08-15" }, { startDate: "2025-09-01" }],
      undefined,
    );

    expect(options).toHaveLength(1);
    expect(options[0].isCurrent).toBe(false);
  });

  it("형식이 깨진 시즌은 버린다", () => {
    expect(toSeasonOptions([{ startDate: "nope" }], undefined)).toEqual([]);
  });

  it("무료 플랜이 열어주지 않는 오래된 시즌은 잘라낸다", () => {
    const many = Array.from({ length: 20 }, (_, index) => ({
      startDate: `${2026 - index}-08-15`,
    }));

    const options = toSeasonOptions(many, "2026-08-15");

    expect(options).toHaveLength(4);
    expect(options.at(-1)?.label).toBe("2023-24");
  });
});
