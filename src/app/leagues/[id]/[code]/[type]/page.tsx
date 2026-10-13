import ErrorNotice from "@/app/_components/_commons/ErrorNotice/ErrorNotice";
import LeagueHeader from "@/app/_components/_widgets/leagues/LeagueHeader/LeagueHeader";
import LeagueTable from "@/app/_components/_widgets/leagues/LeagueTable/LeagueTable";
import SeasonSelect from "@/app/_components/_widgets/leagues/SeasonSelect/SeasonSelect";
import StandingsChart from "@/app/_components/_widgets/leagues/StandingsChart/StandingsChart";
import TopScorers from "@/app/_components/_widgets/leagues/TopScorers/TopScorers";
import { toSeasonOptions } from "@/app/_libs/_utils/scorers";
import { buildPositionHistory } from "@/app/_libs/_utils/standings";
import { getCompetitionDetailServer } from "@/app/_libs/football/competitions";
import { getMatchesRecentServer } from "@/app/_libs/football/matches";
import { getCompetitionScorersServer } from "@/app/_libs/football/scorers";
import { getCompetitionStandingsServer } from "@/app/_libs/football/standings";
import styles from "./leagues.module.scss";

interface Props {
  params: Promise<{ id: string; code: string; type: string }>;
  searchParams: Promise<{ season?: string }>;
}

/** 쿼리로 들어온 시즌은 4자리 연도만 통과시킨다. */
function parseSeason(value: string | undefined): number | null {
  return value && /^\d{4}$/.test(value) ? Number(value) : null;
}

export default async function LeaguesPage({ params, searchParams }: Props) {
  const { id, code, type } = await params;
  const season = parseSeason((await searchParams).season ?? undefined);

  // 무료 플랜 요청 제한(429) 등으로 실패해도 에러 화면 대신 안내를 보여준다.
  // 시즌 목록은 하루 캐시라 사실상 매번 캐시에서 온다.
  const [data, recent, scorers, detail] = await Promise.all([
    getCompetitionStandingsServer(code, season ?? undefined).catch(() => null),
    getMatchesRecentServer(code, season ?? undefined).catch(() => null),
    getCompetitionScorersServer(code, season ?? undefined).catch(() => null),
    getCompetitionDetailServer(code).catch(() => null),
  ]);

  if (!data) return <ErrorNotice />;

  const totalStanding = data.standings.at(0);
  const positionHistory = buildPositionHistory(recent?.matches ?? []);
  const seasons = toSeasonOptions(
    detail?.seasons ?? [],
    detail?.currentSeason?.startDate,
  );

  return (
    <div className={styles.leaguePage}>
      <LeagueHeader
        competition={data.competition}
        area={data.area}
        id={id}
        code={code}
        type={type}
      />

      <SeasonSelect
        seasons={seasons}
        selected={season}
        basePath={`/leagues/${id}/${code}/${type}`}
      />

      {totalStanding ? (
        <>
          <LeagueTable
            standings={totalStanding}
            code={code}
            season={season ?? undefined}
          />
          <StandingsChart history={positionHistory} />
          <TopScorers
            data={scorers?.data ?? null}
            code={code}
            isCurrentSeason={scorers?.isCurrentSeason ?? true}
          />
        </>
      ) : (
        <ErrorNotice
          title="순위 정보가 없습니다."
          description="이 대회는 순위표를 제공하지 않습니다."
        />
      )}
    </div>
  );
}
