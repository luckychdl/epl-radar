import { CompetitionsResponse } from "@/app/_types/competitions.js";
import { footballServerFetch } from "./footballServerFetch.ts";

export function getCompetitionsServer() {
  return footballServerFetch<CompetitionsResponse>("/competitions", {
    revalidate: 60 * 60,
  });
}
