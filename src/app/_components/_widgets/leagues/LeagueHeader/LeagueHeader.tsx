import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/app/_components/_commons/FavoriteButton/FavoriteButton";
import { Area, CompetitionSummary } from "@/app/_types/common";
import styles from "./LeagueHeader.module.scss";

const TABS = [
  { type: "overview", label: "Overview" },
  { type: "table", label: "Table" },
] as const;

interface Props {
  competition: CompetitionSummary;
  area: Area;
  id: string;
  code: string;
  type: string;
}

export default function LeagueHeader({
  competition,
  area,
  id,
  code,
  type,
}: Props) {
  return (
    <div className={styles.leagueHeader}>
      <header>
        {competition.emblem && (
          <Image src={competition.emblem} alt="" width={100} height={100} />
        )}
        <div>
          <span>{competition.name}</span>
          <p>{area.name}</p>
        </div>
        <FavoriteButton
          type="league"
          league={{ code, name: competition.name }}
        />
      </header>
      <nav>
        {TABS.map((tab) => (
          <Link
            key={tab.type}
            href={`/leagues/${id}/${code}/${tab.type}`}
            className={type === tab.type ? styles.current : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
