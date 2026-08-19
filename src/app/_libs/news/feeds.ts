import { REVALIDATE } from "@/app/_constants/football";
import { mergeNewsItems, parseRssItems } from "@/app/_libs/_utils/rss";
import { NewsItem } from "@/app/_types/news";

/**
 * 공개 RSS 만 쓴다. 키가 필요 없고 요청 한도도 없다.
 * 제목·요약·링크만 보여주고 본문은 원문으로 보낸다.
 */
export const NEWS_SOURCES = [
  { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
  { name: "The Guardian", url: "https://www.theguardian.com/football/rss" },
  { name: "ESPN", url: "https://www.espn.com/espn/rss/soccer/news" },
] as const;

/** 피드 하나가 죽어도 화면 전체를 죽이지 않는다. 그 소스만 빠진다. */
async function fetchFeed(source: (typeof NEWS_SOURCES)[number]) {
  try {
    const response = await fetch(source.url, {
      next: { revalidate: REVALIDATE.standard },
    });

    if (!response.ok) return [];

    return parseRssItems(await response.text(), source.name);
  } catch {
    return [];
  }
}

export async function getFootballNewsServer(): Promise<NewsItem[]> {
  const groups = await Promise.all(NEWS_SOURCES.map(fetchFeed));

  return mergeNewsItems(groups);
}
