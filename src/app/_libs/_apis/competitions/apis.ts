import { SUPPORTED_LEAGUES } from "@/app/_constants/leagues";
import { CompetitionsResponse } from "@/app/_types/competitions";
import axiosInstance from "../../_utils/axiosInstance";

const SUPPORTED_CODES = new Set<string>(
  SUPPORTED_LEAGUES.map((league) => league.code),
);

export async function getCompetitions() {
  const res = await axiosInstance.get<CompetitionsResponse>("/competitions");
  const competitions = res.data.competitions.filter((competition) =>
    SUPPORTED_CODES.has(competition.code),
  );

  return { ...res.data, competitions };
}
