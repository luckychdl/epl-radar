import { useQuery } from "@tanstack/react-query";
import { getTeamRecentMatches, getTeamScheduledMatches } from "./apis";
export function useTeamRecentMeatched(teamId: number, code: string) {
  return useQuery({
    queryKey: ["recentMatch", teamId],
    queryFn: () => getTeamRecentMatches(teamId, code),
    enabled: !!teamId && !!code,
    staleTime: 1000 * 60 * 60,

    gcTime: 1000 * 60 * 60,
    retry: false,
  });
}
export function useTeamScheduledMeatched(teamId: number, code: string) {
  return useQuery({
    queryKey: ["scheduledMatch", teamId],
    queryFn: () => getTeamScheduledMatches(teamId, code),
    enabled: !!teamId && !!code,
    staleTime: 1000 * 60 * 60,

    gcTime: 1000 * 60 * 60,
    retry: false,
  });
}
