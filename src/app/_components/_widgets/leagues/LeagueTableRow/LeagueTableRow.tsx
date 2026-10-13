import Image from "next/image";
import Link from "next/link";
import { LEAGUE_RULES } from "@/app/_constants/leagueRules";
import {
  getNextMatchOfTeam,
  getRecentMatchesOfTeam,
} from "@/app/_libs/_utils/match";
import { Match } from "@/app/_types/matches";
import { TableRow } from "@/app/_types/standings";
import LeagueMatchResult from "../LeagueMatchResult/LeagueMatchResult";
import styles from "./LeagueTableRow.module.scss";

type LeagueCode = keyof typeof LEAGUE_RULES;

interface Props {
  data: TableRow;
  code: string;
  matches: Match[];
  scheduled: Match[];
}

export default function LeagueTableRow({
  data,
  code,
  matches,
  scheduled,
}: Props) {
  const rules = LEAGUE_RULES[code as LeagueCode] as
    | (typeof LEAGUE_RULES)[LeagueCode]
    | undefined;

  const qualificationClass = [
    rules?.ucl.includes(data.position) && styles.ucl,
    rules?.uel.includes(data.position) && styles.uel,
    rules?.uecl.includes(data.position) && styles.uecl,
    rules?.relegation.includes(data.position) && styles.relegation,
  ]
    .filter(Boolean)
    .join(" ");

  const recentMatches = getRecentMatchesOfTeam(matches, data.team.id);
  const nextMatch = getNextMatchOfTeam(scheduled, data.team.id);
  const nextOpponentCrest =
    nextMatch &&
    (nextMatch.homeTeam.id === data.team.id
      ? nextMatch.awayTeam.crest
      : nextMatch.homeTeam.crest);

  return (
    <div className={styles.leagueTableRow}>
      <div className={styles.rank}>
        <p className={qualificationClass} />
        <span>{data.position}</span>
      </div>
      <Link
        className={styles.teamName}
        href={`/teams/${data.team.id}/${code}/overview`}
      >
        <Image src={data.team.crest} alt="" width={18} height={18} />
        <span>{data.team.shortName}</span>
      </Link>
      <span>{data.playedGames}</span>
      <span>{data.won}</span>
      <span>{data.draw}</span>
      <span>{data.lost}</span>
      <span>
        {data.goalsFor}-{data.goalsAgainst}
      </span>
      <span>
        {data.goalDifference > 0 && "+"}
        {data.goalDifference}
      </span>
      <span>{data.points}</span>
      <div className={styles.leagueMatchResult}>
        {recentMatches.map((match) => (
          <LeagueMatchResult key={match.id} match={match} teamId={data.team.id} />
        ))}
      </div>
      <div className={styles.nextMatch}>
        {nextOpponentCrest && (
          <Image src={nextOpponentCrest} alt="" width={20} height={20} />
        )}
      </div>
    </div>
  );
}
