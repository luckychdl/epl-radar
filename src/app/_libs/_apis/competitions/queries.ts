import { useQuery } from "@tanstack/react-query";
import { getCompetitions } from "./apis";
export function useCompetitions() {
  return useQuery({
    queryKey: ["competitions"],
    queryFn: () => getCompetitions(),
  });
}
