"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useHasHydrated } from "@/app/_hooks/useHasHydrated";
import {
  getNextMatchOfTeam,
  getRecentMatchesOfTeam,
  isFinishedMatch,
} from "@/app/_libs/_utils/match";
import { useFavoriteStore } from "@/app/_stores/useFavoriteStore";
import { Match } from "@/app/_types/matches";
import LeagueMatchResult from "../../leagues/LeagueMatchResult/LeagueMatchResult";
import styles from "./MyTeamsList.module.scss";

const SKELETON_COUNT = 3;

interface Props {
  recentMatches: Match[];
  upcomingMatches: Match[];
}

export default function MyTeamsList({ recentMatches, upcomingMatches }: Props) {
  const hasHydrated = useHasHydrated();
  const teams = useFavoriteStore((state) => state.teams);

  if (!hasHydrated) {
    return (
      <div className={styles.myTeamsList}>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <div key={index} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className={styles.empty}>
        <strong>즐겨찾기한 팀이 없습니다.</strong>
        <p>
          팀 상세 페이지의 별 버튼을 누르면 이 목록에 추가됩니다.{" "}
          <Link href="/">홈에서 리그 둘러보기</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.myTeamsList}>
      {teams.map((team) => {
        // 이미 받아온 창 안에서만 채운다. 팀마다 추가 요청을 내지 않는다.
        const form = getRecentMatchesOfTeam(recentMatches, team.id).filter(
          (match) => isFinishedMatch(match.status),
        );
        const nextMatch = getNextMatchOfTeam(upcomingMatches, team.id);
        const opponent =
          nextMatch &&
          (nextMatch.homeTeam.id === team.id
            ? nextMatch.awayTeam
            : nextMatch.homeTeam);

        return (
          <section key={team.id} className={styles.teamCard}>
            <Link
              className={styles.teamName}
              href={`/teams/${team.id}/${team.code}/overview`}
            >
              {team.crest && (
                <Image src={team.crest} alt="" width={32} height={32} />
              )}
              <span>{team.name}</span>
            </Link>

            <div className={styles.form}>
              <p>최근 10일</p>
              {form.length > 0 ? (
                <div>
                  {form.map((match) => (
                    <LeagueMatchResult
                      key={match.id}
                      match={match}
                      teamId={team.id}
                    />
                  ))}
                </div>
              ) : (
                <span className={styles.none}>결과 없음</span>
              )}
            </div>

            <div className={styles.nextMatch}>
              <p>다음 경기</p>
              {nextMatch && opponent ? (
                <div>
                  {opponent.crest && (
                    <Image src={opponent.crest} alt="" width={24} height={24} />
                  )}
                  <span>{opponent.shortName}</span>
                  <em suppressHydrationWarning>
                    {format(new Date(nextMatch.utcDate), "MMM d h:mm a")}
                  </em>
                </div>
              ) : (
                <span className={styles.none}>예정 없음</span>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
