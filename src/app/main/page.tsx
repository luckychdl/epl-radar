import ListCard from "../_components/_widgets/main/ListCard/ListCard";
import MatchCard from "../_components/_widgets/main/MatchCard/MatchCard";
import styles from "./main.module.scss";
export default function MainPage() {
  return (
    <div className={styles.main}>
      <div>
        <ListCard />
      </div>
      <div>
        <MatchCard />
      </div>
      <div></div>
    </div>
  );
}
