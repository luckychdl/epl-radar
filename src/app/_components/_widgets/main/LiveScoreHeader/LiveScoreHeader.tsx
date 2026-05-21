"use client";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import styles from "./LiveScoreHeader..module.scss";
import { useModalStore } from "@/app/_stores/useModalStore";
import { useRouter, useSearchParams } from "next/navigation";
import {
  format,
  parse,
  isToday,
  isTomorrow,
  isYesterday,
  addDays,
} from "date-fns";
export default function LiveScoreHeader() {
  const { openModal } = useModalStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParams = searchParams.get("date");
  const currentDate = dateParams
    ? parse(dateParams, "yyyyMMdd", new Date())
    : new Date();
  function getDisplayDate(date: Date) {
    if (isToday(date)) {
      return "Today";
    }

    if (isYesterday(date)) {
      return "Yesterday";
    }

    if (isTomorrow(date)) {
      return "Tomorrow";
    }

    return format(date, "EEEE, MMMM d");
  }
  const moveDate = (amount: number) => {
    const nextDate = addDays(currentDate, amount);

    router.push(`?date=${format(nextDate, "yyyyMMdd")}`);
  };
  return (
    <header className={styles.liveScoreHeader}>
      <button className={styles.arrow} onClick={() => moveDate(-1)}>
        <ChevronLeft width={20} />
      </button>
      <button onClick={() => openModal("calendar", null)}>
        <span>{getDisplayDate(currentDate)}</span>
        <CalendarDays width={20} />
      </button>
      <button className={styles.arrow} onClick={() => moveDate(1)}>
        <ChevronRight width={20} />
      </button>
    </header>
  );
}
