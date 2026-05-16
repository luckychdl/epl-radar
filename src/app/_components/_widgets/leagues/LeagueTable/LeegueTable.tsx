import { Standing, Table } from "@/app/_types/standings";
import styles from "./LeagueTable.module.scss";
import Image from "next/image";
interface Props {
  standings: Standing;
}
export default function LeagueTable({ standings }: Props) {
  console.log(standings, "standings");
  return (
    <div className={styles.leagueTable}>
      <div>
        <header>
          <p>#</p>
          <p></p>
          <p>PL</p>
          <p>W</p>
          <p>D</p>
          <p>L</p>
          <p>+/-</p>
          <p>GD</p>
          <p>PTS</p>
          <p>Form</p>
        </header>
        <div>
          {standings.table.map((v: Table) => (
            <div key={v.team.id}>
              <span>{v.position}</span>
              <div>
                <Image src={v.team.crest} alt="" width={18} height={18} />
                <span>{v.team.name}</span>
              </div>
              <span>{v.playedGames}</span>
              <span>{v.won}</span>
              <span>{v.draw}</span>
              <span>{v.lost}</span>
              <span>
                {v.goalsFor}-{v.goalsAgainst}
              </span>
              <span>+{v.goalDifference}</span>
              <span>{v.points}</span>
              <span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
