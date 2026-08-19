/** football-data.org 무료 플랜의 분당 요청 한도 */
export const FREE_PLAN_REQUESTS_PER_MINUTE = 10;

/** 프록시 라우트(/api/football)의 기본 경로 */
export const FOOTBALL_PROXY_BASE_URL = "/api/football";

export const REVALIDATE = {
  /** 라이브 스코어처럼 자주 바뀌는 데이터 */
  live: 60,
  /** 순위표, 경기 일정 */
  standard: 60 * 10,
  /** 리그 목록처럼 거의 바뀌지 않는 데이터 */
  static: 60 * 60 * 24,
} as const;

/** URL 쿼리(?date=)에 사용하는 날짜 포맷 */
export const DATE_PARAM_FORMAT = "yyyyMMdd";
/** football-data API 가 요구하는 날짜 포맷 */
export const API_DATE_FORMAT = "yyyy-MM-dd";

/**
 * 경기 목록 폴링 간격.
 * 서버 캐시 주기보다 짧게 잡으면 같은 캐시를 다시 받을 뿐이라 낭비다.
 */
export const MATCH_POLLING_INTERVAL_MS = REVALIDATE.live * 1000;
