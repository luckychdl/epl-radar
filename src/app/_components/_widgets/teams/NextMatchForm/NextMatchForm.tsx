import { Match } from "@/app/_types/matches";
import styles from "./NextMatchForm.module.scss";
import Image from "next/image";
import { format } from "date-fns";
interface Props {
  match: Match[];
  id: string;
}
export default function NextMatchForm({ match, id }: Props) {
  const nextMatch = match.find(
    (match) =>
      match.homeTeam.id === Number(id) || match.awayTeam.id === Number(id),
  );
  const isHome = nextMatch?.homeTeam.id == Number(id);
  console.log(nextMatch);
  return (
    <div className={styles.nextMatchForm}>
      <div className={styles.header}>
        <span>Next Match</span>
        <button>
          <p>{nextMatch?.competition.name}</p>
          {nextMatch?.competition.emblem && (
            <Image
              src={nextMatch?.competition.emblem}
              alt=""
              width={24}
              height={24}
            />
          )}
        </button>
      </div>
      <div className={styles.content}>
        <div>
          {(nextMatch?.homeTeam.crest || nextMatch?.awayTeam.crest) && (
            <Image
              src={
                isHome ? nextMatch?.homeTeam.crest : nextMatch?.awayTeam.crest
              }
              alt=""
              width={32}
              height={32}
            />
          )}
          <p>
            {isHome
              ? nextMatch?.homeTeam.shortName
              : nextMatch?.awayTeam.shortName}
          </p>
        </div>
        <div>
          <span>
            {nextMatch?.utcDate ? format(nextMatch?.utcDate, "hh:mm aa") : ""}
          </span>
          <p>{nextMatch?.utcDate ? format(nextMatch?.utcDate, "MMM d") : ""}</p>
        </div>
        <div>
          {(nextMatch?.homeTeam.crest || nextMatch?.awayTeam.crest) && (
            <Image
              src={
                isHome ? nextMatch?.awayTeam.crest : nextMatch?.homeTeam.crest
              }
              alt=""
              width={32}
              height={32}
            />
          )}
          <p>
            {isHome
              ? nextMatch?.awayTeam.shortName
              : nextMatch?.homeTeam.shortName}
          </p>
        </div>
      </div>
    </div>
  );
}
