import Image from "next/image";
import { TeamDetailResponse } from "@/app/_types/teamDetail";
import styles from "./TeamInfo.module.scss";

interface Props {
  team: TeamDetailResponse;
}

export default function TeamInfo({ team }: Props) {
  // 무료 플랜은 필드가 비어 오는 경우가 있다. 값이 있는 항목만 줄을 만든다.
  const rows = [
    { label: "정식 명칭", value: team.name },
    { label: "창단", value: team.founded ? `${team.founded}년` : null },
    { label: "홈 구장", value: team.venue },
    { label: "클럽 컬러", value: team.clubColors },
    { label: "연고", value: team.area?.name },
    { label: "주소", value: team.address },
  ].filter((row) => !!row.value);

  return (
    <div className={styles.teamInfo}>
      <header>
        <span>클럽 정보</span>
        {team.website && (
          <a href={team.website} target="_blank" rel="noreferrer noopener">
            공식 홈페이지
          </a>
        )}
      </header>

      <dl>
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      {team.runningCompetitions?.length > 0 && (
        <div className={styles.competitions}>
          <strong>참가 중인 대회</strong>
          <ul>
            {team.runningCompetitions.map((competition) => (
              <li key={competition.id}>
                {competition.emblem && (
                  <Image
                    src={competition.emblem}
                    alt=""
                    width={20}
                    height={20}
                  />
                )}
                <span>{competition.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
