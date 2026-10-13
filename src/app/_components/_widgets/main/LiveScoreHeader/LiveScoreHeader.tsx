"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { addDays, format, isToday, isTomorrow, isYesterday } from "date-fns";
import { useSelectedDate } from "@/app/_hooks/useSelectedDate";
import { useModalStore } from "@/app/_stores/useModalStore";
import styles from "./LiveScoreHeader.module.scss";

function getDisplayDate(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isTomorrow(date)) return "Tomorrow";

  return format(date, "EEEE, MMMM d");
}

export default function LiveScoreHeader() {
  const openModal = useModalStore((state) => state.openModal);
  const { selectedDate, setSelectedDate } = useSelectedDate();

  const moveDate = (amount: number) => setSelectedDate(addDays(selectedDate, amount));

  return (
    <header className={styles.liveScoreHeader}>
      <button
        type="button"
        className={styles.arrow}
        onClick={() => moveDate(-1)}
        aria-label="이전 날짜"
      >
        <ChevronLeft width={20} />
      </button>
      <button type="button" onClick={() => openModal("calendar")}>
        <span>{getDisplayDate(selectedDate)}</span>
        <CalendarDays width={20} />
      </button>
      <button
        type="button"
        className={styles.arrow}
        onClick={() => moveDate(1)}
        aria-label="다음 날짜"
      >
        <ChevronRight width={20} />
      </button>
    </header>
  );
}
