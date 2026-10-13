import {
  BudgetPathStat,
  BudgetSnapshot,
  normalizeFootballPath,
} from "@/app/_libs/_utils/budget";

/**
 * 요청 예산 계측기.
 *
 * 프로세스 메모리에만 쌓는다. 서버 인스턴스가 여러 개면 인스턴스별 수치이고
 * 콜드 스타트에 초기화된다. 운영 지표가 아니라 "분당 10회 안에서 도는지" 를
 * 눈으로 확인하기 위한 진단용이다.
 */
const MAX_PATHS = 100;
const MAX_TIMESTAMPS = 500;
const MINUTE_MS = 60_000;

interface MutableStat extends BudgetPathStat {
  /** 응답 Date 헤더. 값이 바뀌면 새 응답 = 외부로 나갔다는 뜻이다. */
  lastResponseDate: string | null;
}

const stats = new Map<string, MutableStat>();
const upstreamTimestamps: number[] = [];
let requestsAvailable: number | null = null;
let since = new Date().toISOString();

function getStat(path: string): MutableStat {
  const existing = stats.get(path);
  if (existing) return existing;

  // 경로가 무한히 늘지 않도록 상한을 둔다. 정규화 덕에 실제로는 한 자릿수다.
  if (stats.size >= MAX_PATHS) stats.clear();

  const created: MutableStat = {
    path,
    calls: 0,
    upstream: 0,
    rateLimited: 0,
    lastUpstreamAt: null,
    lastResponseDate: null,
  };
  stats.set(path, created);

  return created;
}

function markUpstream(stat: MutableStat, now: number) {
  stat.upstream += 1;
  stat.lastUpstreamAt = new Date(now).toISOString();

  upstreamTimestamps.push(now);
  if (upstreamTimestamps.length > MAX_TIMESTAMPS) {
    upstreamTimestamps.splice(0, upstreamTimestamps.length - MAX_TIMESTAMPS);
  }
}

/**
 * 한 번의 footballServerFetch 결과를 기록한다.
 *
 * Next 의 fetch 캐시는 응답을 통째로(헤더까지) 재생하므로, 캐시 적중이면
 * Date 헤더가 직전과 같다. 값이 달라졌을 때만 외부 호출로 센다.
 * ISR 주기가 최소 60초라 같은 경로가 1초 안에 두 번 나갈 일은 없다.
 */
export function recordFootballFetch(
  rawPath: string,
  headers: Headers | null,
  options: { rateLimited?: boolean } = {},
) {
  const stat = getStat(normalizeFootballPath(rawPath));
  const now = Date.now();

  stat.calls += 1;

  if (options.rateLimited) {
    stat.rateLimited += 1;
    markUpstream(stat, now);
    return;
  }

  const responseDate = headers?.get("Date") ?? null;

  if (responseDate === null || responseDate !== stat.lastResponseDate) {
    stat.lastResponseDate = responseDate;
    markUpstream(stat, now);
  }

  const available = Number(headers?.get("x-requests-available-minute"));
  if (Number.isFinite(available)) requestsAvailable = available;
}

export function getBudgetSnapshot(): BudgetSnapshot {
  const cutoff = Date.now() - MINUTE_MS;
  // lastResponseDate 는 캐시 판정용 내부 값이라 스냅샷에서 뺀다.
  const paths: BudgetPathStat[] = [...stats.values()]
    .map((stat) => ({
      path: stat.path,
      calls: stat.calls,
      upstream: stat.upstream,
      rateLimited: stat.rateLimited,
      lastUpstreamAt: stat.lastUpstreamAt,
    }))
    .sort((a, b) => b.calls - a.calls);

  return {
    paths,
    totals: paths.reduce(
      (totals, stat) => ({
        calls: totals.calls + stat.calls,
        upstream: totals.upstream + stat.upstream,
        rateLimited: totals.rateLimited + stat.rateLimited,
      }),
      { calls: 0, upstream: 0, rateLimited: 0 },
    ),
    upstreamLastMinute: upstreamTimestamps.filter((time) => time > cutoff).length,
    requestsAvailable,
    since,
  };
}

/** 테스트와 수동 확인용. 계측만 비우고 캐시에는 손대지 않는다. */
export function resetBudget() {
  stats.clear();
  upstreamTimestamps.length = 0;
  requestsAvailable = null;
  since = new Date().toISOString();
}
