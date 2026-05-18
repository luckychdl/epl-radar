"use client";
import Image from "next/image";
import styles from "./LeagueTableRow.module.scss";
import { Table } from "@/app/_types/standings";
import { LEAGUE_RULES } from "@/app/_constants/leagueRules";
import { useParams, useRouter } from "next/navigation";

import LeagueMatchResult from "../LeagueMatchResult/LeagueMatchResult";
import { Match } from "@/app/_types/matches";
interface Props {
  data: Table;
  matches: Match[];
  scheduled: Match[];
}
type LeagueCode = keyof typeof LEAGUE_RULES;
export default function LeagueTableRow({ data, matches, scheduled }: Props) {
  const params = useParams();
  const code = typeof params.code === "string" ? params.code : undefined;
  const rules = code ? LEAGUE_RULES[code as LeagueCode] : undefined;
  const isUcl = rules?.ucl.includes(data.position) ?? false;
  const isUel = rules?.uel.includes(data.position) ?? false;
  const isUecl = rules?.uecl.includes(data.position) ?? false;
  const isRelegation = rules?.relegation.includes(data.position) ?? false;
  const match = matches
    .filter(
      (match) =>
        match.homeTeam.id === data.team.id ||
        match.awayTeam.id === data.team.id,
    )

    .slice(-5);
  const nextMatch = scheduled.find(
    (match) =>
      match.homeTeam.id === data.team.id || match.awayTeam.id === data.team.id,
  );
  const nextMatchTeam =
    nextMatch?.homeTeam.id == data.team.id
      ? nextMatch.awayTeam.crest
      : nextMatch?.homeTeam.crest;
  const router = useRouter();
  const handleMoveTeamDetail = (teamId: number) => {
    router.push(`/teams/${teamId}/${code}/overview`);
  };
  return (
    <div key={data.team.id} className={styles.leagueTableRow}>
      <div className={styles.rank}>
        <p
          className={`${isUcl ? styles.ucl : undefined} ${isUecl ? styles.uecl : undefined} ${isUel ? styles.uel : undefined} ${isRelegation ? styles.relegation : undefined}`}
        ></p>
        <span>{data.position}</span>
      </div>
      <button
        className={styles.teamName}
        onClick={() => handleMoveTeamDetail(data.team.id)}
      >
        <Image src={data.team.crest} alt="" width={18} height={18} />
        <span>{data.team.shortName}</span>
      </button>
      <span>{data.playedGames}</span>
      <span>{data.won}</span>
      <span>{data.draw}</span>
      <span>{data.lost}</span>
      <span>
        {data.goalsFor}-{data.goalsAgainst}
      </span>
      <span>
        {String(data.goalDifference).startsWith("-") ? "" : "+"}
        {data.goalDifference}
      </span>
      <span>{data.points}</span>
      <div className={styles.leagueMatchResult}>
        {match.map((v) => (
          <LeagueMatchResult match={v} key={v.id} team={data.team} />
        ))}
      </div>
      <div className={styles.nextMatch}>
        {nextMatchTeam && (
          <Image src={nextMatchTeam} alt="" width={20} height={20} />
        )}
      </div>
    </div>
  );
}
