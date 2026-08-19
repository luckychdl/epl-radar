import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FavoriteLeague, FavoriteTeam } from "@/app/_types/favorites";

interface FavoriteState {
  teams: FavoriteTeam[];
  leagues: FavoriteLeague[];
  toggleTeam: (team: FavoriteTeam) => void;
  toggleLeague: (league: FavoriteLeague) => void;
  isFavoriteTeam: (teamId: number) => boolean;
  isFavoriteLeague: (code: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      teams: [],
      leagues: [],
      toggleTeam: (team) =>
        set((state) => ({
          teams: state.teams.some((saved) => saved.id === team.id)
            ? state.teams.filter((saved) => saved.id !== team.id)
            : [...state.teams, team],
        })),
      toggleLeague: (league) =>
        set((state) => ({
          leagues: state.leagues.some((saved) => saved.code === league.code)
            ? state.leagues.filter((saved) => saved.code !== league.code)
            : [...state.leagues, league],
        })),
      isFavoriteTeam: (teamId) =>
        get().teams.some((saved) => saved.id === teamId),
      isFavoriteLeague: (code) =>
        get().leagues.some((saved) => saved.code === code),
    }),
    { name: "epl-radar-favorites", version: 1 },
  ),
);
