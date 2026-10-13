import ErrorNotice from "@/app/_components/_commons/ErrorNotice/ErrorNotice";
import { getCompetitionsServer } from "@/app/_libs/football/competitions";
import ListCard from "../ListCard/ListCard";

export default async function LeagueListSection() {
  const competitions = await getCompetitionsServer().catch(() => null);

  if (!competitions) {
    return <ErrorNotice title="리그 목록을 불러오지 못했습니다." />;
  }

  return <ListCard data={competitions.competitions} title="Leagues" />;
}
