import { getTodayMatchesServer } from "@/app/_libs/football/todayMatches";
import TodayMatches from "../TodayMatches/TodayMatches";

interface Props {
  date?: string;
}

export default async function TodayMatchesSection({ date }: Props) {
  const todayMatches = await getTodayMatchesServer(date);

  return <TodayMatches date={date} initialData={todayMatches} />;
}
