"use client";
import { useEffect } from "react";
import styles from "./ListCard.module.scss";
import { getCompetitions } from "@/app/_libs/_apis/competitions/apis";
export default function ListCard() {
  useEffect(() => {
    getCompetitions();
  }, []);
  return <div className={styles.listCard}>ListCard</div>;
}
