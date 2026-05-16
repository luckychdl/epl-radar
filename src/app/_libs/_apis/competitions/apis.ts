import { Competition, CompetitionsResponse } from "@/app/_types/competitions";
import axiosInstance from "../../_uitils/axiosInstance";

export async function getCompetitions() {
  const res = await axiosInstance.get<CompetitionsResponse>(`/competitions`);
  const filter = res.data.competitions.filter(
    (el: Competition) => el.code !== "BSA",
  );

  return { ...res.data, competitions: filter };
}
