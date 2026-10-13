import { Match } from "@/app/_types/matches";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export interface MatchDayWindow {
  /** 서비스 시간대 기준 하루의 시작(포함) */
  start: Date;
  /** 다음 날의 시작(제외) */
  end: Date;
  /** football-data 에 넘길 UTC 날짜 범위. dateTo 는 배타적이다. */
  dateFrom: string;
  dateTo: string;
}

/** 서비스 시간대 기준의 오늘을 yyyyMMdd 로 돌려준다. */
export function getServiceDateParam(now: Date, offsetHours: number): string {
  return toIsoDate(new Date(now.getTime() + offsetHours * HOUR_MS)).replaceAll(
    "-",
    "",
  );
}

/**
 * yyyyMMdd 하루를 서비스 시간대 기준 구간으로 바꾼다.
 * API 는 UTC 날짜로만 자르므로, 구간이 걸치는 UTC 날짜를 모두 받아 온 뒤 코드에서 걸러야 한다.
 */
export function getMatchDayWindow(
  dateParam: string,
  offsetHours: number,
): MatchDayWindow {
  const year = Number(dateParam.slice(0, 4));
  const month = Number(dateParam.slice(4, 6));
  const day = Number(dateParam.slice(6, 8));

  const start = new Date(
    Date.UTC(year, month - 1, day) - offsetHours * HOUR_MS,
  );
  const end = new Date(start.getTime() + DAY_MS);

  return {
    start,
    end,
    dateFrom: toIsoDate(start),
    dateTo: toIsoDate(new Date(end.getTime() - 1 + DAY_MS)),
  };
}

/** 킥오프가 구간 안에 있는 경기만 남긴다. */
export function filterMatchesInWindow(
  matches: Match[],
  window: Pick<MatchDayWindow, "start" | "end">,
): Match[] {
  const from = window.start.getTime();
  const to = window.end.getTime();

  return matches.filter((match) => {
    const kickOff = new Date(match.utcDate).getTime();

    return kickOff >= from && kickOff < to;
  });
}
