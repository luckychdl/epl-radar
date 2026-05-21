"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import styles from "./CalendarModal.module.scss";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
import { useModalStore } from "@/app/_stores/useModalStore";

export default function CalendarModal() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const date = searchparams.get("date");
  const { closeModal } = useModalStore();
  const [month, setMonth] = useState(new Date());
  const handleDaySelected = (day?: Date) => {
    if (!day) return;

    router.push(`?date=${format(day, "yyyyMMdd")}`);
    closeModal();
  };
  const selected = date ? parse(date, "yyyyMMdd", new Date()) : new Date();

  return (
    <div className={styles.modal}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={handleDaySelected}
        month={month}
        onMonthChange={setMonth}
        showOutsideDays
        components={{
          PreviousMonthButton: (props) => (
            <button {...props} className={styles.navButton}>
              <ChevronLeft size={18} />
            </button>
          ),
          NextMonthButton: (props) => (
            <button {...props} className={styles.navButton}>
              <ChevronRight size={18} />
            </button>
          ),
        }}
        classNames={{
          root: styles.calendar,
          month: styles.month,
          month_caption: styles.caption,
          month_grid: styles.monthGrid,
          caption_label: styles.captionLabel,
          nav: styles.nav,
          weekdays: styles.weekdays,
          weekday: styles.weekday,
          week: styles.week,
          day: styles.day,
          day_button: styles.dayButton,
          today: styles.today,
          selected: styles.selected,
          outside: styles.outside,
        }}
      />
    </div>
  );
}
