import styles from "./DetailHeaderSkeleton.module.scss";

interface Props {
  /** 탭 개수. LeagueHeader 는 2개, TeamDetailHeader 는 4개다. */
  tabs: number;
}

/** 리그·팀 상세 헤더가 같은 골격이라 스켈레톤도 하나만 둔다. */
export default function DetailHeaderSkeleton({ tabs }: Props) {
  return (
    <div className={styles.detailHeaderSkeleton}>
      <header>
        <span className={styles.crest} />
        <div>
          <span className={styles.name} />
          <span className={styles.area} />
        </div>
        <span className={styles.favorite} />
      </header>
      <nav>
        {Array.from({ length: tabs }).map((_, index) => (
          <span key={index} className={styles.tab} />
        ))}
      </nav>
    </div>
  );
}
