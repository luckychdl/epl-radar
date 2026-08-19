export interface NewsItem {
  /** 원문 링크. 피드마다 guid 형식이 달라 링크를 식별자로 쓴다. */
  link: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  source: string;
  thumbnail: string | null;
}
