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
  return (
    <div className={styles.listCard}>
      <h4>{title}</h4>
      {data
        ?.filter((el) => el.code !== "BSA" && el.code !== "ELC")
        .map((el) => (
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
