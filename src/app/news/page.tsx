import NewsList from "@/app/_components/_widgets/news/NewsList/NewsList";
import { NEWS_SOURCES, getFootballNewsServer } from "@/app/_libs/news/feeds";
import styles from "./news.module.scss";

export const metadata = { title: "News | EPL Radar" };

export default async function NewsPage() {
  const items = await getFootballNewsServer();

  return (
    <div className={styles.news}>
      <header>
        <h2>Football News</h2>
        <p>
          {NEWS_SOURCES.map((source) => source.name).join(" · ")} 공개 피드에서
          모았습니다. 제목을 누르면 원문으로 이동합니다.
        </p>
      </header>
      <NewsList items={items} />
    </div>
  );
}
