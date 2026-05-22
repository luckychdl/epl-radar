"use client";
import { LeagueMatches } from "@/app/_types/todayMatches";
import styles from "./TodayMatches.module.scss";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import TodayMatchRows from "../TodayMatcheRows/TodayMatcheRows";
import { SUPPORTED_LEAGUES } from "@/app/_constants/leagues";
interface Props {
  leagues: LeagueMatches[];
}

export default function TodayMatches({ leagues }: Props) {
  const [rowController, setRowController] = useState(
    [...SUPPORTED_LEAGUES].map((v) => ({ ...v, open: true })),
  );
  const handleContract = (code: string) => {
    let temp = [...rowController];
    temp = temp.map((v) => {
      if (v.code == code) {
        return {
          ...v,
          open: !v.open,
        };
      } else {
        return {
          ...v,
        };
      }
    });
    setRowController(temp);
  };
  console.log(leagues, "leagues");
  return (
    <>
      {leagues.map((el) => (
        <div className={styles.todayMatches} key={el.code}>
          <button
            className={styles.todayMatchHeader}
            onClick={() => handleContract(el.code)}
          >
            <div>
              <Image
                src={el?.matches[0]?.area.flag}
                alt=""
                width={20}
                height={20}
              />
              <span>
                {el?.matches[0]?.area.name} - {el.name}
              </span>
            </div>
            {rowController?.find((row) => row.code == el.code)?.open ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>

          {el.matches.map((v) => (
            <TodayMatchRows
              v={v}
              key={v.id}
              rowController={rowController?.find((row) => row.code == el.code)}
            />
          ))}
        </div>
      ))}
    </>
  );
}
