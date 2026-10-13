import BudgetPanel from "@/app/_components/_widgets/budget/BudgetPanel/BudgetPanel";
import { FREE_PLAN_REQUESTS_PER_MINUTE } from "@/app/_constants/football";
import { getBudgetSnapshot } from "@/app/_libs/football/budget";
import styles from "./budget.module.scss";

export const metadata = { title: "요청 예산 | EPL Radar" };

// 계측값은 매 요청 시점의 메모리 상태다. 캐시하면 의미가 없다.
export const dynamic = "force-dynamic";

export default function BudgetPage() {
  return (
    <div className={styles.budget}>
      <header>
        <h2>요청 예산</h2>
        <p>
          football-data.org 무료 플랜은 분당 {FREE_PLAN_REQUESTS_PER_MINUTE}회
          제한입니다. 이 화면은 그 한도 안에서 실제로 돌고 있는지를 서버에서
          직접 계측한 값입니다.
        </p>
      </header>
      <BudgetPanel
        snapshot={getBudgetSnapshot()}
        limit={FREE_PLAN_REQUESTS_PER_MINUTE}
      />
    </div>
  );
}
