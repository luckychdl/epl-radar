import { getAge, groupSquadByPosition } from "@/app/_libs/_utils/squad";
import { TeamPlayer } from "@/app/_types/teamDetail";
import styles from "./TeamSquad.module.scss";

interface Props {
  squad: TeamPlayer[];
}

export default function TeamSquad({ squad }: Props) {
  const groups = groupSquadByPosition(squad);

  if (groups.length === 0) {
    return (
      <div className={styles.teamSquad}>
        <div className={styles.empty}>등록된 선수 명단이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.teamSquad}>
      <header>
        <span>스쿼드</span>
        <em>{squad.length}명</em>
      </header>

      {groups.map((group) => (
        <section key={group.position}>
          <h3>
            {group.label}
            <span>{group.players.length}</span>
          </h3>
          <ul>
            {group.players.map((player) => {
              const age = getAge(player.dateOfBirth);

              return (
                <li key={player.id}>
                  <span className={styles.name}>{player.name}</span>
                  <span className={styles.meta}>
                    {player.nationality}
                    {age !== null && ` · ${age}세`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className={styles.notice}>
        무료 플랜은 등번호를 선수 목록에 싣지 않습니다. 득점·도움 기록은 Stats
        탭에서 확인할 수 있습니다.
      </p>
    </div>
  );
}
