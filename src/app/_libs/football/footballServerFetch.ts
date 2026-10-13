import { recordFootballFetch } from "./budget";

/**
 * 서버에서만 읽는다. E2E 는 목 서버를 가리키게 덮어써서 실제 한도를 쓰지 않는다.
 */
const BASE_URL =
  process.env.FOOTBALL_API_BASE_URL ?? "https://api.football-data.org/v4";

export class FootballApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    detail?: string,
  ) {
    super(
      `Football API 요청 실패 (${status}) - ${path}${detail ? `: ${detail}` : ""}`,
    );
    this.name = "FootballApiError";
  }
}

/**
 * 분당 요청 한도(무료 플랜 10회) 초과.
 * 예외 상황이 아니라 정상 시나리오이므로 호출부는 폴백 데이터를 반환한다.
 */
export class RateLimitError extends FootballApiError {
  constructor(
    path: string,
    readonly resetSeconds: number | null,
    detail?: string,
  ) {
    super(429, path, detail);
    this.name = "RateLimitError";
  }
}

interface FootballFetchOptions {
  /** 초 단위 ISR 재검증 주기. cache 를 함께 넘기면 cache 가 우선한다. */
  revalidate?: number;
  cache?: RequestCache;
  tags?: string[];
}

/** football-data 는 남은 대기 시간을 X-RequestCounter-Reset 으로 알려준다. */
function parseResetSeconds(headers: Headers): number | null {
  const raw =
    headers.get("X-RequestCounter-Reset") ?? headers.get("Retry-After");
  const seconds = Number(raw);

  return raw !== null && Number.isFinite(seconds) ? seconds : null;
}

export async function footballServerFetch<T>(
  path: string,
  options: FootballFetchOptions = {},
): Promise<T> {
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    throw new Error("FOOTBALL_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const { revalidate, cache, tags } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": apiKey },
    // cache 와 next.revalidate 를 동시에 지정하면 Next 가 충돌 에러를 던진다.
    ...(cache
      ? { cache }
      : {
          next: {
            ...(revalidate !== undefined && { revalidate }),
            ...(tags && { tags }),
          },
        }),
  });

  if (res.status === 429) {
    recordFootballFetch(path, res.headers, { rateLimited: true });

    const resetSeconds = parseResetSeconds(res.headers);

    // 재시도 루프를 돌리지 않는다. 한도 초과 상황에서 재시도는 한도를 더 태울 뿐이다.
    console.warn(
      `[football-api] 429 요청 한도 초과 - ${path}` +
        (resetSeconds !== null ? ` (${resetSeconds}초 후 초기화)` : ""),
    );

    throw new RateLimitError(path, resetSeconds);
  }

  recordFootballFetch(path, res.headers);

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new FootballApiError(res.status, path, detail.slice(0, 200));
  }

  return res.json() as Promise<T>;
}
