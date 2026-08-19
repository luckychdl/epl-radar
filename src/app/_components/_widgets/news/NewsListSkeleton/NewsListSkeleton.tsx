import styles from "./NewsListSkeleton.module.scss";

interface Props {
  count?: number;
}

/** NewsList 의 카드 골격. 썸네일이 있는 기사와 없는 기사를 섞어 둔다. */
export default function NewsListSkeleton({ count = 6 }: Props) {
  return (
    <ul className={styles.newsListSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          {index % 3 !== 2 && <span className={styles.thumbnail} />}
          <div className={styles.body}>
            <span className={styles.title} />
            <span className={styles.summary} />
            <div className={styles.meta}>
              <span className={styles.source} />
              <span className={styles.time} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
