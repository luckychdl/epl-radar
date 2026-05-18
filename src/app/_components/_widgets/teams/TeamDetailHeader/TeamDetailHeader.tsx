"use client";
import { useParams, useRouter } from "next/navigation";
import styles from "./TeamDetailHeader.module.scss";
import { TeamDetailResponse } from "@/app/_types/teamDetail";
import Image from "next/image";
interface Props {
  team: TeamDetailResponse;
}
export default function TeamDetailHeader({ team }: Props) {
  const params = useParams();
  const { type, id, code } = params;
  const router = useRouter();
  const handleShiftType = (type: string) => {
    router.push(`/teams/${id}/${code}/${type}`);
  };
  return (
    <div className={styles.teamDetailHeader}>
      <header>
        <Image src={team.crest} alt="" width={100} height={100} />
        <div>
          <span>{team.shortName}</span>
          <p>{team.area.name}</p>
        </div>
      </header>
      <nav>
        <button
          className={type == "overview" ? styles.current : undefined}
          onClick={() => handleShiftType("overview")}
        >
          Overview
        </button>
        <button
          className={type == "matches" ? styles.current : undefined}
          onClick={() => handleShiftType("matches")}
        >
          Matches
        </button>
        <button
          className={type == "squad" ? styles.current : undefined}
          onClick={() => handleShiftType("squad")}
        >
          Squad
        </button>
        <button
          className={type == "stats" ? styles.current : undefined}
          onClick={() => handleShiftType("stats")}
        >
          Stats
        </button>
      </nav>
    </div>
  );
}
