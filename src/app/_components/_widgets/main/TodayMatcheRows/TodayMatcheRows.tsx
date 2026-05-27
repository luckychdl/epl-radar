import Image from "next/image";
import styles from "./TodayMatcheRows.module.scss";
import { differenceInCalendarDays, format } from "date-fns";
import { Match } from "@/app/_types/todayMatches";
import { useState } from "react";
interface Props {
  v: Match;
  rowController:
    | {
        code: string;
        name: string;
        open: boolean;
      }
    | undefined;
}
export default function TodayMatchRows({ v, rowController }: Props) {
  function getMatchTimeLabel(utcDate: string) {
    const matchDate = new Date(utcDate);

    const diffDays = differenceInCalendarDays(
      matchDate,

      new Date(),
    );

    if (diffDays > 0) {
      return `+${diffDays} day`;
    }
  }
  return (
    <>
      {rowController?.open && (
        <button className={styles.matchRows}>
          <div className={styles.matchTeam}>
            <span>{v.homeTeam.shortName}</span>
            <Image src={v.homeTeam.crest} alt="" width={20} height={20} />
          </div>
          <div className={styles.matchTime}>
            <p>{getMatchTimeLabel(v.utcDate)}</p>
            <span>
              {format(new Date(v.utcDate), "H:mm")}
              <p>{format(new Date(v.utcDate), "a")}</p>
            </span>
          </div>
          <div className={styles.matchTeam}>
            <Image src={v.awayTeam.crest} alt="" width={20} height={20} />
            <span>{v.awayTeam.shortName}</span>
          </div>
        </button>
      )}
    </>
  );
}
