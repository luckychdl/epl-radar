import { describe, expect, it } from "vitest";
import { clampPublishedAt, mergeNewsItems, parseRssItems } from "./rss";

const BBC_STYLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <item>
    <title><![CDATA[Arsenal agree deal for Konsa]]></title>
    <description><![CDATA[Arsenal agree a deal worth more than £50m.]]></description>
    <link>https://www.bbc.co.uk/sport/football/articles/abc?at_medium=RSS</link>
    <pubDate>Wed, 19 Aug 2026 13:55:18 GMT</pubDate>
    <media:thumbnail width="240" height="135" url="https://ichef.bbci.co.uk/a.jpg"/>
  </item>
</channel></rss>`;

const GUARDIAN_STYLE = `<rss version="2.0"><channel>
  <item>
    <title>Webb &#8216;troubled&#8217; by ban &amp; appeal</title>
    <link>https://www.theguardian.com/football/2026/aug/19/webb</link>
    <description>&lt;p&gt;USA striker missed &lt;b&gt;no&lt;/b&gt; matches&lt;/p&gt;</description>
    <pubDate>Tue, 18 Aug 2026 09:00:00 GMT</pubDate>
  </item>
  <item>
    <title>제목만 있고 링크가 없는 항목</title>
    <description>버려져야 한다</description>
  </item>
</channel></rss>`;

describe("parseRssItems", () => {
  it("CDATA 와 media:thumbnail 을 읽는다", () => {
    const [item] = parseRssItems(BBC_STYLE, "BBC Sport");

    expect(item.title).toBe("Arsenal agree deal for Konsa");
    expect(item.summary).toBe("Arsenal agree a deal worth more than £50m.");
    expect(item.thumbnail).toBe("https://ichef.bbci.co.uk/a.jpg");
    expect(item.source).toBe("BBC Sport");
    expect(item.publishedAt).toBe("2026-08-19T13:55:18.000Z");
  });

  it("요약에 섞인 HTML 을 걷어내고 엔티티를 푼다", () => {
    const [item] = parseRssItems(GUARDIAN_STYLE, "The Guardian");

    expect(item.title).toBe("Webb ‘troubled’ by ban & appeal");
    expect(item.summary).toBe("USA striker missed no matches");
    expect(item.thumbnail).toBeNull();
  });

  it("제목이나 링크가 없는 항목은 버린다", () => {
    expect(parseRssItems(GUARDIAN_STYLE, "The Guardian")).toHaveLength(1);
  });

  it("item 이 없으면 빈 배열", () => {
    expect(parseRssItems("<rss><channel/></rss>", "X")).toEqual([]);
  });
});

describe("clampPublishedAt", () => {
  const now = new Date("2026-08-19T17:00:00.000Z");

  it("미래 시각은 현재로 눌러 쓴다", () => {
    expect(clampPublishedAt("2026-08-19T17:40:00.000Z", now)).toBe(
      "2026-08-19T17:00:00.000Z",
    );
  });

  it("과거 시각은 그대로 둔다", () => {
    expect(clampPublishedAt("2026-08-19T13:55:18.000Z", now)).toBe(
      "2026-08-19T13:55:18.000Z",
    );
  });

  it("없으면 null", () => {
    expect(clampPublishedAt(null, now)).toBeNull();
  });
});

describe("mergeNewsItems", () => {
  it("같은 링크는 하나만 남긴다", () => {
    const merged = mergeNewsItems([
      parseRssItems(GUARDIAN_STYLE, "The Guardian"),
      parseRssItems(BBC_STYLE, "BBC Sport"),
      parseRssItems(BBC_STYLE, "BBC Sport"),
    ]);

    expect(merged).toHaveLength(2);
  });

  it("한 소스가 첫 화면을 독점하지 않도록 번갈아 배치한다", () => {
    const now = new Date("2026-08-20T00:00:00.000Z");
    const espn = [1, 2, 3].map((n) => ({
      ...parseRssItems(BBC_STYLE, "ESPN")[0],
      link: `espn-${n}`,
      publishedAt: `2026-08-19T1${n}:00:00.000Z`,
    }));
    const bbc = [{ ...parseRssItems(BBC_STYLE, "BBC Sport")[0], link: "bbc-1" }];

    const merged = mergeNewsItems([espn, bbc], now);

    expect(merged.map((item) => item.source)).toEqual([
      "ESPN",
      "BBC Sport",
      "ESPN",
      "ESPN",
    ]);
    // 소스 안에서는 최신순을 지킨다.
    expect(merged.filter((item) => item.source === "ESPN").map((i) => i.link)).toEqual([
      "espn-3",
      "espn-2",
      "espn-1",
    ]);
  });

  it("미래 시각을 주는 피드가 목록 위를 독점하지 않는다", () => {
    const now = new Date("2026-08-19T14:00:00.000Z");
    const future = {
      ...parseRssItems(BBC_STYLE, "ESPN")[0],
      link: "future",
      publishedAt: "2026-08-19T17:40:00.000Z",
    };

    const merged = mergeNewsItems([[future]], now);

    expect(merged[0].publishedAt).toBe("2026-08-19T14:00:00.000Z");
  });

  it("날짜가 없는 항목은 같은 소스 안에서 뒤로 민다", () => {
    const undated = { ...parseRssItems(BBC_STYLE, "BBC")[0], link: "x", publishedAt: null };
    const dated = parseRssItems(BBC_STYLE, "BBC")[0];
    const merged = mergeNewsItems([[undated, dated]]);

    expect(merged.at(-1)?.link).toBe("x");
  });
});
