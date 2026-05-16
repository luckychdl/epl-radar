import ListCard from "../_components/_widgets/main/ListCard/ListCard";
import MatchCard from "../_components/_widgets/main/MatchCard/MatchCard";
import { getCompetitionsServer } from "../_libs/football/competitions";
import styles from "./main.module.scss";
export default async function MainPage() {
  const competitionRes = await getCompetitionsServer();
  return (
    <div className={styles.main}>
      <div>
        <ListCard data={competitionRes.competitions} title={"Leagues"} />
      </div>
      <div>
        <MatchCard />
      </div>
      <div></div>
    </div>
  );
}
