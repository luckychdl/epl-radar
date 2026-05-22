"use client";
import Image from "next/image";
import styles from "./ListCard.module.scss";
import { Competition } from "@/app/_types/competitions";
import { useRouter } from "next/navigation";
interface Props {
  data: Competition[];
  title: string;
}
export default function ListCard({ data, title }: Props) {
  const router = useRouter();
  const handleLeagues = (el: Competition) => {
    router.push(`/leagues/${el.id}/${el.code}/overview`);
  };
  const filterData = [...data].filter(
    (el) =>
      el.code === "PL" ||
      el.code === "CL" ||
      el.code === "FL1" ||
      el.code === "BL1" ||
      el.code === "SA" ||
      el.code === "PD" ||
      el.code === "WC" ||
      el.code === "EC",
  );

  return (
    <div className={styles.listCard}>
      <h4>{title}</h4>
      {filterData.map((el: Competition) => (
        <button key={el.id} onClick={() => handleLeagues(el)}>
          <Image
            src={el.emblem}
            alt=""
            width={24}
            height={24}
            objectFit="cover"
          />
          <p>{el.name}</p>
        </button>
      ))}
    </div>
  );
}
