"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div style={{ padding: 24 }}>
      <h2>Something went wrong.</h2>
      <p>{error.message}</p>
      <button
        type="button"
        onClick={() => {
          router.refresh();
          reset();
        }}
        style={{
          border: "1px solid #000",
          padding: "10px 20px",
          borderRadius: 12,
          marginTop: 10,
          background: "#fff",
        }}
      >
        Retry
      </button>
    </div>
  );
}
