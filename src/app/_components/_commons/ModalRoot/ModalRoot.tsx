"use client";

import { useModalStore } from "@/app/_stores/useModalStore";
import { motion } from "framer-motion";
import styles from "./ModalRoot.module.scss";
import CalendarModal from "../../_modals/CalendarModal/CalendarModal";
const MODALS = {
  calendar: CalendarModal,
} as const;
export default function ModalRoot() {
  const { type, closeModal } = useModalStore();
  if (!type) return null;
  const ModalComponent = MODALS[type];
  return (
    <motion.div
      className={styles.modalRoot}
      onClick={() => closeModal()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.2,
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <ModalComponent />
      </div>
    </motion.div>
  );
}
