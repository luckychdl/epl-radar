"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, isValid, parse } from "date-fns";
import { DATE_PARAM_FORMAT } from "@/app/_constants/football";

/** ?date= 쿼리로 관리되는 선택 날짜를 읽고 갱신한다. */
export function useSelectedDate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const parsed = dateParam
    ? parse(dateParam, DATE_PARAM_FORMAT, new Date())
    : null;
  const selectedDate = parsed && isValid(parsed) ? parsed : new Date();

  const setSelectedDate = useCallback(
    (date: Date) => {
      // 다른 쿼리 파라미터를 잃지 않도록 기존 값을 복사한 뒤 date 만 교체한다.
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", format(date, DATE_PARAM_FORMAT));
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return { selectedDate, setSelectedDate };
}
