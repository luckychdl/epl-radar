import ListCard from "../_components/_widgets/main/ListCard/ListCard";
import MatchCard from "../_components/_widgets/main/MatchCard/MatchCard";
import TodayMatches from "../_components/_widgets/main/TodayMatches/TodayMatches";
import { getTodayMatchesServer } from "../_libs/_apis/matches/apis";
import { getCompetitionsServer } from "../_libs/football/competitions";
import styles from "./main.module.scss";
interface Props {
  searchParams: {
    date: string;
  };
}
export default async function MainPage({ searchParams }: Props) {
  const date = searchParams?.date;
  const competitionRes = await getCompetitionsServer();
  const data = await getTodayMatchesServer(date);
  console.log(data, "leguesDATa");
  return (
    <div className={styles.main}>
      <div>
        <ListCard data={competitionRes.competitions} title={"Leagues"} />
      </div>
      <div>
        <MatchCard />
        <TodayMatches leagues={data.leagues} />
      </div>
      <div></div>
    </div>
  );
}
