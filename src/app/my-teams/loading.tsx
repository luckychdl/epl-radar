import SkeletonBlock from "@/app/_components/_commons/SkeletonBlock/SkeletonBlock";
import styles from "./myTeams.module.scss";

export default function Loading() {
  return (
    <div className={styles.myTeams}>
      <h2>My Teams</h2>
      {/* MyTeamsList 의 하이드레이션 스켈레톤과 같은 카드 높이 */}
      <SkeletonBlock count={3} height={78} radius={16} />
    </div>
  );
}
