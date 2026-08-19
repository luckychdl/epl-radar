import { Suspense } from "react";
import LeagueListSection from "./_components/_widgets/main/LeagueListSection/LeagueListSection";
import LeagueListSkeleton from "./_components/_widgets/main/LeagueListSkeleton/LeagueListSkeleton";
import MatchCard from "./_components/_widgets/main/MatchCard/MatchCard";
import TodayMatchesSection from "./_components/_widgets/main/TodayMatchesSection/TodayMatchesSection";
import TodayMatchesSkeleton from "./_components/_widgets/main/TodayMatchesSkeleton/TodayMatchesSkeleton";
import { normalizeDateParam } from "./_libs/football/todayMatches";
import styles from "./home.module.scss";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { date } = await searchParams;
  // 잘못된 값을 클라이언트 폴링 쿼리로 흘리지 않도록 여기서 걸러낸다.
  const dateParam = normalizeDateParam(date);

  return (
    <div className={styles.main}>
      <div>
        {/* 섹션별로 끊어 스트리밍한다. 한쪽 응답이 늦어도 다른 쪽이 먼저 그려진다. */}
        <Suspense fallback={<LeagueListSkeleton />}>
          <LeagueListSection />
        </Suspense>
      </div>
      <div className={styles.todayMatches}>
        <MatchCard />
        <Suspense fallback={<TodayMatchesSkeleton />}>
          <TodayMatchesSection date={dateParam} />
        </Suspense>
      </div>
      <div />
    </div>
  );
}
