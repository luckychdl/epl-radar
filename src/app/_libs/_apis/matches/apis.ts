import { TodayMatchesResponse } from "@/app/_types/todayMatches";
import axiosInstance from "../../_utils/axiosInstance";

export async function getTodayMatches(date?: string) {
  const res = await axiosInstance.get<TodayMatchesResponse>("/matches", {
    params: date ? { date } : undefined,
  });

  return res.data;
}
