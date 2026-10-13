"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelectedDate } from "@/app/_hooks/useSelectedDate";
import { useModalStore } from "@/app/_stores/useModalStore";
import styles from "./CalendarModal.module.scss";

export default function CalendarModal() {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const closeModal = useModalStore((state) => state.closeModal);
  const [month, setMonth] = useState(selectedDate);

  const handleDaySelected = (day?: Date) => {
    if (!day) return;

    setSelectedDate(day);
    closeModal();
  };

  return (
    <div className={styles.modal}>
      <DayPicker
        mode="single"
        selected={selectedDate}
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
