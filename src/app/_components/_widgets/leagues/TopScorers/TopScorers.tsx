import Image from "next/image";
import Link from "next/link";
import { CompetitionScorersResponse } from "@/app/_types/scorers";
import styles from "./TopScorers.module.scss";

interface Props {
  data: CompetitionScorersResponse | null;
  code: string;
  /** 표에 보여줄 인원. 전체 목록은 팀 상세에서 재사용한다. */
  limit?: number;
  /** 지금 보고 있는 시즌이 진행 중인 시즌인지 */
  isCurrentSeason: boolean;
}

export default function TopScorers({
  data,
  code,
  limit = 10,
  isCurrentSeason,
}: Props) {
  const scorers = data?.scorers.slice(0, limit) ?? [];

  if (scorers.length === 0) return null;

  const seasonYear = new Date(data!.season.startDate).getFullYear();

  return (
    <div className={styles.topScorers}>
      <header>
        <span>득점 순위</span>
        {!isCurrentSeason && (
          <em>
            {seasonYear}-{String((seasonYear + 1) % 100).padStart(2, "0")} 시즌
          </em>
        )}
      </header>

      <div className={styles.columns}>
        <span>골</span>
        <span>도움</span>
      </div>

      <ol>
        {scorers.map((scorer, index) => (
          <li key={scorer.player.id}>
            <span className={styles.rank}>{index + 1}</span>
            <div className={styles.player}>
              <span>{scorer.player.name}</span>
              <Link href={`/teams/${scorer.team.id}/${code}/overview`}>
                {scorer.team.crest && (
                  <Image
                    src={scorer.team.crest}
                    alt=""
                    width={16}
                    height={16}
                  />
                )}
                <em>{scorer.team.shortName}</em>
              </Link>
            </div>
            <span className={styles.goals}>{scorer.goals}</span>
            <span className={styles.assists}>
              {scorer.assists === null ? "-" : scorer.assists}
            </span>
          </li>
        ))}
      </ol>

    </div>
  );
}
