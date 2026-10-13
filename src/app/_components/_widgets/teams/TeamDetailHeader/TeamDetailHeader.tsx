import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/app/_components/_commons/FavoriteButton/FavoriteButton";
import { TEAM_TABS } from "@/app/_constants/teams";
import { TeamDetailResponse } from "@/app/_types/teamDetail";
import styles from "./TeamDetailHeader.module.scss";

interface Props {
  team: TeamDetailResponse;
  id: string;
  code: string;
  type: string;
}

export default function TeamDetailHeader({ team, id, code, type }: Props) {
  return (
    <div className={styles.teamDetailHeader}>
      <header>
        {team.crest && <Image src={team.crest} alt="" width={100} height={100} />}
        <div>
          <span>{team.shortName}</span>
          <p>{team.area.name}</p>
        </div>
        <FavoriteButton
          type="team"
          team={{
            id: team.id,
            name: team.shortName || team.name,
            crest: team.crest,
            code,
          }}
        />
      </header>
      <nav>
        {TEAM_TABS.map((tab) => (
          <Link
            key={tab.type}
            href={`/teams/${id}/${code}/${tab.type}`}
            className={type === tab.type ? styles.current : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
