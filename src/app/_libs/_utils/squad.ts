import { TeamPlayer } from "@/app/_types/teamDetail";

/** football-data 무료 플랜이 내려주는 position 값과 표기 순서 */
const POSITION_LABELS = [
  ["Goalkeeper", "골키퍼"],
  ["Defence", "수비수"],
  ["Midfield", "미드필더"],
  ["Offence", "공격수"],
] as const;

const OTHER_LABEL = "기타";

export interface SquadGroup {
  position: string;
  label: string;
  players: TeamPlayer[];
}

/** 만 나이. 생년월일이 없거나 형식이 깨졌으면 null. */
export function getAge(
  dateOfBirth: string | null | undefined,
  now = new Date(),
): number | null {
  if (!dateOfBirth) return null;

  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;

  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age < 0 ? null : age;
}

/**
 * 포지션별로 묶는다. 알려진 포지션을 먼저 정해진 순서로 두고,
 * 응답에 새 포지션이 생겨도 버리지 않도록 나머지는 "기타" 로 모은다.
 */
export function groupSquadByPosition(squad: TeamPlayer[]): SquadGroup[] {
  const known = new Set<string>(POSITION_LABELS.map(([position]) => position));

  const groups: SquadGroup[] = POSITION_LABELS.map(([position, label]) => ({
    position,
    label,
    players: squad.filter((player) => player.position === position),
  }));

  const others = squad.filter((player) => !known.has(player.position));

  if (others.length > 0) {
    groups.push({ position: OTHER_LABEL, label: OTHER_LABEL, players: others });
  }

  return groups.filter((group) => group.players.length > 0);
}
