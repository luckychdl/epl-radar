"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./error.module.scss";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.error}>
      <h2>Something went wrong.</h2>
      <p>{error.message}</p>
      <button
        type="button"
        onClick={() => {
          router.refresh();
          reset();
        }}
      >
        Retry
      </button>
    </div>
  );
}
