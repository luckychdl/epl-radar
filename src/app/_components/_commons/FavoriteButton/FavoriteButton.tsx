"use client";

import { Star } from "lucide-react";
import { useHasHydrated } from "@/app/_hooks/useHasHydrated";
import { useFavoriteStore } from "@/app/_stores/useFavoriteStore";
import { FavoriteLeague, FavoriteTeam } from "@/app/_types/favorites";
import styles from "./FavoriteButton.module.scss";

type Props =
  | { type: "team"; team: FavoriteTeam }
  | { type: "league"; league: FavoriteLeague };

export default function FavoriteButton(props: Props) {
  const hasHydrated = useHasHydrated();
  const toggleTeam = useFavoriteStore((state) => state.toggleTeam);
  const toggleLeague = useFavoriteStore((state) => state.toggleLeague);
  const isFavorite = useFavoriteStore((state) =>
    props.type === "team"
      ? state.isFavoriteTeam(props.team.id)
      : state.isFavoriteLeague(props.league.code),
  );

  const name = props.type === "team" ? props.team.name : props.league.name;
  // localStorage 값은 서버 렌더에 존재하지 않으므로 하이드레이션 전에는 빈 별로 둔다.
  const isActive = hasHydrated && isFavorite;

  return (
    <button
      type="button"
      className={`${styles.favoriteButton} ${isActive ? styles.active : ""}`}
      onClick={() =>
        props.type === "team"
          ? toggleTeam(props.team)
          : toggleLeague(props.league)
      }
      aria-pressed={isActive}
      aria-label={`${name} 즐겨찾기`}
    >
      <Star size={20} />
    </button>
  );
}
