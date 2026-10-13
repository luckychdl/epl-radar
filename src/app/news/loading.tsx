import NewsListSkeleton from "@/app/_components/_widgets/news/NewsListSkeleton/NewsListSkeleton";
import styles from "./news.module.scss";

// 외부 RSS 세 곳을 기다리므로 이 페이지는 스켈레톤이 특히 오래 보인다.
export default function Loading() {
  return (
    <div className={styles.news}>
      <header>
        <h2>Football News</h2>
        <p>기사를 불러오는 중입니다.</p>
      </header>
      <NewsListSkeleton />
    </div>
  );
}
