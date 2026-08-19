import { NewsItem } from "@/app/_types/news";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }

    if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }

    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/** CDATA 를 벗기고 엔티티를 푼 태그 본문. 없으면 null. */
function readTag(item: string, tag: string): string | null {
  const match = item.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"),
  );

  if (!match) return null;

  const raw = match[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");

  return decodeEntities(raw).trim();
}

/**
 * 요약문에는 피드마다 다른 HTML 이 섞여 온다.
 * 태그를 걷어내고 한 줄로 만든 뒤 카드 높이에 맞게 자른다.
 */
function toSummary(description: string | null, maxLength: number): string {
  if (!description) return "";

  // 엔티티를 푼 뒤 태그가 드러나므로 한 번 더 푼다.
  const text = decodeEntities(description)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

function readThumbnail(item: string): string | null {
  const match = item.match(
    /<media:(?:thumbnail|content)[^>]*\surl="([^"]+)"[^>]*>/i,
  );

  return match ? decodeEntities(match[1]) : null;
}

function toIsoDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const SUMMARY_MAX_LENGTH = 160;

/**
 * RSS 2.0 <item> 목록을 파싱한다.
 * 외부 XML 파서를 들이지 않고 필요한 필드만 뽑는다. 형식이 어긋난 항목은 버린다.
 */
export function parseRssItems(xml: string, source: string): NewsItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];

  return items
    .map((item): NewsItem | null => {
      const title = readTag(item, "title");
      const link = readTag(item, "link");

      if (!title || !link) return null;

      return {
        link,
        title,
        summary: toSummary(readTag(item, "description"), SUMMARY_MAX_LENGTH),
        publishedAt: toIsoDate(readTag(item, "pubDate")),
        source,
        thumbnail: readThumbnail(item),
      };
    })
    .filter((item): item is NewsItem => item !== null);
}

/**
 * 피드가 미래 시각을 주는 경우가 있다.
 * (ESPN 은 서머타임 기간에도 pubDate 를 EST 로 표기해 실제보다 한 시간 앞선다.)
 * 그대로 두면 "41분 후" 같은 문구가 뜨고 그 소스만 목록 위를 독점한다.
 */
export function clampPublishedAt(
  publishedAt: string | null,
  now: Date,
): string | null {
  if (!publishedAt) return null;

  const nowIso = now.toISOString();

  return publishedAt > nowIso ? nowIso : publishedAt;
}

/**
 * 링크가 같은 기사를 합치고, 소스를 번갈아 가며 배치한다.
 *
 * 순수 최신순으로 두면 갱신이 잦은 한 소스가 첫 화면을 통째로 차지한다.
 * 소스 안에서는 최신순을 지키고, 소스 사이에서는 돌아가며 하나씩 뽑는다.
 */
export function mergeNewsItems(
  groups: NewsItem[][],
  now = new Date(),
): NewsItem[] {
  const byLink = new Map<string, NewsItem>();

  for (const item of groups.flat()) {
    if (byLink.has(item.link)) continue;

    byLink.set(item.link, {
      ...item,
      publishedAt: clampPublishedAt(item.publishedAt, now),
    });
  }

  // 소스 등장 순서를 유지해야 매 요청 같은 배치가 나온다.
  const bySource = new Map<string, NewsItem[]>();

  for (const item of byLink.values()) {
    const bucket = bySource.get(item.source) ?? [];
    bucket.push(item);
    bySource.set(item.source, bucket);
  }

  const queues = [...bySource.values()].map((items) =>
    [...items].sort((a, b) => {
      // 날짜가 없는 항목은 소스 안에서 뒤로 민다.
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;

      return b.publishedAt.localeCompare(a.publishedAt);
    }),
  );

  const merged: NewsItem[] = [];
  const longest = Math.max(0, ...queues.map((queue) => queue.length));

  for (let index = 0; index < longest; index += 1) {
    for (const queue of queues) {
      const item = queue[index];
      if (item) merged.push(item);
    }
  }

  return merged;
}
