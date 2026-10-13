"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ModalType, useModalStore } from "@/app/_stores/useModalStore";
import CalendarModal from "../../_modals/CalendarModal/CalendarModal";
import styles from "./ModalRoot.module.scss";

const MODALS: Record<ModalType, () => React.ReactNode> = {
  calendar: CalendarModal,
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ModalRoot() {
  const type = useModalStore((state) => state.type);
  const closeModal = useModalStore((state) => state.closeModal);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!type) return;

    // 모달을 연 요소를 기억해 닫을 때 포커스를 되돌린다.
    const trigger = document.activeElement;
    const getFocusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR,
        ) ?? [],
      );

    getFocusable().at(0)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;

      // 포커스가 모달 밖으로 나가지 않도록 양 끝에서 되돌린다.
      const focusable = getFocusable();
      const first = focusable.at(0);
      const last = focusable.at(-1);

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // 모달이 떠 있는 동안 뒤 배경이 스크롤되지 않도록 고정한다.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [type, closeModal]);

  const ModalComponent = type ? MODALS[type] : null;

  return (
    <AnimatePresence>
      {ModalComponent && (
        <motion.div
          className={styles.modalRoot}
          role="presentation"
          onClick={closeModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <ModalComponent />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
