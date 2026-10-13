import Link from "next/link";
import { SeasonOption } from "@/app/_libs/_utils/scorers";
import styles from "./SeasonSelect.module.scss";

interface Props {
  seasons: SeasonOption[];
  /** 지금 보고 있는 시즌 시작 연도 */
  selected: number | null;
  basePath: string;
}

export default function SeasonSelect({ seasons, selected, basePath }: Props) {
  if (seasons.length < 2) return null;

  return (
    <nav className={styles.seasonSelect} aria-label="시즌 선택">
      {seasons.map((season) => {
        // 진행 중인 시즌은 쿼리 없는 기본 URL 로 둔다.
        const href = season.isCurrent
          ? basePath
          : `${basePath}?season=${season.year}`;
        const isActive = season.isCurrent
          ? selected === null || selected === season.year
          : selected === season.year;

        return (
          <Link
            key={season.year}
            href={href}
            className={isActive ? styles.current : undefined}
          >
            {season.label}
            {season.isCurrent && <em>진행 중</em>}
          </Link>
        );
      })}
    </nav>
  );
}
