"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import ErrorNotice from "@/app/_components/_commons/ErrorNotice/ErrorNotice";
import { useHasHydrated } from "@/app/_hooks/useHasHydrated";
import { useMatchPolling } from "@/app/_hooks/useMatchPolling";
import {
  getMatchesOfTeams,
  getScoreChangedMatchIds,
  sortLeaguesByFavorite,
} from "@/app/_libs/_utils/match";
import { useFavoriteStore } from "@/app/_stores/useFavoriteStore";
import { TodayMatchesResponse } from "@/app/_types/todayMatches";
import MatchUpdateStatus from "../MatchUpdateStatus/MatchUpdateStatus";
import TodayMatchRow from "../TodayMatchRow/TodayMatchRow";
import styles from "./TodayMatches.module.scss";

/** 플래시 애니메이션 길이보다 살짝 길게 잡아 다음 변경을 다시 강조할 수 있게 한다. */
const FLASH_DURATION_MS = 1600;

interface Props {
  date?: string;
  initialData: TodayMatchesResponse;
}

export default function TodayMatches({ date, initialData }: Props) {
  const { data, dataUpdatedAt, isPolling } = useMatchPolling(date, initialData);

  // 개인화는 클라이언트 정렬·필터로만 한다. 사용자마다 서버 요청이 갈라지면
  // 캐시 적중률이 무너지고 곧바로 분당 한도에 걸린다.
  const hasHydrated = useHasHydrated();
  const favoriteTeams = useFavoriteStore((state) => state.teams);
  const favoriteLeagues = useFavoriteStore((state) => state.leagues);

  const [collapsedCodes, setCollapsedCodes] = useState<string[]>([]);
  const [flashedIds, setFlashedIds] = useState<number[]>([]);
  const previousLeaguesRef = useRef(initialData.leagues);

  useEffect(() => {
    const changed = getScoreChangedMatchIds(
      previousLeaguesRef.current,
      data.leagues,
    );
    previousLeaguesRef.current = data.leagues;

    if (changed.length === 0) return;

    setFlashedIds(changed);
    const timer = setTimeout(() => setFlashedIds([]), FLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [data]);

  const toggleLeague = (code: string) => {
    setCollapsedCodes((prev) =>
      prev.includes(code)
        ? prev.filter((collapsed) => collapsed !== code)
        : [...prev, code],
    );
  };

  if (data.leagues.length === 0) {
    return <ErrorNotice title="경기 일정을 불러오지 못했습니다." />;
  }

  const myMatches = hasHydrated
    ? getMatchesOfTeams(
        data.leagues,
        favoriteTeams.map((team) => team.id),
      )
    : [];
  const leagues = hasHydrated
    ? sortLeaguesByFavorite(
        data.leagues,
        favoriteLeagues.map((league) => league.code),
      )
    : data.leagues;

  return (
    <>
      <MatchUpdateStatus updatedAt={dataUpdatedAt} isPolling={isPolling} />

      {myMatches.length > 0 && (
        <section className={styles.todayMatches}>
          <div className={styles.myMatchesHeader}>
            <Star size={16} />
            <span>My Matches</span>
          </div>
          {myMatches.map((match) => (
            <TodayMatchRow
              match={match}
              key={`my-${match.id}`}
              isScoreChanged={flashedIds.includes(match.id)}
            />
          ))}
        </section>
      )}

      {leagues.map((league) => {
        const isOpen = !collapsedCodes.includes(league.code);
        const area = league.matches.at(0)?.area;

        return (
          <section className={styles.todayMatches} key={league.code}>
            <button
              type="button"
              className={styles.todayMatchHeader}
              onClick={() => toggleLeague(league.code)}
              aria-expanded={isOpen}
            >
              <div>
                {area?.flag && (
                  <Image src={area.flag} alt="" width={20} height={20} />
                )}
                <span>
                  {area?.name && `${area.name} - `}
                  {league.name}
                </span>
              </div>
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {isOpen &&
              (league.matches.length > 0 ? (
                league.matches.map((match) => (
                  <TodayMatchRow
                    match={match}
                    key={match.id}
                    isScoreChanged={flashedIds.includes(match.id)}
                  />
                ))
              ) : (
                <div className={styles.noMatches}>
                  <span>No matches today</span>
                </div>
              ))}
          </section>
        );
      })}
    </>
  );
}
