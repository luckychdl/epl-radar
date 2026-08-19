/**
 * 계측 표에서 같은 리소스를 한 줄로 모으기 위한 경로 정규화.
 *
 * 날짜와 시즌은 호출할 때마다 달라지지만 캐시 관점에서는 같은 리소스다.
 * 반대로 status 처럼 캐시 엔트리를 가르는 값은 남겨야 한다.
 */
const PLACEHOLDERS: [pattern: RegExp, replacement: string][] = [
  [/\b(date|dateFrom|dateTo)=\d{4}-\d{2}-\d{2}/g, "$1=<date>"],
  [/\bseason=\d{4}/g, "season=<year>"],
  [/\blimit=\d+/g, "limit=<n>"],
];

export function normalizeFootballPath(path: string): string {
  return PLACEHOLDERS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    path,
  );
}

export interface BudgetPathStat {
  path: string;
  /** 앱 코드가 요청한 횟수 */
  calls: number;
  /** 그중 실제로 외부 API 까지 나간 횟수 */
  upstream: number;
  rateLimited: number;
  lastUpstreamAt: string | null;
}

export interface BudgetSnapshot {
  paths: BudgetPathStat[];
  totals: {
    calls: number;
    upstream: number;
    rateLimited: number;
  };
  /** 최근 60초 동안 외부로 나간 요청 수 */
  upstreamLastMinute: number;
  /** football-data 가 알려준 남은 분당 요청 수 */
  requestsAvailable: number | null;
  since: string;
}

/** 캐시 적중률. 호출이 없으면 null. */
export function getCacheHitRate(stat: {
  calls: number;
  upstream: number;
}): number | null {
  if (stat.calls <= 0) return null;

  return (stat.calls - stat.upstream) / stat.calls;
}
