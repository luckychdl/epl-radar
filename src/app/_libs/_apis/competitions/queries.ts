import { useQuery } from "@tanstack/react-query";
import { REVALIDATE } from "@/app/_constants/football";
import { getCompetitions } from "./apis";

export function useCompetitions() {
  return useQuery({
    queryKey: ["competitions"],
    queryFn: getCompetitions,
    staleTime: REVALIDATE.static * 1000,
  });
}
