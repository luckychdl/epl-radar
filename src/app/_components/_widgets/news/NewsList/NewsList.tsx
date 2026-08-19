import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import ErrorNotice from "@/app/_components/_commons/ErrorNotice/ErrorNotice";
import { NewsItem } from "@/app/_types/news";
import styles from "./NewsList.module.scss";

interface Props {
  items: NewsItem[];
}

export default function NewsList({ items }: Props) {
  if (items.length === 0) {
    return (
      <ErrorNotice
        title="뉴스를 불러오지 못했습니다."
        description="외부 언론사 피드에 일시적으로 접근하지 못했습니다. 잠시 후 다시 시도해주세요."
      />
    );
  }

  return (
    <ul className={styles.newsList}>
      {items.map((item) => (
        <li key={item.link}>
          <a href={item.link} target="_blank" rel="noreferrer noopener">
            {item.thumbnail && (
              <div className={styles.thumbnail}>
                {/*
                  언론사 CDN 호스트는 피드마다 다르고 예고 없이 바뀐다.
                  next/image 는 remotePatterns 에 없는 호스트에서 렌더 자체를 실패시키므로,
                  썸네일 하나 때문에 뉴스 페이지가 죽지 않도록 일반 img 를 쓴다.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt=""
                  width={120}
                  height={68}
                  loading="lazy"
                />
              </div>
            )}
            <div className={styles.body}>
              <strong>{item.title}</strong>
              {item.summary && <p>{item.summary}</p>}
              <div className={styles.meta}>
                <em>{item.source}</em>
                {item.publishedAt && (
                  <span suppressHydrationWarning>
                    {formatDistanceToNow(new Date(item.publishedAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                )}
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
