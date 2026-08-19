import Image from "next/image";
import Link from "next/link";
import { SUPPORTED_LEAGUES } from "@/app/_constants/leagues";
import { Competition } from "@/app/_types/competitions";
import styles from "./ListCard.module.scss";

const LEAGUE_ORDER = new Map<string, number>(
  SUPPORTED_LEAGUES.map((league, index) => [league.code, index]),
);

interface Props {
  data: Competition[];
  title: string;
}

export default function ListCard({ data, title }: Props) {
  const competitions = data
    .filter((competition) => LEAGUE_ORDER.has(competition.code))
    .sort(
      (a, b) =>
        (LEAGUE_ORDER.get(a.code) ?? 0) - (LEAGUE_ORDER.get(b.code) ?? 0),
    );

  return (
    <nav className={styles.listCard}>
      <h4>{title}</h4>
      {competitions.map((competition) => (
        <Link
          key={competition.id}
          href={`/leagues/${competition.id}/${competition.code}/overview`}
        >
          {competition.emblem && (
            <Image src={competition.emblem} alt="" width={24} height={24} />
          )}
          <p>{competition.name}</p>
        </Link>
      ))}
    </nav>
  );
}
