import { describe, expect, it } from "vitest";
import { TeamPlayer } from "@/app/_types/teamDetail";
import { getAge, groupSquadByPosition } from "./squad";

function createPlayer(
  id: number,
  position: string,
  dateOfBirth = "2000-01-01",
): TeamPlayer {
  return {
    id,
    name: `Player ${id}`,
    position,
    dateOfBirth,
    nationality: "England",
  };
}

describe("getAge", () => {
  it("생일이 지났으면 그해 나이", () => {
    expect(getAge("1995-01-01", new Date("2026-08-20"))).toBe(31);
  });

  it("생일이 아직 안 지났으면 한 살 적다", () => {
    expect(getAge("1995-12-31", new Date("2026-08-20"))).toBe(30);
  });

  it("생일 당일은 이미 지난 것으로 본다", () => {
    expect(getAge("1995-08-20", new Date("2026-08-20"))).toBe(31);
  });

  it("값이 없거나 형식이 깨지면 null", () => {
    expect(getAge(null)).toBeNull();
    expect(getAge("")).toBeNull();
    expect(getAge("not-a-date")).toBeNull();
  });
});

describe("groupSquadByPosition", () => {
  it("정해진 포지션 순서로 묶는다", () => {
    const groups = groupSquadByPosition([
      createPlayer(1, "Offence"),
      createPlayer(2, "Goalkeeper"),
      createPlayer(3, "Midfield"),
      createPlayer(4, "Defence"),
    ]);

    expect(groups.map((group) => group.position)).toEqual([
      "Goalkeeper",
      "Defence",
      "Midfield",
      "Offence",
    ]);
  });

  it("비어 있는 포지션 그룹은 버린다", () => {
    const groups = groupSquadByPosition([createPlayer(1, "Goalkeeper")]);

    expect(groups).toHaveLength(1);
    expect(groups[0].players).toHaveLength(1);
  });

  it("모르는 포지션도 버리지 않고 기타로 모은다", () => {
    const groups = groupSquadByPosition([
      createPlayer(1, "Goalkeeper"),
      createPlayer(2, "Left Winger"),
    ]);

    expect(groups.at(-1)?.label).toBe("기타");
    expect(groups.at(-1)?.players.map((player) => player.id)).toEqual([2]);
  });

  it("빈 스쿼드는 빈 배열", () => {
    expect(groupSquadByPosition([])).toEqual([]);
  });
});
