"use client";
import Image from "next/image";
import styles from "./LeagueHeader.module.scss";
import { useParams } from "next/navigation";
import { Area, Competition } from "@/app/_types/standings";
interface Props {
  league: {
    competition: Competition;
    area: Area;
  };
}
export default function LeagueHeader({ league }: Props) {
  const params = useParams();
  const type = params.type;
  console.log(params.type);
  return (
    <div className={styles.leagueHeader}>
      <header>
        <Image
          src={league.competition.emblem}
          alt=""
          width={100}
          height={100}
        />
        <div>
          <span>{league.competition.name}</span>
          <p>{league.area.name}</p>
        </div>
      </header>
      <nav>
        <button className={type == "overview" ? styles.current : undefined}>
          Overview
        </button>
        <button>table</button>
      </nav>
    </div>
  );
}
